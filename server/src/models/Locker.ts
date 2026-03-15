import { database, run, get, all } from './database'

export type LockerSize = 'large' | 'medium' | 'small'

export interface LockerEquipmentItem {
  id: number
  equipmentId: number
  equipmentName: string
  instanceNumber: number
  isFree: boolean
  customerLastName?: string  // фамилия арендатора если занят
}

export interface Locker {
  id: number
  lockerNumber: string
  accessCode: string
  description?: string
  items: string[] // Список предметов в ячейке (legacy, оставляем для совместимости)
  size: LockerSize
  rowNumber: number
  positionInRow: number
  isActive: boolean
  // Новые поля
  equipmentItems: LockerEquipmentItem[]
  totalEquipment: number   // сколько единиц оборудования в ячейке
  freeEquipment: number    // сколько из них свободно
  createdAt: string
  updatedAt: string
}

export interface CreateLockerData {
  lockerNumber: string
  accessCode: string
  description?: string
  items?: string[]
  size?: LockerSize
  rowNumber?: number
  positionInRow?: number
  isActive?: boolean
}

export class LockerModel {
  private db = database.instance

  // Генерация случайного 4-значного кода
  generateAccessCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  // Проверка уникальности кода
  async isCodeUnique(code: string, excludeLockerId?: number): Promise<boolean> {
    const query = excludeLockerId
      ? 'SELECT COUNT(*) as count FROM lockers WHERE access_code = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM lockers WHERE access_code = ?'

    const params = excludeLockerId ? [code, excludeLockerId] : [code]
    const result = await get(query, params) as any
    return result.count === 0
  }

  // Генерация уникального кода
  async generateUniqueCode(): Promise<string> {
    let code = this.generateAccessCode()
    let attempts = 0

    while (!(await this.isCodeUnique(code)) && attempts < 100) {
      code = this.generateAccessCode()
      attempts++
    }

    if (attempts >= 100) {
      throw new Error('Не удалось сгенерировать уникальный код')
    }

    return code
  }

  // Получить оборудование в ячейке — каждый экземпляр отдельной строкой
  private async getEquipmentItems(lockerId: number): Promise<LockerEquipmentItem[]> {
    const rows = await all(`
      SELECT
        le.id,
        le.equipment_id,
        le.instance_number,
        re.name as equipment_name
      FROM locker_equipment le
      JOIN rental_equipment re ON le.equipment_id = re.id
      WHERE le.locker_id = ?
      ORDER BY re.name, le.instance_number
    `, [lockerId]) as any[]

    if (rows.length === 0) return []

    const items: LockerEquipmentItem[] = []

    for (const row of rows) {
      // Проверяем, занят ли конкретно этот экземпляр, и берём имя арендатора
      const activeResult = await get(`
        SELECT r.customer_name
        FROM rental_equipment_items rei
        JOIN rentals r ON rei.rental_id = r.id
        WHERE rei.equipment_id = ?
          AND rei.instance_number = ?
          AND r.status != 'completed'
          AND (
            r.status IN ('active', 'overdue')
            OR (datetime('now') >= datetime(r.start_date) AND datetime('now') <= datetime(r.end_date))
            OR datetime('now') > datetime(r.end_date)
          )
        LIMIT 1
      `, [row.equipment_id, row.instance_number]) as any

      const isFree = !activeResult
      const customerLastName = activeResult?.customer_name
        ? activeResult.customer_name.trim().split(/\s+/)[0]
        : undefined

      items.push({
        id: row.id,
        equipmentId: row.equipment_id,
        equipmentName: row.equipment_name,
        instanceNumber: row.instance_number,
        isFree,
        customerLastName
      })
    }

    return items
  }

  private async mapRow(row: any): Promise<Locker> {
    let items: string[] = []
    if (row.items) {
      try {
        items = JSON.parse(row.items)
      } catch (e) {
        items = []
      }
    }

    const equipmentItems = await this.getEquipmentItems(row.id)
    const totalEquipment = equipmentItems.length
    const freeEquipment = equipmentItems.filter(e => e.isFree).length

    return {
      id: row.id,
      lockerNumber: row.locker_number,
      accessCode: row.access_code,
      description: row.description,
      items,
      size: row.size || 'medium',
      rowNumber: row.row_number || 1,
      positionInRow: row.position_in_row || 1,
      isActive: row.is_active === 1,
      equipmentItems,
      totalEquipment,
      freeEquipment,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async findAll(): Promise<Locker[]> {
    const rows = await all(`
      SELECT * FROM lockers
      ORDER BY CAST(locker_number AS INTEGER) ASC
    `) as any[]

    return Promise.all(rows.map(row => this.mapRow(row)))
  }

  async findById(id: number): Promise<Locker | null> {
    const row = await get('SELECT * FROM lockers WHERE id = ?', [id]) as any

    if (!row) {
      return null
    }

    return this.mapRow(row)
  }

  async findByLockerNumber(lockerNumber: string): Promise<Locker | null> {
    const row = await get('SELECT * FROM lockers WHERE locker_number = ?', [lockerNumber]) as any

    if (!row) {
      return null
    }

    return this.mapRow(row)
  }

  async create(data: CreateLockerData): Promise<Locker> {
    // Проверяем уникальность номера ячейки
    const existing = await this.findByLockerNumber(data.lockerNumber)
    if (existing) {
      throw new Error(`Ячейка с номером "${data.lockerNumber}" уже существует`)
    }

    const itemsJson = data.items ? JSON.stringify(data.items) : '[]'

    const lockerId = await new Promise<number>((resolve, reject) => {
      this.db.run(`
        INSERT INTO lockers (locker_number, access_code, description, items, size, row_number, position_in_row, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.lockerNumber,
        data.accessCode,
        data.description || null,
        itemsJson,
        data.size || 'medium',
        data.rowNumber || 1,
        data.positionInRow || 1,
        data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1
      ], function(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })

    const locker = await this.findById(lockerId)
    if (!locker) {
      throw new Error('Failed to create locker')
    }

    return locker
  }

  async update(id: number, data: Partial<CreateLockerData>): Promise<Locker> {
    const updates: string[] = []
    const values: any[] = []

    // Проверяем уникальность номера ячейки при обновлении
    if (data.lockerNumber !== undefined) {
      const existing = await this.findByLockerNumber(data.lockerNumber)
      if (existing && existing.id !== id) {
        throw new Error(`Ячейка с номером "${data.lockerNumber}" уже существует`)
      }
      updates.push('locker_number = ?')
      values.push(data.lockerNumber)
    }

    if (data.accessCode !== undefined) {
      updates.push('access_code = ?')
      values.push(data.accessCode)
    }

    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }

    if (data.items !== undefined) {
      updates.push('items = ?')
      values.push(JSON.stringify(data.items))
    }

    if (data.size !== undefined) {
      updates.push('size = ?')
      values.push(data.size)
    }

    if (data.rowNumber !== undefined) {
      updates.push('row_number = ?')
      values.push(data.rowNumber)
    }

    if (data.positionInRow !== undefined) {
      updates.push('position_in_row = ?')
      values.push(data.positionInRow)
    }

    if (data.isActive !== undefined) {
      updates.push('is_active = ?')
      values.push(data.isActive ? 1 : 0)
    }

    if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await run(`
      UPDATE lockers
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values)

    const locker = await this.findById(id)
    if (!locker) {
      throw new Error('Locker not found')
    }

    return locker
  }

  // Установить оборудование в ячейке (заменяет весь список)
  async setEquipment(lockerId: number, items: Array<{ equipmentId: number; instanceNumber: number }>): Promise<void> {
    await run('DELETE FROM locker_equipment WHERE locker_id = ?', [lockerId])

    for (const item of items) {
      await run(`
        INSERT INTO locker_equipment (locker_id, equipment_id, instance_number)
        VALUES (?, ?, ?)
      `, [lockerId, item.equipmentId, item.instanceNumber])
    }
  }

  async delete(id: number): Promise<void> {
    await run('DELETE FROM lockers WHERE id = ?', [id])
  }
}

export const lockerModel = new LockerModel()
