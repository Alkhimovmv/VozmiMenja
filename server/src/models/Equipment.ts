import { promisify } from 'util'
import { database } from './database'

export interface PricingTier {
  days1_2: number
  days3: number
  days7: number
  days14: number
  days30: number
}

export interface Equipment {
  id: string
  name: string
  category: string
  pricePerDay: number
  pricing?: PricingTier
  quantity: number
  availableQuantity: number
  images: string[]
  description: string
  specifications: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface CreateEquipmentData {
  name: string
  category: string
  pricePerDay: number
  pricing?: PricingTier
  quantity: number
  images: string[]
  description: string
  specifications: Record<string, string>
}

export class EquipmentModel {
  private db = database.instance

  async findAll(options: {
    page?: number
    limit?: number
    category?: string
    search?: string
  } = {}): Promise<{ data: Equipment[]; total: number }> {
    const { page = 1, limit = 12, category, search } = options
    const offset = (page - 1) * limit

    let whereClause = ''
    const params: any[] = []

    if (category) {
      whereClause += ' WHERE category = ?'
      params.push(category)
    }

    if (search) {
      whereClause += category ? ' AND' : ' WHERE'
      whereClause += ' (name LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    const all = promisify(this.db.all.bind(this.db))
    const get = promisify(this.db.get.bind(this.db))

    const countQuery = `SELECT COUNT(*) as count FROM equipment${whereClause}`
    const countResult = await get(countQuery, params) as { count: number }

    const dataQuery = `
      SELECT * FROM equipment
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `

    const rows = await all(dataQuery, [...params, limit, offset]) as any[]

    const data = rows.map(this.mapRow)

    return {
      data,
      total: countResult.count
    }
  }

  async findById(id: string): Promise<Equipment | null> {
    const get = promisify(this.db.get.bind(this.db))
    const row = await get('SELECT * FROM equipment WHERE id = ?', [id]) as any

    return row ? this.mapRow(row) : null
  }

  async create(data: CreateEquipmentData & { id: string }): Promise<Equipment> {
    const run = promisify(this.db.run.bind(this.db))

    await run(`
      INSERT INTO equipment (
        id, name, category, price_per_day, pricing, quantity, available_quantity,
        images, description, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id,
      data.name,
      data.category,
      data.pricePerDay,
      data.pricing ? JSON.stringify(data.pricing) : null,
      data.quantity,
      data.quantity, // initially all available
      JSON.stringify(data.images),
      data.description,
      JSON.stringify(data.specifications)
    ])

    const equipment = await this.findById(data.id)
    if (!equipment) {
      throw new Error('Failed to create equipment')
    }

    return equipment
  }

  async update(id: string, data: Partial<CreateEquipmentData>): Promise<Equipment> {
    const run = promisify(this.db.run.bind(this.db))

    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.category !== undefined) {
      updates.push('category = ?')
      values.push(data.category)
    }
    if (data.pricePerDay !== undefined) {
      updates.push('price_per_day = ?')
      values.push(data.pricePerDay)
    }
    if (data.pricing !== undefined) {
      updates.push('pricing = ?')
      values.push(JSON.stringify(data.pricing))
    }
    if (data.quantity !== undefined) {
      updates.push('quantity = ?')
      values.push(data.quantity)
    }
    if ((data as any).availableQuantity !== undefined) {
      updates.push('available_quantity = ?')
      values.push((data as any).availableQuantity)
    }
    if (data.images !== undefined) {
      updates.push('images = ?')
      values.push(JSON.stringify(data.images))
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.specifications !== undefined) {
      updates.push('specifications = ?')
      values.push(JSON.stringify(data.specifications))
    }

    if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await run(`
      UPDATE equipment
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values)

    const equipment = await this.findById(id)
    if (!equipment) {
      throw new Error('Failed to update equipment')
    }

    return equipment
  }

  async delete(id: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db))
    await run('DELETE FROM equipment WHERE id = ?', [id])
  }

  async updateAvailableQuantity(id: string, change: number): Promise<void> {
    const run = promisify(this.db.run.bind(this.db))

    await run(`
      UPDATE equipment
      SET available_quantity = available_quantity + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [change, id])
  }

  async getStats(): Promise<{ totalEquipment: number; totalCategories: number }> {
    const get = promisify(this.db.get.bind(this.db))

    const totalResult = await get('SELECT COUNT(*) as count FROM equipment') as { count: number }
    const categoriesResult = await get('SELECT COUNT(DISTINCT category) as count FROM equipment') as { count: number }

    return {
      totalEquipment: totalResult.count,
      totalCategories: categoriesResult.count
    }
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    const all = promisify(this.db.all.bind(this.db))

    const rows = await all(`
      SELECT category, COUNT(*) as count
      FROM equipment
      GROUP BY category
    `) as Array<{ category: string; count: number }>

    const counts: Record<string, number> = {}
    rows.forEach(row => {
      counts[row.category] = row.count
    })

    return counts
  }

  private mapRow(row: any): Equipment {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      pricePerDay: row.price_per_day,
      pricing: row.pricing ? JSON.parse(row.pricing) : undefined,
      quantity: row.quantity,
      availableQuantity: row.available_quantity,
      images: JSON.parse(row.images),
      description: row.description,
      specifications: JSON.parse(row.specifications),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

export const equipmentModel = new EquipmentModel()