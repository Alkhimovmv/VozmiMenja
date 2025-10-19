import { database, run, get, all } from './database'

export interface RentalEquipment {
  id: number
  name: string
  quantity: number
  description?: string
  basePrice: number
  createdAt: string
  updatedAt: string
}

export interface CreateRentalEquipmentData {
  name: string
  quantity: number
  description?: string
  basePrice: number
}

export class RentalEquipmentModel {
  private db = database.instance

  async findAll(): Promise<RentalEquipment[]> {
    const rows = await all(`
      SELECT * FROM rental_equipment
      ORDER BY created_at DESC
    `) as any[]

    return rows.map(this.mapRow)
  }

  async findById(id: number): Promise<RentalEquipment | null> {
    const row = await get('SELECT * FROM rental_equipment WHERE id = ?', [id]) as any

    return row ? this.mapRow(row) : null
  }

  async create(data: CreateRentalEquipmentData): Promise<RentalEquipment> {
    const result = await new Promise<number>((resolve, reject) => {
      this.db.run(`
        INSERT INTO rental_equipment (name, quantity, description, base_price)
        VALUES (?, ?, ?, ?)
      `, [data.name, data.quantity, data.description || null, data.basePrice], function(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })

    const equipment = await this.findById(result)
    if (!equipment) {
      throw new Error('Failed to create rental equipment')
    }

    return equipment
  }

  async update(id: number, data: Partial<CreateRentalEquipmentData>): Promise<RentalEquipment> {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.quantity !== undefined) {
      updates.push('quantity = ?')
      values.push(data.quantity)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.basePrice !== undefined) {
      updates.push('base_price = ?')
      values.push(data.basePrice)
    }

    if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await run(`
      UPDATE rental_equipment
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values)

    const equipment = await this.findById(id)
    if (!equipment) {
      throw new Error('Failed to update rental equipment')
    }

    return equipment
  }

  async delete(id: number): Promise<void> {
    await run('DELETE FROM rental_equipment WHERE id = ?', [id])
  }

  private mapRow(row: any): RentalEquipment {
    return {
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      description: row.description || undefined,
      basePrice: row.base_price,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

export const rentalEquipmentModel = new RentalEquipmentModel()
