import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { rentalModel, CreateRentalData, RentalStatus } from '../models/Rental'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'
import { rentalToSnakeCase as toSnakeCase } from '../utils/transformers'
import { lockerModel } from '../models/Locker'
import { get, all } from '../models/database'
import { equipmentModel } from '../models/Equipment'
import { calculateRentalPriceQuote } from '../domain/rentalPriceQuote'
import { isForeignKeyError } from '../utils/dbErrors'
import {
  OfficeEquipmentSelectionItem,
  validateOfficeEquipmentSelection,
} from '../domain/officeEquipmentSelection'
import { normalizeLocalRentalDate } from '../domain/rentalDate'
import { rentalCommentSchema } from '../domain/rentalInputRules'

const router = Router()

async function hasOfficeAccess(req: Request, officeId: number): Promise<boolean> {
  const userOfficeIds = await getUserOfficeIds(req)
  return userOfficeIds === null || userOfficeIds.includes(officeId)
}

async function validateEquipmentForOffice(
  equipmentInstances: OfficeEquipmentSelectionItem[],
  officeId: number,
) {
  const uniqueIds = [...new Set(equipmentInstances.map((item) => item.equipmentId))]
  if (!uniqueIds.length) return null

  const rows = await all(
    `SELECT id, office_id, quantity FROM rental_equipment WHERE id IN (${uniqueIds.map(() => '?').join(',')})`,
    uniqueIds
  ) as Array<{ id: number; office_id: number | null; quantity: number }>

  return validateOfficeEquipmentSelection(
    equipmentInstances,
    rows.map((row) => ({ id: row.id, officeId: row.office_id, quantity: row.quantity })),
    officeId,
  )
}

const equipmentSelectionErrorMessage = (error: ReturnType<typeof validateOfficeEquipmentSelection>) => {
  if (error === 'office-mismatch') return 'Выбранное оборудование находится в другом офисе'
  if (error === 'instance-out-of-range') return 'У выбранного оборудования нет такого экземпляра'
  if (error === 'duplicate-instance') return 'Один экземпляр оборудования выбран несколько раз'
  return 'Оборудование не найдено'
}

// Загружает аренду по :id и проверяет, что её офис доступен пользователю.
// Сам отвечает 400/404/403 и возвращает null, если продолжать нельзя.
async function findAccessibleRental(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Некорректный id аренды' })
    return null
  }

  const rental = await rentalModel.findById(id)
  if (!rental) {
    res.status(404).json({ error: 'Аренда не найдена' })
    return null
  }

  if (!await hasOfficeAccess(req, rental.officeId || 1)) {
    res.status(403).json({ error: 'Нет доступа к этой аренде' })
    return null
  }

  return rental
}

const equipmentInstanceSchema = z.object({
  equipment_id: z.number().int().positive(),
  instance_number: z.number().int().positive()
})

// Даты хранятся строкой и сравниваются лексикографически, поэтому формат обязан быть единым:
// YYYY-MM-DD или YYYY-MM-DDTHH:mm[:ss]. Пробел вместо T нормализуем, иначе сравнение ломается.
const rentalDateSchema = z.string()
  .trim()
  .refine((value) => normalizeLocalRentalDate(value) !== null, 'Некорректный формат даты')
  .transform((value) => normalizeLocalRentalDate(value)!)

// Совпадает с CHECK-ограничением колонки rentals.source.
const RENTAL_SOURCES = ['авито', 'сайт', 'рекомендация', 'карты'] as const

const createRentalSchema = z.object({
  equipment_id: z.number().int().positive({ message: 'equipment_id обязателен' }),
  equipment_instances: z.array(equipmentInstanceSchema).min(1).optional(),
  start_date: rentalDateSchema,
  end_date: rentalDateSchema,
  customer_name: z.string().min(1, 'customer_name обязателен').max(200),
  customer_phone: z.string().min(1, 'customer_phone обязателен').max(50),
  needs_delivery: z.boolean().optional().default(false),
  delivery_address: z.string().max(500).optional(),
  rental_price: z.number().min(0).optional().nullable(),
  delivery_price: z.number().min(0).optional().nullable(),
  delivery_costs: z.number().min(0).optional().nullable(),
  source: z.enum(RENTAL_SOURCES, { message: 'Некорректный источник аренды' }).optional().default('авито'),
  comment: rentalCommentSchema.optional(),
  office_id: z.number().int().positive().optional().default(1)
}).refine((data) => data.end_date > data.start_date, {
  message: 'Дата окончания должна быть позже даты начала',
  path: ['end_date'],
})

const updateRentalSchema = z.object({
  equipment_id: z.number().int().positive().optional(),
  equipment_instances: z.array(equipmentInstanceSchema).min(1).optional(),
  start_date: rentalDateSchema.optional(),
  end_date: rentalDateSchema.optional(),
  customer_name: z.string().min(1).max(200).optional(),
  customer_phone: z.string().min(1).max(50).optional(),
  needs_delivery: z.boolean().optional(),
  delivery_address: z.string().max(500).optional().nullable(),
  rental_price: z.number().min(0).optional().nullable(),
  delivery_price: z.number().min(0).optional().nullable(),
  delivery_costs: z.number().min(0).optional().nullable(),
  source: z.enum(RENTAL_SOURCES, { message: 'Некорректный источник аренды' }).optional(),
  comment: rentalCommentSchema.optional().nullable(),
  office_id: z.number().int().positive().optional(),
  status: z.enum(['pending', 'active', 'completed', 'overdue']).optional()
})

const availabilityQuerySchema = z.object({
  equipment_id: z.coerce.number().int().positive(),
  start_date: rentalDateSchema,
  end_date: rentalDateSchema,
  office_id: z.coerce.number().int().positive().optional()
}).refine((data) => data.end_date > data.start_date, {
  message: 'Дата окончания должна быть позже даты начала',
  path: ['end_date'],
})

const priceQuoteSchema = z.object({
  equipment_ids: z.array(z.number().int().positive()).min(1).max(30),
  start_date: rentalDateSchema,
  end_date: rentalDateSchema,
}).refine((data) => data.end_date > data.start_date, {
  message: 'Дата окончания должна быть позже даты начала',
  path: ['end_date'],
})

// GET /api/rentals - Получить все аренды
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, equipmentId, officeId } = req.query
    const userOfficeIds = await getUserOfficeIds(req)

    // Если officeId передан — проверяем что он входит в разрешённые
    const resolvedOfficeId = officeId ? parseInt(officeId as string) : undefined
    if (userOfficeIds !== null) {
      if (resolvedOfficeId !== undefined && !userOfficeIds.includes(resolvedOfficeId)) {
        return res.json([])
      }
    }

    const rentals = await rentalModel.findAll({
      status: status as RentalStatus | undefined,
      equipmentId: equipmentId ? parseInt(equipmentId as string) : undefined,
      officeId: resolvedOfficeId,
      officeIds: userOfficeIds ?? undefined,
    })

    const rentalsWithStatus = rentals.map(rental => ({
      ...rental,
      status: calculateStatus(rental)
    }))

    res.json(rentalsWithStatus.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting rentals:', error)
    res.status(500).json({ error: 'Ошибка получения аренд' })
  }
})

// GET /api/rentals/gantt - Получить данные для диаграммы Ганта
router.get('/gantt', authMiddleware, async (req: Request, res: Response) => {
  try {
    const officeId = req.query.officeId ? parseInt(req.query.officeId as string) : undefined
    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && officeId !== undefined && !userOfficeIds.includes(officeId)) {
      return res.json([])
    }
    const rentals = await rentalModel.findAll({ officeId, officeIds: userOfficeIds ?? undefined })

    // Для диаграммы Ганта разворачиваем каждую аренду в отдельные записи
    // для каждого экземпляра оборудования из equipment_list
    const ganttData: any[] = []

    for (const rental of rentals) {
      const status = calculateStatus(rental)

      // Если есть equipment_list, создаём отдельную запись для каждого экземпляра
      if (rental.equipmentList && rental.equipmentList.length > 0) {
        for (const equipment of rental.equipmentList) {
          ganttData.push({
            ...rental,
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            instanceNumber: equipment.instanceNumber,
            status
          })
        }
      } else {
        // Если equipment_list пуст, используем основное оборудование
        ganttData.push({
          ...rental,
          status
        })
      }
    }

    res.json(ganttData.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting gantt data:', error)
    res.status(500).json({ error: 'Ошибка получения данных для диаграммы Ганта' })
  }
})

// POST /api/admin/rentals/price-quote - необязательная тарифная подсказка.
// Никогда не изменяет аренду и не перезаписывает введённую менеджером сумму.
router.post('/price-quote', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = priceQuoteSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues.map((error) => error.message).join(', ') })
    }

    const { equipment_ids: equipmentIds, start_date: startDate, end_date: endDate } = parsed.data
    const uniqueEquipmentIds = [...new Set(equipmentIds)]
    const placeholders = uniqueEquipmentIds.map(() => '?').join(', ')
    const officeEquipmentRows = await all(`
      SELECT id, name, office_id, catalog_equipment_id
      FROM rental_equipment
      WHERE id IN (${placeholders})
    `, uniqueEquipmentIds) as Array<{
      id: number
      name: string
      office_id: number | null
      catalog_equipment_id: string | null
    }>
    const userOfficeIds = await getUserOfficeIds(req)
    const accessibleOfficeEquipmentRows = userOfficeIds === null
      ? officeEquipmentRows
      : officeEquipmentRows.filter((item) => item.office_id !== null && userOfficeIds.includes(item.office_id))
    const officeEquipmentById = new Map(accessibleOfficeEquipmentRows.map((item) => [item.id, item]))
    const catalogEquipmentIds = [...new Set(
      accessibleOfficeEquipmentRows
        .map((item) => item.catalog_equipment_id)
        .filter((id): id is string => Boolean(id)),
    )]
    const catalogEquipment = await equipmentModel.findByIds(catalogEquipmentIds)
    const catalogEquipmentById = new Map(catalogEquipment.map((item) => [item.id, item]))
    const unresolvedEquipmentIds: number[] = []
    const quoteItems = equipmentIds.flatMap((equipmentId) => {
      const officeEquipment = officeEquipmentById.get(equipmentId)
      const catalogItem = officeEquipment?.catalog_equipment_id
        ? catalogEquipmentById.get(officeEquipment.catalog_equipment_id)
        : undefined

      if (!officeEquipment || !catalogItem) {
        unresolvedEquipmentIds.push(equipmentId)
        return []
      }

      return [{
        rentalEquipmentId: officeEquipment.id,
        rentalEquipmentName: officeEquipment.name,
        catalogEquipment: catalogItem,
      }]
    })

    if (unresolvedEquipmentIds.length > 0) {
      return res.json({
        complete: false,
        unresolved_equipment_ids: [...new Set(unresolvedEquipmentIds)],
        message: 'Не для всех позиций настроена связь с тарифами сайта',
      })
    }

    const quote = calculateRentalPriceQuote(quoteItems, startDate, endDate)
    res.json({
      complete: true,
      rental_days: quote.rentalDays,
      total: quote.total,
      items: quote.items.map((item) => ({
        rental_equipment_id: item.rentalEquipmentId,
        rental_equipment_name: item.rentalEquipmentName,
        catalog_equipment_id: item.catalogEquipmentId,
        catalog_equipment_name: item.catalogEquipmentName,
        total: item.total,
      })),
      unresolved_equipment_ids: [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось рассчитать стоимость'
    res.status(400).json({ error: message })
  }
})

// GET /api/rentals/availability - Проверить доступность слота по оборудованию
router.get('/availability', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = availabilityQuerySchema.safeParse(req.query)

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues.map(e => e.message).join(', ') })
    }

    const { equipment_id, start_date, end_date, office_id } = parsed.data
    const userOfficeIds = await getUserOfficeIds(req)

    const equipmentOffice = await get(
      'SELECT id, name, quantity, office_id FROM rental_equipment WHERE id = ?',
      [equipment_id]
    ) as { id: number; name: string; quantity: number; office_id: number | null } | undefined
    if (!equipmentOffice) {
      return res.status(404).json({ error: 'Оборудование не найдено' })
    }

    const effectiveOfficeId = office_id ?? equipmentOffice.office_id ?? undefined
    if (office_id !== undefined && equipmentOffice.office_id !== office_id) {
      return res.status(400).json({ error: 'Оборудование находится в другом офисе' })
    }

    if (userOfficeIds !== null && (effectiveOfficeId === undefined || !userOfficeIds.includes(effectiveOfficeId))) {
      return res.status(403).json({ error: 'Нет доступа к выбранному офису' })
    }

    const availableInstances = await rentalModel.findAvailableInstances(
      equipment_id,
      start_date,
      end_date,
      undefined,
      effectiveOfficeId
    )

    const rentals = await rentalModel.findAll({
      officeId: effectiveOfficeId,
      officeIds: userOfficeIds ?? undefined,
    })

    const conflictingRentals = rentals
      .flatMap((rental) => {
        const status = calculateStatus(rental)
        const matchingItems = rental.equipmentList?.filter(item => item.id === equipment_id) ?? []

        if (matchingItems.length > 0) {
          return matchingItems.map(item => ({
            ...rental,
            equipmentId: item.id,
            equipmentName: item.name,
            instanceNumber: item.instanceNumber,
            status
          }))
        }

        if (rental.equipmentId === equipment_id) {
          return [{
            ...rental,
            equipmentId: rental.equipmentId,
            equipmentName: rental.equipmentName,
            instanceNumber: 1,
            status
          }]
        }

        return []
      })
      .filter((rental) => {
        if (rental.status === 'completed') return false
        return start_date < rental.endDate && end_date > rental.startDate
      })

    res.json({
      equipment_id,
      equipment_name: equipmentOffice.name,
      total_instances: equipmentOffice.quantity,
      available: availableInstances.length > 0,
      available_instances: availableInstances,
      conflicting_rentals: conflictingRentals.map(toSnakeCase)
    })
  } catch (error) {
    console.error('Error checking rental availability:', error)
    res.status(500).json({ error: 'Ошибка проверки доступности слота' })
  }
})

// GET /api/rentals/customers - Получить список клиентов
router.get('/customers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userOfficeIds = await getUserOfficeIds(req)
    const customers = await rentalModel.getCustomers(userOfficeIds ?? undefined)
    res.json(customers)
  } catch (error) {
    console.error('Error getting customers:', error)
    res.status(500).json({ error: 'Ошибка получения клиентов' })
  }
})

// GET /api/rentals/revenue - Получить данные о доходах по месяцам
router.get('/revenue', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userOfficeIds = await getUserOfficeIds(req)
    const revenue = await rentalModel.getMonthlyRevenue(userOfficeIds ?? undefined)
    res.json(revenue)
  } catch (error) {
    console.error('Error getting revenue:', error)
    res.status(500).json({ error: 'Ошибка получения данных о доходах' })
  }
})

// GET /api/rentals/:id - Получить аренду по ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const rental = await findAccessibleRental(req, res)
    if (!rental) return

    res.json(toSnakeCase({
      ...rental,
      status: calculateStatus(rental)
    }))
  } catch (error) {
    console.error('Error getting rental:', error)
    res.status(500).json({ error: 'Ошибка получения аренды' })
  }
})

// POST /api/admin/rentals - Создать аренду
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = createRentalSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues.map(e => e.message).join(', ') })
    }
    const body = parsed.data

    if (!await hasOfficeAccess(req, body.office_id)) {
      return res.status(403).json({ error: 'Нет доступа к этому офису' })
    }

    let equipmentInstances = body.equipment_instances?.map(inst => ({
      equipmentId: inst.equipment_id,
      instanceNumber: inst.instance_number
    }))
    if (equipmentInstances && !equipmentInstances.some((item) => item.equipmentId === body.equipment_id)) {
      return res.status(400).json({ error: 'Основное оборудование должно входить в список выбранных экземпляров' })
    }

    // Без экземпляров аренда не попадёт в rental_equipment_items и станет невидимой
    // для проверки занятости. Подбираем первый свободный экземпляр сами.
    if (!equipmentInstances?.length) {
      const freeInstances = await rentalModel.findAvailableInstances(
        body.equipment_id, body.start_date, body.end_date, undefined, body.office_id
      )
      if (!freeInstances.length) {
        return res.status(400).json({ error: 'Все экземпляры оборудования уже забронированы на выбранные даты' })
      }
      equipmentInstances = [{ equipmentId: body.equipment_id, instanceNumber: freeInstances[0] }]
    }

    const selectionError = await validateEquipmentForOffice(equipmentInstances, body.office_id)
    if (selectionError) {
      return res.status(400).json({ error: equipmentSelectionErrorMessage(selectionError) })
    }

    const data: CreateRentalData = {
      equipmentId: body.equipment_id,
      equipmentInstances,
      startDate: body.start_date,
      endDate: body.end_date,
      customerName: body.customer_name,
      customerPhone: body.customer_phone,
      needsDelivery: body.needs_delivery ?? false,
      deliveryAddress: body.delivery_address,
      rentalPrice: body.rental_price ?? undefined,
      deliveryPrice: body.delivery_price ?? undefined,
      deliveryCosts: body.delivery_costs ?? undefined,
      source: body.source,
      comment: body.comment,
      officeId: body.office_id
    }
    const rental = await rentalModel.create(data)
    res.status(201).json(toSnakeCase(rental))
  } catch (error: any) {
    console.error('Error creating rental:', error)
    // Если это ошибка проверки доступности, возвращаем 400 с сообщением
    if (error.message && error.message.includes('уже забронировано')) {
      res.status(400).json({ error: error.message })
    } else if (isForeignKeyError(error)) {
      res.status(400).json({ error: 'Оборудование не найдено' })
    } else {
      res.status(500).json({ error: 'Ошибка создания аренды' })
    }
  }
})

// PUT /api/admin/rentals/:id - Обновить аренду
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = updateRentalSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues.map(e => e.message).join(', ') })
    }
    const body = parsed.data

    const existing = await findAccessibleRental(req, res)
    if (!existing) return

    const nextStartDate = body.start_date ?? existing.startDate.replace(' ', 'T')
    const nextEndDate = body.end_date ?? existing.endDate.replace(' ', 'T')
    if (nextEndDate <= nextStartDate) {
      return res.status(400).json({ error: 'Дата окончания должна быть позже даты начала' })
    }

    if (body.office_id !== undefined && !await hasOfficeAccess(req, body.office_id)) {
      return res.status(403).json({ error: 'Нет доступа к этому офису' })
    }
    const nextOfficeId = body.office_id ?? existing.officeId
    const requestedInstances = body.equipment_instances?.map((item) => ({
      equipmentId: item.equipment_id,
      instanceNumber: item.instance_number,
    }))
    if (requestedInstances && body.equipment_id !== undefined
      && !requestedInstances.some((item) => item.equipmentId === body.equipment_id)) {
      return res.status(400).json({ error: 'Основное оборудование должно входить в список выбранных экземпляров' })
    }
    const effectiveInstances = requestedInstances
      ?? (body.equipment_id !== undefined
        ? [{ equipmentId: body.equipment_id, instanceNumber: 1 }]
        : existing.equipmentList?.map((item) => ({
            equipmentId: item.id,
            instanceNumber: item.instanceNumber || 1,
          })) ?? [{ equipmentId: existing.equipmentId, instanceNumber: 1 }])
    const selectionError = await validateEquipmentForOffice(effectiveInstances, nextOfficeId)
    if (selectionError) {
      return res.status(400).json({ error: equipmentSelectionErrorMessage(selectionError) })
    }

    const data: Partial<CreateRentalData & { status: RentalStatus }> = {}

    if (body.equipment_id !== undefined) data.equipmentId = body.equipment_id
    else if (requestedInstances) data.equipmentId = requestedInstances[0].equipmentId
    if (body.equipment_instances !== undefined) {
      data.equipmentInstances = body.equipment_instances.map(inst => ({
        equipmentId: inst.equipment_id,
        instanceNumber: inst.instance_number
      }))
    } else if (body.equipment_id !== undefined) {
      data.equipmentInstances = effectiveInstances
    }
    if (body.start_date !== undefined) data.startDate = body.start_date
    if (body.end_date !== undefined) data.endDate = body.end_date
    if (body.customer_name !== undefined) data.customerName = body.customer_name
    if (body.customer_phone !== undefined) data.customerPhone = body.customer_phone
    if (body.needs_delivery !== undefined) data.needsDelivery = body.needs_delivery
    if (body.delivery_address !== undefined) data.deliveryAddress = body.delivery_address ?? undefined
    if (body.rental_price !== undefined) data.rentalPrice = body.rental_price ?? undefined
    if (body.delivery_price !== undefined) data.deliveryPrice = body.delivery_price ?? undefined
    if (body.delivery_costs !== undefined) data.deliveryCosts = body.delivery_costs ?? undefined
    if (body.source !== undefined) data.source = body.source as any
    if (body.comment !== undefined) data.comment = body.comment ?? undefined
    if (body.office_id !== undefined) data.officeId = body.office_id
    if (body.status !== undefined) data.status = body.status
    if ((body as any).locker_id !== undefined) (data as any).lockerId = (body as any).locker_id

    const rental = await rentalModel.update(existing.id, data)

    // Если аренда завершена — найти ячейку с этим оборудованием и пометить как требующую проверки
    if (body.status === 'completed') {
      const rentalId = parseInt(req.params.id)
      // Берём все equipment_id + instance_number из аренды
      const items = await all(`
        SELECT equipment_id, instance_number FROM rental_equipment_items WHERE rental_id = ?
      `, [rentalId]) as Array<{ equipment_id: number; instance_number: number }>

      if (items.length > 0) {
        // Ищем все ячейки, где лежат экземпляры из этой аренды
        const placeholders = items.map(() => '(le.equipment_id = ? AND le.instance_number = ?)').join(' OR ')
        const params = items.flatMap(i => [i.equipment_id, i.instance_number])
        const lockerRows = await all(`
          SELECT DISTINCT l.id FROM lockers l
          JOIN locker_equipment le ON le.locker_id = l.id
          WHERE ${placeholders}
        `, params) as Array<{ id: number }>

        for (const lockerRow of lockerRows) {
          await lockerModel.markNeedsCheck(lockerRow.id)
        }
      }
    }

    res.json(toSnakeCase(rental))
  } catch (error: any) {
    console.error('Error updating rental:', error)
    if (error.message && error.message.includes('уже забронировано')) {
      res.status(400).json({ error: error.message })
    } else if (error.message === 'Rental not found') {
      res.status(404).json({ error: 'Аренда не найдена' })
    } else {
      res.status(500).json({ error: error.message || 'Ошибка обновления аренды' })
    }
  }
})

// DELETE /api/admin/rentals/:id - Удалить аренду
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const rental = await findAccessibleRental(req, res)
    if (!rental) return

    await rentalModel.delete(rental.id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting rental:', error)
    res.status(500).json({ error: 'Ошибка удаления аренды' })
  }
})

// Функция расчета статуса аренды
function calculateStatus(rental: any): RentalStatus {
  // Если статус вручную установлен как completed - не меняем его
  if (rental.status === 'completed') {
    return 'completed'
  }

  const now = new Date()
  const endDate = new Date(rental.endDate)
  const startDate = new Date(rental.startDate)

  if (now > endDate) {
    return 'overdue'
  }

  if (now >= startDate && now <= endDate) {
    return 'active'
  }

  return 'pending'
}

export default router
