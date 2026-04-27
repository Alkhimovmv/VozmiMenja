import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

// server/dist/services/ -> server/database.sqlite
const DB_PATH = path.join(__dirname, '../../database.sqlite')

class EmailBackupService {
  private transporter: nodemailer.Transporter | null = null

  private isConfigured(): boolean {
    return !!(
      process.env.BACKUP_EMAIL_FROM &&
      process.env.BACKUP_EMAIL_TO &&
      process.env.BACKUP_EMAIL_PASS
    )
  }

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.BACKUP_EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.BACKUP_EMAIL_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.BACKUP_EMAIL_FROM,
          pass: process.env.BACKUP_EMAIL_PASS
        }
      })
    }
    return this.transporter
  }

  async sendDatabaseBackup(): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Email бэкап не настроен: добавь BACKUP_EMAIL_FROM, BACKUP_EMAIL_TO, BACKUP_EMAIL_PASS в server/.env')
    }

    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Файл базы данных не найден: ${DB_PATH}`)
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Moscow'
    })
    const stats = fs.statSync(DB_PATH)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

    await this.getTransporter().sendMail({
      from: `"VozmiMenja Backup" <${process.env.BACKUP_EMAIL_FROM}>`,
      to: process.env.BACKUP_EMAIL_TO,
      subject: `БД бэкап VozmiMenja — ${dateStr}`,
      text: `Еженедельный автоматический бэкап базы данных VozmiMenja.\n\nДата: ${dateStr}\nРазмер файла: ${sizeMB} МБ\n\nФайл во вложении.`,
      attachments: [
        {
          filename: `vozmimenya-backup-${now.toISOString().slice(0, 10)}.sqlite`,
          path: DB_PATH
        }
      ]
    })

    console.log(`✅ Email бэкап отправлен на ${process.env.BACKUP_EMAIL_TO} (${sizeMB} МБ)`)
  }
}

export const emailBackupService = new EmailBackupService()
