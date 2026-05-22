import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { expenseModel, CreateExpenseData } from '../models/Expense'
import { authMiddleware } from '../middleware/auth'
import { getUserOfficeIds } from '../middleware/userFilter'

const router = Router()

const createExpenseSchema = z.object({
  description: z.string().min(1, 'description обязателен').max(500),
  amount: z.number().positive('amount должен быть положительным'),
  date: z.string().min(1, 'date обязателен'),
  category: z.string().max(100).optional(),
  office_id: z.number().int().positive().optional().default(1)
})

const updateExpenseSchema = createExpenseSchema.partial()

// GET /api/expenses
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { category, startDate, endDate, officeId } = req.query
    const userOfficeIds = await getUserOfficeIds(req)

    let resolvedOfficeId = officeId ? parseInt(officeId as string) : undefined
    if (userOfficeIds !== null) {
      if (resolvedOfficeId !== undefined && !userOfficeIds.includes(resolvedOfficeId)) {
        return res.json([])
      }
    }

    const expenses = await expenseModel.findAll({
      category: category as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      officeId: resolvedOfficeId,
      officeIds: userOfficeIds ?? undefined,
    })

    res.json(expenses)
  } catch (error) {
    console.error('Error getting expenses:', error)
    res.status(500).json({ error: 'Ошибка получения расходов' })
  }
})

// GET /api/expenses/by-category
router.get('/by-category', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userOfficeIds = await getUserOfficeIds(req)
    const totalByCategory = await expenseModel.getTotalByCategory(userOfficeIds ?? undefined)
    res.json(totalByCategory)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения расходов по категориям' })
  }
})

// GET /api/expenses/monthly
router.get('/monthly', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userOfficeIds = await getUserOfficeIds(req)
    const monthlyTotal = await expenseModel.getMonthlyTotal(userOfficeIds ?? undefined)
    res.json(monthlyTotal)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения месячных расходов' })
  }
})

// GET /api/expenses/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const expense = await expenseModel.findById(parseInt(req.params.id))
    if (!expense) return res.status(404).json({ error: 'Расход не найден' })

    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && !userOfficeIds.includes(expense.officeId || 1)) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    res.json(expense)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения расхода' })
  }
})

// POST /api/admin/expenses
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = createExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const { description, amount, date, category, office_id } = parsed.data

    // Проверяем что офис принадлежит пользователю
    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && !userOfficeIds.includes(office_id)) {
      return res.status(403).json({ error: 'Нет доступа к этому офису' })
    }

    const data: CreateExpenseData = { description, amount, date, category, officeId: office_id }
    const expense = await expenseModel.create(data)
    res.status(201).json(expense)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания расхода' })
  }
})

// PUT /api/admin/expenses/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = updateExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const existing = await expenseModel.findById(parseInt(req.params.id))
    if (!existing) return res.status(404).json({ error: 'Расход не найден' })

    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && !userOfficeIds.includes(existing.officeId || 1)) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    const { description, amount, date, category, office_id } = parsed.data
    const data: Partial<CreateExpenseData> = { description, amount, date, category, officeId: office_id }
    const expense = await expenseModel.update(parseInt(req.params.id), data)
    res.json(expense)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления расхода' })
  }
})

// DELETE /api/admin/expenses/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const existing = await expenseModel.findById(parseInt(req.params.id))
    if (!existing) return res.status(404).json({ error: 'Расход не найден' })

    const userOfficeIds = await getUserOfficeIds(req)
    if (userOfficeIds !== null && !userOfficeIds.includes(existing.officeId || 1)) {
      return res.status(403).json({ error: 'Нет доступа' })
    }

    await expenseModel.delete(parseInt(req.params.id))
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления расхода' })
  }
})

export default router
