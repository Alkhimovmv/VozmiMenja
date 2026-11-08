import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { rentalModel } from '../models/Rental'
import { expenseModel } from '../models/Expense'
import { all } from '../models/database'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'
import { resolveOfficeScope } from '../domain/officeScope'
import { getPublicContentPriceAuditReport } from '../services/publicContentPriceAuditReport'

const router = Router()

const leadSourcesQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100)
}).refine((data) => !data.from || !data.to || data.from <= data.to, {
  message: 'from must be earlier than or equal to to',
  path: ['to']
})

const equipmentPerformanceQuerySchema = z.object({
  days: z.coerce.number().int().min(30).max(3650).default(365),
  officeId: z.coerce.number().int().positive().optional(),
})

const bookingFunnelQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
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
    const officeIds = resolveOfficeScope(userOfficeIds, req.query.officeId as string | undefined)
    const revenue = await rentalModel.getMonthlyRevenue(officeIds)
    res.json(revenue)
  } catch (error) {
    console.error('Error getting monthly revenue:', error)
    res.status(500).json({ error: 'Ошибка получения месячной выручки' })
  }
})

// GET /api/admin/analytics/booking-funnel - анонимная воронка оформления брони
router.get('/booking-funnel', authMiddleware, async (req: Request, res: Response) => {
  const parsed = bookingFunnelQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Некорректный период воронки' })
  }

  try {
    const [row] = await all(`
      SELECT
        COUNT(DISTINCT CASE WHEN event_name = 'equipment_view' THEN session_id END) AS equipment_view,
        COUNT(DISTINCT CASE WHEN event_name = 'booking_view' THEN session_id END) AS booking_view,
        COUNT(DISTINCT CASE WHEN event_name = 'equipment_selected' THEN session_id END) AS equipment_selected,
        COUNT(DISTINCT CASE WHEN event_name = 'form_started' THEN session_id END) AS form_started,
        COUNT(DISTINCT CASE WHEN event_name = 'booking_submitted' THEN session_id END) AS booking_submitted
      FROM booking_funnel_events
      WHERE created_at >= datetime('now', ?)
    `, [`-${parsed.data.days} days`]) as Array<Record<string, number>>

    return res.json({
      days: parsed.data.days,
      stages: {
        equipmentView: Number(row?.equipment_view) || 0,
        bookingView: Number(row?.booking_view) || 0,
        equipmentSelected: Number(row?.equipment_selected) || 0,
        formStarted: Number(row?.form_started) || 0,
        bookingSubmitted: Number(row?.booking_submitted) || 0,
      },
    })
  } catch (error) {
    console.error('Error getting booking funnel:', error)
    return res.status(500).json({ error: 'Ошибка получения воронки бронирования' })
  }
})

// GET /api/admin/analytics/content-price-audit - расхождения каталога и публичного контента
router.get('/content-price-audit', authMiddleware, async (_req: Request, res: Response) => {
  try {
    return res.json(await getPublicContentPriceAuditReport())
  } catch (error) {
    console.error('Error auditing public content prices:', error)
    return res.status(500).json({ error: 'Ошибка проверки цен в публичном контенте' })
  }
})

// GET /api/admin/analytics/equipment-utilization - Загрузка и валовая окупаемость парка
router.get('/equipment-utilization', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsedQuery = equipmentPerformanceQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({ error: 'Некорректные параметры отчета' })
    }

    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && userOfficeIds.length === 0) {
      return res.json([])
    }
    const officeIds = resolveOfficeScope(
      userOfficeIds,
      parsedQuery.data.officeId ? String(parsedQuery.data.officeId) : undefined
    )
    const officeFilter = officeIds?.length
      ? `WHERE e.office_id IN (${officeIds.map(() => '?').join(',')})`
      : ''
    const rentalOfficeFilter = officeIds?.length
      ? `AND r.office_id IN (${officeIds.map(() => '?').join(',')})`
      : ''
    const daysModifier = `-${parsedQuery.data.days} days`

    const rows = await all(`
      WITH completed_rentals AS (
        SELECT r.*
        FROM rentals r
        WHERE r.status = 'completed'
          AND date(r.end_date) >= date('now', ?)
          ${rentalOfficeFilter}
      ),
      rental_items AS (
        SELECT
          r.id AS rental_id,
          r.start_date,
          r.end_date,
          COALESCE(r.rental_price, 0) AS rental_price,
          rei.equipment_id
        FROM completed_rentals r
        JOIN rental_equipment_items rei ON rei.rental_id = r.id

        UNION ALL

        SELECT
          r.id AS rental_id,
          r.start_date,
          r.end_date,
          COALESCE(r.rental_price, 0) AS rental_price,
          r.equipment_id
        FROM completed_rentals r
        WHERE NOT EXISTS (
          SELECT 1 FROM rental_equipment_items rei WHERE rei.rental_id = r.id
        )
      ),
      weighted_items AS (
        SELECT
          ri.*,
          CASE WHEN COALESCE(re.base_price, 0) > 0 THEN re.base_price ELSE 1 END AS item_weight,
          SUM(CASE WHEN COALESCE(re.base_price, 0) > 0 THEN re.base_price ELSE 1 END)
            OVER (PARTITION BY ri.rental_id) AS rental_weight
        FROM rental_items ri
        JOIN rental_equipment re ON re.id = ri.equipment_id
      )
      SELECT
        e.id,
        e.name,
        e.quantity,
        e.office_id,
        e.created_at,
        COALESCE(e.base_price, 0) AS base_price,
        COUNT(DISTINCT wi.rental_id) AS total_rentals,
        COALESCE(SUM(
          MAX(1, CAST((julianday(wi.end_date) - julianday(wi.start_date)) + 0.999999 AS INTEGER))
        ), 0) AS rented_days,
        ROUND(COALESCE(SUM(
          wi.rental_price * wi.item_weight / NULLIF(wi.rental_weight, 0)
        ), 0), 2) AS total_revenue
      FROM rental_equipment e
      LEFT JOIN weighted_items wi ON wi.equipment_id = e.id
      ${officeFilter}
      GROUP BY e.id, e.name, e.quantity, e.office_id, e.created_at, e.base_price
      ORDER BY total_revenue DESC, total_rentals DESC, e.name ASC
    `, [daysModifier, ...(officeIds || []), ...(officeIds || [])]) as Array<{
      id: number
      name: string
      quantity: number
      office_id: number | null
      created_at: string
      base_price: number
      total_rentals: number
      rented_days: number
      total_revenue: number
    }>

    const data = rows.map((row) => {
      const quantity = Math.max(1, Number(row.quantity) || 1)
      const totalRevenue = Number(row.total_revenue) || 0
      const totalRentals = Number(row.total_rentals) || 0
      const rentedDays = Number(row.rented_days) || 0
      const investmentValue = (Number(row.base_price) || 0) * quantity
      const createdAt = new Date(`${row.created_at.replace(' ', 'T')}Z`)
      const ageInDays = Number.isNaN(createdAt.getTime())
        ? parsedQuery.data.days
        : Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / 86_400_000))
      const observationDays = Math.min(parsedQuery.data.days, ageInDays)
      const availableDays = observationDays * quantity

      return {
        id: row.id,
        name: row.name,
        quantity,
        office_id: row.office_id,
        total_rentals: totalRentals,
        rented_days: rentedDays,
        idle_days: Math.max(0, availableDays - rentedDays),
        observation_days: observationDays,
        total_revenue: totalRevenue,
        average_revenue: totalRentals > 0 ? Math.round(totalRevenue / totalRentals) : 0,
        utilization_percent: Math.round((rentedDays / availableDays) * 1000) / 10,
        investment_value: investmentValue,
        gross_return_percent: investmentValue > 0
          ? Math.round((totalRevenue / investmentValue) * 1000) / 10
          : null,
      }
    })

    res.json(data)
  } catch (error) {
    console.error('Error getting equipment utilization:', error)
    res.status(500).json({ error: 'Ошибка получения доходности оборудования' })
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
        errors: parsedQuery.error.issues
      })
    }

    const { from, to, limit } = parsedQuery.data
    const userOfficeIds = await getUserOfficeIds(req)
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
    const bookingOfficeFilter = userOfficeIds === null
      ? ''
      : userOfficeIds.length > 0
        ? `WHERE COALESCE(b.office_id, 1) IN (${userOfficeIds.map(() => '?').join(',')})`
        : 'WHERE 1=0'
    const includeContactLeads = userOfficeIds === null || userOfficeIds.includes(1) ? 1 : 0

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
        ${bookingOfficeFilter}

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
        WHERE ? = 1
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
    `, [...(userOfficeIds ?? []), includeContactLeads, ...params, limit]) as LeadSourceReportRow[]

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
    const officeIds = resolveOfficeScope(userOfficeIds, req.query.officeId as string | undefined)

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
