import { Router, Request, Response } from 'express'
import { rentalEquipmentModel, CreateRentalEquipmentData } from '../models/RentalEquipment'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'
import { equipmentToSnakeCase as toSnakeCase, equipmentToRentalFormat as toRentalFormat } from '../utils/transformers'

const router = Router()

// Получить office_id из query или использовать первый доступный офис пользователя
async function resolveOfficeId(req: Request): Promise<number | undefined> {
  const userOfficeIds = await getUserOfficeIds(req)
  if (userOfficeIds === null) {
    // суперадмин — фильтр по query param если передан
    const qOffice = req.query.officeId ? parseInt(req.query.officeId as string) : undefined
    return qOffice
  }
  if (userOfficeIds.length === 0) return -1 // нет офисов — нет оборудования
  const qOffice = req.query.officeId ? parseInt(req.query.officeId as string) : undefined
  if (qOffice && userOfficeIds.includes(qOffice)) return qOffice
  return userOfficeIds[0]
}

// Проверка доступа к конкретной единице оборудования
async function canAccessEquipment(req: Request, equipmentOfficeId?: number): Promise<boolean> {
  const userOfficeIds = await getUserOfficeIds(req)
  if (userOfficeIds === null) return true // суперадмин
  if (!equipmentOfficeId) return false
  return userOfficeIds.includes(equipmentOfficeId)
}

// GET /api/admin/equipment/for-rental
router.get('/for-rental', authMiddleware, async (req: Request, res: Response) => {
  try {
    const officeId = await resolveOfficeId(req)
    if (officeId === -1) return res.json([])
    const equipment = await rentalEquipmentModel.findAll(officeId)
    res.json(equipment.map(toRentalFormat))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения оборудования' })
  }
})

// GET /api/admin/equipment
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const officeId = await resolveOfficeId(req)
    if (officeId === -1) return res.json([])
    const equipment = await rentalEquipmentModel.findAll(officeId)
    res.json(equipment.map(toSnakeCase))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения оборудования' })
  }
})

// GET /api/admin/equipment/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const equipment = await rentalEquipmentModel.findById(parseInt(req.params.id))
    if (!equipment) return res.status(404).json({ error: 'Оборудование не найдено' })

    if (!await canAccessEquipment(req, equipment.officeId)) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    res.json(toSnakeCase(equipment))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения оборудования' })
  }
})

// POST /api/admin/equipment
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const officeId = await resolveOfficeId(req)
    if (officeId === -1) return res.status(403).json({ error: 'Нет доступа к офису' })

    const bodyOfficeId = req.body.office_id ? Number(req.body.office_id) : undefined
    const finalOfficeId = (bodyOfficeId && !isNaN(bodyOfficeId)) ? bodyOfficeId : officeId

    const data: CreateRentalEquipmentData = {
      name: req.body.name,
      quantity: req.body.quantity,
      description: req.body.description,
      basePrice: req.body.base_price || req.body.basePrice,
      userId: req.user!.userId,
      officeId: finalOfficeId,
    }
    const equipment = await rentalEquipmentModel.create(data)
    res.status(201).json(toSnakeCase(equipment))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания оборудования' })
  }
})

// PUT /api/admin/equipment/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const equipment = await rentalEquipmentModel.findById(parseInt(req.params.id))
    if (!equipment) return res.status(404).json({ error: 'Оборудование не найдено' })

    if (!await canAccessEquipment(req, equipment.officeId)) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    const data: Partial<CreateRentalEquipmentData> = {}
    if (req.body.name !== undefined) data.name = req.body.name
    if (req.body.quantity !== undefined) data.quantity = req.body.quantity
    if (req.body.description !== undefined) data.description = req.body.description
    if (req.body.base_price !== undefined || req.body.basePrice !== undefined) {
      data.basePrice = req.body.base_price || req.body.basePrice
    }

    const updated = await rentalEquipmentModel.update(parseInt(req.params.id), data)
    res.json(toSnakeCase(updated))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления оборудования' })
  }
})

// DELETE /api/admin/equipment/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const equipment = await rentalEquipmentModel.findById(parseInt(req.params.id))
    if (!equipment) return res.status(404).json({ error: 'Оборудование не найдено' })

    if (!await canAccessEquipment(req, equipment.officeId)) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    await rentalEquipmentModel.delete(parseInt(req.params.id))
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления оборудования' })
  }
})

export default router
