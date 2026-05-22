import { Router, Request, Response } from 'express'
import { rentalModel } from '../models/Rental'
import { expenseModel } from '../models/Expense'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'

const router = Router()

function resolveOfficeIds(userOfficeIds: number[] | null, queryOfficeId?: string): number[] | undefined {
  const qId = queryOfficeId ? parseInt(queryOfficeId) : undefined
  if (userOfficeIds === null) {
    return qId ? [qId] : undefined
  }
  if (qId && userOfficeIds.includes(qId)) return [qId]
  return userOfficeIds.length > 0 ? userOfficeIds : undefined
}

// GET /api/admin/analytics/monthly-revenue - Получить месячную выручку
router.get('/monthly-revenue', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userOfficeIds = await getUserOfficeIds(req)
    const officeIds = resolveOfficeIds(userOfficeIds, req.query.officeId as string | undefined)
    const revenue = await rentalModel.getMonthlyRevenue(officeIds)
    res.json(revenue)
  } catch (error) {
    console.error('Error getting monthly revenue:', error)
    res.status(500).json({ error: 'Ошибка получения месячной выручки' })
  }
})

// GET /api/admin/analytics/financial-summary - Получить финансовую сводку
router.get('/financial-summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' })
    }

    const yearNum = parseInt(year as string)
    const monthNum = parseInt(month as string)
    const userOfficeIds = await getUserOfficeIds(req)
    const officeIds = resolveOfficeIds(userOfficeIds, req.query.officeId as string | undefined)

    const revenueDetails = await rentalModel.getMonthlyRevenueDetails(yearNum, monthNum, officeIds)
    const expensesDetails = await expenseModel.getMonthlyExpensesDetails(yearNum, monthNum, officeIds)

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
