import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

class TelegramService {
  private bot: TelegramBot | null = null
  private chatId: string | null = null

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    console.log('🔍 Проверка Telegram конфигурации:', {
      hasToken: !!token,
      tokenLength: token?.length,
      hasChatId: !!chatId,
      chatId: chatId
    })

    if (token && chatId) {
      this.bot = new TelegramBot(token, { polling: false })
      this.chatId = chatId
      console.log('✅ Telegram бот инициализирован')
    } else {
      console.log('⚠️  Telegram бот не настроен (отсутствуют TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID)')
    }
  }

  async sendBookingNotification(data: {
    equipmentName: string
    customerName: string
    customerPhone: string
    customerEmail: string
    startDate: string
    endDate: string
    totalPrice: number
    comment?: string
  }) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram бот не настроен, уведомление не отправлено')
      return
    }

    try {
      let message = `
🔔 <b>Новая заявка на аренду</b>

📦 <b>Оборудование:</b> ${data.equipmentName}

👤 <b>Клиент:</b>
• Имя: ${data.customerName}
• Телефон: ${data.customerPhone}
• Email: ${data.customerEmail || 'не указан'}

📅 <b>Даты аренды:</b>
• Начало: ${this.formatDate(data.startDate)}
• Окончание: ${this.formatDate(data.endDate)}

💰 <b>Стоимость:</b> ${data.totalPrice}₽`

      if (data.comment) {
        message += `\n\n💬 <b>Комментарий:</b>\n${data.comment}`
      }

      message += `\n\n👉 Свяжитесь с клиентом для подтверждения бронирования`
      message = message.trim()

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML'
      })

      console.log('✅ Уведомление о бронировании отправлено в Telegram')
    } catch (error) {
      console.error('❌ Ошибка отправки в Telegram:', error)
    }
  }

  async sendContactMessage(data: {
    name: string
    phone: string
    email?: string
    subject: string
    message: string
  }) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram бот не настроен, сообщение не отправлено')
      return
    }

    try {
      const subjectLabels: Record<string, string> = {
        rental: 'Аренда оборудования',
        support: 'Техническая поддержка',
        partnership: 'Сотрудничество',
        other: 'Другое'
      }

      const message = `
📨 <b>Новое сообщение с формы обратной связи</b>

📋 <b>Тема:</b> ${subjectLabels[data.subject] || data.subject}

👤 <b>Контакт:</b>
• Имя: ${data.name}
• Телефон: ${data.phone}
• Email: ${data.email || 'не указан'}

💬 <b>Сообщение:</b>
${data.message}
      `.trim()

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML'
      })

      console.log('✅ Сообщение обратной связи отправлено в Telegram')
    } catch (error) {
      console.error('❌ Ошибка отправки в Telegram:', error)
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

export const telegramService = new TelegramService()
