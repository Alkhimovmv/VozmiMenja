import { database, run, get, all } from './database'

export type RentalSource = 'авито' | 'сайт' | 'рекомендация' | 'карты'
export type RentalStatus = 'pending' | 'active' | 'completed' | 'overdue'

export interface Rental {
  id: number
  equipmentId: number
  startDate: string
  endDate: string
  customerName: string
  customerPhone: string
  needsDelivery: boolean
  deliveryAddress?: string
  rentalPrice?: number
  deliveryPrice?: number
  deliveryCosts?: number
  source: RentalSource
  comment?: string
  status: RentalStatus
  createdAt: string
  updatedAt: string
}

export interface EquipmentInstance {
  equipmentId: number
  instanceNumber: number
}

export interface RentalWithEquipment extends Rental {
  equipmentName: string
  equipmentList?: Array<{ id: number; name: string; instanceNumber: number }>
}

export interface CreateRentalData {
  equipmentId: number
  equipmentIds?: number[]  // Устаревшее, для обратной совместимости
  equipmentInstances?: EquipmentInstance[]  // Новое поле с номерами экземпляров
  startDate: string
  endDate: string
  customerName: string
  customerPhone: string
  needsDelivery: boolean
  deliveryAddress?: string
  rentalPrice?: number
  deliveryPrice?: number
  deliveryCosts?: number
  source: RentalSource
  comment?: string
}

export class RentalModel {
  private db = database.instance

  async findAll(options: {
    status?: RentalStatus
    equipmentId?: number
  } = {}): Promise<RentalWithEquipment[]> {
    const { status, equipmentId } = options

    let whereClause = ''
    const params: any[] = []

    if (status) {
      whereClause += ' WHERE r.status = ?'
      params.push(status)
    }

    if (equipmentId) {
      whereClause += status ? ' AND' : ' WHERE'
      whereClause += ' r.equipment_id = ?'
      params.push(equipmentId)
    }

    const rows = await all(`
      SELECT
        r.*,
        re.name as equipment_name
      FROM rentals r
      LEFT JOIN rental_equipment re ON r.equipment_id = re.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `, params) as any[]

    // Для каждой аренды получаем список дополнительного оборудования с номерами экземпляров
    const rentalsWithEquipment = await Promise.all(
      rows.map(async (row) => {
        const equipmentItems = await all(`
          SELECT re.id, re.name, rei.instance_number
          FROM rental_equipment_items rei
          JOIN rental_equipment re ON rei.equipment_id = re.id
          WHERE rei.rental_id = ?
        `, [row.id]) as Array<{ id: number; name: string; instance_number: number }>

        return {
          ...this.mapRow(row),
          equipmentName: row.equipment_name,
          equipmentList: equipmentItems.length > 0 ? equipmentItems.map(item => ({
            id: item.id,
            name: item.name,
            instanceNumber: item.instance_number || 1  // Default to 1 for old records
          })) : undefined
        }
      })
    )

    return rentalsWithEquipment
  }

  async findById(id: number): Promise<RentalWithEquipment | null> {
    const row = await get(`
      SELECT
        r.*,
        re.name as equipment_name
      FROM rentals r
      LEFT JOIN rental_equipment re ON r.equipment_id = re.id
      WHERE r.id = ?
    `, [id]) as any

    if (!row) return null

    // Получаем список дополнительного оборудования с номерами экземпляров
    const equipmentItems = await all(`
      SELECT re.id, re.name, rei.instance_number
      FROM rental_equipment_items rei
      JOIN rental_equipment re ON rei.equipment_id = re.id
      WHERE rei.rental_id = ?
    `, [id]) as Array<{ id: number; name: string; instance_number: number }>

    return {
      ...this.mapRow(row),
      equipmentName: row.equipment_name,
      equipmentList: equipmentItems.length > 0 ? equipmentItems.map(item => ({
        id: item.id,
        name: item.name,
        instanceNumber: item.instance_number || 1  // Default to 1 for old records
      })) : undefined
    }
  }

  async create(data: CreateRentalData): Promise<Rental> {
    const rentalId = await new Promise<number>((resolve, reject) => {
      this.db.run(`
        INSERT INTO rentals (
          equipment_id, start_date, end_date, customer_name, customer_phone,
          needs_delivery, delivery_address, rental_price, delivery_price,
          delivery_costs, source, comment, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.equipmentId,
        data.startDate,
        data.endDate,
        data.customerName,
        data.customerPhone,
        data.needsDelivery ? 1 : 0,
        data.deliveryAddress || null,
        data.rentalPrice || null,
        data.deliveryPrice || null,
        data.deliveryCosts || null,
        data.source,
        data.comment || null,
        'pending'
      ], function(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })

    // Если указано несколько единиц оборудования, добавляем их в связующую таблицу
    if (data.equipmentInstances && data.equipmentInstances.length > 0) {
      // Новый формат с номерами экземпляров
      for (const instance of data.equipmentInstances) {
        await run(`
          INSERT INTO rental_equipment_items (rental_id, equipment_id, instance_number)
          VALUES (?, ?, ?)
        `, [rentalId, instance.equipmentId, instance.instanceNumber])
      }
    } else if (data.equipmentIds && data.equipmentIds.length > 0) {
      // Старый формат (обратная совместимость) - без номеров экземпляров
      for (const equipmentId of data.equipmentIds) {
        await run(`
          INSERT INTO rental_equipment_items (rental_id, equipment_id, instance_number)
          VALUES (?, ?, ?)
        `, [rentalId, equipmentId, 1])
      }
    }

    const rental = await this.findById(rentalId)
    if (!rental) {
      throw new Error('Failed to create rental')
    }

    return rental
  }

  async update(id: number, data: Partial<CreateRentalData & { status: RentalStatus }>): Promise<Rental> {
    const updates: string[] = []
    const values: any[] = []

    if (data.equipmentId !== undefined) {
      updates.push('equipment_id = ?')
      values.push(data.equipmentId)
    }
    if (data.startDate !== undefined) {
      updates.push('start_date = ?')
      values.push(data.startDate)
    }
    if (data.endDate !== undefined) {
      updates.push('end_date = ?')
      values.push(data.endDate)
    }
    if (data.customerName !== undefined) {
      updates.push('customer_name = ?')
      values.push(data.customerName)
    }
    if (data.customerPhone !== undefined) {
      updates.push('customer_phone = ?')
      values.push(data.customerPhone)
    }
    if (data.needsDelivery !== undefined) {
      updates.push('needs_delivery = ?')
      values.push(data.needsDelivery ? 1 : 0)
    }
    if (data.deliveryAddress !== undefined) {
      updates.push('delivery_address = ?')
      values.push(data.deliveryAddress)
    }
    if (data.rentalPrice !== undefined) {
      updates.push('rental_price = ?')
      values.push(data.rentalPrice)
    }
    if (data.deliveryPrice !== undefined) {
      updates.push('delivery_price = ?')
      values.push(data.deliveryPrice)
    }
    if (data.deliveryCosts !== undefined) {
      updates.push('delivery_costs = ?')
      values.push(data.deliveryCosts)
    }
    if (data.source !== undefined) {
      updates.push('source = ?')
      values.push(data.source)
    }
    if (data.comment !== undefined) {
      updates.push('comment = ?')
      values.push(data.comment)
    }
    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }

    if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    // Обновляем связи с оборудованием, если указаны новые ID
    if (data.equipmentInstances !== undefined) {
      // Удаляем старые связи
      await run('DELETE FROM rental_equipment_items WHERE rental_id = ?', [id])

      // Добавляем новые с номерами экземпляров
      for (const instance of data.equipmentInstances) {
        await run(`
          INSERT INTO rental_equipment_items (rental_id, equipment_id, instance_number)
          VALUES (?, ?, ?)
        `, [id, instance.equipmentId, instance.instanceNumber])
      }
    } else if (data.equipmentIds !== undefined) {
      // Старый формат (обратная совместимость)
      await run('DELETE FROM rental_equipment_items WHERE rental_id = ?', [id])

      for (const equipmentId of data.equipmentIds) {
        await run(`
          INSERT INTO rental_equipment_items (rental_id, equipment_id, instance_number)
          VALUES (?, ?, ?)
        `, [id, equipmentId, 1])
      }
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await run(`
      UPDATE rentals
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values)

    const rental = await this.findById(id)
    if (!rental) {
      throw new Error('Failed to update rental')
    }

    return rental
  }

  async delete(id: number): Promise<void> {
    await run('DELETE FROM rentals WHERE id = ?', [id])
  }

  async getCustomers(): Promise<Array<{
    customerName: string
    customerPhone: string
    rentalCount: number
  }>> {
    const rows = await all(`
      SELECT
        customer_name,
        customer_phone,
        COUNT(*) as rental_count
      FROM rentals
      GROUP BY customer_name, customer_phone
      ORDER BY rental_count DESC
    `) as any[]

    return rows.map(row => ({
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      rentalCount: row.rental_count
    }))
  }

  async getMonthlyRevenue(): Promise<Array<{
    month: string
    year: number
    totalRevenue: number
    rentalCount: number
  }>> {
    const rows = await all(`
      SELECT
        strftime('%m', start_date) as month,
        strftime('%Y', start_date) as year,
        SUM(rental_price + COALESCE(delivery_price, 0)) as total_revenue,
        COUNT(*) as rental_count
      FROM rentals
      WHERE status != 'cancelled'
      GROUP BY month, year
      ORDER BY year DESC, month DESC
    `) as any[]

    return rows.map(row => ({
      month: row.month,
      year: parseInt(row.year),
      totalRevenue: row.total_revenue || 0,
      rentalCount: row.rental_count
    }))
  }

  async getMonthlyRevenueDetails(year: number, month: number): Promise<{
    rental_revenue: number
    delivery_revenue: number
    delivery_costs: number
    total_rentals: number
  }> {
    const monthStr = month.toString().padStart(2, '0')

    const row = await get(`
      SELECT
        COALESCE(SUM(rental_price), 0) as rental_revenue,
        COALESCE(SUM(delivery_price), 0) as delivery_revenue,
        COALESCE(SUM(delivery_costs), 0) as delivery_costs,
        COUNT(*) as total_rentals
      FROM rentals
      WHERE strftime('%Y', start_date) = ?
        AND strftime('%m', start_date) = ?
        AND status != 'cancelled'
    `, [year.toString(), monthStr]) as any

    return {
      rental_revenue: row?.rental_revenue || 0,
      delivery_revenue: row?.delivery_revenue || 0,
      delivery_costs: row?.delivery_costs || 0,
      total_rentals: row?.total_rentals || 0
    }
  }

  async getCustomerRentals(phone: string): Promise<RentalWithEquipment[]> {
    const rows = await all(`
      SELECT
        r.*,
        re.name as equipment_name
      FROM rentals r
      LEFT JOIN rental_equipment re ON r.equipment_id = re.id
      WHERE r.customer_phone = ?
      ORDER BY r.start_date DESC
    `, [phone]) as any[]

    return rows.map(row => ({
      ...this.mapRow(row),
      equipmentName: row.equipment_name
    }))
  }

  private mapRow(row: any): Rental {
    return {
      id: row.id,
      equipmentId: row.equipment_id,
      startDate: row.start_date,
      endDate: row.end_date,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      needsDelivery: row.needs_delivery === 1,
      deliveryAddress: row.delivery_address || undefined,
      rentalPrice: row.rental_price || undefined,
      deliveryPrice: row.delivery_price || undefined,
      deliveryCosts: row.delivery_costs || undefined,
      source: row.source as RentalSource,
      comment: row.comment || undefined,
      status: row.status as RentalStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

export const rentalModel = new RentalModel()
