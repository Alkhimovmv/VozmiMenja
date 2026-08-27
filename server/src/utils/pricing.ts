import type { PricingTier } from '../models/Equipment'

const isPackagePrice = (pricing: PricingTier, value: number, periodDays: number) =>
  periodDays > 1 && pricing.day1 > 0 && value > pricing.day1

export const calculateRentalTotal = (
  pricing: PricingTier | undefined,
  rentalDays: number,
  fallbackDailyPrice: number
) => {
  if (!pricing) return Math.round(rentalDays * fallbackDailyPrice)

  const tier = rentalDays >= 30
    ? { value: pricing.days30, days: 30 }
    : rentalDays >= 14
    ? { value: pricing.days14, days: 14 }
    : rentalDays >= 7
    ? { value: pricing.days7, days: 7 }
    : rentalDays >= 3
    ? { value: pricing.days3, days: 3 }
    : rentalDays === 2
    ? { value: pricing.days2, days: 2 }
    : { value: pricing.day1, days: 1 }

  if (!tier.value || tier.value <= 0) return Math.round(rentalDays * fallbackDailyPrice)
  const dailyPrice = isPackagePrice(pricing, tier.value, tier.days)
    ? tier.value / tier.days
    : tier.value

  return Math.round(rentalDays * dailyPrice)
}
