import { Router, Request, Response } from 'express'
import { equipmentModel } from '../models/Equipment'

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

export default router