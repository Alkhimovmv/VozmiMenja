import { database, run, get, all } from './database'

export type LockerSize = 'large' | 'medium' | 'small'

export interface Locker {
  id: number
  lockerNumber: string
  accessCode: string
  description?: string
  size: LockerSize
  rowNumber: number
  positionInRow: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLockerData {
  lockerNumber: string
  accessCode: string
  description?: string
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

  private mapRow(row: any): Locker {
    return {
      id: row.id,
      lockerNumber: row.locker_number,
      accessCode: row.access_code,
      description: row.description,
      size: row.size || 'medium',
      rowNumber: row.row_number || 1,
      positionInRow: row.position_in_row || 1,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async findAll(): Promise<Locker[]> {
    const rows = await all(`
      SELECT * FROM lockers
      ORDER BY locker_number ASC
    `) as any[]

    return rows.map(this.mapRow)
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

    const lockerId = await new Promise<number>((resolve, reject) => {
      this.db.run(`
        INSERT INTO lockers (locker_number, access_code, description, size, row_number, position_in_row, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.lockerNumber,
        data.accessCode,
        data.description || null,
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

  async delete(id: number): Promise<void> {
    await run('DELETE FROM lockers WHERE id = ?', [id])
  }
}

export const lockerModel = new LockerModel()
