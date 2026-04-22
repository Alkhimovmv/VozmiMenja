import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { lockerModel, CreateLockerData } from '../models/Locker'
import { authMiddleware } from '../middleware/auth'
import { initializeLockers } from '../scripts/initializeLockers'

const router = Router()

const createLockerSchema = z.object({
  locker_number: z.string().min(1, 'locker_number обязателен').max(20),
  access_code: z.string().min(1, 'access_code обязателен').max(20),
  description: z.string().max(500).optional(),
  items: z.array(z.string()).optional().default([]),
  is_active: z.boolean().optional().default(true),
  office_id: z.number().int().positive().optional().default(1)
})

function toSnakeCase(locker: any) {
  return {
    id: locker.id,
    locker_number: locker.lockerNumber,
    access_code: locker.accessCode,
    description: locker.description,
    items: locker.items || [],
    size: locker.size,
    row_number: locker.rowNumber,
    position_in_row: locker.positionInRow,
    is_active: locker.isActive,
    office_id: locker.officeId || 1,
    equipment_items: (locker.equipmentItems || []).map((e: any) => ({
      id: e.id,
      equipment_id: e.equipmentId,
      equipment_name: e.equipmentName,
      instance_number: e.instanceNumber,
      is_free: e.isFree,
      customer_last_name: e.customerLastName || null,
    })),
    total_equipment: locker.totalEquipment,
    free_equipment: locker.freeEquipment,
    created_at: locker.createdAt,
    updated_at: locker.updatedAt
  }
}

// GET /api/admin/lockers - Получить все ячейки
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const officeId = req.query.officeId ? parseInt(req.query.officeId as string) : undefined
    const lockers = await lockerModel.findAll(officeId)
    res.json(lockers.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting lockers:', error)
    res.status(500).json({ error: 'Ошибка получения списка ячеек' })
  }
})

// POST /api/admin/lockers/initialize - Инициализировать 13 ячеек постомата
router.post('/initialize', authMiddleware, async (req: Request, res: Response) => {
  try {
    await initializeLockers()
    res.json({ message: '13 ячеек успешно инициализированы' })
  } catch (error) {
    console.error('Error initializing lockers:', error)
    res.status(500).json({ error: 'Ошибка инициализации ячеек' })
  }
})

// GET /api/admin/lockers/generate-code - Сгенерировать уникальный код
router.get('/generate-code', authMiddleware, async (req: Request, res: Response) => {
  try {
    const code = await lockerModel.generateUniqueCode()
    res.json({ code })
  } catch (error) {
    console.error('Error generating code:', error)
    res.status(500).json({ error: 'Ошибка генерации кода' })
  }
})

// GET /api/admin/lockers/:id - Получить ячейку по ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const locker = await lockerModel.findById(parseInt(req.params.id))

    if (!locker) {
      res.status(404).json({ error: 'Ячейка не найдена' })
      return
    }

    res.json(toSnakeCase(locker))
  } catch (error) {
    console.error('Error getting locker:', error)
    res.status(500).json({ error: 'Ошибка получения ячейки' })
  }
})

// POST /api/admin/lockers - Создать ячейку
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = createLockerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const data: CreateLockerData = {
      lockerNumber: parsed.data.locker_number,
      accessCode: parsed.data.access_code,
      description: parsed.data.description,
      items: parsed.data.items,
      isActive: parsed.data.is_active,
      officeId: parsed.data.office_id
    }

    const locker = await lockerModel.create(data)
    res.status(201).json(toSnakeCase(locker))
  } catch (error: any) {
    console.error('Error creating locker:', error)
    if (error.message && error.message.includes('уже существует')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Ошибка создания ячейки' })
    }
  }
})

// PUT /api/admin/lockers/:id - Обновить ячейку
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data: Partial<CreateLockerData> = {}

    if (req.body.locker_number !== undefined || req.body.lockerNumber !== undefined) {
      data.lockerNumber = req.body.locker_number || req.body.lockerNumber
    }

    if (req.body.access_code !== undefined || req.body.accessCode !== undefined) {
      data.accessCode = req.body.access_code || req.body.accessCode
    }

    if (req.body.description !== undefined) {
      data.description = req.body.description
    }

    if (req.body.items !== undefined) {
      data.items = req.body.items
    }

    if (req.body.is_active !== undefined || req.body.isActive !== undefined) {
      data.isActive = req.body.is_active !== undefined ? req.body.is_active : req.body.isActive
    }

    const locker = await lockerModel.update(parseInt(req.params.id), data)
    res.json(toSnakeCase(locker))
  } catch (error: any) {
    console.error('Error updating locker:', error)
    if (error.message && error.message.includes('уже существует')) {
      res.status(400).json({ error: error.message })
    } else if (error.message === 'Locker not found') {
      res.status(404).json({ error: 'Ячейка не найдена' })
    } else {
      res.status(500).json({ error: 'Ошибка обновления ячейки' })
    }
  }
})

// PUT /api/admin/lockers/:id/equipment - Установить оборудование в ячейке
// Body: { items: [{ equipment_id: number, instance_number: number }] }
router.put('/:id/equipment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const lockerId = parseInt(req.params.id)
    const locker = await lockerModel.findById(lockerId)
    if (!locker) {
      res.status(404).json({ error: 'Ячейка не найдена' })
      return
    }

    const items: Array<{ equipmentId: number; instanceNumber: number }> = (req.body.items || []).map((item: any) => ({
      equipmentId: item.equipment_id,
      instanceNumber: item.instance_number || 1,
    }))

    await lockerModel.setEquipment(lockerId, items)

    const updated = await lockerModel.findById(lockerId)
    res.json(toSnakeCase(updated!))
  } catch (error: any) {
    console.error('Error setting locker equipment:', error)
    res.status(500).json({ error: 'Ошибка обновления оборудования в ячейке' })
  }
})

// DELETE /api/admin/lockers/:id - Удалить ячейку
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await lockerModel.delete(parseInt(req.params.id))
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting locker:', error)
    res.status(500).json({ error: 'Ошибка удаления ячейки' })
  }
})

export default router
