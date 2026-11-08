import { auditPublicContentPrices, CatalogPriceRow, PublicContentSnapshot } from './publicContentPriceAudit'

const equipment: CatalogPriceRow[] = [
  ['Karcher Puzzi 8/1', 980], ['Karcher Puzzi 10/1', 980], ['Karcher WD5', 980],
  ['Karcher SC4', 780], ['Okami Q75', 980], ['GoPro 13', 1300],
  ['DJI Osmo Pocket 3 Creator Combo', 1300], ['Insta360 X5', 1500], ['DJI Mic 2', 1400],
  ['JBL Partybox 320', 1400], ['JBL Partybox 710', 2300], ['Микрофоны JBL', 500],
  ['Сушилка Vacmaster', 400],
].map(([name, price]) => ({ name: String(name), price_per_day: Number(price), pricing: { day1: Number(price) } }))

const articles = {
  'gopro-dlya-nachinayushchih-polnoe-rukovodstvo': 'GoPro 13 — 1 300 ₽/сутки',
  'professionalny-pylesy-dlya-klininga': 'Karcher WD5 980 ₽/сутки; Karcher Puzzi 8/1 980 ₽/сутки; Karcher Puzzi 10/1 980 ₽/сутки; Karcher SC4 780 ₽/сутки; Okami Q75 980 ₽/сутки',
  'top-3-kamery-dlya-svadeb-2025': 'GoPro 13 1 300 ₽/сутки; DJI Osmo Pocket 3 1 300 ₽/сутки; Insta360 X5 1 500 ₽/сутки',
  'kachestvennyj-zvuk-dlya-video-dji-mic-2': 'DJI Mic 2 1 400 ₽/сутки',
}

const valid: PublicContentSnapshot = {
  business: 'от 400 ₽ в сутки',
  home: 'От 400 ₽/день',
  faq: 'Стоимость аренды пылесосов начинается от 980 ₽/сутки.',
  karaoke: '1 400 ₽/сутки; 2 300 ₽/сутки; Два микрофона: 500 ₽/сутки',
  booking: '500 ₽ за 1–3 суток; 400 ₽ за 1–3 суток',
  delivery: 'Стоимость — по текущему тарифу Яндекс Go',
  articles,
}

describe('auditPublicContentPrices', () => {
  it('accepts content that matches the catalog', () => {
    expect(auditPublicContentPrices(equipment, valid)).toEqual([])
  })

  it('detects a stale FAQ minimum', () => {
    const stale = auditPublicContentPrices(equipment, {
      ...valid,
      faq: 'Стоимость аренды пылесосов начинается от 400 ₽/сутки.',
    })
    expect(stale.some((issue) => issue.location === 'FAQ пылесосов')).toBe(true)
  })

  it('detects when a catalog price changes but a landing page does not', () => {
    const changedCatalog = equipment.map((row) => row.name === 'JBL Partybox 710'
      ? { ...row, price_per_day: 2500, pricing: { day1: 2500 } }
      : row)
    expect(auditPublicContentPrices(changedCatalog, valid).some((issue) => issue.location === 'Караоке-комплект')).toBe(true)
  })
})
