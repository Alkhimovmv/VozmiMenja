const PERIOD_DAYS = 14
const REPORT_TIME_ZONE = 'Europe/Moscow'

interface CalendarDate {
  year: number
  month: number
  day: number
}

export interface LeadReportWindow {
  baselineStart: Date
  currentStart: Date
  end: Date
}

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

const zonedDateParts = (date: Date): CalendarDate => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)

  return { year: value('year'), month: value('month'), day: value('day') }
}

const shiftCalendarDate = ({ year, month, day }: CalendarDate, days: number): CalendarDate => {
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

const timeZoneOffsetMs = (date: Date): number => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)
  const representedAsUtc = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second'),
  )

  return representedAsUtc - Math.trunc(date.getTime() / 1000) * 1000
}

const moscowMidnight = ({ year, month, day }: CalendarDate): Date => {
  const wallClockUtc = Date.UTC(year, month - 1, day)
  const firstGuess = new Date(wallClockUtc)
  const candidate = new Date(wallClockUtc - timeZoneOffsetMs(firstGuess))

  return new Date(wallClockUtc - timeZoneOffsetMs(candidate))
}

export function getLeadReportWindow(now: Date = new Date()): LeadReportWindow {
  const end = new Date(now)
  const today = zonedDateParts(end)
  const currentDate = shiftCalendarDate(today, -(PERIOD_DAYS - 1))
  const baselineDate = shiftCalendarDate(currentDate, -PERIOD_DAYS)

  return {
    baselineStart: moscowMidnight(baselineDate),
    currentStart: moscowMidnight(currentDate),
    end,
  }
}

const parseCreatedAt = (value: string): number => {
  const sqliteUtc = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/
  const normalized = sqliteUtc.test(value) ? `${value.replace(' ', 'T')}Z` : value
  return new Date(normalized).getTime()
}

export function buildLeadReport(inputs: LeadReportInput[], now: Date = new Date()): LeadReportRow[] {
  const window = getLeadReportWindow(now)
  const nowMs = window.end.getTime()
  const currentStart = window.currentStart.getTime()
  const baselineStart = window.baselineStart.getTime()
  const groups = new Map<string, ReportTotals>()

  for (const input of inputs) {
    const createdAt = parseCreatedAt(input.createdAt)
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
