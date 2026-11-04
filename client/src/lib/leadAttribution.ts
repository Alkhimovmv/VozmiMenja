export type LeadScenario = 'puzzi-cleaning' | 'karaoke-kit' | 'travel-camera'

export interface LeadAttribution {
  sourcePage: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  scenario?: LeadScenario
}

const FIRST_TOUCH_STORAGE_KEY = 'lead-attribution:first-touch'

type FirstTouchAttribution = Pick<
  LeadAttribution,
  'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmContent'
>

const getOptionalParam = (params: URLSearchParams, name: string) => params.get(name) || undefined

export function inferLeadScenario(campaign?: string, pathname = ''): LeadScenario | undefined {
  const normalizedCampaign = campaign?.toLowerCase()
  if (normalizedCampaign === 'puzzi-cleaning') return 'puzzi-cleaning'
  if (normalizedCampaign === 'karaoke-kit') return 'karaoke-kit'
  if (normalizedCampaign === 'travel-camera') return 'travel-camera'

  const normalizedPathname = pathname.toLowerCase()
  if (normalizedPathname.includes('arenda-moyushchego-pylesosa-dlya-divana-kovra')) return 'puzzi-cleaning'
  if (normalizedPathname.includes('arenda-karaoke-komplekta')) return 'karaoke-kit'
  if (normalizedPathname.includes('arenda-kamery-dlya-puteshestviya-vloga')) return 'travel-camera'

  return undefined
}

export function parseLeadAttribution(href: string, referrer?: string): LeadAttribution {
  const url = new URL(href, 'https://vozmimenya.ru')
  const utmCampaign = getOptionalParam(url.searchParams, 'utm_campaign')

  return {
    sourcePage: url.href,
    referrer: referrer || undefined,
    utmSource: getOptionalParam(url.searchParams, 'utm_source'),
    utmMedium: getOptionalParam(url.searchParams, 'utm_medium'),
    utmCampaign,
    utmContent: getOptionalParam(url.searchParams, 'utm_content'),
    scenario: inferLeadScenario(utmCampaign, url.pathname),
  }
}

const hasUtmAttribution = (attribution: FirstTouchAttribution) => Boolean(
  attribution.utmSource
  || attribution.utmMedium
  || attribution.utmCampaign
  || attribution.utmContent,
)

const readFirstTouchAttribution = (storage: Storage): FirstTouchAttribution | undefined => {
  const stored = storage.getItem(FIRST_TOUCH_STORAGE_KEY)
  if (!stored) return undefined

  try {
    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      storage.removeItem(FIRST_TOUCH_STORAGE_KEY)
      return undefined
    }

    return {
      utmSource: typeof parsed.utmSource === 'string' ? parsed.utmSource : undefined,
      utmMedium: typeof parsed.utmMedium === 'string' ? parsed.utmMedium : undefined,
      utmCampaign: typeof parsed.utmCampaign === 'string' ? parsed.utmCampaign : undefined,
      utmContent: typeof parsed.utmContent === 'string' ? parsed.utmContent : undefined,
    }
  } catch {
    storage.removeItem(FIRST_TOUCH_STORAGE_KEY)
    return undefined
  }
}

export function getLeadContext(): LeadAttribution {
  const current = parseLeadAttribution(window.location.href, document.referrer)

  try {
    const stored = readFirstTouchAttribution(window.sessionStorage)
    const firstTouch = stored || current

    if (!stored && hasUtmAttribution(current)) {
      window.sessionStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify({
        utmSource: current.utmSource,
        utmMedium: current.utmMedium,
        utmCampaign: current.utmCampaign,
        utmContent: current.utmContent,
      }))
    }

    return {
      ...current,
      utmSource: firstTouch.utmSource,
      utmMedium: firstTouch.utmMedium,
      utmCampaign: firstTouch.utmCampaign,
      utmContent: firstTouch.utmContent,
      scenario: inferLeadScenario(firstTouch.utmCampaign, new URL(current.sourcePage).pathname),
    }
  } catch {
    return current
  }
}

export function buildAttributedBookingHref(
  equipment: string | readonly string[],
  scenario: LeadScenario,
  attribution: LeadAttribution,
) {
  const params = new URLSearchParams()
  params.set('equipment', Array.isArray(equipment) ? equipment.join(',') : equipment)

  if (hasUtmAttribution(attribution)) {
    if (attribution.utmSource) params.set('utm_source', attribution.utmSource)
    if (attribution.utmMedium) params.set('utm_medium', attribution.utmMedium)
    if (attribution.utmCampaign) params.set('utm_campaign', attribution.utmCampaign)
    if (attribution.utmContent) params.set('utm_content', attribution.utmContent)
  } else {
    params.set('utm_source', 'site')
    params.set('utm_medium', 'landing')
    params.set('utm_campaign', scenario)
  }

  return `/booking?${params.toString()}`
}

export function buildAttributedBookingLinks<T extends { equipment: string | readonly string[] }>(
  items: readonly T[],
  scenario: LeadScenario,
  attribution: LeadAttribution,
) {
  return items.map((item) => ({
    ...item,
    href: buildAttributedBookingHref(item.equipment, scenario, attribution),
  }))
}
