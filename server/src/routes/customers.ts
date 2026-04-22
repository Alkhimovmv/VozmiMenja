import { Router, Request, Response } from 'express'
import { rentalModel } from '../models/Rental'
import { rentalToSnakeCase } from '../utils/transformers'

const router = Router()

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
