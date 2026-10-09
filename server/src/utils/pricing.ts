import type { PricingTier } from '../models/Equipment'

const isPackagePrice = (pricing: PricingTier, value: number, periodDays: number) =>
  periodDays > 1 && pricing.day1 > 0 && value > pricing.day1

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
    const periodStart = getRentalPeriodStart(options.startDate!, options.startTime, index)
    return sum + (isWeekendRentalDay(periodStart) ? weekendDay : dailyPrice)
  }, 0))
}
