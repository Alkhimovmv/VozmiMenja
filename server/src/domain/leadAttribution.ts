import { z } from 'zod'

export const leadScenarios = ['puzzi-cleaning', 'karaoke-kit', 'travel-camera'] as const
export type LeadScenario = typeof leadScenarios[number]

const scenarioSchema = z.enum(leadScenarios)
const scenarioByPathname: Record<string, LeadScenario> = {
  '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva': 'puzzi-cleaning',
  '/arenda-karaoke-komplekta-moskva': 'karaoke-kit',
  '/arenda-kamery-dlya-puteshestviya-vloga-moskva': 'travel-camera',
}

export const leadAttributionSchema = z.object({
  sourcePage: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(160).optional(),
  utmContent: z.string().max(160).optional(),
  scenario: scenarioSchema.optional(),
})

const asLeadScenario = (value?: string): LeadScenario | undefined => {
  const parsed = scenarioSchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export function normalizeLeadScenario(
  scenario?: string,
  campaign?: string,
  sourcePage?: string,
): LeadScenario | undefined {
  const explicitScenario = asLeadScenario(scenario)
  if (explicitScenario) return explicitScenario

  const campaignScenario = asLeadScenario(campaign)
  if (campaignScenario) return campaignScenario

  if (!sourcePage) return undefined

  try {
    const pathname = new URL(sourcePage, 'https://vozmimenya.ru').pathname
    return scenarioByPathname[pathname]
  } catch {
    return undefined
  }
}
