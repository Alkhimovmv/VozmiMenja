import { Bot } from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import type { LeadScenario } from '../domain/leadAttribution'

// Загружаем переменные окружения
dotenv.config()

class TelegramService {
  private bot: Bot | null = null
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
      this.bot = new Bot(token)
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
    startDate: string
    endDate: string
    totalPrice: number
    officeName?: string
    comment?: string
    sourcePage?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmContent?: string
    scenario?: LeadScenario
  }) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram бот не настроен, уведомление не отправлено')
      return
    }

    try {
      const source = [data.utmSource, data.utmMedium, data.utmCampaign].filter(Boolean).join(' / ')
      let message = `
🔔 <b>Новая заявка на аренду</b>

📦 <b>Оборудование:</b> ${this.escapeHtml(data.equipmentName)}

👤 <b>Клиент:</b>
• Имя: ${this.escapeHtml(data.customerName)}
• Телефон: ${this.escapeHtml(data.customerPhone)}

📅 <b>Даты аренды:</b>
• Начало: ${this.formatDate(data.startDate)}
• Окончание: ${this.formatDate(data.endDate)}

💰 <b>Стоимость:</b> ${data.totalPrice}₽`

      if (data.officeName) {
        message += `\n\n🏢 <b>Офис:</b> ${this.escapeHtml(data.officeName)}`
      }

      if (data.comment) {
        message += `\n\n💬 <b>Комментарий:</b>\n${this.escapeHtml(data.comment)}`
      }

      if (source || data.utmContent || data.scenario || data.sourcePage || data.referrer) {
        message += `\n\n📈 <b>Источник:</b>`
        if (source) message += `\n• UTM: ${this.escapeHtml(source)}`
        if (data.utmContent) message += `\n• UTM content: ${this.escapeHtml(data.utmContent)}`
        if (data.scenario) message += `\n• Сценарий: ${this.escapeHtml(data.scenario)}`
        if (data.sourcePage) message += `\n• Страница: ${this.escapeHtml(data.sourcePage)}`
        if (data.referrer) message += `\n• Referrer: ${this.escapeHtml(data.referrer)}`
      }

      message += `\n\n👉 Свяжитесь с клиентом для подтверждения бронирования`
      message = message.trim()

      await this.bot.api.sendMessage({
        chat_id: this.chatId,
        text: message,
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
    sourcePage?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmContent?: string
    scenario?: LeadScenario
    officeId?: number
    officeName?: string
    deliveryMethod?: 'pickup' | 'delivery'
    preferredContact?: 'phone' | 'telegram' | 'whatsapp'
    equipmentIds?: string[]
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

      const subject = subjectLabels[data.subject] || data.subject
      let message = `
📨 <b>Новое сообщение с формы обратной связи</b>

📋 <b>Тема:</b> ${this.escapeHtml(subject)}

👤 <b>Контакт:</b>
• Имя: ${this.escapeHtml(data.name)}
• Телефон: ${this.escapeHtml(data.phone)}
• Email: ${data.email ? this.escapeHtml(data.email) : 'не указан'}

💬 <b>Сообщение:</b>
${this.escapeHtml(data.message)}`.trim()

      if (data.officeName) message += `\n\n🏢 <b>Офис:</b> ${this.escapeHtml(data.officeName)}`
      if (data.officeId) message += `\n• ID офиса: ${data.officeId}`
      if (data.deliveryMethod) message += `\n• Получение: ${this.escapeHtml(data.deliveryMethod)}`
      if (data.preferredContact) message += `\n• Связь: ${this.escapeHtml(data.preferredContact)}`
      if (data.equipmentIds?.length) {
        message += `\n• Оборудование: ${this.escapeHtml(data.equipmentIds.join(', '))}`
      }

      const source = [data.utmSource, data.utmMedium, data.utmCampaign].filter(Boolean).join(' / ')
      if (source || data.utmContent || data.scenario || data.sourcePage || data.referrer) {
        message += `\n\n📈 <b>Источник:</b>`
        if (source) message += `\n• UTM: ${this.escapeHtml(source)}`
        if (data.utmContent) message += `\n• UTM content: ${this.escapeHtml(data.utmContent)}`
        if (data.scenario) message += `\n• Сценарий: ${this.escapeHtml(data.scenario)}`
        if (data.sourcePage) message += `\n• Страница: ${this.escapeHtml(data.sourcePage)}`
        if (data.referrer) message += `\n• Referrer: ${this.escapeHtml(data.referrer)}`
      }

      await this.bot.api.sendMessage({
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML'
      })

      console.log('✅ Сообщение обратной связи отправлено в Telegram')
    } catch (error) {
      console.error('❌ Ошибка отправки в Telegram:', error)
    }
  }

  async sendDailyRentalsReminder(message: string) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram бот не настроен, уведомление не отправлено')
      return
    }

    try {
      await this.bot.api.sendMessage({
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML'
      })

      console.log('✅ Ежедневное уведомление о предстоящих арендах отправлено в Telegram')
    } catch (error) {
      console.error('❌ Ошибка отправки ежедневного уведомления в Telegram:', error)
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

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
}

export const telegramService = new TelegramService()
