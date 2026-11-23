import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { gzipSync } from 'zlib'
import { database } from '../models/database'

// Gmail и большинство SMTP режут письма около 25 МБ; держим запас на base64-кодирование.
const MAX_ATTACHMENT_BYTES = 18 * 1024 * 1024

class EmailBackupService {
  private transporter: Transporter | null = null

  private isConfigured(): boolean {
    return !!(
      process.env.BACKUP_EMAIL_FROM &&
      process.env.BACKUP_EMAIL_TO &&
      process.env.BACKUP_EMAIL_PASS
    )
  }

  private getTransporter(): Transporter {
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

    const now = new Date()
    const dateStr = now.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Moscow'
    })

    // Копировать живой файл нельзя: письмо может уйти с недописанной транзакцией.
    // VACUUM INTO делает согласованный снимок через то же соединение.
    const snapshotPath = path.join(os.tmpdir(), `vozmimenya-backup-${process.pid}-${now.getTime()}.sqlite`)
    let compressed: Buffer
    try {
      await database.run('VACUUM INTO ?', [snapshotPath])
      compressed = gzipSync(fs.readFileSync(snapshotPath))
    } finally {
      fs.rmSync(snapshotPath, { force: true })
    }

    if (compressed.length > MAX_ATTACHMENT_BYTES) {
      throw new Error(`Бэкап ${(compressed.length / 1024 / 1024).toFixed(1)} МБ не помещается во вложение письма — нужен другой способ хранения бэкапов`)
    }
    const sizeMB = (compressed.length / 1024 / 1024).toFixed(2)

    await this.getTransporter().sendMail({
      from: `"VozmiMenja Backup" <${process.env.BACKUP_EMAIL_FROM}>`,
      to: process.env.BACKUP_EMAIL_TO,
      subject: `БД бэкап VozmiMenja — ${dateStr}`,
      text: `Еженедельный автоматический бэкап базы данных VozmiMenja.\n\nДата: ${dateStr}\nРазмер архива: ${sizeMB} МБ\n\nФайл во вложении (gzip). Распаковка: gunzip <файл>.sqlite.gz`,
      attachments: [
        {
          filename: `vozmimenya-backup-${now.toISOString().slice(0, 10)}.sqlite.gz`,
          content: compressed
        }
      ]
    })

    console.log(`✅ Email бэкап отправлен на ${process.env.BACKUP_EMAIL_TO} (${sizeMB} МБ)`)
  }
}

export const emailBackupService = new EmailBackupService()
