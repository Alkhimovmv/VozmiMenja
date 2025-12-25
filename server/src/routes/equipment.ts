import { Router, Request, Response } from 'express'
import { equipmentModel } from '../models/Equipment'
import { authMiddleware } from '../middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await equipmentModel.getStats()
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching equipment stats:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    })
  }
})

router.get('/categories/counts', async (req: Request, res: Response) => {
  try {
    const counts = await equipmentModel.getCategoryCounts()
    res.json({
      success: true,
      data: counts
    })
  } catch (error) {
    console.error('Error fetching category counts:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении счетчиков категорий'
    })
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const category = req.query.category as string
    const search = req.query.search as string

    const result = await equipmentModel.findAll({
      page,
      limit,
      category,
      search
    })

    res.json({
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error) {
    console.error('Error fetching equipment:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении оборудования'
    })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const equipment = await equipmentModel.findById(id)

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Оборудование не найдено'
      })
    }

    res.json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error('Error fetching equipment by ID:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении оборудования'
    })
  }
})

// POST /api/admin/equipment - Создать оборудование
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = uuidv4()
    const data = {
      id,
      name: req.body.name,
      category: req.body.category,
      pricePerDay: req.body.pricePerDay || req.body.pricing?.day1 || 0,
      pricing: req.body.pricing,
      quantity: req.body.quantity || 1,
      images: req.body.images || [],
      description: req.body.description || '',
      specifications: req.body.specifications || {}
    }

    const equipment = await equipmentModel.create(data)
    res.status(201).json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error('Error creating equipment:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании оборудования',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT /api/admin/equipment/:id - Обновить оборудование
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data: any = {}

    if (req.body.name !== undefined) data.name = req.body.name
    if (req.body.category !== undefined) data.category = req.body.category
    if (req.body.pricePerDay !== undefined) data.pricePerDay = req.body.pricePerDay
    if (req.body.pricing !== undefined) data.pricing = req.body.pricing
    if (req.body.quantity !== undefined) data.quantity = req.body.quantity
    if (req.body.availableQuantity !== undefined) data.availableQuantity = req.body.availableQuantity
    if (req.body.images !== undefined) data.images = req.body.images
    if (req.body.description !== undefined) data.description = req.body.description
    if (req.body.specifications !== undefined) data.specifications = req.body.specifications

    const equipment = await equipmentModel.update(id, data)
    res.json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error('Error updating equipment:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении оборудования',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// DELETE /api/admin/equipment/:id - Удалить оборудование
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await equipmentModel.delete(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting equipment:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении оборудования'
    })
  }
})

export default router