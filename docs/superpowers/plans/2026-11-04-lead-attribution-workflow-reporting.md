# Lead Attribution, Workflow and Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve campaign attribution from an external channel through booking, give the manager a structured lead workflow, and produce a 14-day channel × offer report.

**Architecture:** A focused client helper owns first-touch UTM persistence, scenario inference and attributed internal links. The existing booking and contact-lead records gain the same attribution/workflow fields; authenticated admin endpoints update outcomes, and a pure aggregation module builds current/baseline campaign reports. The existing inbox renders the workflow and report without changing prices or the public booking contract.

**Tech Stack:** React 18, TypeScript, React Router, TanStack Query, Express, Zod, SQLite, Jest, tsx assertion tests.

---

## File map

- Create `client/src/lib/leadAttribution.ts`: parse, persist and forward campaign attribution.
- Create `client/src/lib/leadAttribution.test.ts`: pure client attribution tests.
- Modify `client/src/lib/contactLinks.ts`: use the shared attribution helper.
- Modify `client/src/pages/SelfServiceBookingPage.tsx`: remove the local UTM parser and send shared attribution.
- Modify `client/src/components/equipment/BookingForm.tsx`: remove the local UTM parser and send shared attribution.
- Modify `client/src/pages/KaraokeKitRentalPage.tsx`: preserve incoming campaign data in booking links.
- Modify `client/src/pages/WashingVacuumSofaCarpetPage.tsx`: preserve incoming campaign data in booking links.
- Modify `client/src/pages/TravelVlogCameraRentalPage.tsx`: preserve incoming campaign data in booking links.
- Modify `client/src/types/index.ts`: add attribution and workflow fields.
- Modify `client/src/lib/api.ts`: send the new contact fields.
- Create `server/src/domain/leadAttribution.ts`: shared Zod fields and scenario normalization.
- Create `server/src/domain/leadAttribution.test.ts`: schema and normalization tests.
- Create `server/src/domain/leadWorkflow.ts`: workflow enums and validation.
- Create `server/src/domain/leadWorkflow.test.ts`: workflow tests.
- Create `server/src/domain/leadReport.ts`: pure 14-day aggregation.
- Create `server/src/domain/leadReport.test.ts`: aggregation and baseline tests.
- Create `server/src/routes/adminLeadWorkflow.test.ts`: authenticated office-scope and report route tests.
- Modify `server/src/models/database.ts`: additive SQLite columns and indexes.
- Modify `server/src/models/Booking.ts`: persist and map attribution/workflow fields.
- Modify `server/src/models/ContactLead.ts`: persist and map attribution/workflow fields.
- Modify `server/src/routes/bookings.ts`: accept the shared attribution fields.
- Modify `server/src/routes/contact.ts`: accept the shared attribution fields and include them in notifications.
- Modify `server/src/routes/admin.ts`: workflow update and report endpoints.
- Modify `server/src/services/telegram.ts`: display scenario/content in notifications.
- Modify `server/src/services/emailNotify.ts`: display scenario/content in notifications.
- Modify `client/src/api/admin/bookings.ts`: update booking workflow and fetch report.
- Modify `client/src/api/admin/contactLeads.ts`: update contact-lead workflow.
- Create `client/src/lib/leadWorkflow.ts`: labels, reply text and UI helpers.
- Create `client/src/lib/leadWorkflow.test.ts`: helper tests.
- Create `client/src/components/admin/LeadCampaignReport.tsx`: current/baseline report table.
- Modify `client/src/pages/admin/SiteBookingsPage.tsx`: structured outcome controls and report.
- Modify `client/package.json`: include the new client tests.
- Modify `.agents/board.md` and `docs/changelog.md`: record implementation and release state.

### Task 1: Preserve external attribution through landing and booking pages

**Files:**
- Create: `client/src/lib/leadAttribution.ts`
- Create: `client/src/lib/leadAttribution.test.ts`
- Modify: `client/src/lib/contactLinks.ts`
- Modify: `client/src/pages/SelfServiceBookingPage.tsx`
- Modify: `client/src/components/equipment/BookingForm.tsx`
- Modify: `client/src/pages/KaraokeKitRentalPage.tsx`
- Modify: `client/src/pages/WashingVacuumSofaCarpetPage.tsx`
- Modify: `client/src/pages/TravelVlogCameraRentalPage.tsx`
- Modify: `client/package.json`

- [ ] **Step 1: Write the failing attribution tests**

```ts
// client/src/lib/leadAttribution.test.ts
import assert from 'node:assert/strict'
import {
  buildAttributedBookingHref,
  inferLeadScenario,
  parseLeadAttribution,
} from './leadAttribution'

const avito = parseLeadAttribution(
  'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=avito&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=volzhskaya-account-1',
  'https://www.avito.ru/item/1',
)

assert.equal(avito.utmSource, 'avito')
assert.equal(avito.utmMedium, 'listing')
assert.equal(avito.utmCampaign, 'karaoke-kit')
assert.equal(avito.utmContent, 'volzhskaya-account-1')
assert.equal(avito.scenario, 'karaoke-kit')

assert.equal(
  buildAttributedBookingHref(
    '/booking?equipment=jbl-partybox-320,jbl-partybox-wireless-microphones',
    'karaoke-kit',
    avito,
  ),
  '/booking?equipment=jbl-partybox-320%2Cjbl-partybox-wireless-microphones&utm_source=avito&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=volzhskaya-account-1',
)

const direct = parseLeadAttribution(
  'https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva',
  '',
)
assert.equal(direct.scenario, 'puzzi-cleaning')
assert.equal(
  buildAttributedBookingHref('/booking?equipment=karcher-puzzi-8-1', 'puzzi-cleaning', direct),
  '/booking?equipment=karcher-puzzi-8-1&utm_source=site&utm_medium=landing&utm_campaign=puzzi-cleaning',
)

assert.equal(inferLeadScenario('travel-camera', '/booking'), 'travel-camera')
assert.equal(inferLeadScenario(undefined, '/contact'), undefined)

console.log('leadAttribution tests passed')
```

Add the test to the client script:

```json
"test": "tsx src/lib/leadAttribution.test.ts && tsx src/lib/adminLeadConversion.test.ts && tsx src/lib/bookingFormGuidance.test.ts && tsx src/lib/selfServiceBooking.test.ts && tsx src/lib/rentalPriceSuggestion.test.ts && tsx src/utils/pricing.test.ts"
```

- [ ] **Step 2: Run the client test and verify it fails**

Run: `npm --prefix client test`

Expected: FAIL because `client/src/lib/leadAttribution.ts` does not exist.

- [ ] **Step 3: Implement the pure attribution helper**

```ts
// client/src/lib/leadAttribution.ts
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

const scenarios = new Set<LeadScenario>(['puzzi-cleaning', 'karaoke-kit', 'travel-camera'])

const scenarioByPath: Record<string, LeadScenario> = {
  '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva': 'puzzi-cleaning',
  '/arenda-karaoke-komplekta-moskva': 'karaoke-kit',
  '/arenda-kamery-dlya-puteshestviya-vloga-moskva': 'travel-camera',
}

export const inferLeadScenario = (campaign: string | undefined, pathname: string) => {
  if (campaign && scenarios.has(campaign as LeadScenario)) return campaign as LeadScenario
  return scenarioByPath[pathname]
}

export const parseLeadAttribution = (href: string, referrer = ''): LeadAttribution => {
  const url = new URL(href, 'https://vozmimenya.ru')
  const utmCampaign = url.searchParams.get('utm_campaign') || undefined
  return {
    sourcePage: `${url.pathname}${url.search}`,
    referrer: referrer || undefined,
    utmSource: url.searchParams.get('utm_source') || undefined,
    utmMedium: url.searchParams.get('utm_medium') || undefined,
    utmCampaign,
    utmContent: url.searchParams.get('utm_content') || undefined,
    scenario: inferLeadScenario(utmCampaign, url.pathname),
  }
}

export const buildAttributedBookingHref = (
  href: string,
  campaign: LeadScenario,
  attribution: LeadAttribution,
) => {
  const url = new URL(href, 'https://vozmimenya.ru')
  url.searchParams.set('utm_source', attribution.utmSource || 'site')
  url.searchParams.set('utm_medium', attribution.utmMedium || 'landing')
  url.searchParams.set('utm_campaign', attribution.utmCampaign || campaign)
  if (attribution.utmContent) url.searchParams.set('utm_content', attribution.utmContent)
  return `${url.pathname}?${url.searchParams.toString()}`
}

const storageKey = 'vozmimenya_lead_attribution'

export const getLeadContext = (): LeadAttribution => {
  const current = parseLeadAttribution(window.location.href, document.referrer)
  const hasCampaign = Boolean(current.utmSource || current.utmMedium || current.utmCampaign || current.utmContent)

  if (hasCampaign) {
    sessionStorage.setItem(storageKey, JSON.stringify(current))
    return current
  }

  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as LeadAttribution | null
    return stored
      ? { ...stored, sourcePage: current.sourcePage, referrer: current.referrer || stored.referrer }
      : current
  } catch {
    sessionStorage.removeItem(storageKey)
    return current
  }
}
```

- [ ] **Step 4: Replace duplicate context parsers and preserve landing attribution**

In `client/src/lib/contactLinks.ts`, remove the local `getLeadContext` body and re-export the shared helper:

```ts
export { getLeadContext } from './leadAttribution'
```

In `SelfServiceBookingPage.tsx` and `BookingForm.tsx`, import `getLeadContext` from `../lib/leadAttribution` or `../../lib/leadAttribution`, remove the local function, and include the new fields already returned by the helper.

In each scenario landing component, build the booking link inside the component so it sees the current first-touch attribution:

```ts
const attribution = getLeadContext()
const bookingHref = (equipment: string) => buildAttributedBookingHref(
  `/booking?equipment=${equipment}`,
  'puzzi-cleaning',
  attribution,
)
```

Use `karaoke-kit` and `travel-camera` in their respective pages. Do not replace an incoming `avito`, `polka`, `2gis`, `vk` or `yandex_maps` source with `site`.

- [ ] **Step 5: Run the client tests**

Run: `npm --prefix client test`

Expected: all assertion test files print their success message and exit 0.

- [ ] **Step 6: Commit the attribution helper**

```bash
git add client/src/lib/leadAttribution.ts client/src/lib/leadAttribution.test.ts client/src/lib/contactLinks.ts client/src/pages/SelfServiceBookingPage.tsx client/src/components/equipment/BookingForm.tsx client/src/pages/KaraokeKitRentalPage.tsx client/src/pages/WashingVacuumSofaCarpetPage.tsx client/src/pages/TravelVlogCameraRentalPage.tsx client/package.json
git commit -m "feat: preserve acquisition attribution through booking"
```

### Task 2: Persist scenario and `utm_content` for bookings and contact leads

**Files:**
- Create: `server/src/domain/leadAttribution.ts`
- Create: `server/src/domain/leadAttribution.test.ts`
- Modify: `server/src/models/database.ts`
- Modify: `server/src/models/Booking.ts`
- Modify: `server/src/models/ContactLead.ts`
- Modify: `server/src/routes/bookings.ts`
- Modify: `server/src/routes/contact.ts`
- Modify: `server/src/services/telegram.ts`
- Modify: `server/src/services/emailNotify.ts`
- Modify: `client/src/types/index.ts`
- Modify: `client/src/lib/api.ts`

- [ ] **Step 1: Write the failing server attribution test**

```ts
// server/src/domain/leadAttribution.test.ts
import { leadAttributionSchema, normalizeLeadScenario } from './leadAttribution'

describe('lead attribution', () => {
  it('accepts the three campaign scenarios and utm_content', () => {
    expect(leadAttributionSchema.parse({
      utmSource: 'avito',
      utmMedium: 'listing',
      utmCampaign: 'karaoke-kit',
      utmContent: 'volzhskaya-account-1',
      scenario: 'karaoke-kit',
    })).toEqual(expect.objectContaining({ scenario: 'karaoke-kit' }))
  })

  it('infers a known scenario from the campaign and rejects arbitrary values', () => {
    expect(normalizeLeadScenario(undefined, 'travel-camera', '/booking')).toBe('travel-camera')
    expect(normalizeLeadScenario('discount-secret', undefined, '/')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the focused server test and verify it fails**

Run: `npm --prefix server test -- --runInBand src/domain/leadAttribution.test.ts`

Expected: FAIL because the domain module does not exist.

- [ ] **Step 3: Implement the shared schema**

```ts
// server/src/domain/leadAttribution.ts
import { z } from 'zod'

export const leadScenarios = ['puzzi-cleaning', 'karaoke-kit', 'travel-camera'] as const
export type LeadScenario = typeof leadScenarios[number]

const scenarioByPath: Record<string, LeadScenario> = {
  '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva': 'puzzi-cleaning',
  '/arenda-karaoke-komplekta-moskva': 'karaoke-kit',
  '/arenda-kamery-dlya-puteshestviya-vloga-moskva': 'travel-camera',
}

export const normalizeLeadScenario = (
  scenario?: string,
  campaign?: string,
  sourcePage?: string,
): LeadScenario | undefined => {
  if (leadScenarios.includes(scenario as LeadScenario)) return scenario as LeadScenario
  if (leadScenarios.includes(campaign as LeadScenario)) return campaign as LeadScenario
  if (!sourcePage) return undefined
  try {
    return scenarioByPath[new URL(sourcePage, 'https://vozmimenya.ru').pathname]
  } catch {
    return undefined
  }
}

export const leadAttributionSchema = z.object({
  sourcePage: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(160).optional(),
  utmContent: z.string().max(160).optional(),
  scenario: z.enum(leadScenarios).optional(),
}).partial()
```

- [ ] **Step 4: Add additive SQLite columns**

Add `utm_content` and `scenario` to both create-table statements and migration arrays in `server/src/models/database.ts`. Add the optional operating-context fields to `contact_leads` so forms that collect them retain the same context as bookings:

```ts
['utm_content', 'TEXT'],
['scenario', 'TEXT'],
['office_id', 'INTEGER'],
['office_name', 'TEXT'],
['delivery_method', 'TEXT'],
['preferred_contact', 'TEXT'],
['equipment_ids', 'TEXT'],
```

Add query indexes after the existing lead indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_bookings_campaign_created
ON bookings(utm_source, utm_campaign, created_at);

CREATE INDEX IF NOT EXISTS idx_contact_leads_campaign_created
ON contact_leads(utm_source, utm_campaign, created_at);
```

- [ ] **Step 5: Persist and map the new fields**

Add to both model interfaces:

```ts
utmContent?: string
scenario?: LeadScenario
```

Add the optional context fields to `ContactLead` and its request type:

```ts
officeId?: number
officeName?: string
deliveryMethod?: 'pickup' | 'delivery'
preferredContact?: 'phone' | 'telegram' | 'whatsapp'
equipmentIds?: string[]
```

Add `utm_content, scenario` to each INSERT and pass:

```ts
data.utmContent || '',
normalizeLeadScenario(data.scenario, data.utmCampaign, data.sourcePage) || '',
```

Map rows with:

```ts
utmContent: row.utm_content || undefined,
scenario: normalizeLeadScenario(row.scenario, row.utm_campaign, row.source_page),
```

Map and persist the optional contact-lead context fields without inventing values when the public form did not ask for them. Store `equipmentIds` as a sorted, unique JSON array and return an empty array for missing legacy values.

Update `ContactLeadModel.findRecentDuplicate` so a contact with the same normalized phone, non-empty scenario and the same sorted equipment-ID set inside the existing 10-minute window is treated as a duplicate even if the message wording changed. An empty set means the customer did not choose concrete equipment, not an inferred selection. For contacts without a scenario, preserve the existing phone + subject + message rule. Keep the booking duplicate rule unchanged because it already keys on phone, dates, office and equipment.

- [ ] **Step 6: Extend public validation and notifications**

Merge `leadAttributionSchema.shape` into the existing booking/contact Zod objects and include `utmContent` and normalized `scenario` in model creation. Add notification lines only when populated:

```ts
if (data.utmContent) message += `\n• UTM content: ${this.escapeHtml(data.utmContent)}`
if (data.scenario) message += `\n• Сценарий: ${this.escapeHtml(data.scenario)}`
```

Apply the equivalent escaped rows in `emailNotify.ts`.

- [ ] **Step 7: Extend client request/response types**

Add to `Booking`, `BookingRequest`, `ContactLead` and `sendContactMessage`:

```ts
utmContent?: string
scenario?: 'puzzi-cleaning' | 'karaoke-kit' | 'travel-camera'
```

Add `officeId`, `officeName`, `deliveryMethod`, `preferredContact` and `equipmentIds` to the contact request/response types as optional fields. Existing forms may omit them; no default office, delivery method, contact channel or equipment may be fabricated.

- [ ] **Step 8: Run server and client verification**

Run:

```bash
npm --prefix server test -- --runInBand src/domain/leadAttribution.test.ts
npm --prefix server run typecheck
npm --prefix client run typecheck
npm --prefix client test
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit attribution persistence**

```bash
git add server/src/domain/leadAttribution.ts server/src/domain/leadAttribution.test.ts server/src/models/database.ts server/src/models/Booking.ts server/src/models/ContactLead.ts server/src/routes/bookings.ts server/src/routes/contact.ts server/src/services/telegram.ts server/src/services/emailNotify.ts client/src/types/index.ts client/src/lib/api.ts
git commit -m "feat: persist lead campaign attribution"
```

### Task 3: Add a shared lead outcome workflow

**Files:**
- Create: `server/src/domain/leadWorkflow.ts`
- Create: `server/src/domain/leadWorkflow.test.ts`
- Modify: `server/src/models/database.ts`
- Modify: `server/src/models/Booking.ts`
- Modify: `server/src/models/ContactLead.ts`
- Modify: `server/src/routes/admin.ts`
- Create: `server/src/routes/adminLeadWorkflow.test.ts`
- Modify: `client/src/types/index.ts`
- Modify: `client/src/api/admin/bookings.ts`
- Modify: `client/src/api/admin/contactLeads.ts`

- [ ] **Step 1: Write the failing workflow test**

```ts
// server/src/domain/leadWorkflow.test.ts
import { leadWorkflowSchema } from './leadWorkflow'

describe('lead workflow', () => {
  it.each(['unreached', 'thinking', 'booked', 'declined', 'duplicate'] as const)('accepts %s', (result) => {
    expect(leadWorkflowSchema.parse({ result })).toEqual({ result })
  })

  it('accepts non-negative revenue and rejects negative revenue', () => {
    expect(leadWorkflowSchema.parse({ result: 'booked', revenue: 1900 })).toEqual({ result: 'booked', revenue: 1900 })
    expect(() => leadWorkflowSchema.parse({ result: 'booked', revenue: -1 })).toThrow()
  })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm --prefix server test -- --runInBand src/domain/leadWorkflow.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the workflow domain**

```ts
// server/src/domain/leadWorkflow.ts
import { z } from 'zod'

export const leadResults = ['unreached', 'thinking', 'booked', 'declined', 'duplicate'] as const
export type LeadResult = typeof leadResults[number]

export const leadWorkflowSchema = z.object({
  result: z.enum(leadResults),
  revenue: z.number().finite().min(0).max(10_000_000).nullable().optional(),
})
```

- [ ] **Step 4: Add workflow columns and model methods**

Add to both booking and contact-lead migrations:

```ts
['lead_result', 'TEXT'],
['lead_revenue', 'REAL'],
['last_contacted_at', 'DATETIME'],
```

Add model fields:

```ts
leadResult?: LeadResult
leadRevenue?: number
lastContactedAt?: string
```

Implement the booking method with its concrete table name:

```ts
async updateWorkflow(id: string | number, result: LeadResult, revenue?: number | null): Promise<void> {
  await run(`
    UPDATE bookings
    SET lead_result = ?, lead_revenue = ?,
        last_contacted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [result, revenue ?? null, id])
}
```

Implement the contact-lead method separately:

```ts
async updateWorkflow(id: number, result: LeadResult, revenue?: number | null): Promise<void> {
  await run(`
    UPDATE contact_leads
    SET lead_result = ?, lead_revenue = ?,
        last_contacted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [result, revenue ?? null, id])
}
```

Do not derive or overwrite the existing operational `status`: booking confirmation/completion and lead-contact outcome are separate concepts.

- [ ] **Step 5: Add authenticated workflow endpoints**

In `server/src/routes/admin.ts`, add:

```ts
router.patch('/bookings/:id/workflow', authMiddleware, async (req, res) => {
  const parsed = leadWorkflowSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Некорректный результат контакта' })
  const booking = await bookingModel.findById(req.params.id)
  if (!booking || !await canAccessOffice(req, booking.officeId)) {
    return res.status(404).json({ error: 'Заявка не найдена' })
  }
  await bookingModel.updateWorkflow(req.params.id, parsed.data.result, parsed.data.revenue)
  res.json(await bookingModel.findById(req.params.id))
})

router.patch('/contact-leads/:id/workflow', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Некорректный номер обращения' })
  const parsed = leadWorkflowSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Некорректный результат контакта' })
  const lead = await contactLeadModel.findById(id)
  if (!lead || !await canAccessOffice(req, lead.officeId)) {
    return res.status(404).json({ error: 'Обращение не найдено' })
  }
  await contactLeadModel.updateWorkflow(id, parsed.data.result, parsed.data.revenue)
  res.json(await contactLeadModel.findById(id))
})
```

Reuse the existing `canAccessOffice` import. Update the existing contact-lead list/status/delete handlers in the same file to filter or check `lead.officeId`; legacy `NULL` values continue to follow `DEFAULT_OFFICE_ID` through `filterByOfficeAccess`/`canAccessOffice`. Add route tests proving that an office-scoped admin receives `404` when updating another office's record.

- [ ] **Step 6: Extend client APIs and types**

Add:

```ts
export type LeadResult = 'unreached' | 'thinking' | 'booked' | 'declined' | 'duplicate'
```

Add `leadResult`, `leadRevenue`, and `lastContactedAt` to both booking and contact-lead types. Add `updateWorkflow` methods that PATCH the new endpoints with `{ result, revenue }`.

- [ ] **Step 7: Run focused and full server tests**

Run:

```bash
npm --prefix server test -- --runInBand src/domain/leadWorkflow.test.ts
npm --prefix server test -- --runInBand
npm --prefix server run typecheck
```

Expected: the focused suite and all existing server suites pass.

- [ ] **Step 8: Commit the workflow backend**

```bash
git add server/src/domain/leadWorkflow.ts server/src/domain/leadWorkflow.test.ts server/src/models/database.ts server/src/models/Booking.ts server/src/models/ContactLead.ts server/src/routes/admin.ts server/src/routes/adminLeadWorkflow.test.ts client/src/types/index.ts client/src/api/admin/bookings.ts client/src/api/admin/contactLeads.ts
git commit -m "feat: add structured lead outcomes"
```

### Task 4: Add outcome controls and reply helpers to the inbox

**Files:**
- Create: `client/src/lib/leadWorkflow.ts`
- Create: `client/src/lib/leadWorkflow.test.ts`
- Modify: `client/src/pages/admin/SiteBookingsPage.tsx`
- Modify: `client/package.json`

- [ ] **Step 1: Write the failing client workflow test**

```ts
// client/src/lib/leadWorkflow.test.ts
import assert from 'node:assert/strict'
import { buildLeadReply, getLeadResultLabel } from './leadWorkflow'

assert.equal(getLeadResultLabel('thinking'), 'Думает')
assert.match(buildLeadReply({
  customerName: 'Анна',
  scenario: 'karaoke-kit',
  officeName: 'Волжская',
}), /Анна/)
assert.match(buildLeadReply({
  customerName: 'Анна',
  scenario: 'karaoke-kit',
  officeName: 'Волжская',
}), /караоке-комплект/)

console.log('leadWorkflow tests passed')
```

Update the client test script at this point, after the file exists:

```json
"test": "tsx src/lib/leadAttribution.test.ts && tsx src/lib/leadWorkflow.test.ts && tsx src/lib/adminLeadConversion.test.ts && tsx src/lib/bookingFormGuidance.test.ts && tsx src/lib/selfServiceBooking.test.ts && tsx src/lib/rentalPriceSuggestion.test.ts && tsx src/utils/pricing.test.ts"
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm --prefix client test`

Expected: FAIL because `client/src/lib/leadWorkflow.ts` does not exist.

- [ ] **Step 3: Implement labels and deterministic reply text**

```ts
// client/src/lib/leadWorkflow.ts
import type { LeadResult } from '../types'

const resultLabels: Record<LeadResult, string> = {
  unreached: 'Не связались',
  thinking: 'Думает',
  booked: 'Забронировано',
  declined: 'Отказ',
  duplicate: 'Дубль',
}

const scenarioLabels = {
  'puzzi-cleaning': 'моющий пылесос для химчистки',
  'karaoke-kit': 'караоке-комплект JBL с микрофонами',
  'travel-camera': 'камеру для поездки или съёмки',
} as const

export const getLeadResultLabel = (result: LeadResult) => resultLabels[result]

export const buildLeadReply = (lead: {
  customerName: string
  scenario?: keyof typeof scenarioLabels
  officeName?: string
}) => {
  const firstName = lead.customerName.trim().split(/\s+/)[0] || 'Здравствуйте'
  const offer = lead.scenario ? scenarioLabels[lead.scenario] : 'оборудование'
  const office = lead.officeName ? ` Офис: ${lead.officeName}.` : ''
  return `${firstName}, здравствуйте! Вы оставляли заявку на ${offer} в «ВозьмиМеня». Подскажите, даты ещё актуальны?${office}`
}
```

- [ ] **Step 4: Add mutations and controls to each inbox card**

Add one mutation per record type. After success invalidate the relevant query and show `toast.success('Результат контакта сохранён')`.

Render the same five actions for bookings and contact leads:

```tsx
{(['unreached', 'thinking', 'booked', 'declined', 'duplicate'] as LeadResult[]).map((result) => (
  <button
    key={result}
    type="button"
    onClick={() => updateWorkflow(result)}
    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
  >
    {getLeadResultLabel(result)}
  </button>
))}
```

For `booked`, use the booking `totalPrice` as the default revenue; for a contact lead open a numeric prompt initialized to an empty value and send `null` when the manager does not know the sum. Add a `Скопировать ответ` button using `buildLeadReply`.

Each card must also render the source/campaign, scenario, lead age, office, pickup/delivery and preferred contact channel when available. Missing optional fields render as `Не указано`; they must not be inferred from UTM content.

- [ ] **Step 5: Run client tests, typecheck and lint**

Run:

```bash
npm --prefix client test
npm --prefix client run typecheck
npm --prefix client run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the inbox workflow**

```bash
git add client/src/lib/leadWorkflow.ts client/src/lib/leadWorkflow.test.ts client/src/pages/admin/SiteBookingsPage.tsx client/package.json
git commit -m "feat: add lead outcome controls to inbox"
```

### Task 5: Build the 14-day campaign report

**Files:**
- Create: `server/src/domain/leadReport.ts`
- Create: `server/src/domain/leadReport.test.ts`
- Modify: `server/src/routes/admin.ts`
- Modify: `server/src/routes/adminLeadWorkflow.test.ts`
- Modify: `client/src/api/admin/bookings.ts`
- Create: `client/src/components/admin/LeadCampaignReport.tsx`
- Modify: `client/src/pages/admin/SiteBookingsPage.tsx`

- [ ] **Step 1: Write the failing aggregation test**

```ts
// server/src/domain/leadReport.test.ts
import { buildLeadReport } from './leadReport'

describe('lead report', () => {
  it('groups leads by source and campaign and calculates conversion', () => {
    const rows = buildLeadReport([
      { kind: 'booking', createdAt: '2026-11-02T10:00:00Z', utmSource: 'avito', utmCampaign: 'karaoke-kit', leadResult: 'booked', revenue: 1900 },
      { kind: 'contact', createdAt: '2026-11-03T10:00:00Z', utmSource: 'avito', utmCampaign: 'karaoke-kit', leadResult: 'thinking', revenue: 0 },
      { kind: 'booking', createdAt: '2026-10-18T10:00:00Z', utmSource: 'avito', utmCampaign: 'karaoke-kit', leadResult: 'booked', revenue: 1400 },
    ], new Date('2026-11-04T00:00:00Z'))

    expect(rows).toContainEqual(expect.objectContaining({
      source: 'avito',
      campaign: 'karaoke-kit',
      currentLeads: 2,
      currentStartedBookings: 1,
      currentConfirmedRentals: 1,
      currentRevenue: 1900,
      currentConversion: 50,
      baselineLeads: 1,
      baselineStartedBookings: 1,
      baselineConfirmedRentals: 1,
    }))
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm --prefix server test -- --runInBand src/domain/leadReport.test.ts`

Expected: FAIL because the report module does not exist.

- [ ] **Step 3: Implement pure current/baseline aggregation**

```ts
// server/src/domain/leadReport.ts
interface LeadReportInput {
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

const pct = (confirmed: number, leads: number) => leads ? Math.round((confirmed / leads) * 1000) / 10 : 0

export const buildLeadReport = (items: LeadReportInput[], now = new Date()): LeadReportRow[] => {
  const currentStart = new Date(now.getTime() - 14 * 86400000)
  const baselineStart = new Date(now.getTime() - 28 * 86400000)
  const groups = new Map<string, LeadReportRow>()

  for (const item of items) {
    const createdAt = new Date(item.createdAt)
    if (Number.isNaN(createdAt.getTime()) || createdAt < baselineStart || createdAt > now) continue
    const source = item.utmSource || 'не определён'
    const campaign = item.utmCampaign || 'без кампании'
    const key = `${source}\u0000${campaign}`
    const row = groups.get(key) || {
      source, campaign,
      currentLeads: 0, currentStartedBookings: 0, currentConfirmedRentals: 0,
      currentRevenue: 0, currentConversion: 0,
      baselineLeads: 0, baselineStartedBookings: 0, baselineConfirmedRentals: 0,
      baselineRevenue: 0, baselineConversion: 0,
    }
    if (createdAt >= currentStart) {
      row.currentLeads += 1
      if (item.kind === 'booking') row.currentStartedBookings += 1
      if (item.leadResult === 'booked') {
        row.currentConfirmedRentals += 1
        row.currentRevenue += item.revenue || 0
      }
    } else {
      row.baselineLeads += 1
      if (item.kind === 'booking') row.baselineStartedBookings += 1
      if (item.leadResult === 'booked') {
        row.baselineConfirmedRentals += 1
        row.baselineRevenue += item.revenue || 0
      }
    }
    groups.set(key, row)
  }

  return [...groups.values()].map((row) => ({
    ...row,
    currentConversion: pct(row.currentConfirmedRentals, row.currentLeads),
    baselineConversion: pct(row.baselineConfirmedRentals, row.baselineLeads),
  })).sort((a, b) => b.currentConfirmedRentals - a.currentConfirmedRentals || b.currentLeads - a.currentLeads)
}
```

- [ ] **Step 4: Add an authenticated report endpoint**

In `server/src/routes/admin.ts`, fetch bookings and contact leads, apply the existing office-access filter before aggregation, map them to the pure input shape, and return:

```ts
router.get('/lead-report', authMiddleware, async (req, res) => {
  const [allBookings, allContactLeads] = await Promise.all([
    bookingModel.findAll(),
    contactLeadModel.findAll(),
  ])
  const [bookings, contactLeads] = await Promise.all([
    filterByOfficeAccess(req, allBookings, (item) => item.officeId),
    filterByOfficeAccess(req, allContactLeads, (item) => item.officeId),
  ])
  const rows = buildLeadReport([
    ...bookings.map((item) => ({
      kind: 'booking' as const,
      createdAt: item.createdAt,
      utmSource: item.utmSource,
      utmCampaign: item.utmCampaign,
      leadResult: item.leadResult,
      revenue: item.leadRevenue ?? (item.leadResult === 'booked' ? item.totalPrice : 0),
    })),
    ...contactLeads.map((item) => ({
      kind: 'contact' as const,
      createdAt: item.createdAt,
      utmSource: item.utmSource,
      utmCampaign: item.utmCampaign,
      leadResult: item.leadResult,
      revenue: item.leadRevenue || 0,
    })),
  ])
  res.json({ generatedAt: new Date().toISOString(), periodDays: 14, rows })
})
```

Extend `server/src/routes/adminLeadWorkflow.test.ts` to prove an office-scoped admin's report excludes bookings and contact leads from other offices, while a superadmin without `X-View-As-User` can see all offices.

- [ ] **Step 5: Render a compact report table**

Add `bookingsApi.getLeadReport()`. Create `LeadCampaignReport.tsx` with columns: channel, offer, leads, started bookings, confirmed rentals, conversion and revenue for current 14 days, followed by the same baseline values. Empty state text must be `Данных по кампаниям за последние 28 дней нет`.

Mount the component below the inbox header. Report load failure must render a local warning and must not hide or block the inbox.

- [ ] **Step 6: Run the full relevant checks**

Run:

```bash
npm --prefix server test -- --runInBand
npm --prefix server run typecheck
npm --prefix server run lint
npm --prefix client test
npm --prefix client run typecheck
npm --prefix client run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the report**

```bash
git add server/src/domain/leadReport.ts server/src/domain/leadReport.test.ts server/src/routes/admin.ts server/src/routes/adminLeadWorkflow.test.ts client/src/api/admin/bookings.ts client/src/components/admin/LeadCampaignReport.tsx client/src/pages/admin/SiteBookingsPage.tsx
git commit -m "feat: add channel and offer lead report"
```

### Task 6: Run end-to-end verification and document the release gate

**Files:**
- Modify: `.agents/board.md`
- Modify: `docs/changelog.md`

- [ ] **Step 1: Run the repository verification suite**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Expected: all test suites, lint, typecheck and build exit 0; `git diff --check` prints nothing.

- [ ] **Step 2: Perform a local browser smoke**

Start the existing local stack. Open each of these URLs with an external campaign:

```text
http://localhost:5173/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=avito&utm_medium=listing&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-account-1
http://localhost:5173/arenda-karaoke-komplekta-moskva?utm_source=polka&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=dinamo-profile
http://localhost:5173/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=vk&utm_medium=post&utm_campaign=travel-camera&utm_content=brand-community
```

For each path, verify the booking link retains all four UTM values, submit one test lead, confirm the inbox shows channel/scenario/content, set an outcome, and verify the report row. Confirm a second contact submission with the same phone and scenario inside 10 minutes does not create another lead. Delete only local test data.

- [ ] **Step 3: Record implementation but leave production unchecked**

Mark the implementation tasks complete in `.agents/board.md`. Add a changelog entry with the schema additions, attribution behavior and tests. Confirm that no catalog or offer price changed. Leave Cloud.ru deployment and external publication explicitly unchecked until the owner says `выкатывай`.

- [ ] **Step 4: Commit documentation**

```bash
git add .agents/board.md docs/changelog.md
git commit -m "docs: record acquisition attribution implementation"
```

- [ ] **Step 5: Request code review before any deployment**

Run the `superpowers:requesting-code-review` skill against the complete diff. Resolve findings with TDD and rerun Step 1. Do not deploy, publish channel content, or mutate production data in this plan.
