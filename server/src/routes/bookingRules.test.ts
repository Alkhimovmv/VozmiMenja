import { calculateRentalDays, createBookingSchema, parseDateInput } from './bookingRules'

describe('booking rules', () => {
  it('accepts a valid booking payload with optional email and lead source fields', () => {
    const parsed = createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'Максим',
      customerPhone: '+7 999 000-00-00',
      customerEmail: '',
      startDate: '2026-09-12',
      endDate: '2026-09-13',
      sourcePage: 'https://vozmimenya.ru/arenda-gopro-moskva',
      utmSource: 'yandex',
    })

    expect(parsed.customerEmail).toBe('')
    expect(parsed.utmSource).toBe('yandex')
  })

  it('rejects invalid booking dates before creation logic runs', () => {
    expect(() => createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'М',
      customerPhone: '123',
      startDate: '12.09.2026',
      endDate: '2026-09-13',
    })).toThrow()
  })

  it('calculates one-day rental for same calendar date', () => {
    expect(calculateRentalDays(parseDateInput('2026-09-12'), parseDateInput('2026-09-12'))).toBe(1)
  })
})
