import assert from 'node:assert/strict'
import { buildRentalPriceSuggestion } from './rentalPriceSuggestion'

const suggestionWithManualDiscount = buildRentalPriceSuggestion(2500, 3000, 3900, 3)

assert.equal(suggestionWithManualDiscount.tariffDelta, 900)
assert.equal(suggestionWithManualDiscount.suggestedTotal, 3400)

const suggestionWithoutSavedPrice = buildRentalPriceSuggestion(null, 3000, 3900, 3)

assert.equal(suggestionWithoutSavedPrice.suggestedTotal, 3900)

const reducedPeriod = buildRentalPriceSuggestion(500, 1000, 0, 1)

assert.equal(reducedPeriod.suggestedTotal, 0)

console.log('rentalPriceSuggestion tests passed')
