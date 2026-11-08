import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { run } from '../models/database'
import { createPublicLeadRateLimiter } from '../middleware/publicLeadGuard'

const router = Router()
const funnelRateLimiter = createPublicLeadRateLimiter({ limit: 300, windowMs: 10 * 60 * 1000 })

const bookingFunnelEventSchema = z.object({
  sessionId: z.string().trim().min(16).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  eventName: z.enum([
    'equipment_view',
    'booking_view',
    'equipment_selected',
    'form_started',
    'booking_submitted',
  ]),
  pagePath: z.string().trim().max(500).optional(),
  equipmentId: z.string().trim().max(100).optional(),
}).strict()

router.post('/booking-funnel', funnelRateLimiter, async (req: Request, res: Response) => {
  const parsed = bookingFunnelEventSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Некорректное событие воронки' })
  }

  const { sessionId, eventName, pagePath, equipmentId } = parsed.data

  try {
    await run(`
      INSERT OR IGNORE INTO booking_funnel_events (session_id, event_name, page_path, equipment_id)
      VALUES (?, ?, ?, ?)
    `, [sessionId, eventName, pagePath || null, equipmentId || null])
    return res.status(204).send()
  } catch (error) {
    console.error('Error saving booking funnel event:', error)
    return res.status(500).json({ success: false, message: 'Не удалось сохранить событие' })
  }
})

export default router
