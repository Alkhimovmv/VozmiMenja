import * as cron from 'node-cron'
import { rentalModel } from '../models/Rental'
import { telegramService } from './telegram'
import { emailBackupService } from './emailBackup'

class SchedulerService {
  private dailyReminderTask: cron.ScheduledTask | null = null
  private weeklyBackupTask: cron.ScheduledTask | null = null

  /**
   * Инициализация планировщика задач
   */
  init() {
    // Ежедневное уведомление в 23:45
    this.dailyReminderTask = cron.schedule('45 23 * * *', async () => {
      console.log('⏰ Запуск ежедневного уведомления о предстоящих арендах')
      await this.sendDailyRentalsReminder()
    }, { timezone: 'Europe/Moscow' })

    // Еженедельный email бэкап — каждое воскресенье в 10:00
    this.weeklyBackupTask = cron.schedule('0 10 * * 0', async () => {
      console.log('⏰ Запуск еженедельного email бэкапа БД')
      await emailBackupService.sendDatabaseBackup()
    }, { timezone: 'Europe/Moscow' })

    console.log('✅ Планировщик задач инициализирован (уведомления 23:45, бэкап по воскресеньям 10:00 МСК)')
  }

  /**
   * Остановка планировщика
   */
  stop() {
    this.dailyReminderTask?.stop()
    this.weeklyBackupTask?.stop()
    console.log('⏹️  Планировщик задач остановлен')
  }

  /**
   * Отправка ежедневного напоминания о предстоящих арендах на завтра
   */
  async sendDailyRentalsReminder() {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      // Получаем все активные и предстоящие аренды
      const allRentals = await rentalModel.findAll({})

      // Фильтруем аренды, которые начинаются или заканчиваются завтра
      const tomorrowRentals = allRentals.filter(rental => {
        const startDate = new Date(rental.startDate)
        const endDate = new Date(rental.endDate)

        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)

        // Проверяем, что аренда начинается или заканчивается завтра
        const startsOrEndsTomorrow =
          startDate.getTime() === tomorrow.getTime() ||
          endDate.getTime() === tomorrow.getTime()

        return startsOrEndsTomorrow && rental.status !== 'completed' && rental.status !== 'overdue'
      })

      if (tomorrowRentals.length === 0) {
        console.log('ℹ️  Нет аренд на завтра')
        return
      }

      // Формируем сообщение
      const message = this.formatDailyRentalsMessage(tomorrowRentals, tomorrow)

      // Отправляем в Telegram
      await telegramService.sendDailyRentalsReminder(message)

      console.log(`✅ Уведомление о ${tomorrowRentals.length} арендах отправлено`)
    } catch (error) {
      console.error('❌ Ошибка отправки ежедневного уведомления:', error)
    }
  }

  /**
   * Форматирование сообщения о предстоящих арендах
   */
  private formatDailyRentalsMessage(rentals: any[], date: Date): string {
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    })

    let message = `📅 <b>План на завтра (${dateStr})</b>\n\n`

    // Группируем по типу события
    const startingRentals = rentals.filter(r => {
      const startDate = new Date(r.startDate)
      startDate.setHours(0, 0, 0, 0)
      return startDate.getTime() === date.getTime()
    })

    const endingRentals = rentals.filter(r => {
      const endDate = new Date(r.endDate)
      endDate.setHours(0, 0, 0, 0)
      return endDate.getTime() === date.getTime()
    })

    // Аренды, которые начинаются
    if (startingRentals.length > 0) {
      message += `🟢 <b>Выдача оборудования (${startingRentals.length}):</b>\n\n`

      startingRentals.forEach((rental, index) => {
        const startTime = this.extractTime(rental.startDate)
        const equipmentList = this.formatEquipmentList(rental)

        message += `${index + 1}. ${startTime} - ${rental.equipmentName}\n`
        if (equipmentList) {
          message += `   ${equipmentList}\n`
        }
        message += `   👤 ${rental.customerName}\n`
        message += `   📱 ${rental.customerPhone}\n`

        if (rental.needsDelivery) {
          message += `   🚚 Доставка: ${rental.deliveryAddress || 'не указан адрес'}\n`
        } else {
          message += `   🏢 Самовывоз\n`
        }

        if (rental.comment) {
          message += `   💬 ${rental.comment}\n`
        }

        message += '\n'
      })
    }

    // Аренды, которые заканчиваются
    if (endingRentals.length > 0) {
      message += `🔴 <b>Возврат оборудования (${endingRentals.length}):</b>\n\n`

      endingRentals.forEach((rental, index) => {
        const endTime = this.extractTime(rental.endDate)
        const equipmentList = this.formatEquipmentList(rental)

        message += `${index + 1}. ${endTime} - ${rental.equipmentName}\n`
        if (equipmentList) {
          message += `   ${equipmentList}\n`
        }
        message += `   👤 ${rental.customerName}\n`
        message += `   📱 ${rental.customerPhone}\n`

        if (rental.needsDelivery) {
          message += `   🚚 Возврат с доставки\n`
        } else {
          message += `   🏢 Возврат в офис\n`
        }

        message += '\n'
      })
    }

    message += `\n📊 Всего событий: ${rentals.length}`

    return message.trim()
  }

  /**
   * Извлечение времени из даты
   */
  private extractTime(dateString: string): string {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    // Если время 00:00, не указываем его
    if (hours === '00' && minutes === '00') {
      return 'Время не указано'
    }

    return `${hours}:${minutes}`
  }

  /**
   * Форматирование списка дополнительного оборудования
   */
  private formatEquipmentList(rental: any): string {
    if (!rental.equipmentList || rental.equipmentList.length === 0) {
      return ''
    }

    const items = rental.equipmentList.map((item: any) =>
      `${item.name} #${item.instanceNumber}`
    ).join(', ')

    return `+ ${items}`
  }
}

export const schedulerService = new SchedulerService()
