import { isForeignKeyError } from './dbErrors'

describe('isForeignKeyError', () => {
  it('detects SQLite foreign key violations', () => {
    expect(isForeignKeyError({ code: 'SQLITE_CONSTRAINT', message: 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed' })).toBe(true)
  })

  it('ignores other constraint and generic errors', () => {
    expect(isForeignKeyError({ code: 'SQLITE_CONSTRAINT', message: 'UNIQUE constraint failed: lockers.locker_number' })).toBe(false)
    expect(isForeignKeyError(new Error('boom'))).toBe(false)
    expect(isForeignKeyError(null)).toBe(false)
  })
})
