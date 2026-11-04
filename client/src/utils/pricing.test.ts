import assert from 'node:assert/strict'
import { calculateRentalTotal, getLongTermDailyPrice, getOneDayPrice, getPricingRows, getRentalPriceSummary } from './pricing'
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

assert.equal(calculateRentalTotal(microphonePricing, 3, 500), 1500)
assert.equal(calculateRentalTotal(microphonePricing, 4, 500), 1600)
assert.equal(calculateRentalTotal(microphonePricing, 7, 500), 2100)
assert.equal(calculateRentalTotal(microphonePricing, 14, 500), 2800)
assert.equal(calculateRentalTotal(microphonePricing, 30, 500), 3000)

const goproPricing: PricingTier = {
  day1_10to20: 1100,
  day1: 1300,
  days2: 900,
  days3: 800,
  days7: 600,
  days14: 525,
  days30: 360,
  weekendDay: 0,
  weekendDay10to20: 0,
}

// Публичная цена — за 1 сутки, а не минимальный месячный тариф.
assert.equal(getOneDayPrice(goproPricing, 999), 1300)
assert.equal(getOneDayPrice(undefined, 999), 999)
assert.deepEqual(getLongTermDailyPrice(goproPricing, 1300), { dailyPrice: 360, days: 30 })
assert.deepEqual(getLongTermDailyPrice(microphonePricing, 500), { dailyPrice: 100, days: 30 })
assert.equal(getLongTermDailyPrice({ ...goproPricing, days2: 0, days3: 0, days7: 0, days14: 0, days30: 0 }, 1300), null)

console.log('pricing tests passed')
