import type { PricingTier } from '../models/Equipment'

const isPackagePrice = (pricing: PricingTier, value: number, periodDays: number) =>
  periodDays > 1 && pricing.day1 > 0 && value > pricing.day1

const durationTiers: Array<{ key: keyof PricingTier; days: number }> = [
  { key: 'day1', days: 1 },
  { key: 'days2', days: 2 },
  { key: 'days3', days: 3 },
  { key: 'days4', days: 4 },
  { key: 'days7', days: 7 },
  { key: 'days14', days: 14 },
  { key: 'days30', days: 30 },
]

const getEffectiveDailyPrice = (pricing: PricingTier, rentalDays: number, fallbackDailyPrice: number) => {
  const tier = durationTiers
    .filter((candidate) => candidate.days <= rentalDays)
    .map((candidate) => ({ ...candidate, value: Number(pricing[candidate.key]) || 0 }))
    .filter((candidate) => candidate.value > 0)
    .at(-1)

  if (!tier) return fallbackDailyPrice
  return isPackagePrice(pricing, tier.value, tier.days) ? tier.value / tier.days : tier.value
}

const parseTimeInMinutes = (time = '10:00') => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

const isSameDayTenToTwentyRental = (options?: {
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
}) => {
  if (!options?.startDate || !options.endDate || options.startDate !== options.endDate) return false

  const startMinutes = parseTimeInMinutes(options.startTime)
  const endMinutes = parseTimeInMinutes(options.endTime)
  const dayStart = parseTimeInMinutes('10:00')
  const dayEnd = parseTimeInMinutes('20:00')

  return startMinutes >= dayStart && endMinutes <= dayEnd && endMinutes > startMinutes
}

const isWeekendRentalDay = (date: Date) => [0, 5, 6].includes(date.getDay())

const getRentalPeriodStart = (startDate: string, startTime = '10:00', offsetDays = 0) => {
  const [year, month, day] = startDate.split('-').map(Number)
  const [hours, minutes] = startTime.split(':').map(Number)
  return new Date(year, month - 1, day + offsetDays, hours || 0, minutes || 0)
}

export const calculateRentalTotal = (
  pricing: PricingTier | undefined,
  rentalDays: number,
  fallbackDailyPrice: number,
  options?: { startDate?: string; endDate?: string; startTime?: string; endTime?: string }
) => {
  if (!pricing) return Math.round(rentalDays * fallbackDailyPrice)

  const weekendDay10to20 = Number(pricing.weekendDay10to20) || 0
  if (
    rentalDays === 1 &&
    weekendDay10to20 > 0 &&
    options?.startDate &&
    isSameDayTenToTwentyRental(options) &&
    isWeekendRentalDay(getRentalPeriodStart(options.startDate, options.startTime))
  ) {
    return Math.round(weekendDay10to20)
  }

  const dayRentalPrice = Number(pricing.day1_10to20) || 0
  if (rentalDays === 1 && dayRentalPrice > 0 && isSameDayTenToTwentyRental(options)) {
    return Math.round(dayRentalPrice)
  }

  const dailyPrice = getEffectiveDailyPrice(pricing, rentalDays, fallbackDailyPrice)

  const weekendDay = Number(pricing.weekendDay) || 0
  if (!weekendDay || !options?.startDate) {
    return Math.round(rentalDays * dailyPrice)
  }

  return Math.round(Array.from({ length: rentalDays }).reduce<number>((sum, _, index) => {
    const periodStart = getRentalPeriodStart(options.startDate!, options.startTime, index)
    return sum + (isWeekendRentalDay(periodStart) ? weekendDay : dailyPrice)
  }, 0))
}
