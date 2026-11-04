import { all, database, get, run } from './database'
import { normalizeLeadScenario, type LeadScenario } from '../domain/leadAttribution'

const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('7')) return `8${digits.slice(1, 11)}`
  if (digits.startsWith('8')) return digits.slice(0, 11)
  return digits.length === 10 ? `8${digits}` : digits.slice(0, 11)
}

const normalizeEquipmentIds = (equipmentIds?: readonly string[]): string[] => [...new Set(
  (equipmentIds || []).map((id) => id.trim()).filter(Boolean),
)].sort()

const parseEquipmentIds = (value: unknown): string[] => {
  if (typeof value !== 'string' || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? normalizeEquipmentIds(parsed.filter((id): id is string => typeof id === 'string'))
      : []
  } catch {
    return []
  }
}

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
  utmContent?: string
  scenario?: LeadScenario
  officeId?: number
  officeName?: string
  deliveryMethod?: 'pickup' | 'delivery'
  preferredContact?: 'phone' | 'telegram' | 'whatsapp'
  equipmentIds: string[]
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
  utmContent?: string
  scenario?: LeadScenario
  officeId?: number
  officeName?: string
  deliveryMethod?: 'pickup' | 'delivery'
  preferredContact?: 'phone' | 'telegram' | 'whatsapp'
  equipmentIds?: string[]
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
    const equipmentIds = normalizeEquipmentIds(data.equipmentIds)
    const scenario = normalizeLeadScenario(data.scenario, data.utmCampaign, data.sourcePage)
    const result = await run(`
      INSERT INTO contact_leads (
        name, phone, email, subject, message, source_page, referrer,
        utm_source, utm_medium, utm_campaign, utm_content, scenario,
        office_id, office_name, delivery_method, preferred_contact, equipment_ids, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      data.name,
      normalizePhone(data.phone),
      data.email || '',
      data.subject,
      data.message,
      data.sourcePage || '',
      data.referrer || '',
      data.utmSource || '',
      data.utmMedium || '',
      data.utmCampaign || '',
      data.utmContent || '',
      scenario || '',
      data.officeId ?? null,
      data.officeName || '',
      data.deliveryMethod || '',
      data.preferredContact || '',
      JSON.stringify(equipmentIds),
    ])

    const lead = await this.findById(result.lastID)
    if (!lead) {
      throw new Error('Failed to create contact lead')
    }

    return lead
  }

  async findRecentDuplicate(data: CreateContactLeadData, windowMinutes = 10): Promise<ContactLead | null> {
    const rows = await all(`
      SELECT *
      FROM contact_leads
      WHERE status != 'cancelled'
        AND created_at >= datetime('now', ?)
      ORDER BY created_at DESC
    `, [`-${windowMinutes} minutes`]) as any[]

    const phone = normalizePhone(data.phone)
    const scenario = normalizeLeadScenario(data.scenario, data.utmCampaign, data.sourcePage)
    const equipmentIds = normalizeEquipmentIds(data.equipmentIds)
    const row = rows.find((candidate) => {
      if (normalizePhone(candidate.phone) !== phone) return false

      if (scenario) {
        const candidateScenario = normalizeLeadScenario(
          candidate.scenario,
          candidate.utm_campaign,
          candidate.source_page,
        )
        if (candidateScenario !== scenario) return false

        const candidateEquipmentIds = parseEquipmentIds(candidate.equipment_ids)
        return candidateEquipmentIds.length === equipmentIds.length
          && candidateEquipmentIds.every((id, index) => id === equipmentIds[index])
      }

      return candidate.subject === data.subject && candidate.message === data.message
    })

    return row ? this.mapRow(row) : null
  }

  async findOrCreateRecent(
    data: CreateContactLeadData,
    windowMinutes = 10,
  ): Promise<{ lead: ContactLead; created: boolean }> {
    return database.withImmediateTransaction(async () => {
      const duplicate = await this.findRecentDuplicate(data, windowMinutes)
      if (duplicate) return { lead: duplicate, created: false }

      return { lead: await this.create(data), created: true }
    })
  }

  async updateStatus(id: number, status: ContactLead['status']): Promise<void> {
    await run(`
      UPDATE contact_leads
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id])
  }

  async delete(id: number): Promise<void> {
    await run('DELETE FROM contact_leads WHERE id = ?', [id])
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
      utmContent: row.utm_content || undefined,
      scenario: normalizeLeadScenario(row.scenario, row.utm_campaign, row.source_page),
      officeId: row.office_id ?? undefined,
      officeName: row.office_name || undefined,
      deliveryMethod: row.delivery_method || undefined,
      preferredContact: row.preferred_contact || undefined,
      equipmentIds: parseEquipmentIds(row.equipment_ids),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

export const contactLeadModel = new ContactLeadModel()
