import { normalizeLocalRentalDate } from './rentalDate'

describe('normalizeLocalRentalDate', () => {
  it('accepts local dates and normalizes the separator', () => {
    expect(normalizeLocalRentalDate('2026-11-04')).toBe('2026-11-04')
    expect(normalizeLocalRentalDate('2026-11-04 10:30')).toBe('2026-11-04T10:30')
    expect(normalizeLocalRentalDate('2026-11-04T10:30:15.25')).toBe('2026-11-04T10:30:15.25')
  })

  it('rejects impossible dates, times and timezone-bearing values', () => {
    expect(normalizeLocalRentalDate('2026-02-31T10:00')).toBeNull()
    expect(normalizeLocalRentalDate('2026-11-04T25:00')).toBeNull()
    expect(normalizeLocalRentalDate('2026-11-04T10:00Z')).toBeNull()
  })
})
