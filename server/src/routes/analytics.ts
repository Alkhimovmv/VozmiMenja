import { Router, Request, Response } from 'express'
import { rentalModel } from '../models/Rental'
import { expenseModel } from '../models/Expense'

const router = Router()

// GET /api/admin/analytics/monthly-revenue - Получить месячную выручку
router.get('/monthly-revenue', async (req: Request, res: Response) => {
  try {
    const officeId = req.query.officeId ? parseInt(req.query.officeId as string) : undefined
    const revenue = await rentalModel.getMonthlyRevenue(officeId)
    res.json(revenue)
  } catch (error) {
    console.error('Error getting monthly revenue:', error)
    res.status(500).json({ error: 'Ошибка получения месячной выручки' })
  }
})

// GET /api/admin/analytics/financial-summary - Получить финансовую сводку
router.get('/financial-summary', async (req: Request, res: Response) => {
  try {
    const { year, month, officeId } = req.query

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' })
    }

    const yearNum = parseInt(year as string)
    const monthNum = parseInt(month as string)
    const officeIdNum = officeId ? parseInt(officeId as string) : undefined

    const revenueDetails = await rentalModel.getMonthlyRevenueDetails(yearNum, monthNum, officeIdNum)
    const expensesDetails = await expenseModel.getMonthlyExpensesDetails(yearNum, monthNum, officeIdNum)

    const summary = {
      total_revenue: revenueDetails.rental_revenue + revenueDetails.delivery_revenue,
      rental_revenue: revenueDetails.rental_revenue,
      delivery_revenue: revenueDetails.delivery_revenue,
      total_costs: revenueDetails.delivery_costs + expensesDetails.operational_expenses,
      delivery_costs: revenueDetails.delivery_costs,
      operational_expenses: expensesDetails.operational_expenses,
      net_profit: (revenueDetails.rental_revenue + revenueDetails.delivery_revenue) -
                  (revenueDetails.delivery_costs + expensesDetails.operational_expenses),
      total_rentals: revenueDetails.total_rentals,
      expenses_by_category: expensesDetails.by_category
    }

    res.json(summary)
  } catch (error) {
    console.error('Error getting financial summary:', error)
    res.status(500).json({ error: 'Ошибка получения финансовой сводки' })
  }
})

export default router
