import { Router, Request, Response } from 'express'
import { rentalEquipmentModel, CreateRentalEquipmentData, RentalEquipmentInstance } from '../models/RentalEquipment'
import { equipmentModel } from '../models/Equipment'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'
import { equipmentToSnakeCase as toSnakeCase, equipmentToRentalFormat as toRentalFormat } from '../utils/transformers'

const router = Router()

const getCatalogEquipmentId = (body: any): string | null | undefined => {
  const hasSnakeCaseValue = Object.prototype.hasOwnProperty.call(body, 'catalog_equipment_id')
  const hasCamelCaseValue = Object.prototype.hasOwnProperty.call(body, 'catalogEquipmentId')
  if (!hasSnakeCaseValue && !hasCamelCaseValue) return undefined

  const rawValue = hasSnakeCaseValue ? body.catalog_equipment_id : body.catalogEquipmentId
  if (rawValue === null || String(rawValue).trim() === '') return null
  return String(rawValue).trim()
}

async function validateCatalogEquipmentLink(
  catalogEquipmentId: string | null | undefined,
  officeId: number | undefined,
  excludeRentalEquipmentId?: number,
): Promise<string | null> {
  if (!catalogEquipmentId) return null
  if (!officeId) return 'Сначала выберите офис оборудования'

  const catalogEquipment = await equipmentModel.findById(catalogEquipmentId)
  if (!catalogEquipment) return 'Выбранная позиция отсутствует в каталоге сайта'

  const existingLinks = await rentalEquipmentModel.findByCatalogEquipmentId(catalogEquipmentId, officeId)
  if (existingLinks.some((item) => item.id !== excludeRentalEquipmentId)) {
    return 'Эта позиция каталога уже связана с другим оборудованием выбранного офиса'
  }

  return null
}

function normalizeInstances(input: any, quantity: number): RentalEquipmentInstance[] {
  if (!Array.isArray(input)) {
    return Array.from({ length: quantity }, (_, index) => ({
      instanceNumber: index + 1,
    }))
  }

  return Array.from({ length: quantity }, (_, index) => {
    const instanceNumber = index + 1
    const matching = input.find((instance: any) => Number(instance?.instance_number ?? instance?.instanceNumber) === instanceNumber)
    return {
      instanceNumber,
      serialNumber: typeof matching?.serial_number === 'string'
        ? matching.serial_number
        : typeof matching?.serialNumber === 'string'
          ? matching.serialNumber
          : undefined,
      comment: typeof matching?.comment === 'string' ? matching.comment : undefined,
    }
  })
}

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

// Список публичного каталога для явной связи с офисным оборудованием.
router.get('/catalog-options', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const result = await equipmentModel.findAll({ page: 1, limit: 1000 })
    res.json(result.data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
    })))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения каталога сайта' })
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

// POST /api/admin/equipment/:id/instances/:instanceNumber/move
router.post('/:id/instances/:instanceNumber/move', authMiddleware, async (req: Request, res: Response) => {
  try {
    const equipmentId = Number(req.params.id)
    const instanceNumber = Number(req.params.instanceNumber)
    const targetOfficeId = Number(req.body.office_id ?? req.body.officeId)

    if (!Number.isInteger(equipmentId) || equipmentId <= 0 || !Number.isInteger(instanceNumber) || instanceNumber <= 0) {
      return res.status(400).json({ error: 'Некорректный экземпляр оборудования' })
    }

    if (!Number.isInteger(targetOfficeId) || targetOfficeId <= 0) {
      return res.status(400).json({ error: 'Некорректный офис' })
    }

    const equipment = await rentalEquipmentModel.findById(equipmentId)
    if (!equipment) return res.status(404).json({ error: 'Оборудование не найдено' })

    if (!await canAccessEquipment(req, equipment.officeId)) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && !userOfficeIds.includes(targetOfficeId)) {
      return res.status(403).json({ error: 'Нет доступа к выбранному офису' })
    }

    const moved = await rentalEquipmentModel.moveInstanceToOffice(equipmentId, instanceNumber, targetOfficeId)
    res.json(toSnakeCase(moved))
  } catch (error: any) {
    const message = error?.message || 'Ошибка переноса экземпляра оборудования'
    const status = message.includes('активной') || message.includes('ожидающей') || message.includes('уже находится') ? 400 : 500
    res.status(status).json({ error: message })
  }
})

// POST /api/admin/equipment
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userOfficeIds = await getUserOfficeIds(req)
    const officeId = await resolveOfficeId(req)
    if (officeId === -1) return res.status(403).json({ error: 'Нет доступа к офису' })

    const bodyOfficeId = req.body.office_id ? Number(req.body.office_id) : undefined
    const finalOfficeId = (bodyOfficeId && !isNaN(bodyOfficeId)) ? bodyOfficeId : officeId

    if (userOfficeIds !== null && (!finalOfficeId || !userOfficeIds.includes(finalOfficeId))) {
      return res.status(403).json({ error: 'Нет доступа к выбранному офису' })
    }

    const rawBasePrice = req.body.base_price ?? req.body.basePrice
    const normalizedBasePrice = rawBasePrice === '' || rawBasePrice === null || rawBasePrice === undefined
      ? 0
      : Number(rawBasePrice)

    if (Number.isNaN(normalizedBasePrice)) {
      return res.status(400).json({ error: 'Некорректная цена оборудования' })
    }

    const data: CreateRentalEquipmentData = {
      name: req.body.name,
      quantity: req.body.quantity,
      description: req.body.description,
      basePrice: normalizedBasePrice,
      catalogEquipmentId: getCatalogEquipmentId(req.body),
      userId: req.user!.userId,
      officeId: finalOfficeId,
      instances: normalizeInstances(req.body.instances, Number(req.body.quantity) || 1),
    }

    const catalogLinkError = await validateCatalogEquipmentLink(data.catalogEquipmentId, finalOfficeId)
    if (catalogLinkError) return res.status(400).json({ error: catalogLinkError })

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
    const catalogEquipmentId = getCatalogEquipmentId(req.body)
    if (catalogEquipmentId !== undefined) data.catalogEquipmentId = catalogEquipmentId
    const nextQuantity = req.body.quantity !== undefined ? Number(req.body.quantity) : equipment.quantity
    if (req.body.base_price !== undefined || req.body.basePrice !== undefined) {
      const rawBasePrice = req.body.base_price ?? req.body.basePrice
      const normalizedBasePrice = rawBasePrice === '' || rawBasePrice === null || rawBasePrice === undefined
        ? 0
        : Number(rawBasePrice)

      if (Number.isNaN(normalizedBasePrice)) {
        return res.status(400).json({ error: 'Некорректная цена оборудования' })
      }

      data.basePrice = normalizedBasePrice
    }
    if (req.body.instances !== undefined || req.body.quantity !== undefined) {
      data.instances = normalizeInstances(req.body.instances, nextQuantity)
    }

    const catalogLinkError = await validateCatalogEquipmentLink(
      data.catalogEquipmentId,
      equipment.officeId,
      equipment.id,
    )
    if (catalogLinkError) return res.status(400).json({ error: catalogLinkError })

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
