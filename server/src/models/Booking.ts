import { database, run, get, all } from './database'
import { Equipment } from './Equipment'

export interface Booking {
  id: string
  equipmentId: string
  equipment?: Equipment
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

  private parseImages(value: unknown): string[] {
    if (typeof value !== 'string' || !value.trim()) return []

    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
    } catch {
      return []
    }
  }

  async findAll(): Promise<Booking[]> {
    const rows = await all(`
      SELECT
        b.*,
        e.name as equipment_name,
        e.category as equipment_category,
        e.price_per_day as equipment_price_per_day,
        e.images as equipment_images
      FROM bookings b
      LEFT JOIN equipment e ON b.equipment_id = e.id
      ORDER BY b.created_at DESC
    `) as any[]

    return rows.map((row) => this.mapRowWithEquipment(row))
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await get(`
      SELECT
        b.*,
        e.name as equipment_name,
        e.category as equipment_category,
        e.price_per_day as equipment_price_per_day,
        e.images as equipment_images
      FROM bookings b
      LEFT JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = ?
    `, [id]) as any

    return row ? this.mapRowWithEquipment(row) : null
  }

  async create(data: CreateBookingData & { id: string }): Promise<Booking> {
    const legalAcceptedAt = data.legal ? new Date().toISOString() : null

    await run(`
      INSERT INTO bookings (
        id, equipment_id, customer_name, customer_phone, customer_email,
        start_date, end_date, start_time, end_time, office_id, office_name, total_price, comment, preferred_contact,
        delivery_method, delivery_address, source_page, referrer,
        utm_source, utm_medium, utm_campaign, legal_offer_accepted_at,
        legal_agreement_accepted_at, legal_privacy_accepted_at,
        legal_terms_version, legal_acceptance_ip, legal_acceptance_user_agent,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      data.id,
      data.equipmentId,
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
      WHERE equipment_id = ?
        AND status IN ('confirmed', 'active')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
    `

    const params = [
      equipmentId,
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

  private mapRowWithEquipment(row: any): Booking {
    const booking = this.mapRow(row)

    if (row.equipment_name) {
      booking.equipment = {
        id: booking.equipmentId,
        name: row.equipment_name,
        category: row.equipment_category,
        pricePerDay: row.equipment_price_per_day,
        images: this.parseImages(row.equipment_images),
        quantity: 0,
        availableQuantity: 0,
        description: '',
        specifications: {},
        createdAt: '',
        updatedAt: ''
      }
    }

    return booking
  }
}

export const bookingModel = new BookingModel()
