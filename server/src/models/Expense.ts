import { database, run, get, all } from './database'

export interface Expense {
  id: number
  description: string
  amount: number
  date: string
  category?: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseData {
  description: string
  amount: number
  date: string
  category?: string
}

export class ExpenseModel {
  private db = database.instance

  async findAll(options: {
    category?: string
    startDate?: string
    endDate?: string
  } = {}): Promise<Expense[]> {
    const { category, startDate, endDate } = options

    let whereClause = ''
    const params: any[] = []

    if (category) {
      whereClause += ' WHERE category = ?'
      params.push(category)
    }

    if (startDate) {
      whereClause += category ? ' AND' : ' WHERE'
      whereClause += ' date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      whereClause += (category || startDate) ? ' AND' : ' WHERE'
      whereClause += ' date <= ?'
      params.push(endDate)
    }

    const rows = await all(`
      SELECT * FROM expenses
      ${whereClause}
      ORDER BY date DESC, created_at DESC
    `, params) as any[]

    return rows.map(this.mapRow)
  }

  async findById(id: number): Promise<Expense | null> {
    const row = await get('SELECT * FROM expenses WHERE id = ?', [id]) as any

    return row ? this.mapRow(row) : null
  }

  async create(data: CreateExpenseData): Promise<Expense> {
    const result = await new Promise<number>((resolve, reject) => {
      this.db.run(`
        INSERT INTO expenses (description, amount, date, category)
        VALUES (?, ?, ?, ?)
      `, [data.description, data.amount, data.date, data.category || null], function(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })

    const expense = await this.findById(result)
    if (!expense) {
      throw new Error('Failed to create expense')
    }

    return expense
  }

  async update(id: number, data: Partial<CreateExpenseData>): Promise<Expense> {
    const updates: string[] = []
    const values: any[] = []

    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.amount !== undefined) {
      updates.push('amount = ?')
      values.push(data.amount)
    }
    if (data.date !== undefined) {
      updates.push('date = ?')
      values.push(data.date)
    }
    if (data.category !== undefined) {
      updates.push('category = ?')
      values.push(data.category)
    }

    if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await run(`
      UPDATE expenses
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values)

    const expense = await this.findById(id)
    if (!expense) {
      throw new Error('Failed to update expense')
    }

    return expense
  }

  async delete(id: number): Promise<void> {
    await run('DELETE FROM expenses WHERE id = ?', [id])
  }

  async getTotalByCategory(): Promise<Record<string, number>> {
    const rows = await all(`
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY total DESC
    `) as Array<{ category: string; total: number }>

    const result: Record<string, number> = {}
    rows.forEach(row => {
      result[row.category] = row.total
    })

    return result
  }

  async getMonthlyTotal(): Promise<Array<{
    month: string
    year: number
    total: number
  }>> {
    const rows = await all(`
      SELECT
        strftime('%m', date) as month,
        strftime('%Y', date) as year,
        SUM(amount) as total
      FROM expenses
      GROUP BY month, year
      ORDER BY year DESC, month DESC
    `) as any[]

    return rows.map(row => ({
      month: row.month,
      year: parseInt(row.year),
      total: row.total
    }))
  }

  async getMonthlyExpensesDetails(year: number, month: number): Promise<{
    operational_expenses: number
    by_category: Record<string, number>
  }> {
    const monthStr = month.toString().padStart(2, '0')

    // Получаем общую сумму операционных расходов
    const totalRow = await get(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE strftime('%Y', date) = ?
        AND strftime('%m', date) = ?
    `, [year.toString(), monthStr]) as any

    // Получаем расходы по категориям
    const categoryRows = await all(`
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE strftime('%Y', date) = ?
        AND strftime('%m', date) = ?
        AND category IS NOT NULL
      GROUP BY category
    `, [year.toString(), monthStr]) as Array<{ category: string; total: number }>

    const byCategory: Record<string, number> = {}
    categoryRows.forEach(row => {
      byCategory[row.category] = row.total
    })

    return {
      operational_expenses: totalRow?.total || 0,
      by_category: byCategory
    }
  }

  private mapRow(row: any): Expense {
    return {
      id: row.id,
      description: row.description,
      amount: row.amount,
      date: row.date,
      category: row.category || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

export const expenseModel = new ExpenseModel()
