# Free Channel Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish three verified acquisition offers across the available free profiles and measure them for 14 days without paid promotion, fake availability or duplicate listings.

**Architecture:** A versioned campaign manifest is the source of truth for channel, offer, office, profile, landing URL, UTM and publication state. A deterministic validator blocks malformed or duplicate placements before any UI mutation. Publication then proceeds channel-by-channel with an action-time confirmation checkpoint, and the technical attribution plan must be deployed before links go live.

**Tech Stack:** Markdown/JSON campaign assets, TypeScript validation script, production catalog API, authorized Chrome, Avito/Polka/2ГИС/VK/Яндекс Бизнес.

---

## File map

- Create `docs/growth/free-acquisition-campaigns.json`: machine-readable publication manifest.
- Create `docs/growth/free-acquisition-runbook.md`: verified content/photo/link inventory and live statuses.
- Create `server/src/scripts/validate-acquisition-campaigns.ts`: deterministic manifest validator.
- Create `server/src/scripts/validate-acquisition-campaigns.test.ts`: validation tests.
- Modify `server/package.json`: `growth:validate` script.
- Modify `.agents/board.md`: per-channel progress and owner actions.
- Modify `docs/changelog.md`: exact publication/moderation status.

### Task 1: Create and validate the campaign manifest

**Files:**
- Create: `docs/growth/free-acquisition-campaigns.json`
- Create: `server/src/scripts/validate-acquisition-campaigns.ts`
- Create: `server/src/scripts/validate-acquisition-campaigns.test.ts`
- Modify: `server/package.json`

- [ ] **Step 1: Write the failing validator test**

```ts
// server/src/scripts/validate-acquisition-campaigns.test.ts
import { type AcquisitionCampaign, validateCampaigns } from './validate-acquisition-campaigns'

const valid: AcquisitionCampaign[] = [{
  id: 'avito-account-1-puzzi-volzhskaya',
  channel: 'avito',
  profile: 'account-1',
  offer: 'puzzi-cleaning',
  office: 'volzhskaya',
  landingUrl: 'https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=avito&utm_medium=listing&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-account-1',
  status: 'draft',
}]

describe('acquisition manifest', () => {
  it('accepts a unique placement with matching UTM', () => {
    expect(validateCampaigns(valid)).toEqual([])
  })

  it('rejects duplicate channel/profile/offer/office placements', () => {
    expect(validateCampaigns([...valid, { ...valid[0], id: 'duplicate' }])).toContain(
      'Duplicate placement: avito/account-1/puzzi-cleaning/volzhskaya',
    )
  })

  it('rejects a campaign mismatch', () => {
    const invalid = [{ ...valid[0], landingUrl: valid[0].landingUrl.replace('puzzi-cleaning', 'travel-camera') }]
    expect(validateCampaigns(invalid)).toContain('Campaign mismatch: avito-account-1-puzzi-volzhskaya')
  })

  it('rejects an unsupported status at runtime', () => {
    const invalid = [{ ...valid[0], status: 'scheduled' }] as unknown as AcquisitionCampaign[]
    expect(validateCampaigns(invalid)).toContain('Unsupported status: avito-account-1-puzzi-volzhskaya')
  })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm --prefix server test -- --runInBand src/scripts/validate-acquisition-campaigns.test.ts`

Expected: FAIL because the validator does not exist.

- [ ] **Step 3: Implement the validator**

```ts
// server/src/scripts/validate-acquisition-campaigns.ts
import fs from 'fs'
import path from 'path'

export const channels = ['avito', 'polka', '2gis', 'vk', 'yandex_maps'] as const
export const offers = ['puzzi-cleaning', 'karaoke-kit', 'travel-camera'] as const
export const offices = ['volzhskaya', 'dinamo'] as const
export const statuses = ['draft', 'ready', 'published', 'moderation', 'blocked'] as const

export interface AcquisitionCampaign {
  id: string
  channel: typeof channels[number]
  profile: string
  offer: typeof offers[number]
  office: typeof offices[number]
  landingUrl: string
  status: typeof statuses[number]
}

export const validateCampaigns = (items: AcquisitionCampaign[]) => {
  const errors: string[] = []
  const seen = new Set<string>()

  for (const item of items) {
    const id = typeof item.id === 'string' && item.id.trim() ? item.id : '(missing)'
    const profile = typeof item.profile === 'string' ? item.profile.trim() : ''
    if (id === '(missing)') errors.push('Missing placement id')
    if (!profile) errors.push(`Missing profile: ${id}`)
    if (!channels.includes(item.channel as typeof channels[number])) errors.push(`Unsupported channel: ${id}`)
    if (!offers.includes(item.offer as typeof offers[number])) errors.push(`Unsupported offer: ${id}`)
    if (!offices.includes(item.office as typeof offices[number])) errors.push(`Unsupported office: ${id}`)
    if (!statuses.includes(item.status as typeof statuses[number])) errors.push(`Unsupported status: ${id}`)

    const key = `${item.channel}/${profile}/${item.offer}/${item.office}`
    if (seen.has(key)) errors.push(`Duplicate placement: ${key}`)
    seen.add(key)

    let url: URL
    try {
      url = new URL(typeof item.landingUrl === 'string' ? item.landingUrl : '')
    } catch {
      errors.push(`Invalid URL: ${id}`)
      continue
    }

    if (url.origin !== 'https://vozmimenya.ru') errors.push(`External landing origin: ${id}`)
    if (url.searchParams.get('utm_source') !== item.channel) errors.push(`Source mismatch: ${id}`)
    if (url.searchParams.get('utm_campaign') !== item.offer) errors.push(`Campaign mismatch: ${id}`)
    if (!url.searchParams.get('utm_medium')) errors.push(`Missing medium: ${id}`)
    if (!url.searchParams.get('utm_content')) errors.push(`Missing content: ${id}`)
  }

  return [...new Set(errors)]
}

if (require.main === module) {
  const manifestPath = path.resolve(__dirname, '../../../docs/growth/free-acquisition-campaigns.json')
  const campaigns = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as AcquisitionCampaign[]
  const errors = validateCampaigns(campaigns)
  if (campaigns.length !== 15) errors.push(`Expected 15 acquisition placements, received ${campaigns.length}`)
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log(`Validated ${campaigns.length} acquisition placements`)
}
```

- [ ] **Step 4: Create the initial manifest**

Create `docs/growth/free-acquisition-campaigns.json` with exactly these 15 unique placements:

```json
[
  {"id":"avito-account-1-puzzi-volzhskaya","channel":"avito","profile":"account-1","offer":"puzzi-cleaning","office":"volzhskaya","landingUrl":"https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=avito&utm_medium=listing&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-account-1","status":"draft"},
  {"id":"avito-account-1-camera-dinamo","channel":"avito","profile":"account-1","offer":"travel-camera","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=avito&utm_medium=listing&utm_campaign=travel-camera&utm_content=dinamo-account-1","status":"draft"},
  {"id":"avito-account-2-karaoke-dinamo","channel":"avito","profile":"account-2","offer":"karaoke-kit","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=avito&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=dinamo-account-2","status":"draft"},
  {"id":"polka-puzzi-volzhskaya","channel":"polka","profile":"maxim","offer":"puzzi-cleaning","office":"volzhskaya","landingUrl":"https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=polka&utm_medium=listing&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-maxim","status":"draft"},
  {"id":"polka-karaoke-volzhskaya","channel":"polka","profile":"maxim","offer":"karaoke-kit","office":"volzhskaya","landingUrl":"https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=polka&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=volzhskaya-maxim","status":"draft"},
  {"id":"polka-camera-volzhskaya","channel":"polka","profile":"maxim","offer":"travel-camera","office":"volzhskaya","landingUrl":"https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=polka&utm_medium=listing&utm_campaign=travel-camera&utm_content=volzhskaya-maxim","status":"draft"},
  {"id":"2gis-puzzi-network","channel":"2gis","profile":"organization","offer":"puzzi-cleaning","office":"volzhskaya","landingUrl":"https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=2gis&utm_medium=profile&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-organization","status":"draft"},
  {"id":"2gis-karaoke-network","channel":"2gis","profile":"organization","offer":"karaoke-kit","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=2gis&utm_medium=profile&utm_campaign=karaoke-kit&utm_content=dinamo-organization","status":"draft"},
  {"id":"2gis-camera-network","channel":"2gis","profile":"organization","offer":"travel-camera","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=2gis&utm_medium=profile&utm_campaign=travel-camera&utm_content=dinamo-organization","status":"draft"},
  {"id":"vk-puzzi-brand","channel":"vk","profile":"brand-community","offer":"puzzi-cleaning","office":"volzhskaya","landingUrl":"https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=vk&utm_medium=post&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-brand-community","status":"draft"},
  {"id":"vk-karaoke-brand","channel":"vk","profile":"brand-community","offer":"karaoke-kit","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=vk&utm_medium=post&utm_campaign=karaoke-kit&utm_content=dinamo-brand-community","status":"draft"},
  {"id":"vk-camera-brand","channel":"vk","profile":"brand-community","offer":"travel-camera","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=vk&utm_medium=post&utm_campaign=travel-camera&utm_content=dinamo-brand-community","status":"draft"},
  {"id":"yandex-puzzi-volzhskaya","channel":"yandex_maps","profile":"206350428739","offer":"puzzi-cleaning","office":"volzhskaya","landingUrl":"https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=yandex_maps&utm_medium=post&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-206350428739","status":"draft"},
  {"id":"yandex-karaoke-dinamo","channel":"yandex_maps","profile":"95879395485","offer":"karaoke-kit","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=yandex_maps&utm_medium=post&utm_campaign=karaoke-kit&utm_content=dinamo-95879395485","status":"draft"},
  {"id":"yandex-camera-dinamo","channel":"yandex_maps","profile":"95879395485","offer":"travel-camera","office":"dinamo","landingUrl":"https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=yandex_maps&utm_medium=post&utm_campaign=travel-camera&utm_content=dinamo-95879395485","status":"draft"}
]
```

The split deliberately avoids identical Avito offers across both accounts. If a listed office lacks the required equipment during preflight, mark that row `blocked`; do not silently substitute another office.

- [ ] **Step 5: Add and run the validation script**

Add to `server/package.json`:

```json
"growth:validate": "tsx src/scripts/validate-acquisition-campaigns.ts"
```

Run:

```bash
npm --prefix server test -- --runInBand src/scripts/validate-acquisition-campaigns.test.ts
npm --prefix server run growth:validate
```

Expected: the test passes and the script prints `Validated 15 acquisition placements`.

- [ ] **Step 6: Commit the manifest and validator**

```bash
git add docs/growth/free-acquisition-campaigns.json server/src/scripts/validate-acquisition-campaigns.ts server/src/scripts/validate-acquisition-campaigns.test.ts server/package.json
git commit -m "feat: add validated free acquisition manifest"
```

### Task 2: Complete production, stock, photo and link preflight

**Files:**
- Create: `docs/growth/free-acquisition-runbook.md`
- Modify: `docs/growth/free-acquisition-campaigns.json`

- [ ] **Step 1: Verify the three production landings**

Run:

```bash
for url in \
  https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva \
  https://vozmimenya.ru/arenda-karaoke-komplekta-moskva \
  https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva; do
  curl -sS -L --max-time 30 -o /dev/null -w '%{http_code} %{url_effective}\n' "$url"
done
```

Expected: three HTTP `200` responses on the same `vozmimenya.ru` paths.

- [ ] **Step 2: Verify the production catalog and office availability**

Request the two deployed office-specific feeds, which expose the production catalog content/prices and conservatively matched office inventory:

```bash
curl -fsSL https://vozmimenya.ru/api/yandex-business/feeds/volzhskaya.yml
curl -fsSL https://vozmimenya.ru/api/yandex-business/feeds/dinamo.yml
```

For each selected offer, inspect its `<offer>` entry and confirm at minimum:

- Puzzi 8/1 or 10/1 exists at the selected office;
- PartyBox plus one JBL microphone set exists at the selected office;
- the selected camera exists at the selected office;
- every selected item has at least one owned JPG/PNG image.

In authorized Chrome, open `https://vozmimenya.ru/admin/equipment`, select each office, and verify the physical quantity for the catalog-linked item. Record exact product IDs, office IDs, daily prices, confirmed quantities and chosen image URLs in `docs/growth/free-acquisition-runbook.md`. If an item is `available="unknown"` in the office feed, lacks a unique catalog link, or has no confirmed physical quantity in the admin inventory, mark the placement `blocked` instead of claiming stock.

- [ ] **Step 3: Verify production attribution before any public link goes live**

Open one production landing with all four UTM values, follow its booking CTA, and confirm the booking URL retains `utm_source`, `utm_medium`, `utm_campaign` and `utm_content`. If it does not, leave every placement `ready` or `blocked`; do not publish until the technical attribution release has separately been approved with `выкатывай` and verified in production.

- [ ] **Step 4: Verify every manifest URL**

Run `npm --prefix server run growth:validate`, then request all 15 `landingUrl` values and require HTTP 200. Record any platform that strips query parameters as a channel limitation; do not replace the manifest URL with an untracked short link.

- [ ] **Step 5: Create the runbook tables**

The runbook must contain:

```markdown
| Placement ID | Product IDs | Daily price | Office stock | Photo URLs | Link verified | Status | Moderation/owner action |
|---|---|---:|---:|---|---|---|---|
```

Add one row for all 15 manifest IDs. Use only `ready`, `published`, `moderation` or `blocked`; do not use vague statuses such as `almost ready`.

- [ ] **Step 6: Commit the verified preflight**

```bash
git add docs/growth/free-acquisition-runbook.md docs/growth/free-acquisition-campaigns.json
git commit -m "docs: verify free acquisition placements"
```

### Task 3: Prepare channel-specific copy and photo order

**Files:**
- Modify: `docs/growth/free-acquisition-runbook.md`
- Reference: `docs/acquisition-offers.md`

- [ ] **Step 1: Prepare three Avito variants**

Use the facts and prices from `docs/acquisition-offers.md`, but give each placement a unique first paragraph and local office statement. Titles:

```text
Аренда Karcher Puzzi для дивана, ковра и автомобиля
GoPro 13, Insta360 X5 или DJI Osmo Pocket 3 в аренду
Караоке-комплект JBL PartyBox и 2 микрофона в аренду
```

Do not create the same title + text + office combination in both accounts.

- [ ] **Step 2: Prepare Polka descriptions**

Use one concrete product or complete kit per listing. The first photo must show the complete rented set; later photos show controls, accessories, case/postamat and condition. Do not use a generic collage as the only photo.

- [ ] **Step 3: Prepare 2ГИС product copy**

Keep each title below 80 characters and each description factual: task, included equipment, one-day price, selected office and link. Do not claim that product photos are visible when the free profile hides them.

- [ ] **Step 4: Prepare three VK posts**

Each post contains: customer task, suitable model/kit, confirmed one-day price, office choice, postamat 24/7 statement and its manifest URL. No hashtags unrelated to Moscow equipment rental and no direct messages to users.

- [ ] **Step 5: Prepare three local Yandex posts**

Prepare one Puzzi post for Volzhskaya and separate karaoke and camera posts for Dynamo, matching the three manifest rows. Publish only after the new product catalog appears publicly. Use the exact local manifest link for each offer and do not mention the disputed Dynamo address.

- [ ] **Step 6: Commit the content pack**

```bash
git add docs/growth/free-acquisition-runbook.md
git commit -m "docs: prepare free channel content pack"
```

### Task 4: Publish or update Avito placements

**Files:**
- Modify: `docs/growth/free-acquisition-campaigns.json`
- Modify: `docs/growth/free-acquisition-runbook.md`

- [ ] **Step 1: Inspect both authorized accounts read-only**

List active/draft/archived ads that match Puzzi, GoPro/Insta360/Osmo and JBL karaoke. Record ad IDs and account ownership. Prefer updating a relevant active ad over creating a duplicate.

- [ ] **Step 2: Prepare the three exact mutations**

Map the manifest rows to either `update ad <id>` or `create new ad`. Fill title, description, real photos, office, current price and manifest URL, but stop before the final save/publish action.

- [ ] **Step 3: Obtain action-time confirmation**

Show the user the three prepared ad summaries and explain that saving will publicly modify listings under both Avito accounts. Do not treat approval of this plan as action-time confirmation.

- [ ] **Step 4: Save the approved Avito changes**

After confirmation, submit each prepared change. Do not enable paid promotion, auto-raise, subscriptions or paid packages. Capture the resulting ad ID, public URL, moderation state and timestamp.

- [ ] **Step 5: Update and validate the manifest**

Set each successful Avito row to `published` or `moderation`, blocked rows to `blocked`, update the runbook, and run `npm --prefix server run growth:validate`.

- [ ] **Step 6: Commit Avito status**

```bash
git add docs/growth/free-acquisition-campaigns.json docs/growth/free-acquisition-runbook.md
git commit -m "docs: record Avito acquisition placements"
```

### Task 5: Publish or update Polka and 2ГИС placements

**Files:**
- Modify: `docs/growth/free-acquisition-campaigns.json`
- Modify: `docs/growth/free-acquisition-runbook.md`

- [ ] **Step 1: Inspect existing Polka listings**

Reuse the verified Vacmaster, Okami and JBL microphone work only as supporting inventory. Find the existing Puzzi/camera/PartyBox listings and determine whether the site supports a direct landing URL. Prepare renaming the public profile from the personal-style name to `ВозьмиМеня — аренда техники` (or `ВозьмиМеня` if the platform length limit requires it), and prepare the listing/photo edits without deleting listings or merging profiles.

- [ ] **Step 2: Obtain action-time confirmation and save Polka changes**

Explain the exact profile-name change, which public listings will be modified or created, and that the changes are visible to marketplace users. After confirmation, save only the free placement fields. Record any platform validation failure verbatim in the runbook and leave the row `blocked`.

- [ ] **Step 3: Inspect the 2ГИС organization catalog**

Verify organization `70000001110499403`, both branches, the existing 13-item file upload and delivery flags. Prepare supported photo/link/description changes without removing the current catalog.

- [ ] **Step 4: Obtain action-time confirmation and save 2ГИС changes**

After confirmation, submit only supported free changes. Record whether links are clickable, whether photos are accepted and the moderation state for each branch.

- [ ] **Step 5: Update manifest, validate and commit**

```bash
npm --prefix server run growth:validate
git add docs/growth/free-acquisition-campaigns.json docs/growth/free-acquisition-runbook.md
git commit -m "docs: record Polka and 2GIS placements"
```

### Task 6: Publish the VK and Yandex content when eligible

**Files:**
- Modify: `docs/growth/free-acquisition-campaigns.json`
- Modify: `docs/growth/free-acquisition-runbook.md`

- [ ] **Step 1: Verify VK identity and permission**

Confirm the authorized profile controls the intended VozmiMenja community. If ownership, community identity or posting authority is unclear, stop and mark all VK rows `blocked`; do not post from a personal profile as a workaround.

- [ ] **Step 2: Prepare three VK posts and obtain action-time confirmation**

Show all three final texts, photos and manifest links. Explain that the next action will publish public posts. After confirmation, publish and record post URLs/timestamps. Do not send unsolicited messages.

- [ ] **Step 3: Verify public Yandex product eligibility**

Open both public Maps cards. Continue only when the updated 13-item product catalog is visible publicly for the relevant office. If the card still says `Обновлено 9 сентября`, leave the rows `blocked` with reason `awaiting product moderation`.

- [ ] **Step 4: Prepare Yandex posts and obtain action-time confirmation**

Show the final local post text, image and UTM link for each organization. Explain that submission will create public business posts and may enter moderation. After confirmation, submit without paid promotion and record the exact status.

- [ ] **Step 5: Update manifest, validate and commit**

```bash
npm --prefix server run growth:validate
git add docs/growth/free-acquisition-campaigns.json docs/growth/free-acquisition-runbook.md
git commit -m "docs: record VK and Yandex organic posts"
```

### Task 7: Start the 14-day observation window and report

**Files:**
- Modify: `docs/growth/free-acquisition-runbook.md`
- Modify: `.agents/board.md`
- Modify: `docs/changelog.md`

- [ ] **Step 1: Define the observation start**

Use the timestamp when the first placement becomes public after the technical attribution release. Record start and end as Europe/Moscow calendar dates; the end is 14 complete days after the start.

- [ ] **Step 2: Record platform-side metrics without changing campaigns**

At the end of the window, record views/messages where available, plus site leads, booked results, conversion and revenue from the admin lead report. Do not infer missing view counts as zero; write `not provided`.

- [ ] **Step 3: Apply the decision rules**

For each channel × offer:

- leads and bookings: keep and consider another organic post/listing variant;
- leads but no bookings: inspect availability, response time and offer/expectation mismatch;
- no leads but platform views: revise title/photo/link once;
- no views: verify moderation/category/profile visibility before deciding anything;
- blocked: preserve the reason and required owner/platform action.

- [ ] **Step 4: Update project status**

Mark completed publication and reporting tasks in `.agents/board.md`. Add exact counts and limitations to `docs/changelog.md`; do not call the iteration successful without confirmed rentals.

- [ ] **Step 5: Commit the 14-day report**

```bash
git add docs/growth/free-acquisition-runbook.md .agents/board.md docs/changelog.md
git commit -m "docs: report free acquisition experiment"
```

### Task 8: Final verification and release boundaries

- [ ] **Step 1: Run validation and repository checks**

Run:

```bash
npm --prefix server run growth:validate
npm --prefix server test -- --runInBand src/scripts/validate-acquisition-campaigns.test.ts
git diff --check
git status --short
```

Expected: validator and test pass, diff check is empty, and only intentional files are changed.

- [ ] **Step 2: Verify prohibited actions did not occur**

Confirm the runbook contains no paid promotion, deleted organizations/reviews/listings, duplicate merges, fabricated photos/stock, unapproved Dynamo address change or unapproved production deploy.

- [ ] **Step 3: Request review**

Run `superpowers:requesting-code-review` for the manifest/validator and Product Lead review for public channel status. Any later production deploy still requires the separate command `выкатывай`.
