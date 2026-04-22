import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { expenseModel, CreateExpenseData } from '../models/Expense'
import { authMiddleware } from '../middleware/auth'

const router = Router()

const createExpenseSchema = z.object({
  description: z.string().min(1, 'description обязателен').max(500),
  amount: z.number().positive('amount должен быть положительным'),
  date: z.string().min(1, 'date обязателен'),
  category: z.string().max(100).optional(),
  office_id: z.number().int().positive().optional().default(1)
})

const updateExpenseSchema = createExpenseSchema.partial()

// GET /api/expenses - Получить все расходы
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, startDate, endDate, officeId } = req.query

    const expenses = await expenseModel.findAll({
      category: category as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      officeId: officeId ? parseInt(officeId as string) : undefined
    })

    res.json(expenses)
  } catch (error) {
    console.error('Error getting expenses:', error)
    res.status(500).json({ error: 'Ошибка получения расходов' })
  }
})

// GET /api/expenses/by-category - Получить сумму расходов по категориям
router.get('/by-category', async (req: Request, res: Response) => {
  try {
    const totalByCategory = await expenseModel.getTotalByCategory()
    res.json(totalByCategory)
  } catch (error) {
    console.error('Error getting expenses by category:', error)
    res.status(500).json({ error: 'Ошибка получения расходов по категориям' })
  }
})

// GET /api/expenses/monthly - Получить расходы по месяцам
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const monthlyTotal = await expenseModel.getMonthlyTotal()
    res.json(monthlyTotal)
  } catch (error) {
    console.error('Error getting monthly expenses:', error)
    res.status(500).json({ error: 'Ошибка получения месячных расходов' })
  }
})

// GET /api/expenses/:id - Получить расход по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await expenseModel.findById(parseInt(req.params.id))

    if (!expense) {
      res.status(404).json({ error: 'Расход не найден' })
      return
    }

    res.json(expense)
  } catch (error) {
    console.error('Error getting expense:', error)
    res.status(500).json({ error: 'Ошибка получения расхода' })
  }
})

// POST /api/admin/expenses - Создать расход
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = createExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const { description, amount, date, category, office_id } = parsed.data
    const data: CreateExpenseData = { description, amount, date, category, officeId: office_id }
    const expense = await expenseModel.create(data)
    res.status(201).json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: 'Ошибка создания расхода' })
  }
})

// PUT /api/admin/expenses/:id - Обновить расход
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = updateExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
    }
    const { description, amount, date, category, office_id } = parsed.data
    const data: Partial<CreateExpenseData> = { description, amount, date, category, officeId: office_id }
    const expense = await expenseModel.update(parseInt(req.params.id), data)
    res.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    res.status(500).json({ error: 'Ошибка обновления расхода' })
  }
})

// DELETE /api/admin/expenses/:id - Удалить расход
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await expenseModel.delete(parseInt(req.params.id))
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Ошибка удаления расхода' })
  }
})

export default router
