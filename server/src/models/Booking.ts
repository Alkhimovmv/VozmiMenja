import { database, run, get, all } from './database'
import { Equipment } from './Equipment'

export interface Booking {
  id: string
  equipmentId: string
  equipment?: Equipment
  customerName: string
  customerPhone: string
  customerEmail: string
  startDate: string
  endDate: string
  totalPrice: number
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
  totalPrice: number
  comment?: string
}

export class BookingModel {
  private db = database.instance

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

    return rows.map(this.mapRowWithEquipment)
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
    await run(`
      INSERT INTO bookings (
        id, equipment_id, customer_name, customer_phone, customer_email,
        start_date, end_date, total_price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      data.id,
      data.equipmentId,
      data.customerName,
      data.customerPhone,
      data.customerEmail || '',
      data.startDate,
      data.endDate,
      data.totalPrice
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
      customerEmail: row.customer_email,
      startDate: row.start_date,
      endDate: row.end_date,
      totalPrice: row.total_price,
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
        images: JSON.parse(row.equipment_images || '[]'),
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