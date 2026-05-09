import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

class EmailNotifyService {
  private isConfigured(): boolean {
    return !!(
      process.env.NOTIFY_EMAIL_FROM &&
      process.env.NOTIFY_EMAIL_PASS &&
      process.env.NOTIFY_EMAIL_TO
    )
  }

  private getTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: process.env.NOTIFY_EMAIL_HOST || 'smtp.yandex.ru',
      port: parseInt(process.env.NOTIFY_EMAIL_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.NOTIFY_EMAIL_FROM,
        pass: process.env.NOTIFY_EMAIL_PASS
      }
    })
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
    if (!this.isConfigured()) {
      console.log('⚠️  Email уведомления не настроены (NOTIFY_EMAIL_FROM/PASS/TO)')
      return
    }

    const commentRow = data.comment ? `<tr><td style="padding:6px 0;color:#6b7280">Комментарий</td><td style="padding:6px 0;font-weight:600">${data.comment}</td></tr>` : ''

    const html = `
<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;padding:24px">
  <div style="background:#2563eb;border-radius:16px;padding:20px 24px;margin-bottom:20px">
    <h1 style="color:#fff;margin:0;font-size:20px">🔔 Новая заявка на аренду</h1>
  </div>
  <div style="background:#fff;border-radius:16px;padding:24px;border:1px solid #e2e8f0">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#6b7280;width:140px">Оборудование</td><td style="padding:6px 0;font-weight:700;color:#2563eb">${data.equipmentName}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #f1f5f9;margin:8px 0"></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Клиент</td><td style="padding:6px 0;font-weight:600">${data.customerName}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Телефон</td><td style="padding:6px 0;font-weight:600"><a href="tel:${data.customerPhone}" style="color:#2563eb">${data.customerPhone}</a></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0">${data.customerEmail || 'не указан'}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #f1f5f9;margin:8px 0"></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Начало</td><td style="padding:6px 0;font-weight:600">${this.formatDate(data.startDate)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Окончание</td><td style="padding:6px 0;font-weight:600">${this.formatDate(data.endDate)}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #f1f5f9;margin:8px 0"></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Стоимость</td><td style="padding:6px 0;font-weight:700;font-size:18px;color:#16a34a">${data.totalPrice.toLocaleString('ru-RU')} ₽</td></tr>
      ${commentRow}
    </table>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px">ВозьмиМеня — vozmimenya.ru</p>
</div>`

    try {
      await this.getTransporter().sendMail({
        from: `"ВозьмиМеня" <${process.env.NOTIFY_EMAIL_FROM}>`,
        to: process.env.NOTIFY_EMAIL_TO,
        subject: `Новая заявка: ${data.equipmentName} — ${data.customerName}`,
        html
      })
      console.log('✅ Email уведомление о бронировании отправлено')
    } catch (error) {
      console.error('❌ Ошибка отправки email уведомления:', error)
    }
  }

  async sendContactMessage(data: {
    name: string
    phone: string
    email?: string
    subject: string
    message: string
  }) {
    if (!this.isConfigured()) {
      console.log('⚠️  Email уведомления не настроены (NOTIFY_EMAIL_FROM/PASS/TO)')
      return
    }

    const subjectLabels: Record<string, string> = {
      rental: 'Аренда оборудования',
      support: 'Техническая поддержка',
      partnership: 'Сотрудничество',
      other: 'Другое'
    }

    const html = `
<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;padding:24px">
  <div style="background:#7c3aed;border-radius:16px;padding:20px 24px;margin-bottom:20px">
    <h1 style="color:#fff;margin:0;font-size:20px">📨 Сообщение с сайта</h1>
  </div>
  <div style="background:#fff;border-radius:16px;padding:24px;border:1px solid #e2e8f0">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#6b7280;width:140px">Тема</td><td style="padding:6px 0;font-weight:700">${subjectLabels[data.subject] || data.subject}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #f1f5f9;margin:8px 0"></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Имя</td><td style="padding:6px 0;font-weight:600">${data.name}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Телефон</td><td style="padding:6px 0;font-weight:600"><a href="tel:${data.phone}" style="color:#2563eb">${data.phone}</a></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0">${data.email || 'не указан'}</td></tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #f1f5f9;margin:8px 0"></td></tr>
    </table>
    <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-top:8px;border:1px solid #e2e8f0">
      <p style="margin:0;color:#374151;line-height:1.6">${data.message.replace(/\n/g, '<br>')}</p>
    </div>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px">ВозьмиМеня — vozmimenya.ru</p>
</div>`

    try {
      await this.getTransporter().sendMail({
        from: `"ВозьмиМеня" <${process.env.NOTIFY_EMAIL_FROM}>`,
        to: process.env.NOTIFY_EMAIL_TO,
        subject: `Сообщение с сайта: ${subjectLabels[data.subject] || data.subject} — ${data.name}`,
        html
      })
      console.log('✅ Email уведомление об обращении отправлено')
    } catch (error) {
      console.error('❌ Ошибка отправки email уведомления:', error)
    }
  }
}

export const emailNotifyService = new EmailNotifyService()
