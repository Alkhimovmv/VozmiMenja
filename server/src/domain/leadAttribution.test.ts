import { leadAttributionSchema, normalizeLeadScenario } from './leadAttribution'

describe('lead attribution', () => {
  it('accepts utmContent and an exact lead scenario', () => {
    expect(leadAttributionSchema.parse({
      utmContent: 'volzhskaya-account-1',
      scenario: 'karaoke-kit',
    })).toEqual({
      utmContent: 'volzhskaya-account-1',
      scenario: 'karaoke-kit',
    })
  })

  it('rejects an arbitrary scenario', () => {
    expect(() => leadAttributionSchema.parse({ scenario: 'seasonal-promo' })).toThrow()
  })

  it('prefers an exact explicit scenario over campaign and pathname', () => {
    expect(normalizeLeadScenario(
      'puzzi-cleaning',
      'karaoke-kit',
      'https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva',
    )).toBe('puzzi-cleaning')
  })

  it('falls back to an exact known campaign', () => {
    expect(normalizeLeadScenario(undefined, 'travel-camera', '/booking')).toBe('travel-camera')
    expect(normalizeLeadScenario(undefined, 'TRAVEL-CAMERA', '/booking')).toBeUndefined()
  })

  it('falls back to an exact known landing pathname', () => {
    expect(normalizeLeadScenario(
      undefined,
      'autumn-promo',
      'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_campaign=autumn-promo',
    )).toBe('karaoke-kit')
    expect(normalizeLeadScenario(
      undefined,
      undefined,
      '/blog/arenda-karaoke-komplekta-moskva-review',
    )).toBeUndefined()
  })

  it('returns undefined for unknown values', () => {
    expect(normalizeLeadScenario('unknown', 'other', '/booking')).toBeUndefined()
  })
})
