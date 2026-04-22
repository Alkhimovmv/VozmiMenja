import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { database } from '../models/database'
import { authMiddleware } from '../middleware/auth'

const router = Router()

const lockerRowSchema = z.object({
  row: z.number().int().positive(),
  count: z.number().int().min(1).max(20),
  size: z.enum(['small', 'medium', 'large'])
})

const officeSchema = z.object({
  name: z.string().min(1, 'Название офиса обязательно').max(100),
  address: z.string().max(300).optional().default(''),
  locker_rows: z.array(lockerRowSchema).optional()
})

// GET /api/admin/offices - Получить все офисы
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const offices = await database.all('SELECT * FROM offices ORDER BY id ASC')
    const result = offices.map((o: any) => ({
      id: o.id,
      name: o.name,
      address: o.address || '',
      locker_rows: JSON.parse(o.locker_rows || '[]'),
      created_at: o.created_at,
      updated_at: o.updated_at,
    }))
    res.json(result)
  } catch (error) {
    console.error('Error getting offices:', error)
    res.status(500).json({ error: 'Ошибка получения офисов' })
  }
})

// POST /api/admin/offices - Создать офис
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = officeSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const { name, address, locker_rows } = parsed.data
    const lockerRowsJson = JSON.stringify(locker_rows || [
      { row: 4, count: 6, size: 'small' },
      { row: 3, count: 3, size: 'medium' },
      { row: 2, count: 2, size: 'large' },
      { row: 1, count: 2, size: 'large' },
    ])
    const result = await database.run(
      'INSERT INTO offices (name, address, locker_rows) VALUES (?, ?, ?)',
      [name, address || '', lockerRowsJson]
    )
    const office = await database.get('SELECT * FROM offices WHERE id = ?', [result.lastID])
    res.status(201).json({
      id: office.id,
      name: office.name,
      address: office.address || '',
      locker_rows: JSON.parse(office.locker_rows || '[]'),
    })
  } catch (error) {
    console.error('Error creating office:', error)
    res.status(500).json({ error: 'Ошибка создания офиса' })
  }
})

// PUT /api/admin/offices/:id - Обновить офис
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const parsed = officeSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const { name, address, locker_rows } = parsed.data
    const existing = await database.get('SELECT * FROM offices WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ error: 'Офис не найден' })

    const newName = name ?? existing.name
    const newAddress = address ?? existing.address ?? ''
    const newLockerRows = locker_rows !== undefined ? JSON.stringify(locker_rows) : existing.locker_rows

    await database.run(
      'UPDATE offices SET name = ?, address = ?, locker_rows = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newName, newAddress, newLockerRows, id]
    )
    const office = await database.get('SELECT * FROM offices WHERE id = ?', [id])
    res.json({
      id: office.id,
      name: office.name,
      address: office.address || '',
      locker_rows: JSON.parse(office.locker_rows || '[]'),
    })
  } catch (error) {
    console.error('Error updating office:', error)
    res.status(500).json({ error: 'Ошибка обновления офиса' })
  }
})

// DELETE /api/admin/offices/:id - Удалить офис (нельзя удалить если только 1)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const count = await database.get('SELECT COUNT(*) as cnt FROM offices')
    if (count.cnt <= 1) {
      return res.status(400).json({ error: 'Нельзя удалить единственный офис' })
    }
    const existing = await database.get('SELECT * FROM offices WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ error: 'Офис не найден' })

    await database.run('DELETE FROM offices WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting office:', error)
    res.status(500).json({ error: 'Ошибка удаления офиса' })
  }
})

export default router
