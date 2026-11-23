# Full Equipment Yandex SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every live VozmiMenja equipment model a distinct search intent, useful model-specific content, local links, and automated SSR/indexability coverage for Google and Yandex.

**Architecture:** Keep prices, availability, photos, descriptions, and specifications in the production catalog. Add a small typed, slug-keyed SEO profile layer for search intent and model-specific guidance, consume it from the existing shared equipment page, and extend the SEO smoke test to compare the live catalog, sitemap, and raw SSR output. Do not create new scenario URLs until demand data confirms that they will not cannibalize existing pages.

**Tech Stack:** React 18, TypeScript, React Router, React Helmet Async, Vite SSR, Node test runner, Jest for server utilities, Express API, XML sitemap, Schema.org Product/Offer/FAQPage.

---

## File map

- Create `client/src/content/equipmentSeoProfiles.ts`: typed profiles for the 13 current slugs; no prices or availability.
- Create `client/src/content/equipmentSeoProfiles.test.ts`: completeness, uniqueness, link, and copy checks.
- Modify `client/src/pages/EquipmentDetailsPage.tsx`: consume profiles, render unique intro/scenarios/FAQ/search terms and local office links.
- Modify `client/src/content/productScenarios.json`: correct Vacmaster and cover all camera/audio/cleaning products with existing canonical landings.
- Modify `client/package.json`: run the new profile test.
- Create `server/src/scripts/smoke-seo-equipment.ts`: pure parsers/validators for catalog, sitemap, and raw SSR product pages.
- Create `server/src/scripts/smoke-seo-equipment.test.ts`: contract tests for the validators.
- Modify `server/src/scripts/smoke-seo.ts`: run the product checks for every item returned by the catalog API.
- Create `seo-agent/reports/2026-11-23-equipment-search-groups.md`: exact query groups and post-release measurement baseline.

### Task 1: Add the typed SEO profile registry

**Files:**
- Create: `client/src/content/equipmentSeoProfiles.ts`
- Create: `client/src/content/equipmentSeoProfiles.test.ts`
- Modify: `client/package.json`

- [ ] **Step 1: Write the failing completeness test**

The test must assert the exact 13 slugs, non-empty unique primary queries and intros, at least three scenarios and two FAQs per model, and no price-looking literals in curated copy:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { equipmentSeoProfiles, getEquipmentSeoProfile } from './equipmentSeoProfiles'

const expectedSlugs = [
  'dji-mic-2',
  'dji-osmo-pocket-3-creator-combo',
  'gopro-13',
  'insta360-x5',
  'jbl-partybox-320',
  'jbl-partybox-710',
  'karcher-puzzi-10-1',
  'karcher-puzzi-8-1',
  'karcher-sc4',
  'karcher-wd5',
  'mikrofony-jbl',
  'okami-q75',
  'sushilka-vacmaster',
]

test('covers every production equipment slug with unique useful copy', () => {
  assert.deepEqual(Object.keys(equipmentSeoProfiles).sort(), expectedSlugs)
  assert.equal(new Set(Object.values(equipmentSeoProfiles).map((item) => item.primaryQuery)).size, expectedSlugs.length)
  assert.equal(new Set(Object.values(equipmentSeoProfiles).map((item) => item.intro)).size, expectedSlugs.length)

  for (const slug of expectedSlugs) {
    const profile = getEquipmentSeoProfile(slug)
    assert.ok(profile)
    assert.ok(profile.primaryQuery.includes('аренда'))
    assert.ok(profile.primaryQuery.includes('Москва'))
    assert.ok(profile.intro.length >= 90)
    assert.ok(profile.scenarios.length >= 3)
    assert.ok(profile.faq.length >= 2)
    assert.doesNotMatch(JSON.stringify(profile), /\b\d[\d ]*\s*₽/)
  }
})

test('returns undefined for an unknown or missing slug', () => {
  assert.equal(getEquipmentSeoProfile(undefined), undefined)
  assert.equal(getEquipmentSeoProfile('unknown-model'), undefined)
})
```

Add `tsx src/content/equipmentSeoProfiles.test.ts` to the client `test` script immediately before `seoMeta.test.ts`.

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test --workspace=client`

Expected: FAIL because `equipmentSeoProfiles.ts` does not exist.

- [ ] **Step 3: Implement the profile registry**

Use these exact public types and lookup contract:

```ts
export interface EquipmentSeoFaq {
  question: string
  answer: string
}

export interface EquipmentSeoProfile {
  primaryQuery: string
  aliases: readonly string[]
  intro: string
  scenarios: readonly string[]
  faq: readonly EquipmentSeoFaq[]
}

export const equipmentSeoProfiles = {
  'karcher-puzzi-8-1': {
    primaryQuery: 'аренда Karcher Puzzi 8/1 Москва',
    aliases: ['прокат Karcher Puzzi 8/1', 'Керхер Пуззи 8/1 в аренду'],
    intro: 'Karcher Puzzi 8/1 берут в аренду для самостоятельной химчистки дивана, кресел, небольшого ковра, матраса или салона автомобиля.',
    scenarios: ['Химчистка дивана и кресел', 'Чистка ковра или матраса', 'Химчистка салона автомобиля'],
    faq: [
      { question: 'Для какого объёма подойдёт Puzzi 8/1?', answer: 'Модель удобна для одной-двух мягких зон. Для нескольких комнат или постоянной работы сравните её с Puzzi 10/1.' },
      { question: 'Собирает ли Puzzi 8/1 строительную пыль?', answer: 'Нет. Сухую строительную пыль сначала убирают WD5, а Puzzi используют для экстракционной чистки текстиля.' },
    ],
  },
  'karcher-puzzi-10-1': {
    primaryQuery: 'аренда Karcher Puzzi 10/1 Москва',
    aliases: ['прокат Karcher Puzzi 10/1', 'Керхер Пуззи 10/1 в аренду'],
    intro: 'Karcher Puzzi 10/1 подходит для аренды под большую химчистку: несколько ковров, крупный диван, офис, гостиничный номер или салон автомобиля.',
    scenarios: ['Химчистка нескольких комнат', 'Большой диван и ковровые покрытия', 'Клининг офиса или автомобиля'],
    faq: [
      { question: 'Чем Puzzi 10/1 отличается от Puzzi 8/1?', answer: 'Puzzi 10/1 удобнее при большом объёме и длительной работе, а Puzzi 8/1 проще взять для одного дивана или небольшого ковра.' },
      { question: 'Можно ли взять Puzzi 10/1 на один день?', answer: 'Да. Срок лучше выбирать с учётом числа зон, подготовки помещения и времени на сушку.' },
    ],
  },
  'karcher-sc4': {
    primaryQuery: 'аренда Karcher SC4 Москва',
    aliases: ['пароочиститель Karcher SC4 напрокат', 'Керхер SC4 в аренду'],
    intro: 'Karcher SC4 арендуют для очистки кухни, ванной, плитки, швов, сантехники и других твёрдых поверхностей горячим паром.',
    scenarios: ['Жир на кухне и плите', 'Плитка, швы и сантехника', 'Уборка твёрдых поверхностей'],
    faq: [
      { question: 'Заменяет ли SC4 моющий пылесос?', answer: 'Нет. SC4 работает паром по твёрдым поверхностям, а Puzzi предназначен для диванов, ковров и другого текстиля.' },
      { question: 'Можно ли использовать SC4 на любой поверхности?', answer: 'Нет. Перед обработкой деликатного материала нужно проверить рекомендации производителя и сделать пробу на незаметном участке.' },
    ],
  },
  'karcher-wd5': {
    primaryQuery: 'аренда Karcher WD5 Москва',
    aliases: ['строительный пылесос Karcher WD5 напрокат', 'Керхер WD5 в аренду'],
    intro: 'Karcher WD5 берут для сухой и влажной уборки после ремонта, сбора строительной пыли, воды, стружки и крупного бытового мусора.',
    scenarios: ['Уборка после ремонта', 'Сбор пыли после сверления', 'Гараж, мастерская или дача'],
    faq: [
      { question: 'Можно ли WD5 чистить диван?', answer: 'Нет. WD5 собирает пыль, воду и мусор, но для химчистки ткани нужен моющий пылесос Puzzi.' },
      { question: 'Какой срок выбрать после ремонта?', answer: 'Для локальной уборки часто хватает суток, а квартиру после ремонта удобнее убирать в несколько этапов за один-два дня.' },
    ],
  },
  'okami-q75': {
    primaryQuery: 'аренда робота-мойщика окон Okami Q75 Москва',
    aliases: ['Okami Q75 напрокат', 'робот для мойки окон в аренду'],
    intro: 'Okami Q75 арендуют для автоматической мойки окон, зеркал, стеклянных перегородок и гладкой плитки без ручной работы на всей площади.',
    scenarios: ['Окна и панорамное остекление', 'Зеркала и стеклянные перегородки', 'Гладкая плитка и душевые кабины'],
    faq: [
      { question: 'Подходит ли Okami Q75 для безрамных окон?', answer: 'Совместимость зависит от формы и границ поверхности. Перед арендой пришлите фото окна, чтобы подтвердить подходящий сценарий.' },
      { question: 'Нужна ли страховка робота?', answer: 'Да. При работе на высоте используют штатный страховочный трос и соблюдают инструкцию из комплекта.' },
    ],
  },
  'sushilka-vacmaster': {
    primaryQuery: 'аренда сушилки Vacmaster Москва',
    aliases: ['сушилка для дивана напрокат', 'сушилка ковров после химчистки в аренду'],
    intro: 'Сушилку Vacmaster берут вместе с моющим пылесосом, чтобы ускорить высыхание дивана, ковра, матраса или пола после влажной чистки.',
    scenarios: ['Сушка дивана после химчистки', 'Сушка ковра или матраса', 'Удаление остаточной влаги с пола'],
    faq: [
      { question: 'Заменяет ли сушилка моющий пылесос?', answer: 'Нет. Она не чистит поверхность, а ускоряет высыхание после работы Puzzi или другой влажной обработки.' },
      { question: 'Когда включать Vacmaster?', answer: 'После завершения чистки и удаления основной влаги. Воздушный поток направляют на влажную зону с безопасного расстояния.' },
    ],
  },
  'gopro-13': {
    primaryQuery: 'аренда GoPro 13 Москва',
    aliases: ['GoPro Hero 13 напрокат', 'экшн-камера GoPro 13 в аренду'],
    intro: 'GoPro 13 арендуют для активной съёмки в поездке, на спорте, прогулке или воде, когда важны компактность, крепления и стабилизация.',
    scenarios: ['Спорт и движение', 'Путешествие и прогулки', 'Съёмка на воде и с креплений'],
    faq: [
      { question: 'Подойдёт ли GoPro 13 новичку?', answer: 'Да. Это понятный вариант для активной съёмки; перед выдачей можно уточнить настройки и нужные крепления.' },
      { question: 'Когда лучше выбрать Osmo Pocket 3?', answer: 'Для спокойного влога, речи и плавной съёмки с рук Osmo Pocket обычно удобнее, а GoPro практичнее для спорта и воды.' },
    ],
  },
  'insta360-x5': {
    primaryQuery: 'аренда Insta360 X5 Москва',
    aliases: ['Insta360 X5 напрокат', '360 камера в аренду Москва'],
    intro: 'Insta360 X5 арендуют для панорамного 360-видео, виртуальных туров, поездок и динамичных кадров, где ракурс выбирают после съёмки.',
    scenarios: ['360-видео и виртуальные туры', 'Поездки и экстремальный спорт', 'Необычные ракурсы для соцсетей'],
    faq: [
      { question: 'Чем Insta360 X5 отличается от GoPro?', answer: 'Insta360 снимает всё окружение и позволяет выбрать ракурс на монтаже, а GoPro проще для обычного кадра от первого лица.' },
      { question: 'Нужен ли монтаж после съёмки?', answer: 'Для выбора ракурса и экспорта 360-материала потребуется приложение или программа Insta360.' },
    ],
  },
  'dji-osmo-pocket-3-creator-combo': {
    primaryQuery: 'аренда DJI Osmo Pocket 3 Москва',
    aliases: ['DJI Osmo Pocket 3 Creator Combo напрокат', 'камера для влога в аренду'],
    intro: 'DJI Osmo Pocket 3 Creator Combo арендуют для влога, интервью, прогулки, путешествия или мероприятия, когда нужна плавная съёмка с рук.',
    scenarios: ['Влог и разговорное видео', 'Путешествия и прогулки', 'Интервью и мероприятия'],
    faq: [
      { question: 'Подойдёт ли Osmo Pocket 3 для влога?', answer: 'Да. Компактная камера со стабилизатором удобна для речи, прогулок и съёмки себя без большой камеры.' },
      { question: 'Что входит в Creator Combo?', answer: 'Фактическую комплектацию конкретного экземпляра подтверждаем перед выдачей по карточке и заявке.' },
    ],
  },
  'jbl-partybox-320': {
    primaryQuery: 'аренда JBL PartyBox 320 Москва',
    aliases: ['JBL PartyBox 320 напрокат', 'колонка JBL 320 в аренду'],
    intro: 'JBL PartyBox 320 арендуют для домашней вечеринки, дня рождения, дачи или небольшой площадки, где важны мобильность и работа от аккумулятора.',
    scenarios: ['Домашняя вечеринка', 'День рождения или дача', 'Караоке с микрофонами'],
    faq: [
      { question: 'Для какого мероприятия хватит PartyBox 320?', answer: 'Она подходит для квартиры, дачи и небольшой площадки. Для большого зала сравните её с PartyBox 710.' },
      { question: 'Можно ли добавить микрофоны?', answer: 'Да. Для караоке можно добавить совместимый комплект микрофонов, наличие которого подтвердим перед выдачей.' },
    ],
  },
  'jbl-partybox-710': {
    primaryQuery: 'аренда JBL PartyBox 710 Москва',
    aliases: ['JBL PartyBox 710 напрокат', 'колонка JBL 710 в аренду'],
    intro: 'JBL PartyBox 710 арендуют для свадьбы, корпоратива, большого дня рождения или танцевальной площадки с доступом к сети 220 В.',
    scenarios: ['Свадьба или корпоратив', 'Большой зал и танцы', 'Караоке и выступление'],
    faq: [
      { question: 'Работает ли PartyBox 710 без розетки?', answer: 'Модель рассчитана на питание от сети, поэтому на площадке нужна доступная и безопасная розетка.' },
      { question: 'Когда достаточно PartyBox 320?', answer: 'Для квартиры, небольшой встречи или мобильного использования PartyBox 320 обычно удобнее и легче.' },
    ],
  },
  'dji-mic-2': {
    primaryQuery: 'аренда DJI Mic 2 Москва',
    aliases: ['DJI Mic 2 напрокат', 'беспроводной микрофон для интервью в аренду'],
    intro: 'DJI Mic 2 арендуют для интервью, подкаста, Reels, YouTube и съёмки на телефон или камеру, когда нужен чистый беспроводной звук.',
    scenarios: ['Интервью с одним или двумя героями', 'Влог, Reels и Shorts', 'Подкаст и обучающее видео'],
    faq: [
      { question: 'Можно ли подключить DJI Mic 2 к телефону?', answer: 'Возможность подключения зависит от разъёма и комплекта адаптеров. Укажите модель телефона перед выдачей.' },
      { question: 'Подходит ли комплект для двух человек?', answer: 'Да, если в выдаваемом комплекте два передатчика; состав конкретного набора подтверждаем до бронирования.' },
    ],
  },
  'mikrofony-jbl': {
    primaryQuery: 'аренда микрофонов JBL Москва',
    aliases: ['беспроводные микрофоны JBL напрокат', 'микрофоны для караоке в аренду'],
    intro: 'Беспроводные микрофоны JBL арендуют для караоке, поздравлений и ведущего вместе с колонкой, у которой есть совместимый микрофонный вход.',
    scenarios: ['Караоке дома или на даче', 'Поздравления и конкурсы', 'Речь ведущего на небольшом празднике'],
    faq: [
      { question: 'Работают ли микрофоны без колонки?', answer: 'Нет. Нужна совместимая колонка или акустическая система с подходящим микрофонным входом.' },
      { question: 'Можно ли взять их вместе с PartyBox?', answer: 'Да. Подберём совместимый комплект и подтвердим наличие колонки и микрофонов на выбранные даты.' },
    ],
  },
} as const satisfies Record<string, EquipmentSeoProfile>

export function getEquipmentSeoProfile(slug?: string): EquipmentSeoProfile | undefined {
  if (!slug) return undefined
  return equipmentSeoProfiles[slug as keyof typeof equipmentSeoProfiles]
}
```

- [ ] **Step 4: Run the client tests**

Run: `npm run test --workspace=client`

Expected: PASS including `equipmentSeoProfiles.test.ts`.

- [ ] **Step 5: Commit the registry**

```bash
git add client/src/content/equipmentSeoProfiles.ts client/src/content/equipmentSeoProfiles.test.ts client/package.json
git commit -m "feat: add SEO profiles for every equipment model"
```

### Task 2: Apply model-specific intent and correct scenario links

**Files:**
- Modify: `client/src/pages/EquipmentDetailsPage.tsx`
- Modify: `client/src/content/productScenarios.json`
- Test: `client/src/content/equipmentSeoProfiles.test.ts`

- [ ] **Step 1: Extend the failing test with link coverage**

Import `productScenarios.json` and assert that every expected slug has at least one canonical internal link, every href starts with `/`, and Vacmaster links to the Puzzi/chemical-cleaning page rather than the construction-vacuum page.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx tsx client/src/content/equipmentSeoProfiles.test.ts`

Expected: FAIL because camera slugs and Okami have no scenario links and Vacmaster points at the wrong intent.

- [ ] **Step 3: Update `productScenarios.json`**

Keep the existing links and add/correct these mappings:

```json
{
  "okami-q75": [{ "href": "/arenda-pylesosov-moskva", "label": "Техника для уборки дома" }],
  "sushilka-vacmaster": [{ "href": "/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva", "label": "Сушка после химчистки дивана и ковра" }],
  "gopro-13": [{ "href": "/arenda-gopro-moskva", "label": "Экшн-камера для спорта и путешествий" }],
  "insta360-x5": [{ "href": "/arenda-gopro-moskva", "label": "360-камера для поездки и необычных ракурсов" }],
  "dji-osmo-pocket-3-creator-combo": [{ "href": "/arenda-gopro-moskva", "label": "Камера для влога и путешествия" }]
}
```

The final JSON must still contain the existing Puzzi, WD5, SC4, PartyBox, DJI Mic 2, and JBL microphone mappings.

- [ ] **Step 4: Consume the profile in `EquipmentDetailsPage.tsx`**

Import `getEquipmentSeoProfile`, then compute:

```ts
const seoProfile = getEquipmentSeoProfile(equipment.slug)
const displayedScenarios = seoProfile?.scenarios || guidance.scenarios
const equipmentFaqItems = [
  ...(seoProfile?.faq || guidance.faq),
  ...getEquipmentProcessFaq(equipment.name),
]
const seoKeywords = [
  seoProfile?.primaryQuery,
  ...(seoProfile?.aliases || []),
  `аренда ${equipment.name}`,
  `прокат ${equipment.name}`,
  `${equipment.category} аренда Москва`,
].filter(Boolean).join(', ')
```

Render `seoProfile.intro` directly below the H1 and render `displayedScenarios` in “Для каких задач подходит”. Do not replace the catalog description, live prices, or schema availability.

- [ ] **Step 5: Add local office links**

Add a compact “Где получить” block after the task/rental cards with two ordinary `Link` elements:

```tsx
<Link to="/arenda-tehniki-u-metro-volzhskaya-kuzminki">Самовывоз у м. Волжская</Link>
<Link to="/arenda-tehniki-u-metro-dinamo">Самовывоз у м. Динамо</Link>
```

The copy must state that availability for the selected model and dates is confirmed during booking; it must not claim that every item is always stocked at both offices.

- [ ] **Step 6: Run checks**

Run: `npm run test --workspace=client && npm run typecheck --workspace=client && npm run lint --workspace=client`

Expected: all commands PASS.

- [ ] **Step 7: Commit the page integration**

```bash
git add client/src/pages/EquipmentDetailsPage.tsx client/src/content/productScenarios.json client/src/content/equipmentSeoProfiles.test.ts
git commit -m "feat: connect model intent and local links to product pages"
```

### Task 3: Validate the entire live catalog in SEO smoke tests

**Files:**
- Create: `server/src/scripts/smoke-seo-equipment.ts`
- Create: `server/src/scripts/smoke-seo-equipment.test.ts`
- Modify: `server/src/scripts/smoke-seo.ts`

- [ ] **Step 1: Write failing pure validator tests**

Cover these contracts: extract all `/equipment/{slug}` URLs from sitemap XML; reject duplicate slugs; require every catalog slug in sitemap; require raw SSR HTML to contain one H1, the model, canonical, description, index/follow, Product, Offer, and a non-empty image URL; reject a visible price that differs from structured data.

- [ ] **Step 2: Run the focused server test and verify it fails**

Run: `npm test --workspace=server -- --runInBand src/scripts/smoke-seo-equipment.test.ts`

Expected: FAIL because `smoke-seo-equipment.ts` does not exist.

- [ ] **Step 3: Implement pure validators**

Expose these functions:

```ts
export interface CatalogEquipmentSeoItem {
  slug: string
  name: string
  images: string[]
  pricePerDay: number
}

export function extractEquipmentPathsFromSitemap(xml: string): string[]
export function validateCatalogSitemap(items: CatalogEquipmentSeoItem[], paths: string[]): void
export function validateEquipmentSsrHtml(
  html: string,
  item: CatalogEquipmentSeoItem,
  canonicalOrigin: string,
): void
```

Errors must include the slug and the missing/duplicated contract so production smoke output identifies the exact broken model.

- [ ] **Step 4: Connect validators to `smoke-seo.ts`**

Fetch `${baseUrl}/api/equipment?limit=200`, read `.data`, fetch `${baseUrl}/sitemap.xml`, compare the complete sets, then fetch every product URL as raw HTML and validate it. Do this before Chrome-rendered page checks so missing catalog pages fail quickly.

- [ ] **Step 5: Run focused and full server tests**

Run: `npm test --workspace=server -- --runInBand src/scripts/smoke-seo-equipment.test.ts`

Run: `npm run test --workspace=server`

Expected: PASS.

- [ ] **Step 6: Commit catalog smoke coverage**

```bash
git add server/src/scripts/smoke-seo-equipment.ts server/src/scripts/smoke-seo-equipment.test.ts server/src/scripts/smoke-seo.ts
git commit -m "test: cover every product page in SEO smoke"
```

### Task 4: Verify SSR output and catalog consistency locally

**Files:**
- Modify only if a test exposes a defect in the files from Tasks 1–3.

- [ ] **Step 1: Run all client and SSR tests**

Run: `npm run test --workspace=client && npm run test:ssr --workspace=client`

Expected: PASS.

- [ ] **Step 2: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 3: Build browser, SSR, sitemap, and server**

Run: `npm run build`

Expected: sitemap generation and all builds PASS; the generated sitemap contains all catalog slugs available in the local database.

- [ ] **Step 4: Run SSR runtime tests**

Run: `npm run test:ssr-runtime`

Expected: PASS, including product page schema, image, canonical, and API-unavailable behavior.

- [ ] **Step 5: Audit catalog prices**

Run: `npm run audit:content-prices:prod --workspace=server`

Expected: the report says public prices are consistent with the catalog. If production network access is intentionally unavailable, record the blocker and do not substitute hard-coded prices.

- [ ] **Step 6: Inspect the diff and commit any test-only corrections**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only intentional files changed.

### Task 5: Prepare query groups and post-release submission

**Files:**
- Create: `seo-agent/reports/2026-11-23-equipment-search-groups.md`

- [ ] **Step 1: Record the exact model groups**

Create one section per slug with the `primaryQuery`, aliases, canonical product URL, scenario landing, and baseline fields for Yandex/Google: impressions, clicks, CTR, average position, indexed status, and measurement date. Use `—` where the console has no confirmed data; never invent a position.

- [ ] **Step 2: Record the current console evidence**

State that on 2026-11-23 Yandex reported 20 duplicate title examples last crawled 24.09–02.10.2026, while production SSR now returns unique product metadata. Record that the currently selected Google account has no access to the domain property, so Google baseline export requires the authorized account.

- [ ] **Step 3: Run final verification**

Run: `npm run test && npm run typecheck && npm run lint && git diff --check`

Expected: all checks PASS.

- [ ] **Step 4: Commit the measurement registry**

```bash
git add seo-agent/reports/2026-11-23-equipment-search-groups.md
git commit -m "docs: register equipment search query groups"
```

- [ ] **Step 5: Stop before production release**

Report the commit list, tests, changed URLs, and the Google account blocker. Do not deploy, submit sitemaps, request reindexing, or change production until the owner explicitly says «выкатывай». After release approval and successful smoke tests, run `npm run seo:console:submit`, send the changed commercial URLs to IndexNow, and verify Yandex recrawl status in the UI.
