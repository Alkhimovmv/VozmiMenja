import { validateRawCatalogHtml } from './smoke-seo-catalog'

const page = { path: '/arenda-pylesosov-moskva', minProducts: 3 }
const url = `https://vozmimenya.ru${page.path}`

test('accepts the legacy static catalog fallback', () => {
  const product = '<article data-static-product="true"><a href="/equipment/item">Товар</a><a href="/booking?equipment=item">1 сутки — 1 000 ₽</a><script>{"@type":"Product"}</script></article>'
  const html = `<section data-static-product-catalog="true">${product.repeat(3)}</section>`

  expect(validateRawCatalogHtml(html, url, page)).toEqual({ mode: 'static', productCount: 3 })
})

test('accepts a server-rendered catalog without the legacy fallback marker', () => {
  const products = [1, 2, 3].map((id) => `<article><a href="/equipment/item-${id}"><img src="https://api.vozmimenya.ru/uploads/item-${id}.webp" alt="Товар"></a><span>от 1 000 ₽/сутки</span><button>Забронировать</button><script>{"@type":"Product"}</script></article>`).join('')
  const html = `<main><section id="catalog">${products}</section></main>`

  expect(validateRawCatalogHtml(html, url, page)).toEqual({ mode: 'ssr', productCount: 3 })
})
