import type { PricingTier } from '../types'
import { getEffectiveDailyPrice } from '../utils/pricing'

export type PricingConsistencyIssue = {
  code: string
  message: string
}

export const getPricingConsistencyIssues = (
  pricing: PricingTier,
  savedPricePerDay: number
): PricingConsistencyIssue[] => {
  const issues: PricingConsistencyIssue[] = []
  const day1 = Number(pricing.day1) || 0

  if (day1 <= 0) {
    issues.push({ code: 'missing-day1', message: 'Не указана основная цена за 1 сутки.' })
  }

  if (day1 > 0 && Number(savedPricePerDay) !== day1) {
    issues.push({
      code: 'legacy-day1-mismatch',
      message: `Цена карточки ${Number(savedPricePerDay) || 0}₽ не совпадает с тарифом за сутки ${day1}₽. Сохраните позицию для синхронизации.`,
    })
  }

  const dayRate = Number(pricing.day1_10to20) || 0
  if (dayRate > 0 && day1 > 0 && dayRate >= day1) {
    issues.push({
      code: 'day-window-not-cheaper',
      message: 'Тариф 10:00–20:00 должен быть ниже цены за полные сутки.',
    })
  }

  const weekendDay = Number(pricing.weekendDay) || 0
  const weekendWindow = Number(pricing.weekendDay10to20) || 0
  if (weekendWindow > 0 && weekendDay <= 0) {
    issues.push({
      code: 'weekend-pair-incomplete',
      message: 'Указан выходной тариф 10:00–20:00, но не указана цена за полные выходные сутки.',
    })
  } else if (weekendWindow > 0 && weekendWindow >= weekendDay) {
    issues.push({
      code: 'weekend-window-not-cheaper',
      message: 'Выходной тариф 10:00–20:00 должен быть ниже цены за полные выходные сутки.',
    })
  }

  const tiers = [
    { label: '1 сутки', days: 1 },
    { label: '2 суток', days: 2 },
    { label: '3 суток', days: 3 },
    { label: '4 суток', days: 4 },
    { label: '7 суток', days: 7 },
    { label: '14 суток', days: 14 },
    { label: '30 суток', days: 30 },
  ]

  for (let index = 1; index < tiers.length; index += 1) {
    const previous = tiers[index - 1]
    const current = tiers[index]
    const previousDaily = getEffectiveDailyPrice(pricing, previous.days, savedPricePerDay)
    const currentDaily = getEffectiveDailyPrice(pricing, current.days, savedPricePerDay)

    if (currentDaily > previousDaily) {
      issues.push({
        code: `tier-increase-${current.days}`,
        message: `${current.label}: ставка ${Math.round(currentDaily)}₽/сут. выше предыдущего тарифа ${Math.round(previousDaily)}₽/сут.`,
      })
    }
  }

  return issues
}
