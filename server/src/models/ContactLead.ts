import { all, get, run } from './database'

export interface ContactLead {
  id: number
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateContactLeadData {
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
}

export class ContactLeadModel {
  async findAll(): Promise<ContactLead[]> {
    const rows = await all(`
      SELECT *
      FROM contact_leads
      ORDER BY created_at DESC
    `) as any[]

    return rows.map(this.mapRow)
  }

  async findById(id: number): Promise<ContactLead | null> {
    const row = await get(`
      SELECT *
      FROM contact_leads
      WHERE id = ?
    `, [id]) as any

    return row ? this.mapRow(row) : null
  }

  async create(data: CreateContactLeadData): Promise<ContactLead> {
    const result = await run(`
      INSERT INTO contact_leads (
        name, phone, email, subject, message, source_page, referrer,
        utm_source, utm_medium, utm_campaign, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      data.name,
      data.phone,
      data.email || '',
      data.subject,
      data.message,
      data.sourcePage || '',
      data.referrer || '',
      data.utmSource || '',
      data.utmMedium || '',
      data.utmCampaign || '',
    ])

    const lead = await this.findById(result.lastID)
    if (!lead) {
      throw new Error('Failed to create contact lead')
    }

    return lead
  }

  async updateStatus(id: number, status: ContactLead['status']): Promise<void> {
    await run(`
      UPDATE contact_leads
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id])
  }

  private mapRow(row: any): ContactLead {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email || undefined,
      subject: row.subject,
      message: row.message,
      sourcePage: row.source_page || undefined,
      referrer: row.referrer || undefined,
      utmSource: row.utm_source || undefined,
      utmMedium: row.utm_medium || undefined,
      utmCampaign: row.utm_campaign || undefined,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

export const contactLeadModel = new ContactLeadModel()
