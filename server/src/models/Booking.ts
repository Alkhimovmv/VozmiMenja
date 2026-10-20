import { database, run, get, all } from './database'
import { equipmentModel, type Equipment } from './Equipment'

export interface Booking {
  id: string
  equipmentId: string
  equipmentIds: string[]
  equipment?: Equipment
  equipmentItems: Equipment[]
  customerName: string
  customerPhone: string
  customerEmail?: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  officeId?: number
  officeName?: string
  totalPrice: number
  comment?: string
  preferredContact?: string
  deliveryMethod?: 'pickup' | 'delivery'
  deliveryAddress?: string
  sourcePage?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  legalOfferAcceptedAt?: string
  legalAgreementAcceptedAt?: string
  legalPrivacyAcceptedAt?: string
  legalTermsVersion?: string
  legalAcceptanceIp?: string
  legalAcceptanceUserAgent?: string
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateBookingData {
  equipmentId: string
  equipmentIds?: string[]
  customerName: string
  customerPhone: string
  customerEmail?: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  officeId?: number
  officeName?: string
  totalPrice: number
  comment?: string
  preferredContact?: string
  deliveryMethod?: 'pickup' | 'delivery'
  deliveryAddress?: string
  sourcePage?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  legal?: {
    offerAccepted: true
    agreementAccepted: true
    privacyAccepted: true
    termsVersion: string
  }
  legalAcceptanceIp?: string
  legalAcceptanceUserAgent?: string
}

export class BookingModel {
  private db = database.instance

  async findAll(): Promise<Booking[]> {
    const rows = await all(`
      SELECT b.*
      FROM bookings b
      ORDER BY b.created_at DESC
    `) as any[]

    const bookings = rows.map((row) => this.mapRow(row))
    return this.attachEquipmentItems(bookings)
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await get(`
      SELECT b.*
      FROM bookings b
      WHERE b.id = ?
    `, [id]) as any

    if (!row) return null

    const [booking] = await this.attachEquipmentItems([this.mapRow(row)])
    return booking
  }

  async create(data: CreateBookingData & { id: string }): Promise<Booking> {
    const legalAcceptedAt = data.legal ? new Date().toISOString() : null
    const equipmentIds = data.equipmentIds?.length ? [...new Set(data.equipmentIds)] : [data.equipmentId]

    await run(`
      INSERT INTO bookings (
        id, equipment_id, equipment_ids, customer_name, customer_phone, customer_email,
        start_date, end_date, start_time, end_time, office_id, office_name, total_price, comment, preferred_contact,
        delivery_method, delivery_address, source_page, referrer,
        utm_source, utm_medium, utm_campaign, legal_offer_accepted_at,
        legal_agreement_accepted_at, legal_privacy_accepted_at,
        legal_terms_version, legal_acceptance_ip, legal_acceptance_user_agent,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      data.id,
      data.equipmentId,
      JSON.stringify(equipmentIds),
      data.customerName,
      data.customerPhone,
      data.customerEmail || '',
      data.startDate,
      data.endDate,
      data.startTime || '10:00',
      data.endTime || '10:00',
      data.officeId || null,
      data.officeName || '',
      data.totalPrice,
      data.comment || '',
      data.preferredContact || '',
      data.deliveryMethod || '',
      data.deliveryAddress || '',
      data.sourcePage || '',
      data.referrer || '',
      data.utmSource || '',
      data.utmMedium || '',
      data.utmCampaign || '',
      legalAcceptedAt,
      legalAcceptedAt,
      legalAcceptedAt,
      data.legal?.termsVersion || '',
      data.legalAcceptanceIp || '',
      data.legalAcceptanceUserAgent || ''
    ])

    const booking = await this.findById(data.id)
    if (!booking) {
      throw new Error('Failed to create booking')
    }

    return booking
  }

  async updateStatus(id: string, status: Booking['status']): Promise<void> {
    await run(`
      UPDATE bookings
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id])
  }

  async delete(id: string): Promise<void> {
    await run('DELETE FROM bookings WHERE id = ?', [id])
  }

  async findConflictingBookings(
    equipmentId: string,
    startDate: string,
    endDate: string,
    excludeBookingId?: string
  ): Promise<Booking[]> {

    let query = `
      SELECT * FROM bookings
      WHERE (
          equipment_id = ?
          OR EXISTS (
            SELECT 1
            FROM json_each(
              CASE WHEN json_valid(equipment_ids) THEN equipment_ids ELSE '[]' END
            )
            WHERE json_each.value = ?
          )
        )
        AND status IN ('confirmed', 'active')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
    `

    const params = [
      equipmentId, equipmentId,
      startDate, startDate,
      endDate, endDate,
      startDate, endDate
    ]

    if (excludeBookingId) {
      query += ' AND id != ?'
      params.push(excludeBookingId)
    }

    const rows = await all(query, params) as any[]
    return rows.map(this.mapRow)
  }

  private mapRow(row: any): Booking {
    return {
      id: row.id,
      equipmentId: row.equipment_id,
      equipmentIds: this.parseEquipmentIds(row.equipment_ids, row.equipment_id),
      equipmentItems: [],
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email || undefined,
      startDate: row.start_date,
      endDate: row.end_date,
      startTime: row.start_time || undefined,
      endTime: row.end_time || undefined,
      officeId: row.office_id || undefined,
      officeName: row.office_name || undefined,
      totalPrice: row.total_price,
      comment: row.comment || undefined,
      preferredContact: row.preferred_contact || undefined,
      deliveryMethod: row.delivery_method || undefined,
      deliveryAddress: row.delivery_address || undefined,
      sourcePage: row.source_page || undefined,
      referrer: row.referrer || undefined,
      utmSource: row.utm_source || undefined,
      utmMedium: row.utm_medium || undefined,
      utmCampaign: row.utm_campaign || undefined,
      legalOfferAcceptedAt: row.legal_offer_accepted_at || undefined,
      legalAgreementAcceptedAt: row.legal_agreement_accepted_at || undefined,
      legalPrivacyAcceptedAt: row.legal_privacy_accepted_at || undefined,
      legalTermsVersion: row.legal_terms_version || undefined,
      legalAcceptanceIp: row.legal_acceptance_ip || undefined,
      legalAcceptanceUserAgent: row.legal_acceptance_user_agent || undefined,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private parseEquipmentIds(value: unknown, fallbackId: string): string[] {
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          const ids = parsed.filter((id): id is string => typeof id === 'string' && Boolean(id.trim()))
          if (ids.length) return [...new Set(ids)]
        }
      } catch {
        // Legacy rows fall back to equipment_id.
      }
    }

    return fallbackId ? [fallbackId] : []
  }

  private async attachEquipmentItems(bookings: Booking[]): Promise<Booking[]> {
    const ids = [...new Set(bookings.flatMap((booking) => booking.equipmentIds))]
    const equipment = await equipmentModel.findByIds(ids)
    const equipmentById = new Map(equipment.map((item) => [item.id, item]))

    return bookings.map((booking) => {
      const equipmentItems = booking.equipmentIds
        .map((id) => equipmentById.get(id))
        .filter((item): item is Equipment => Boolean(item))

      return {
        ...booking,
        equipment: equipmentItems[0],
        equipmentItems,
      }
    })
  }
}

export const bookingModel = new BookingModel()
