import { database, run, get, all } from './database'

export interface RentalEquipment {
  id: number
  name: string
  quantity: number
  description?: string
  basePrice: number
  officeId?: number
  instances: RentalEquipmentInstance[]
  createdAt: string
  updatedAt: string
}

export interface RentalEquipmentInstance {
  instanceNumber: number
  serialNumber?: string
  comment?: string
}

export interface CreateRentalEquipmentData {
  name: string
  quantity: number
  description?: string
  basePrice: number
  userId?: number
  officeId?: number
  instances?: RentalEquipmentInstance[]
}

export class RentalEquipmentModel {
  private db = database.instance

  async findAll(officeId?: number): Promise<RentalEquipment[]> {
    const rows = officeId !== undefined
      ? await all(`SELECT * FROM rental_equipment WHERE office_id = ? ORDER BY created_at DESC`, [officeId]) as any[]
      : await all(`SELECT * FROM rental_equipment ORDER BY created_at DESC`) as any[]

    return Promise.all(rows.map((row) => this.mapRow(row)))
  }

  async findById(id: number): Promise<RentalEquipment | null> {
    const row = await get('SELECT * FROM rental_equipment WHERE id = ?', [id]) as any
    return row ? this.mapRow(row) : null
  }

  async create(data: CreateRentalEquipmentData): Promise<RentalEquipment> {
    const result = await new Promise<number>((resolve, reject) => {
      this.db.run(`
        INSERT INTO rental_equipment (name, quantity, description, base_price, user_id, office_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [data.name, data.quantity, data.description || null, data.basePrice, data.userId || null, data.officeId || null], function(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })

    await this.syncInstances(result, data.quantity, data.instances)

    const equipment = await this.findById(result)
    if (!equipment) throw new Error('Failed to create rental equipment')
    return equipment
  }

  async update(id: number, data: Partial<CreateRentalEquipmentData>): Promise<RentalEquipment> {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name) }
    if (data.quantity !== undefined) { updates.push('quantity = ?'); values.push(data.quantity) }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description) }
    if (data.basePrice !== undefined) { updates.push('base_price = ?'); values.push(data.basePrice) }

    const nextQuantity = data.quantity ?? (await this.findById(id))?.quantity
    if (!nextQuantity) throw new Error('Equipment not found')

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      await run(`UPDATE rental_equipment SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    if (data.instances !== undefined || data.quantity !== undefined) {
      await this.syncInstances(id, nextQuantity, data.instances)
    } else if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    const equipment = await this.findById(id)
    if (!equipment) throw new Error('Failed to update rental equipment')
    return equipment
  }

  async delete(id: number): Promise<void> {
    await run('DELETE FROM rental_equipment WHERE id = ?', [id])
  }

  private async getInstances(equipmentId: number, quantity: number): Promise<RentalEquipmentInstance[]> {
    const rows = await all(
      `SELECT instance_number, serial_number, comment
       FROM rental_equipment_instances
       WHERE equipment_id = ?
       ORDER BY instance_number ASC`,
      [equipmentId]
    ) as any[]

    const byNumber = new Map<number, RentalEquipmentInstance>()
    rows.forEach((row) => {
      byNumber.set(row.instance_number, {
        instanceNumber: row.instance_number,
        serialNumber: row.serial_number || undefined,
        comment: row.comment || undefined,
      })
    })

    const instances: RentalEquipmentInstance[] = []
    for (let instanceNumber = 1; instanceNumber <= quantity; instanceNumber++) {
      instances.push(byNumber.get(instanceNumber) || { instanceNumber })
    }

    return instances
  }

  private async syncInstances(equipmentId: number, quantity: number, instances?: RentalEquipmentInstance[]): Promise<void> {
    const normalizedInstances: RentalEquipmentInstance[] = []
    for (let instanceNumber = 1; instanceNumber <= quantity; instanceNumber++) {
      const matching = instances?.find((instance) => instance.instanceNumber === instanceNumber)
      normalizedInstances.push({
        instanceNumber,
        serialNumber: matching?.serialNumber?.trim() || undefined,
        comment: matching?.comment?.trim() || undefined,
      })
    }

    await run(
      'DELETE FROM rental_equipment_instances WHERE equipment_id = ? AND instance_number > ?',
      [equipmentId, quantity]
    )

    for (const instance of normalizedInstances) {
      await run(
        `INSERT INTO rental_equipment_instances (equipment_id, instance_number, serial_number, comment)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(equipment_id, instance_number) DO UPDATE SET
           serial_number = excluded.serial_number,
           comment = excluded.comment`,
        [
          equipmentId,
          instance.instanceNumber,
          instance.serialNumber || null,
          instance.comment || null,
        ]
      )
    }
  }

  private async mapRow(row: any): Promise<RentalEquipment> {
    return {
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      description: row.description || undefined,
      basePrice: row.base_price,
      officeId: row.office_id || undefined,
      instances: await this.getInstances(row.id, row.quantity),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

export const rentalEquipmentModel = new RentalEquipmentModel()
