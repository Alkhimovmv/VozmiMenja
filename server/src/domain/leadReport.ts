const PERIOD_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

export interface LeadReportInput {
  kind: 'booking' | 'contact'
  createdAt: string
  utmSource?: string
  utmCampaign?: string
  leadResult?: string
  revenue?: number
}

export interface LeadReportRow {
  source: string
  campaign: string
  currentLeads: number
  currentStartedBookings: number
  currentConfirmedRentals: number
  currentRevenue: number
  currentConversion: number
  baselineLeads: number
  baselineStartedBookings: number
  baselineConfirmedRentals: number
  baselineRevenue: number
  baselineConversion: number
}

type Period = 'current' | 'baseline'

interface PeriodTotals {
  leads: number
  startedBookings: number
  confirmedRentals: number
  revenue: number
}

interface ReportTotals {
  source: string
  campaign: string
  current: PeriodTotals
  baseline: PeriodTotals
}

const emptyTotals = (): PeriodTotals => ({
  leads: 0,
  startedBookings: 0,
  confirmedRentals: 0,
  revenue: 0,
})

const attribution = (value: string | undefined, fallback: string) => value?.trim() || fallback

const conversion = (confirmed: number, leads: number) => (
  leads === 0 ? 0 : Math.round((confirmed / leads) * 1000) / 10
)

const compareText = (left: string, right: string) => left.localeCompare(right, 'ru')

export function buildLeadReport(inputs: LeadReportInput[], now: Date = new Date()): LeadReportRow[] {
  const nowMs = now.getTime()
  const currentStart = nowMs - PERIOD_DAYS * DAY_MS
  const baselineStart = nowMs - PERIOD_DAYS * 2 * DAY_MS
  const groups = new Map<string, ReportTotals>()

  for (const input of inputs) {
    const createdAt = new Date(input.createdAt).getTime()
    if (!Number.isFinite(createdAt) || createdAt < baselineStart || createdAt > nowMs) continue

    const period: Period = createdAt >= currentStart ? 'current' : 'baseline'
    const source = attribution(input.utmSource, 'не определён')
    const campaign = attribution(input.utmCampaign, 'без кампании')
    const key = JSON.stringify([source, campaign])
    const group = groups.get(key) || {
      source,
      campaign,
      current: emptyTotals(),
      baseline: emptyTotals(),
    }
    const totals = group[period]
    const isConfirmed = input.leadResult === 'booked'

    totals.leads += 1
    if (input.kind === 'booking') totals.startedBookings += 1
    if (isConfirmed) {
      totals.confirmedRentals += 1
      if (typeof input.revenue === 'number' && Number.isFinite(input.revenue) && input.revenue >= 0) {
        totals.revenue += input.revenue
      }
    }
    groups.set(key, group)
  }

  return [...groups.values()]
    .map(({ source, campaign, current, baseline }) => ({
      source,
      campaign,
      currentLeads: current.leads,
      currentStartedBookings: current.startedBookings,
      currentConfirmedRentals: current.confirmedRentals,
      currentRevenue: current.revenue,
      currentConversion: conversion(current.confirmedRentals, current.leads),
      baselineLeads: baseline.leads,
      baselineStartedBookings: baseline.startedBookings,
      baselineConfirmedRentals: baseline.confirmedRentals,
      baselineRevenue: baseline.revenue,
      baselineConversion: conversion(baseline.confirmedRentals, baseline.leads),
    }))
    .sort((left, right) => (
      right.currentConfirmedRentals - left.currentConfirmedRentals
      || right.currentLeads - left.currentLeads
      || compareText(left.source, right.source)
      || compareText(left.campaign, right.campaign)
    ))
}
