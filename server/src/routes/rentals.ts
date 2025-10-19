import { Router, Request, Response } from 'express'
import { rentalModel, CreateRentalData, RentalStatus } from '../models/Rental'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Функция для трансформации camelCase -> snake_case для фронтенда
function toSnakeCase(rental: any) {
  return {
    id: rental.id,
    equipment_id: rental.equipmentId,
    start_date: rental.startDate,
    end_date: rental.endDate,
    customer_name: rental.customerName,
    customer_phone: rental.customerPhone,
    needs_delivery: rental.needsDelivery,
    delivery_address: rental.deliveryAddress,
    rental_price: rental.rentalPrice,
    delivery_price: rental.deliveryPrice,
    delivery_costs: rental.deliveryCosts,
    source: rental.source,
    comment: rental.comment,
    status: rental.status,
    created_at: rental.createdAt,
    updated_at: rental.updatedAt,
    equipment_name: rental.equipmentName,
    equipment_list: rental.equipmentList
  }
}

// GET /api/rentals - Получить все аренды
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, equipmentId } = req.query

    const rentals = await rentalModel.findAll({
      status: status as RentalStatus | undefined,
      equipmentId: equipmentId ? parseInt(equipmentId as string) : undefined
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
    const rentals = await rentalModel.findAll()

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
    // Трансформируем snake_case в camelCase для модели
    const data: CreateRentalData = {
      equipmentId: req.body.equipment_id || req.body.equipmentId,
      equipmentIds: req.body.equipment_ids || req.body.equipmentIds,
      startDate: req.body.start_date || req.body.startDate,
      endDate: req.body.end_date || req.body.endDate,
      customerName: req.body.customer_name || req.body.customerName,
      customerPhone: req.body.customer_phone || req.body.customerPhone,
      needsDelivery: req.body.needs_delivery !== undefined ? req.body.needs_delivery : req.body.needsDelivery,
      deliveryAddress: req.body.delivery_address || req.body.deliveryAddress,
      rentalPrice: req.body.rental_price || req.body.rentalPrice,
      deliveryPrice: req.body.delivery_price || req.body.deliveryPrice,
      deliveryCosts: req.body.delivery_costs || req.body.deliveryCosts,
      source: req.body.source,
      comment: req.body.comment
    }
    const rental = await rentalModel.create(data)
    res.status(201).json(toSnakeCase(rental))
  } catch (error) {
    console.error('Error creating rental:', error)
    res.status(500).json({ error: 'Ошибка создания аренды' })
  }
})

// PUT /api/admin/rentals/:id - Обновить аренду
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Трансформируем snake_case в camelCase для модели
    const data: Partial<CreateRentalData & { status: RentalStatus }> = {}

    if (req.body.equipment_id !== undefined || req.body.equipmentId !== undefined) {
      data.equipmentId = req.body.equipment_id || req.body.equipmentId
    }
    if (req.body.start_date !== undefined || req.body.startDate !== undefined) {
      data.startDate = req.body.start_date || req.body.startDate
    }
    if (req.body.end_date !== undefined || req.body.endDate !== undefined) {
      data.endDate = req.body.end_date || req.body.endDate
    }
    if (req.body.customer_name !== undefined || req.body.customerName !== undefined) {
      data.customerName = req.body.customer_name || req.body.customerName
    }
    if (req.body.customer_phone !== undefined || req.body.customerPhone !== undefined) {
      data.customerPhone = req.body.customer_phone || req.body.customerPhone
    }
    if (req.body.needs_delivery !== undefined || req.body.needsDelivery !== undefined) {
      data.needsDelivery = req.body.needs_delivery !== undefined ? req.body.needs_delivery : req.body.needsDelivery
    }
    if (req.body.delivery_address !== undefined || req.body.deliveryAddress !== undefined) {
      data.deliveryAddress = req.body.delivery_address || req.body.deliveryAddress
    }
    if (req.body.rental_price !== undefined || req.body.rentalPrice !== undefined) {
      data.rentalPrice = req.body.rental_price || req.body.rentalPrice
    }
    if (req.body.delivery_price !== undefined || req.body.deliveryPrice !== undefined) {
      data.deliveryPrice = req.body.delivery_price || req.body.deliveryPrice
    }
    if (req.body.delivery_costs !== undefined || req.body.deliveryCosts !== undefined) {
      data.deliveryCosts = req.body.delivery_costs || req.body.deliveryCosts
    }
    if (req.body.source !== undefined) {
      data.source = req.body.source
    }
    if (req.body.comment !== undefined) {
      data.comment = req.body.comment
    }
    if (req.body.status !== undefined) {
      data.status = req.body.status
    }

    const rental = await rentalModel.update(parseInt(req.params.id), data)
    res.json(toSnakeCase(rental))
  } catch (error) {
    console.error('Error updating rental:', error)
    res.status(500).json({ error: 'Ошибка обновления аренды' })
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
  const now = new Date()
  const endDate = new Date(rental.endDate)
  const startDate = new Date(rental.startDate)

  if (rental.status === 'completed') {
    return 'completed'
  }

  if (now > endDate) {
    return 'overdue'
  }

  if (now >= startDate && now <= endDate) {
    return 'active'
  }

  return 'pending'
}

export default router
