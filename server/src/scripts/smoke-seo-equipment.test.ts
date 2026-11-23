import {
  extractEquipmentPathsFromSitemap,
  resolveEquipmentApiBaseUrl,
  validateCatalogSitemap,
  validateEquipmentSsrHtml,
  type CatalogEquipmentSeoItem,
} from './smoke-seo-equipment'

const item: CatalogEquipmentSeoItem = {
  slug: 'karcher-puzzi-8-1',
  name: 'Karcher Puzzi 8/1',
  images: ['/uploads/puzzi.webp'],
  pricePerDay: 980,
}

const validHtml = `<!doctype html>
<html><head>
<title>Аренда Karcher Puzzi 8/1 в Москве — 980 ₽/сутки | ВозьмиМеня</title>
<meta name="description" content="Karcher Puzzi 8/1 в аренду в Москве с самовывозом и доставкой.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://vozmimenya.ru/equipment/karcher-puzzi-8-1">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Аренда Karcher Puzzi 8/1","image":["https://api.vozmimenya.ru/uploads/puzzi.webp"],"offers":{"@type":"Offer","priceCurrency":"RUB","price":980}}</script>
</head><body><h1>Karcher Puzzi 8/1 в аренду</h1><p>980 ₽</p></body></html>`

describe('equipment SEO smoke contracts', () => {
  it('uses the dedicated production API while keeping local and explicit origins configurable', () => {
    expect(resolveEquipmentApiBaseUrl('https://vozmimenya.ru')).toBe('https://api.vozmimenya.ru')
    expect(resolveEquipmentApiBaseUrl('http://localhost:5173/')).toBe('http://localhost:5173')
    expect(resolveEquipmentApiBaseUrl('https://vozmimenya.ru', 'https://staging-api.example/api/'))
      .toBe('https://staging-api.example/api')
  })

  it('extracts canonical equipment paths from sitemap XML', () => {
    const xml = `
      <urlset>
        <url><loc>https://vozmimenya.ru/equipment/karcher-puzzi-8-1</loc></url>
        <url><loc>https://vozmimenya.ru/equipment/gopro-13</loc></url>
        <url><loc>https://vozmimenya.ru/about</loc></url>
      </urlset>`
    expect(extractEquipmentPathsFromSitemap(xml)).toEqual([
      '/equipment/karcher-puzzi-8-1',
      '/equipment/gopro-13',
    ])
  })

  it('requires an exact one-to-one catalog and sitemap match', () => {
    expect(() => validateCatalogSitemap([item], ['/equipment/karcher-puzzi-8-1'])).not.toThrow()
    expect(() => validateCatalogSitemap([item], [])).toThrow('karcher-puzzi-8-1: missing from sitemap')
    expect(() => validateCatalogSitemap([item], [
      '/equipment/karcher-puzzi-8-1',
      '/equipment/karcher-puzzi-8-1',
    ])).toThrow('karcher-puzzi-8-1: duplicated in sitemap')
    expect(() => validateCatalogSitemap([item, item], ['/equipment/karcher-puzzi-8-1']))
      .toThrow('karcher-puzzi-8-1: duplicated in catalog')
    expect(() => validateCatalogSitemap([item], [
      '/equipment/karcher-puzzi-8-1',
      '/equipment/removed-model',
    ])).toThrow('removed-model: sitemap product is absent from catalog')
  })

  it('accepts a complete raw SSR product page', () => {
    expect(() => validateEquipmentSsrHtml(validHtml, item, 'https://vozmimenya.ru')).not.toThrow()
  })

  it.each([
    ['h1', validHtml.replace('<h1>Karcher Puzzi 8/1 в аренду</h1>', '')],
    ['canonical', validHtml.replace('/equipment/karcher-puzzi-8-1">', '/equipment/wrong">')],
    ['meta description', validHtml.replace(/<meta name="description"[^>]+>\n/, '')],
    ['index, follow', validHtml.replace('index, follow', 'noindex, nofollow')],
    ['Product', validHtml.replace('"@type":"Product"', '"@type":"Thing"')],
    ['Offer', validHtml.replace('"@type":"Offer"', '"@type":"AggregateOffer"')],
    ['image', validHtml.replace('"image":["https://api.vozmimenya.ru/uploads/puzzi.webp"],', '')],
    ['price 980', validHtml.replace('"price":980', '"price":981')],
  ])('rejects a page missing the %s contract', (expectedMessage, html) => {
    expect(() => validateEquipmentSsrHtml(html, item, 'https://vozmimenya.ru')).toThrow(expectedMessage)
  })
})
