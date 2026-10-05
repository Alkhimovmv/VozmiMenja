import type { PricingTier } from '../models/Equipment'

const isPackagePrice = (pricing: PricingTier, value: number, periodDays: number) =>
  periodDays > 1 && pricing.day1 > 0 && value > pricing.day1

export const calculateRentalTotal = (
  pricing: PricingTier | undefined,
  rentalDays: number,
  fallbackDailyPrice: number,
  options?: { startDate?: string; startTime?: string }
) => {
  if (!pricing) return Math.round(rentalDays * fallbackDailyPrice)

  const tier = rentalDays >= 30
    ? { value: pricing.days30, days: 30 }
    : rentalDays >= 14
    ? { value: pricing.days14, days: 14 }
    : rentalDays >= 7
    ? { value: pricing.days7, days: 7 }
    : rentalDays >= 4 && pricing.days4
    ? { value: pricing.days4, days: 4 }
    : rentalDays >= 3
    ? { value: pricing.days3, days: 3 }
    : rentalDays === 2
    ? { value: pricing.days2, days: 2 }
    : { value: pricing.day1, days: 1 }

  if (!tier.value || tier.value <= 0) return Math.round(rentalDays * fallbackDailyPrice)
  const dailyPrice = isPackagePrice(pricing, tier.value, tier.days)
    ? tier.value / tier.days
    : tier.value

  const weekendDay = Number(pricing.weekendDay) || 0
  if (!weekendDay || !options?.startDate) {
    return Math.round(rentalDays * dailyPrice)
  }

  return Math.round(Array.from({ length: rentalDays }).reduce<number>((sum, _, index) => {
    const [year, month, day] = options.startDate!.split('-').map(Number)
    const [hours, minutes] = (options.startTime || '10:00').split(':').map(Number)
    const periodStart = new Date(year, month - 1, day + index, hours || 0, minutes || 0)
    const isWeekend = [0, 5, 6].includes(periodStart.getDay())
    return sum + (isWeekend ? weekendDay : dailyPrice)
  }, 0))
}
