import { calculateRentalDays, createBookingSchema, parseDateInput } from './bookingRules'

describe('booking rules', () => {
  it('accepts a valid booking payload with lead source fields', () => {
    const parsed = createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'Максим',
      customerPhone: '+7 999 000-00-00',
      startDate: '2026-09-12',
      endDate: '2026-09-13',
      preferredContact: 'telegram',
      deliveryMethod: 'delivery',
      deliveryAddress: 'Москва, Тверская 1',
      sourcePage: 'https://vozmimenya.ru/arenda-gopro-moskva',
      utmSource: 'yandex',
      legal: {
        offerAccepted: true,
        agreementAccepted: true,
        privacyAccepted: true,
        termsVersion: 'offer-2026-05-09',
      },
    })

    expect(parsed.utmSource).toBe('yandex')
    expect(parsed.legal?.offerAccepted).toBe(true)
  })

  it('rejects partial legal acceptance', () => {
    expect(() => createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'Максим',
      customerPhone: '+7 999 000-00-00',
      startDate: '2026-09-12',
      endDate: '2026-09-13',
      legal: {
        offerAccepted: true,
        agreementAccepted: false,
        privacyAccepted: true,
        termsVersion: 'offer-2026-05-09',
      },
    })).toThrow()
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
