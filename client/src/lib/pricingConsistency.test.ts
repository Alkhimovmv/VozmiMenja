import assert from 'node:assert/strict'
import type { PricingTier } from '../types'
import { getPricingConsistencyIssues } from './pricingConsistency'

const validPricing: PricingTier = {
  day1_10to20: 800,
  day1: 1000,
  days2: 900,
  days3: 800,
  days4: 700,
  days7: 600,
  days14: 500,
  days30: 400,
  weekendDay: 1200,
  weekendDay10to20: 1100,
}

assert.deepEqual(getPricingConsistencyIssues(validPricing, 1000), [])

const mismatched = getPricingConsistencyIssues({
  ...validPricing,
  day1_10to20: 1000,
  days7: 950,
  weekendDay: 0,
}, 900)

assert.equal(mismatched.some((issue) => issue.code === 'legacy-day1-mismatch'), true)
assert.equal(mismatched.some((issue) => issue.code === 'day-window-not-cheaper'), true)
assert.equal(mismatched.some((issue) => issue.code === 'weekend-pair-incomplete'), true)
assert.equal(mismatched.some((issue) => issue.code === 'tier-increase-7'), true)

assert.deepEqual(getPricingConsistencyIssues({
  ...validPricing,
  days2: 1800,
  days3: 2400,
}, 1000), [])

console.log('pricingConsistency tests passed')
