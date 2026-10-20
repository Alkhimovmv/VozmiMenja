import assert from 'node:assert/strict'
import { calculateRentalTotal, getPricingRows, getRentalPriceSummary } from './pricing'
import type { PricingTier } from '../types'

const pricing: PricingTier = {
  day1_10to20: 600,
  day1: 1000,
  days2: 1000,
  days3: 1000,
  days4: 900,
  days7: 800,
  days14: 700,
  days30: 600,
  weekendDay: 1500,
  weekendDay10to20: 1400,
}

const rows = getPricingRows(pricing)

assert.equal(rows[0]?.key, 'weekendDay10to20')
assert.equal(rows[1]?.key, 'weekendDay')
assert.equal(rows.some((row) => row.key === 'days2'), false)
assert.equal(rows.some((row) => row.key === 'days3'), false)
assert.equal(rows.some((row) => row.key === 'days4'), true)
assert.equal(rows.some((row) => row.key === 'weekendDay'), true)

assert.equal(calculateRentalTotal(pricing, 2, 1000, {
  startDate: '2026-09-11',
  startTime: '10:00',
}), 3000)

assert.equal(calculateRentalTotal(pricing, 2, 1000, {
  startDate: '2026-09-14',
  startTime: '10:00',
}), 2000)

assert.equal(calculateRentalTotal(pricing, 1, 1000, {
  startDate: '2026-09-14',
  endDate: '2026-09-14',
  startTime: '10:00',
  endTime: '20:00',
}), 600)

assert.equal(calculateRentalTotal(pricing, 1, 1000, {
  startDate: '2026-09-11',
  endDate: '2026-09-11',
  startTime: '10:00',
  endTime: '20:00',
}), 1400)

assert.deepEqual(getRentalPriceSummary(pricing, 1, 1000, {
  startDate: '2026-09-12',
  endDate: '2026-09-13',
  startTime: '10:00',
  endTime: '10:00',
}), {
  totalPrice: 1500,
  displayedDailyPrice: 1500,
  dailyPriceLabel: 'Цена за сутки',
})

assert.deepEqual(getRentalPriceSummary(pricing, 2, 1000, {
  startDate: '2026-09-10',
  endDate: '2026-09-12',
  startTime: '10:00',
  endTime: '10:00',
}), {
  totalPrice: 2500,
  displayedDailyPrice: 1250,
  dailyPriceLabel: 'Средняя цена за сутки',
})

assert.equal(calculateRentalTotal(pricing, 1, 1000, {
  startDate: '2026-09-14',
  endDate: '2026-09-14',
  startTime: '09:00',
  endTime: '20:00',
}), 1000)

console.log('pricing tests passed')
