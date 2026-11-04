import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

describe('runtime model write serialization', () => {
  const tempDirectory = mkdtempSync(path.join(tmpdir(), 'vozmimenya-runtime-write-'))
  const databasePath = path.join(tempDirectory, 'test.sqlite')
  let database: typeof import('./database').database
  let expenseModel: typeof import('./Expense').expenseModel

  beforeAll(async () => {
    process.env.DATABASE_PATH = databasePath
    jest.resetModules()
    ;({ database } = await import('./database'))
    ;({ expenseModel } = await import('./Expense'))
    await database.init()
  })

  afterAll(async () => {
    await database.close()
    rmSync(tempDirectory, { recursive: true, force: true })
  })

  it('queues a runtime create until a rolling-back transaction finishes', async () => {
    let releaseTransaction!: () => void
    let transactionStarted!: () => void
    const release = new Promise<void>((resolve) => { releaseTransaction = resolve })
    const started = new Promise<void>((resolve) => { transactionStarted = resolve })

    const transaction = database.withImmediateTransaction(async () => {
      transactionStarted()
      await release
      throw new Error('intentional rollback')
    })
    await started

    const create = expenseModel.create({
      description: 'Queued expense',
      amount: 500,
      date: '2030-03-01',
      category: 'Реклама и продвижение',
      officeId: 1,
    })
    await new Promise<void>((resolve) => setImmediate(resolve))
    releaseTransaction()

    await expect(transaction).rejects.toThrow('intentional rollback')
    const expense = await create
    expect(expense.id).toBeGreaterThan(0)

    const row = await database.get('SELECT id, description FROM expenses WHERE id = ?', [expense.id])
    expect(row).toEqual({ id: expense.id, description: 'Queued expense' })
  })
})
