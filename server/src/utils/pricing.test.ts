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
  weekendDay10to20: 1400,
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

  it('applies weekend daily price when the selected duration tier falls back to pricePerDay', () => {
    const pricingWithMissingTwoDayTier: PricingTier = {
      ...pricing,
      days2: 0,
    }

    expect(calculateRentalTotal(pricingWithMissingTwoDayTier, 2, 1000, {
      startDate: '2026-09-11',
      startTime: '10:00',
    })).toBe(3000)
  })

  it('uses optional four day tier when present', () => {
    expect(calculateRentalTotal(pricing, 4, 1000, {
      startDate: '2026-09-14',
      startTime: '10:00',
    })).toBe(3200)
  })

  it('uses JBL microphone rates as discounted daily prices', () => {
    const microphonePricing: PricingTier = {
      day1_10to20: 0,
      day1: 500,
      days2: 0,
      days3: 0,
      days4: 400,
      days7: 300,
      days14: 200,
      days30: 100,
      weekendDay: 0,
      weekendDay10to20: 0,
    }

    expect(calculateRentalTotal(microphonePricing, 1, 500)).toBe(500)
    expect(calculateRentalTotal(microphonePricing, 3, 500)).toBe(1500)
    expect(calculateRentalTotal(microphonePricing, 4, 500)).toBe(1600)
    expect(calculateRentalTotal(microphonePricing, 7, 500)).toBe(2100)
    expect(calculateRentalTotal(microphonePricing, 14, 500)).toBe(2800)
    expect(calculateRentalTotal(microphonePricing, 30, 500)).toBe(3000)
  })

  it('inherits the nearest previous filled tier for longer rentals', () => {
    const weeklyOnlyPricing: PricingTier = {
      day1_10to20: 0,
      day1: 780,
      days2: 0,
      days3: 0,
      days7: 643,
      days14: 0,
      days30: 0,
      weekendDay: 1180,
      weekendDay10to20: 0,
    }

    expect(calculateRentalTotal(weeklyOnlyPricing, 14, 780)).toBe(9002)
    expect(calculateRentalTotal(weeklyOnlyPricing, 30, 780)).toBe(19290)
  })

  it('uses same-day 10 to 20 price when the rental stays inside that window', () => {
    expect(calculateRentalTotal(pricing, 1, 1000, {
      startDate: '2026-09-14',
      endDate: '2026-09-14',
      startTime: '10:00',
      endTime: '20:00',
    })).toBe(900)

    expect(calculateRentalTotal(pricing, 1, 1000, {
      startDate: '2026-09-14',
      endDate: '2026-09-14',
      startTime: '09:00',
      endTime: '20:00',
    })).toBe(1000)
  })

  it('uses weekend same-day 10 to 20 price before the weekday 10 to 20 price', () => {
    expect(calculateRentalTotal(pricing, 1, 1000, {
      startDate: '2026-09-11',
      endDate: '2026-09-11',
      startTime: '10:00',
      endTime: '20:00',
    })).toBe(1400)
  })
})
