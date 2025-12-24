import { Router, Request, Response } from 'express'
import { lockerModel, CreateLockerData } from '../models/Locker'
import { authMiddleware } from '../middleware/auth'
import { initializeLockers } from '../scripts/initializeLockers'

const router = Router()

// Функция для трансформации camelCase -> snake_case для фронтенда
function toSnakeCase(locker: any) {
  return {
    id: locker.id,
    locker_number: locker.lockerNumber,
    access_code: locker.accessCode,
    description: locker.description,
    size: locker.size,
    row_number: locker.rowNumber,
    position_in_row: locker.positionInRow,
    is_active: locker.isActive,
    created_at: locker.createdAt,
    updated_at: locker.updatedAt
  }
}

// GET /api/admin/lockers - Получить все ячейки
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const lockers = await lockerModel.findAll()
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
    const data: CreateLockerData = {
      lockerNumber: req.body.locker_number || req.body.lockerNumber,
      accessCode: req.body.access_code || req.body.accessCode,
      description: req.body.description,
      isActive: req.body.is_active !== undefined ? req.body.is_active : req.body.isActive
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
