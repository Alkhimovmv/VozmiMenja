export type CatalogPriceRow = {
  name: string
  price_per_day: number
  pricing?: string | Record<string, number> | null
}

export type PublicContentSnapshot = {
  business: string
  home: string
  faq: string
  karaoke: string
  booking: string
  delivery: string
  articles: Record<string, string>
}

export type ContentPriceIssue = {
  location: string
  message: string
}

const formatPrice = (value: number) => new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, ' ')

const getPricing = (row: CatalogPriceRow) => {
  if (!row.pricing) return {}
  if (typeof row.pricing === 'string') {
    try {
      return JSON.parse(row.pricing) as Record<string, number>
    } catch {
      return {}
    }
  }
  return row.pricing
}

const getDayPrice = (row: CatalogPriceRow, tier = 'day1') => {
  const pricing = getPricing(row)
  return Number(pricing[tier]) || Number(pricing.day1) || Number(row.price_per_day) || 0
}

const findEquipment = (rows: CatalogPriceRow[], name: string) =>
  rows.find((row) => row.name.trim().toLowerCase() === name.trim().toLowerCase())

export const auditPublicContentPrices = (
  equipment: CatalogPriceRow[],
  content: PublicContentSnapshot,
): ContentPriceIssue[] => {
  const issues: ContentPriceIssue[] = []

  const requireEquipment = (name: string) => {
    const row = findEquipment(equipment, name)
    if (!row) issues.push({ location: 'Каталог', message: `Не найдено оборудование «${name}» для проверки цен.` })
    return row
  }

  const requireText = (location: string, source: string, expected: string) => {
    if (!source.includes(expected)) {
      issues.push({ location, message: `Ожидается актуальный текст: ${expected}` })
    }
  }

  const globalMinimum = Math.min(...equipment.map((row) => getDayPrice(row)).filter((price) => price > 0))
  if (Number.isFinite(globalMinimum)) {
    requireText('business.json', content.business, `от ${formatPrice(globalMinimum)} ₽ в сутки`)
    requireText('Главная', content.home, `От ${formatPrice(globalMinimum)} ₽/день`)
  }

  const puzzi8 = requireEquipment('Karcher Puzzi 8/1')
  const puzzi10 = requireEquipment('Karcher Puzzi 10/1')
  const wd5 = requireEquipment('Karcher WD5')
  const sc4 = requireEquipment('Karcher SC4')
  const okami = requireEquipment('Okami Q75')
  const gopro = requireEquipment('GoPro 13')
  const osmo = requireEquipment('DJI Osmo Pocket 3 Creator Combo')
  const insta = requireEquipment('Insta360 X5')
  const mic = requireEquipment('DJI Mic 2')
  const partybox320 = requireEquipment('JBL Partybox 320')
  const partybox710 = requireEquipment('JBL Partybox 710')
  const jblMics = requireEquipment('Микрофоны JBL')
  const dryer = requireEquipment('Сушилка Vacmaster')

  const vacuumPrices = [puzzi8, puzzi10, wd5]
    .filter((row): row is CatalogPriceRow => Boolean(row))
    .map((row) => getDayPrice(row))
    .filter((price) => price > 0)
  if (vacuumPrices.length > 0) {
    requireText('FAQ пылесосов', content.faq, `Стоимость аренды пылесосов начинается от ${formatPrice(Math.min(...vacuumPrices))} ₽/сутки.`)
  }

  if (partybox320) requireText('Караоке-комплект', content.karaoke, `${formatPrice(getDayPrice(partybox320))} ₽/сутки`)
  if (partybox710) requireText('Караоке-комплект', content.karaoke, `${formatPrice(getDayPrice(partybox710))} ₽/сутки`)
  if (jblMics) requireText('Караоке-комплект', content.karaoke, `Два микрофона: ${formatPrice(getDayPrice(jblMics))} ₽/сутки`)
  if (jblMics) requireText('Форма брони', content.booking, `${formatPrice(getDayPrice(jblMics))} ₽ за 1–3 суток`)
  if (dryer) requireText('Форма брони', content.booking, `${formatPrice(getDayPrice(dryer))} ₽ за 1–3 суток`)
  requireText('Доставка', content.delivery, 'Стоимость — по текущему тарифу Яндекс Go')

  const articleChecks: Array<[string, CatalogPriceRow | undefined, string]> = [
    ['gopro-dlya-nachinayushchih-polnoe-rukovodstvo', gopro, 'GoPro 13'],
    ['professionalny-pylesy-dlya-klininga', wd5, 'Karcher WD5'],
    ['professionalny-pylesy-dlya-klininga', puzzi8, 'Karcher Puzzi 8/1'],
    ['professionalny-pylesy-dlya-klininga', puzzi10, 'Karcher Puzzi 10/1'],
    ['professionalny-pylesy-dlya-klininga', sc4, 'Karcher SC4'],
    ['professionalny-pylesy-dlya-klininga', okami, 'Okami Q75'],
    ['top-3-kamery-dlya-svadeb-2025', gopro, 'GoPro 13'],
    ['top-3-kamery-dlya-svadeb-2025', osmo, 'DJI Osmo Pocket 3'],
    ['top-3-kamery-dlya-svadeb-2025', insta, 'Insta360 X5'],
    ['kachestvennyj-zvuk-dlya-video-dji-mic-2', mic, 'DJI Mic 2'],
  ]

  for (const [slug, row, label] of articleChecks) {
    if (!row) continue
    const article = content.articles[slug]
    if (!article) {
      issues.push({ location: `Статья ${slug}`, message: 'Статья не найдена или не опубликована.' })
      continue
    }
    requireText(`Статья ${slug}`, article, `${label}`)
    requireText(`Статья ${slug}`, article, `${formatPrice(getDayPrice(row))} ₽/сутки`)
  }

  return issues
}
