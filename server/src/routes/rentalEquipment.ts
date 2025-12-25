import { Router, Request, Response } from 'express'
import { rentalEquipmentModel, CreateRentalEquipmentData } from '../models/RentalEquipment'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Функция для трансформации camelCase -> snake_case для фронтенда
function toSnakeCase(equipment: any) {
  return {
    id: equipment.id,
    name: equipment.name,
    quantity: equipment.quantity,
    description: equipment.description,
    base_price: equipment.basePrice,
    created_at: equipment.createdAt,
    updated_at: equipment.updatedAt
  }
}

// Функция для трансформации в формат для модального окна аренды (совместимость с Equipment)
function toRentalFormat(equipment: any) {
  return {
    id: equipment.id,
    name: equipment.name,
    category: 'Оборудование',
    price_per_day: equipment.basePrice,
    quantity: equipment.quantity,
    available_quantity: equipment.quantity,
    images: [],
    description: equipment.description || '',
    specifications: {},
    created_at: equipment.createdAt,
    updated_at: equipment.updatedAt
  }
}

// GET /api/admin/equipment/for-rental - Получить все оборудование для аренды
router.get('/for-rental', async (req: Request, res: Response) => {
  try {
    const equipment = await rentalEquipmentModel.findAll()
    res.json(equipment.map(toRentalFormat))
  } catch (error) {
    console.error('Error getting rental equipment:', error)
    res.status(500).json({ error: 'Ошибка получения оборудования' })
  }
})

// GET /api/admin/equipment - Получить все оборудование
router.get('/', async (req: Request, res: Response) => {
  try {
    const equipment = await rentalEquipmentModel.findAll()
    res.json(equipment.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting rental equipment:', error)
    res.status(500).json({ error: 'Ошибка получения оборудования' })
  }
})

// GET /api/admin/equipment/:id - Получить оборудование по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const equipment = await rentalEquipmentModel.findById(parseInt(req.params.id))

    if (!equipment) {
      res.status(404).json({ error: 'Оборудование не найдено' })
      return
    }

    res.json(toSnakeCase(equipment))
  } catch (error) {
    console.error('Error getting rental equipment:', error)
    res.status(500).json({ error: 'Ошибка получения оборудования' })
  }
})

// POST /api/admin/equipment - Создать оборудование
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Трансформируем snake_case в camelCase для модели
    const data: CreateRentalEquipmentData = {
      name: req.body.name,
      quantity: req.body.quantity,
      description: req.body.description,
      basePrice: req.body.base_price || req.body.basePrice
    }
    const equipment = await rentalEquipmentModel.create(data)
    // Трансформируем обратно в snake_case для фронтенда
    res.status(201).json(toSnakeCase(equipment))
  } catch (error) {
    console.error('Error creating rental equipment:', error)
    res.status(500).json({ error: 'Ошибка создания оборудования' })
  }
})

// PUT /api/admin/equipment/:id - Обновить оборудование
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Трансформируем snake_case в camelCase для модели
    const data: Partial<CreateRentalEquipmentData> = {}
    if (req.body.name !== undefined) data.name = req.body.name
    if (req.body.quantity !== undefined) data.quantity = req.body.quantity
    if (req.body.description !== undefined) data.description = req.body.description
    if (req.body.base_price !== undefined || req.body.basePrice !== undefined) {
      data.basePrice = req.body.base_price || req.body.basePrice
    }

    const equipment = await rentalEquipmentModel.update(parseInt(req.params.id), data)
    // Трансформируем обратно в snake_case для фронтенда
    res.json(toSnakeCase(equipment))
  } catch (error) {
    console.error('Error updating rental equipment:', error)
    res.status(500).json({ error: 'Ошибка обновления оборудования' })
  }
})

// DELETE /api/admin/equipment/:id - Удалить оборудование
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await rentalEquipmentModel.delete(parseInt(req.params.id))
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting rental equipment:', error)
    res.status(500).json({ error: 'Ошибка удаления оборудования' })
  }
})

export default router
