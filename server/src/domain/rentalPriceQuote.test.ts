import type { Equipment } from '../models/Equipment'
import { calculateRentalPriceQuote } from './rentalPriceQuote'

const equipment = (overrides: Partial<Equipment> = {}): Equipment => ({
  id: 'catalog-1',
  name: 'Тестовое оборудование',
  category: 'Тест',
  pricePerDay: 1000,
  pricing: {
    day1_10to20: 800,
    day1: 1000,
    days2: 900,
    days3: 800,
    days7: 700,
    days14: 600,
    days30: 500,
    weekendDay: 1200,
    weekendDay10to20: 1000,
  },
  quantity: 1,
  availableQuantity: 1,
  images: [],
  description: '',
  specifications: {},
  createdAt: '',
  updatedAt: '',
  ...overrides,
})

describe('rental price quote', () => {
  test('uses the same tariff rules as public booking', () => {
    const quote = calculateRentalPriceQuote([
      { rentalEquipmentId: 11, rentalEquipmentName: 'Позиция офиса', catalogEquipment: equipment() },
    ], '2026-11-09T10:00', '2026-11-09T20:00')

    expect(quote.rentalDays).toBe(1)
    expect(quote.total).toBe(800)
  })

  test('prices every selected instance, including duplicate model ids', () => {
    const item = { rentalEquipmentId: 11, rentalEquipmentName: 'Позиция офиса', catalogEquipment: equipment() }
    const quote = calculateRentalPriceQuote([item, item], '2026-11-09T10:00', '2026-11-11T10:00')

    expect(quote.rentalDays).toBe(2)
    expect(quote.items).toHaveLength(2)
    expect(quote.total).toBe(3600)
  })

  test('rejects an empty or reversed period', () => {
    expect(() => calculateRentalPriceQuote([], '2026-11-09T10:00', '2026-11-09T10:00')).toThrow(/позже/)
  })
})
