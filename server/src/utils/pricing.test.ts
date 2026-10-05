import { calculateRentalTotal } from './pricing'
import type { PricingTier } from '../models/Equipment'

const pricing: PricingTier = {
  day1_10to20: 900,
  day1: 1000,
  days2: 900,
  days3: 2500,
  days4: 800,
  days7: 6000,
  days14: 11000,
  days30: 20000,
  weekendDay: 1500,
}

describe('calculateRentalTotal', () => {
  it('uses fallback daily price when no pricing tiers exist', () => {
    expect(calculateRentalTotal(undefined, 3, 700)).toBe(2100)
  })

  it('treats tier values higher than day1 as package prices', () => {
    expect(calculateRentalTotal(pricing, 7, 1000)).toBe(6000)
  })

  it('treats tier values lower than day1 as daily discounted prices', () => {
    expect(calculateRentalTotal(pricing, 2, 1000)).toBe(1800)
  })

  it('applies weekend daily price to periods starting on Friday Saturday or Sunday', () => {
    expect(calculateRentalTotal(pricing, 2, 1000, {
      startDate: '2026-09-11',
      startTime: '10:00',
    })).toBe(3000)

    expect(calculateRentalTotal(pricing, 2, 1000, {
      startDate: '2026-09-14',
      startTime: '10:00',
    })).toBe(1800)
  })

  it('uses optional four day tier when present', () => {
    expect(calculateRentalTotal(pricing, 4, 1000, {
      startDate: '2026-09-14',
      startTime: '10:00',
    })).toBe(3200)
  })
})
