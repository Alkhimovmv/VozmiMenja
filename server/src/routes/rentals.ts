import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { rentalModel, CreateRentalData, RentalStatus } from '../models/Rental'
import { authMiddleware } from '../middleware/auth'
import { rentalToSnakeCase as toSnakeCase } from '../utils/transformers'

const router = Router()

const equipmentInstanceSchema = z.object({
  equipment_id: z.number().int().positive(),
  instance_number: z.number().int().positive()
})

const createRentalSchema = z.object({
  equipment_id: z.number().int().positive({ message: 'equipment_id обязателен' }),
  equipment_instances: z.array(equipmentInstanceSchema).optional(),
  start_date: z.string().min(1, 'start_date обязателен'),
  end_date: z.string().min(1, 'end_date обязателен'),
  customer_name: z.string().min(1, 'customer_name обязателен').max(200),
  customer_phone: z.string().min(1, 'customer_phone обязателен').max(50),
  needs_delivery: z.boolean().optional().default(false),
  delivery_address: z.string().max(500).optional(),
  rental_price: z.number().min(0).optional().nullable(),
  delivery_price: z.number().min(0).optional().nullable(),
  delivery_costs: z.number().min(0).optional().nullable(),
  source: z.string().optional().default('авито'),
  comment: z.string().max(1000).optional(),
  office_id: z.number().int().positive().optional().default(1)
})

const updateRentalSchema = z.object({
  equipment_id: z.number().int().positive().optional(),
  equipment_instances: z.array(equipmentInstanceSchema).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  customer_name: z.string().min(1).max(200).optional(),
  customer_phone: z.string().min(1).max(50).optional(),
  needs_delivery: z.boolean().optional(),
  delivery_address: z.string().max(500).optional().nullable(),
  rental_price: z.number().min(0).optional().nullable(),
  delivery_price: z.number().min(0).optional().nullable(),
  delivery_costs: z.number().min(0).optional().nullable(),
  source: z.string().optional(),
  comment: z.string().max(1000).optional().nullable(),
  status: z.enum(['pending', 'active', 'completed', 'overdue']).optional()
})

// GET /api/rentals - Получить все аренды
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, equipmentId, officeId } = req.query

    const rentals = await rentalModel.findAll({
      status: status as RentalStatus | undefined,
      equipmentId: equipmentId ? parseInt(equipmentId as string) : undefined,
      officeId: officeId ? parseInt(officeId as string) : undefined
    })

    // Автоматический расчет статуса
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
router.get('/gantt', async (req: Request, res: Response) => {
  try {
    const officeId = req.query.officeId ? parseInt(req.query.officeId as string) : undefined
    const rentals = await rentalModel.findAll({ officeId })

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

// GET /api/rentals/customers - Получить список клиентов
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const customers = await rentalModel.getCustomers()
    res.json(customers)
  } catch (error) {
    console.error('Error getting customers:', error)
    res.status(500).json({ error: 'Ошибка получения клиентов' })
  }
})

// GET /api/rentals/revenue - Получить данные о доходах по месяцам
router.get('/revenue', async (req: Request, res: Response) => {
  try {
    const revenue = await rentalModel.getMonthlyRevenue()
    res.json(revenue)
  } catch (error) {
    console.error('Error getting revenue:', error)
    res.status(500).json({ error: 'Ошибка получения данных о доходах' })
  }
})

// GET /api/rentals/:id - Получить аренду по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rental = await rentalModel.findById(parseInt(req.params.id))

    if (!rental) {
      res.status(404).json({ error: 'Аренда не найдена' })
      return
    }

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
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const body = parsed.data
    const data: CreateRentalData = {
      equipmentId: body.equipment_id,
      equipmentInstances: body.equipment_instances?.map(inst => ({
        equipmentId: inst.equipment_id,
        instanceNumber: inst.instance_number
      })),
      startDate: body.start_date,
      endDate: body.end_date,
      customerName: body.customer_name,
      customerPhone: body.customer_phone,
      needsDelivery: body.needs_delivery ?? false,
      deliveryAddress: body.delivery_address,
      rentalPrice: body.rental_price ?? undefined,
      deliveryPrice: body.delivery_price ?? undefined,
      deliveryCosts: body.delivery_costs ?? undefined,
      source: body.source as any,
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
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const body = parsed.data
    const data: Partial<CreateRentalData & { status: RentalStatus }> = {}

    if (body.equipment_id !== undefined) data.equipmentId = body.equipment_id
    if (body.equipment_instances !== undefined) {
      data.equipmentInstances = body.equipment_instances.map(inst => ({
        equipmentId: inst.equipment_id,
        instanceNumber: inst.instance_number
      }))
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
    if (body.status !== undefined) data.status = body.status

    const rental = await rentalModel.update(parseInt(req.params.id), data)
    res.json(toSnakeCase(rental))
  } catch (error: any) {
    console.error('Error updating rental:', error)
    // Если это ошибка проверки доступности, возвращаем 400 с сообщением
    if (error.message && error.message.includes('уже забронировано')) {
      res.status(400).json({ error: error.message })
    } else if (error.message === 'Rental not found') {
      res.status(404).json({ error: 'Аренда не найдена' })
    } else {
      res.status(500).json({ error: 'Ошибка обновления аренды' })
    }
  }
})

// DELETE /api/admin/rentals/:id - Удалить аренду
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await rentalModel.delete(parseInt(req.params.id))
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
