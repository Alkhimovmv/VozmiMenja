import { buildLeadReport, type LeadReportInput } from './leadReport'

describe('buildLeadReport', () => {
  const now = new Date('2030-01-29T12:00:00.000Z')

  const report = (inputs: LeadReportInput[]) => buildLeadReport(inputs, now)

  it('compares the current 14 days with the previous 14 days by source and campaign', () => {
    const rows = report([
      {
        kind: 'booking',
        createdAt: '2030-01-28T12:00:00.000Z',
        utmSource: 'yandex',
        utmCampaign: 'winter',
        leadResult: 'booked',
        revenue: 12_500,
      },
      {
        kind: 'contact',
        createdAt: '2030-01-27T12:00:00.000Z',
        utmSource: 'yandex',
        utmCampaign: 'winter',
      },
      {
        kind: 'booking',
        createdAt: '2030-01-10T12:00:00.000Z',
        utmSource: 'yandex',
        utmCampaign: 'winter',
        leadResult: 'booked',
        revenue: 5_000,
      },
      {
        kind: 'contact',
        createdAt: '2030-01-09T12:00:00.000Z',
        utmSource: 'yandex',
        utmCampaign: 'winter',
      },
    ])

    expect(rows).toEqual([{
      source: 'yandex',
      campaign: 'winter',
      currentLeads: 2,
      currentStartedBookings: 1,
      currentConfirmedRentals: 1,
      currentRevenue: 12_500,
      currentConversion: 50,
      baselineLeads: 2,
      baselineStartedBookings: 1,
      baselineConfirmedRentals: 1,
      baselineRevenue: 5_000,
      baselineConversion: 50,
    }])
  })

  it('puts the shared boundary in current only and includes both outer boundaries', () => {
    const rows = report([
      { kind: 'contact', createdAt: '2030-01-29T12:00:00.000Z', utmSource: 'now' },
      { kind: 'contact', createdAt: '2030-01-15T12:00:00.000Z', utmSource: 'boundary' },
      { kind: 'contact', createdAt: '2030-01-01T12:00:00.000Z', utmSource: 'oldest' },
    ])

    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: 'now', currentLeads: 1, baselineLeads: 0 }),
      expect.objectContaining({ source: 'boundary', currentLeads: 1, baselineLeads: 0 }),
      expect.objectContaining({ source: 'oldest', currentLeads: 0, baselineLeads: 1 }),
    ]))
    expect(rows.reduce((sum, row) => sum + row.currentLeads + row.baselineLeads, 0)).toBe(3)
  })

  it('ignores invalid, future, and older dates and supplies attribution fallbacks', () => {
    const rows = report([
      { kind: 'contact', createdAt: 'not-a-date' },
      { kind: 'contact', createdAt: '2030-01-29T12:00:00.001Z' },
      { kind: 'contact', createdAt: '2030-01-01T11:59:59.999Z' },
      { kind: 'contact', createdAt: '2030-01-28T12:00:00.000Z', utmSource: ' ', utmCampaign: '' },
    ])

    expect(rows).toEqual([expect.objectContaining({
      source: 'не определён',
      campaign: 'без кампании',
      currentLeads: 1,
      baselineLeads: 0,
      currentConversion: 0,
      baselineConversion: 0,
    })])
  })

  it('counts only bookings as started and only booked outcomes as confirmed and revenue', () => {
    const rows = report([
      { kind: 'contact', createdAt: '2030-01-28T12:00:00.000Z', leadResult: 'booked', revenue: 100 },
      { kind: 'booking', createdAt: '2030-01-27T12:00:00.000Z', leadResult: 'thinking', revenue: 200 },
      { kind: 'booking', createdAt: '2030-01-26T12:00:00.000Z', leadResult: 'booked', revenue: 300 },
    ])

    expect(rows[0]).toEqual(expect.objectContaining({
      currentLeads: 3,
      currentStartedBookings: 2,
      currentConfirmedRentals: 2,
      currentRevenue: 400,
      currentConversion: 66.7,
    }))
  })

  it('ignores invalid confirmed revenue without poisoning totals', () => {
    const rows = report([
      { kind: 'booking', createdAt: '2030-01-28T12:00:00.000Z', leadResult: 'booked', revenue: -10 },
      { kind: 'booking', createdAt: '2030-01-27T12:00:00.000Z', leadResult: 'booked', revenue: Number.NaN },
      { kind: 'booking', createdAt: '2030-01-26T12:00:00.000Z', leadResult: 'booked', revenue: Number.POSITIVE_INFINITY },
      { kind: 'booking', createdAt: '2030-01-25T12:00:00.000Z', leadResult: 'booked', revenue: 750 },
    ])

    expect(rows[0].currentRevenue).toBe(750)
  })

  it('sorts deterministically by confirmed rentals, leads, source, then campaign', () => {
    const rows = report([
      { kind: 'contact', createdAt: '2030-01-28T12:00:00.000Z', utmSource: 'beta', utmCampaign: 'a' },
      { kind: 'contact', createdAt: '2030-01-28T12:00:00.000Z', utmSource: 'alpha', utmCampaign: 'b' },
      { kind: 'contact', createdAt: '2030-01-28T12:00:00.000Z', utmSource: 'alpha', utmCampaign: 'a' },
      { kind: 'booking', createdAt: '2030-01-28T12:00:00.000Z', utmSource: 'winner', leadResult: 'booked' },
      { kind: 'contact', createdAt: '2030-01-27T12:00:00.000Z', utmSource: 'many' },
      { kind: 'contact', createdAt: '2030-01-26T12:00:00.000Z', utmSource: 'many' },
    ])

    expect(rows.map(({ source, campaign }) => [source, campaign])).toEqual([
      ['winner', 'без кампании'],
      ['many', 'без кампании'],
      ['alpha', 'a'],
      ['alpha', 'b'],
      ['beta', 'a'],
    ])
  })
})
