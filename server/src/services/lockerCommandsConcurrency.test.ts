import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

describe('locker command transaction serialization', () => {
  const tempDirectory = mkdtempSync(path.join(tmpdir(), 'vozmimenya-locker-commands-'))
  const databasePath = path.join(tempDirectory, 'test.sqlite')
  let database: typeof import('../models/database').database
  let lockerCommandsService: typeof import('./lockerCommands').lockerCommandsService
  let officeId: number

  beforeAll(async () => {
    process.env.DATABASE_PATH = databasePath
    jest.resetModules()
    ;({ database } = await import('../models/database'))
    ;({ lockerCommandsService } = await import('./lockerCommands'))
    await database.init()

    const office = await database.run(
      'INSERT INTO offices (name, address) VALUES (?, ?)',
      ['Test office', 'Test address'],
    )
    officeId = office.lastID
    const locker = await database.run(
      'INSERT INTO lockers (locker_number, access_code, office_id) VALUES (?, ?, ?)',
      ['1', '1234', office.lastID],
    )
    await database.run(
      `INSERT INTO locker_commands (office_id, locker_id, status)
       VALUES (?, ?, 'pending')`,
      [office.lastID, locker.lastID],
    )
  })

  afterAll(async () => {
    await database.close()
    rmSync(tempDirectory, { recursive: true, force: true })
  })

  it('serializes concurrent command claims without nesting transactions', async () => {
    const [first, second] = await Promise.all([
      lockerCommandsService.takeNextCommand(officeId),
      lockerCommandsService.takeNextCommand(officeId),
    ])

    expect([first?.id, second?.id].filter(Boolean)).toHaveLength(1)
    expect([first, second].filter((command) => command === null)).toHaveLength(1)
  })
})
