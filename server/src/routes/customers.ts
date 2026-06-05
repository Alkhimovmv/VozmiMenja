import { Router, Request, Response } from 'express'
import { rentalModel } from '../models/Rental'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'
import { rentalToSnakeCase } from '../utils/transformers'
import { database } from '../models/database'

const router = Router()

function customerToSnakeCase(customer: any) {
  return {
    customer_name: customer.customerName,
    customer_phone: customer.customerPhone,
    rental_count: customer.rentalCount
  }
}

// GET /api/admin/customers - Получить клиентов с фильтрацией
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userOfficeIds = await getUserOfficeIds(req)
    const search = req.query.search as string | undefined
    const tag = req.query.tag as string | undefined  // 'regular' | 'problem' | undefined

    const customers = await rentalModel.getCustomers(userOfficeIds ?? undefined, search)

    const phones = customers.map(c => c.customerPhone)
    let notes: any[] = []
    if (phones.length > 0) {
      const officeFilter = userOfficeIds !== null
        ? `AND office_id IN (${userOfficeIds.map(() => '?').join(',')})`
        : ''
      const officeParams = userOfficeIds ?? []
      notes = await database.all(
        `SELECT customer_phone, tag, note FROM customer_notes WHERE customer_phone IN (${phones.map(() => '?').join(',')}) ${officeFilter}`,
        [...phones, ...officeParams]
      )
    }
    const notesMap = new Map(notes.map(n => [n.customer_phone, n]))

    let result = customers.map(c => ({
      ...customerToSnakeCase(c),
      tag: notesMap.get(c.customerPhone)?.tag || null,
      note: notesMap.get(c.customerPhone)?.note || null,
    }))

    // Фильтр по тегу
    if (tag === 'regular') {
      result = result.filter(c => c.tag === 'regular' || (!c.tag && Number(c.rental_count) >= 3))
    } else if (tag === 'problem') {
      result = result.filter(c => c.tag === 'problem')
    }

    res.json(result)
  } catch (error) {
    console.error('Error getting customers:', error)
    res.status(500).json({ error: 'Ошибка получения клиентов' })
  }
})

// GET /api/admin/customers/:phone/rentals - Получить аренды клиента
router.get('/:phone/rentals', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { phone } = req.params
    const userOfficeIds = await getUserOfficeIds(req)
    const rentals = await rentalModel.getCustomerRentals(phone, userOfficeIds ?? undefined)
    res.json(rentals.map(rentalToSnakeCase))
  } catch (error) {
    console.error('Error getting customer rentals:', error)
    res.status(500).json({ error: 'Ошибка получения аренд клиента' })
  }
})

// GET /api/admin/customers/:phone/note - Получить заметку о клиенте
router.get('/:phone/note', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { phone } = req.params
    const userOfficeIds = await getUserOfficeIds(req)
    const officeId = userOfficeIds !== null ? (userOfficeIds[0] ?? 1) : 1

    const note = await database.get(
      'SELECT * FROM customer_notes WHERE customer_phone = ? AND office_id = ?',
      [phone, officeId]
    )
    res.json(note || { customer_phone: phone, tag: null, note: null })
  } catch (error) {
    console.error('Error getting customer note:', error)
    res.status(500).json({ error: 'Ошибка получения заметки' })
  }
})

// PUT /api/admin/customers/:phone/note - Сохранить заметку (upsert)
router.put('/:phone/note', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { phone } = req.params
    const { tag, note } = req.body
    const userOfficeIds = await getUserOfficeIds(req)
    const officeId = userOfficeIds !== null ? (userOfficeIds[0] ?? 1) : 1

    // Validate tag
    const validTags = ['regular', 'problem', null, undefined]
    if (!validTags.includes(tag)) {
      return res.status(400).json({ error: 'Недопустимое значение тега' })
    }

    await database.run(`
      INSERT INTO customer_notes (customer_phone, tag, note, office_id, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(customer_phone, office_id) DO UPDATE SET
        tag = excluded.tag,
        note = excluded.note,
        updated_at = CURRENT_TIMESTAMP
    `, [phone, tag ?? null, note ?? null, officeId])

    const saved = await database.get(
      'SELECT * FROM customer_notes WHERE customer_phone = ? AND office_id = ?',
      [phone, officeId]
    )
    res.json(saved)
  } catch (error) {
    console.error('Error saving customer note:', error)
    res.status(500).json({ error: 'Ошибка сохранения заметки' })
  }
})

// DELETE /api/admin/customers/:phone/note - Удалить заметку
router.delete('/:phone/note', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { phone } = req.params
    const userOfficeIds = await getUserOfficeIds(req)
    const officeId = userOfficeIds !== null ? (userOfficeIds[0] ?? 1) : 1

    await database.run(
      'DELETE FROM customer_notes WHERE customer_phone = ? AND office_id = ?',
      [phone, officeId]
    )
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting customer note:', error)
    res.status(500).json({ error: 'Ошибка удаления заметки' })
  }
})

export default router
