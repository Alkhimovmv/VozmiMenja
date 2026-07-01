import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { database } from '../models/database'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'
import { lockerCommandsService } from '../services/lockerCommands'

const router = Router()

function parseLockerRows(raw: string | null): any[] {
  try {
    return JSON.parse(raw || '[]')
  } catch {
    return []
  }
}

async function formatOffice(o: any) {
  return {
    id: o.id,
    name: o.name,
    address: o.address || '',
    locker_rows: parseLockerRows(o.locker_rows),
    postomat_status: await lockerCommandsService.getPostomatStatus(o.id),
    created_at: o.created_at,
    updated_at: o.updated_at,
  }
}

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

const createLockerCommandSchema = z.object({
  lockerId: z.number().int().positive(),
})

// GET /api/admin/offices/:id/lockers-codes - без авторизации, по секрету
router.get('/:id/lockers-codes', async (req: Request, res: Response) => {
  const secret = process.env.LOCKERS_SECRET
  if (!secret) return res.status(500).json({ error: 'LOCKERS_SECRET не настроен' })
  const provided = req.headers['x-lockers-secret']
  if (!provided || provided !== secret) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { id } = req.params
    const lockers = await database.all(
      'SELECT locker_number, access_code FROM lockers WHERE office_id = ? AND is_active = 1 ORDER BY CAST(locker_number AS INTEGER) ASC',
      [id]
    )
    const result: Record<string, string> = {}
    for (const locker of lockers) result[locker.locker_number] = locker.access_code
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения кодов ячеек' })
  }
})

// GET /api/admin/offices
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    let offices: any[]
    if (req.user!.role === 'superadmin') {
      offices = await database.all('SELECT * FROM offices ORDER BY id ASC')
    } else {
      offices = await database.all(
        'SELECT * FROM offices WHERE user_id = ? ORDER BY id ASC',
        [req.user!.userId]
      )
    }
    res.json(await Promise.all(offices.map(formatOffice)))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения офисов' })
  }
})

// POST /api/admin/offices
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
    const userId = req.user!.userId
    const result = await database.run(
      'INSERT INTO offices (name, address, locker_rows, user_id) VALUES (?, ?, ?, ?)',
      [name, address || '', lockerRowsJson, userId]
    )
    const office = await database.get('SELECT * FROM offices WHERE id = ?', [result.lastID])
    res.status(201).json(await formatOffice(office))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания офиса' })
  }
})

// PUT /api/admin/offices/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const parsed = officeSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const existing = await database.get('SELECT * FROM offices WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ error: 'Офис не найден' })

    // Обычный админ может менять только свои офисы
    if (req.user!.role !== 'superadmin' && existing.user_id !== req.user!.userId) {
      return res.status(403).json({ error: 'Нет доступа к этому офису' })
    }

    const { name, address, locker_rows } = parsed.data
    const newName = name ?? existing.name
    const newAddress = address ?? existing.address ?? ''
    const newLockerRows = locker_rows !== undefined ? JSON.stringify(locker_rows) : existing.locker_rows

    await database.run(
      'UPDATE offices SET name = ?, address = ?, locker_rows = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newName, newAddress, newLockerRows, id]
    )
    const office = await database.get('SELECT * FROM offices WHERE id = ?', [id])
    res.json(await formatOffice(office))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления офиса' })
  }
})

// GET /api/admin/offices/:officeId/locker-commands
router.get('/:officeId/locker-commands', authMiddleware, async (req: Request, res: Response) => {
  try {
    const officeId = Number(req.params.officeId)
    if (!Number.isInteger(officeId) || officeId <= 0) {
      return res.status(400).json({ error: 'Некорректный officeId' })
    }

    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && !userOfficeIds.includes(officeId)) {
      return res.status(403).json({ error: 'Нет доступа к этому офису' })
    }

    const commands = await lockerCommandsService.getCommandsHistory(officeId)
    res.json(commands.map((command) => ({
      id: command.id,
      office_id: command.officeId,
      locker_id: command.lockerId,
      status: command.status,
      created_at: command.createdAt,
      taken_at: command.takenAt,
      finished_at: command.finishedAt,
      error: command.error,
    })))
  } catch (error) {
    console.error('Error getting locker commands:', error)
    res.status(500).json({ error: 'Ошибка получения истории команд' })
  }
})

// POST /api/admin/offices/:officeId/locker-commands
router.post('/:officeId/locker-commands', authMiddleware, async (req: Request, res: Response) => {
  try {
    const officeId = Number(req.params.officeId)
    if (!Number.isInteger(officeId) || officeId <= 0) {
      return res.status(400).json({ error: 'Некорректный officeId' })
    }

    const parsed = createLockerCommandSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map((e) => e.message).join(', ') })
    }

    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && !userOfficeIds.includes(officeId)) {
      return res.status(403).json({ error: 'Нет доступа к этому офису' })
    }

    const command = await lockerCommandsService.createCommand(officeId, parsed.data.lockerId)
    res.status(201).json({
      id: command.id,
      office_id: command.officeId,
      locker_id: command.lockerId,
      status: command.status,
      created_at: command.createdAt,
      taken_at: command.takenAt,
      finished_at: command.finishedAt,
      error: command.error,
    })
  } catch (error: any) {
    if (error.message === 'LOCKER_NOT_FOUND') {
      return res.status(404).json({ error: 'Ячейка не найдена' })
    }
    if (error.message === 'LOCKER_OFFICE_MISMATCH') {
      return res.status(400).json({ error: 'Ячейка не принадлежит выбранному офису' })
    }
    if (error.message === 'LOCKER_OUT_OF_RANGE') {
      return res.status(400).json({ error: 'Разрешено открывать только ячейки с номерами от 1 до 16' })
    }
    console.error('Error creating locker command:', error)
    res.status(500).json({ error: 'Ошибка создания команды открытия' })
  }
})

// DELETE /api/admin/offices/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existing = await database.get('SELECT * FROM offices WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ error: 'Офис не найден' })

    if (req.user!.role !== 'superadmin' && existing.user_id !== req.user!.userId) {
      return res.status(403).json({ error: 'Нет доступа к этому офису' })
    }

    // Нельзя удалить если это единственный офис пользователя
    const count = req.user!.role === 'superadmin'
      ? await database.get('SELECT COUNT(*) as cnt FROM offices')
      : await database.get('SELECT COUNT(*) as cnt FROM offices WHERE user_id = ?', [req.user!.userId])

    if (count.cnt <= 1) {
      return res.status(400).json({ error: 'Нельзя удалить единственный офис' })
    }

    await database.run('DELETE FROM offices WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления офиса' })
  }
})

export default router
