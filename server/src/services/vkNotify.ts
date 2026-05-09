import { VK } from 'vk-io'
import dotenv from 'dotenv'

dotenv.config()

class VkNotifyService {
  private vk: VK | null = null
  private peerId: number | null = null

  constructor() {
    const token = process.env.VK_BOT_TOKEN
    const peerId = process.env.VK_PEER_ID

    if (token && peerId) {
      this.vk = new VK({ token })
      this.peerId = parseInt(peerId)
      console.log('✅ VK сервис инициализирован')
    } else {
      console.log('⚠️  VK не настроен (отсутствуют VK_BOT_TOKEN или VK_PEER_ID)')
    }
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
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
    if (!this.vk || !this.peerId) return

    let message =
      `🔔 Новая заявка на аренду\n\n` +
      `📦 ${data.equipmentName}\n\n` +
      `👤 Клиент: ${data.customerName}\n` +
      `📞 Телефон: ${data.customerPhone}\n` +
      `✉️ Email: ${data.customerEmail || 'не указан'}\n\n` +
      `📅 Начало: ${this.formatDate(data.startDate)}\n` +
      `📅 Окончание: ${this.formatDate(data.endDate)}\n\n` +
      `💰 Стоимость: ${data.totalPrice.toLocaleString('ru-RU')} ₽`

    if (data.comment) {
      message += `\n\n💬 Комментарий: ${data.comment}`
    }

    try {
      await this.vk.api.messages.send({ peer_id: this.peerId, message, random_id: Date.now() })
      console.log('✅ VK уведомление о бронировании отправлено')
    } catch (error) {
      console.error('❌ Ошибка отправки VK уведомления:', error)
    }
  }

  async sendMessage(text: string) {
    if (!this.vk || !this.peerId) return
    try {
      const message = text.replace(/<[^>]+>/g, '')
      await this.vk.api.messages.send({ peer_id: this.peerId, message, random_id: Date.now() })
      console.log('✅ VK сообщение отправлено')
    } catch (error) {
      console.error('❌ Ошибка отправки VK сообщения:', error)
    }
  }

  async sendContactMessage(data: {
    name: string
    phone: string
    email?: string
    subject: string
    message: string
  }) {
    if (!this.vk || !this.peerId) return

    const subjectLabels: Record<string, string> = {
      rental: 'Аренда оборудования',
      support: 'Техническая поддержка',
      partnership: 'Сотрудничество',
      other: 'Другое'
    }

    const message =
      `📨 Сообщение с сайта\n\n` +
      `📋 Тема: ${subjectLabels[data.subject] || data.subject}\n\n` +
      `👤 Имя: ${data.name}\n` +
      `📞 Телефон: ${data.phone}\n` +
      `✉️ Email: ${data.email || 'не указан'}\n\n` +
      `💬 ${data.message}`

    try {
      await this.vk.api.messages.send({ peer_id: this.peerId, message, random_id: Date.now() })
      console.log('✅ VK уведомление об обращении отправлено')
    } catch (error) {
      console.error('❌ Ошибка отправки VK уведомления:', error)
    }
  }
}

export const vkNotifyService = new VkNotifyService()
