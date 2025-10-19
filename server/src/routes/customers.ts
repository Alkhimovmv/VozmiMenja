import { Router, Request, Response } from 'express'
import { rentalModel } from '../models/Rental'

const router = Router()

// Функция для трансформации camelCase -> snake_case для фронтенда
function customerToSnakeCase(customer: any) {
  return {
    customer_name: customer.customerName,
    customer_phone: customer.customerPhone,
    rental_count: customer.rentalCount
  }
}

// GET /api/admin/customers - Получить всех клиентов
router.get('/', async (req: Request, res: Response) => {
  try {
    const customers = await rentalModel.getCustomers()
    res.json(customers.map(customerToSnakeCase))
  } catch (error) {
    console.error('Error getting customers:', error)
    res.status(500).json({ error: 'Ошибка получения клиентов' })
  }
})

// Функция для трансформации аренды camelCase -> snake_case
function rentalToSnakeCase(rental: any) {
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
    equipment_name: rental.equipmentName
  }
}

// GET /api/admin/customers/:phone/rentals - Получить аренды клиента
router.get('/:phone/rentals', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params
    const rentals = await rentalModel.getCustomerRentals(phone)
    res.json(rentals.map(rentalToSnakeCase))
  } catch (error) {
    console.error('Error getting customer rentals:', error)
    res.status(500).json({ error: 'Ошибка получения аренд клиента' })
  }
})

export default router
