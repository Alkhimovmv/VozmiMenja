import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { rentalModel } from '../models/Rental'
import { expenseModel } from '../models/Expense'
import { all } from '../models/database'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'

const router = Router()

const leadSourcesQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100)
}).refine((data) => !data.from || !data.to || data.from <= data.to, {
  message: 'from must be earlier than or equal to to',
  path: ['to']
})

type LeadSourceReportRow = {
  source_page: string
  referrer: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  channel: string
  equipment: string
  status: string
  total: number
  first_created_at: string
  last_created_at: string
}

function resolveOfficeIds(userOfficeIds: number[] | null, queryOfficeId?: string): number[] | undefined {
  const qId = queryOfficeId ? parseInt(queryOfficeId) : undefined
  if (userOfficeIds === null) {
    return qId ? [qId] : undefined
  }
  if (qId && userOfficeIds.includes(qId)) return [qId]
  return userOfficeIds.length > 0 ? userOfficeIds : undefined
}

const addCount = (acc: Record<string, number>, key: string, value: number) => {
  acc[key] = (acc[key] || 0) + value
  return acc
}

const formatSourceLabel = (row: LeadSourceReportRow) => {
  const utm = [row.utm_source, row.utm_medium, row.utm_campaign].filter(Boolean).join(' / ')
  if (utm) return utm
  if (row.referrer) return row.referrer
  if (row.source_page) return row.source_page
  return 'Прямой заход'
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

// GET /api/admin/analytics/lead-sources - Отчет по источникам заявок с сайта
router.get('/lead-sources', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsedQuery = leadSourcesQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные параметры отчета',
        errors: parsedQuery.error.errors
      })
    }

    const { from, to, limit } = parsedQuery.data
    const filters: string[] = []
    const params: Array<string | number> = []

    if (from) {
      filters.push(`created_at >= datetime(?)`)
      params.push(from)
    }

    if (to) {
      filters.push(`created_at < datetime(?, '+1 day')`)
      params.push(to)
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const rows = await all(`
      WITH leads AS (
        SELECT
          'Бронь оборудования' AS channel,
          b.source_page,
          b.referrer,
          b.utm_source,
          b.utm_medium,
          b.utm_campaign,
          b.status,
          b.created_at,
          COALESCE(NULLIF(e.name, ''), b.equipment_id) AS equipment
        FROM bookings b
        LEFT JOIN equipment e ON e.id = b.equipment_id

        UNION ALL

        SELECT
          CASE
            WHEN c.subject = 'Заказ обратного звонка' THEN 'Обратный звонок'
            WHEN c.subject = 'other' THEN 'Контактная форма'
            ELSE COALESCE(NULLIF(c.subject, ''), 'Контактная форма')
          END AS channel,
          c.source_page,
          c.referrer,
          c.utm_source,
          c.utm_medium,
          c.utm_campaign,
          c.status,
          c.created_at,
          '' AS equipment
        FROM contact_leads c
      ),
      filtered AS (
        SELECT *
        FROM leads
        ${whereClause}
      )
      SELECT
        COALESCE(NULLIF(source_page, ''), '') AS source_page,
        COALESCE(NULLIF(referrer, ''), '') AS referrer,
        COALESCE(NULLIF(utm_source, ''), '') AS utm_source,
        COALESCE(NULLIF(utm_medium, ''), '') AS utm_medium,
        COALESCE(NULLIF(utm_campaign, ''), '') AS utm_campaign,
        channel,
        COALESCE(NULLIF(equipment, ''), '') AS equipment,
        status,
        COUNT(*) AS total,
        MIN(created_at) AS first_created_at,
        MAX(created_at) AS last_created_at
      FROM filtered
      GROUP BY
        source_page,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        channel,
        equipment,
        status
      ORDER BY total DESC, last_created_at DESC
      LIMIT ?
    `, [...params, limit]) as LeadSourceReportRow[]

    const totalsByChannel: Record<string, number> = {}
    const totalsByStatus: Record<string, number> = {}
    const totalsByEquipment: Record<string, number> = {}
    const data = rows.map((row) => {
      const total = Number(row.total) || 0
      addCount(totalsByChannel, row.channel, total)
      addCount(totalsByStatus, row.status, total)
      if (row.equipment) addCount(totalsByEquipment, row.equipment, total)

      return {
        sourcePage: row.source_page || null,
        referrer: row.referrer || null,
        utmSource: row.utm_source || null,
        utmMedium: row.utm_medium || null,
        utmCampaign: row.utm_campaign || null,
        sourceLabel: formatSourceLabel(row),
        channel: row.channel,
        equipment: row.equipment || null,
        status: row.status,
        total,
        firstCreatedAt: row.first_created_at,
        lastCreatedAt: row.last_created_at
      }
    })

    res.json({
      success: true,
      data: {
        total: data.reduce((sum, row) => sum + row.total, 0),
        rows: data,
        totalsByChannel,
        totalsByStatus,
        totalsByEquipment,
        filters: { from: from || null, to: to || null, limit },
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error getting lead sources report:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения отчета по источникам заявок'
    })
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
