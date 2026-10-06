import { calculateBillableRentalDays, calculateRentalDays, createBookingSchema, normalizeAdminPhone, parseDateInput } from './bookingRules'

describe('booking rules', () => {
  it('accepts a valid booking payload with lead source fields', () => {
    const parsed = createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'Иван Иванов',
      customerPhone: '+7 999 000-00-00',
      startDate: '2026-09-12',
      endDate: '2026-09-13',
      startTime: '10:00',
      endTime: '11:00',
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
    expect(parsed.customerPhone).toBe('89990000000')
  })

  it('normalizes website phone numbers to admin format', () => {
    expect(normalizeAdminPhone('+7 999 000-00-00')).toBe('89990000000')
    expect(normalizeAdminPhone('8 (999) 000-00-00')).toBe('89990000000')
    expect(normalizeAdminPhone('9990000000')).toBe('89990000000')
  })

  it('rejects partial legal acceptance', () => {
    expect(() => createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'Иван Иванов',
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

  it('requires full customer name for booking', () => {
    expect(() => createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'Максим',
      customerPhone: '+7 999 000-00-00',
      startDate: '2026-09-12',
      endDate: '2026-09-13',
    })).toThrow(/фамилию и имя|ФИО/)

    expect(createBookingSchema.parse({
      equipmentId: 'equipment-1',
      customerName: 'Иван Иванов',
      customerPhone: '+7 999 000-00-00',
      startDate: '2026-09-12',
      endDate: '2026-09-13',
    }).customerName).toBe('Иван Иванов')
  })

  it('calculates one-day rental for same calendar date', () => {
    expect(calculateRentalDays(parseDateInput('2026-09-12'), parseDateInput('2026-09-12'))).toBe(1)
  })

  it('calculates billable days by started 24-hour periods', () => {
    expect(calculateBillableRentalDays('2026-09-12', '2026-09-13', '10:00', '10:00')).toBe(1)
    expect(calculateBillableRentalDays('2026-09-12', '2026-09-13', '10:00', '11:00')).toBe(2)
    expect(calculateBillableRentalDays('2026-09-12', '2026-09-12', '10:00', '20:00')).toBe(1)
    expect(calculateBillableRentalDays('2026-09-12', '2026-09-12', '20:00', '10:00')).toBe(0)
  })
})
