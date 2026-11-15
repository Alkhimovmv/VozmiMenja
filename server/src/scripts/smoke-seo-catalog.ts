export type CatalogSmokePage = { path: string; minProducts: number }

export function validateRawCatalogHtml(html: string, url: string, page: CatalogSmokePage) {
  const hasStaticCatalog = html.includes('data-static-product-catalog="true"')

  if (!hasStaticCatalog) {
    const productLinks = new Set(
      [...html.matchAll(/href=["']\/equipment\/([^"'?#]+)["']/g)].map((match) => match[1]),
    )
    const productSchemaCount = (html.match(/"@type":"Product"/g) || []).length

    if (productLinks.size < page.minProducts) {
      throw new Error(`${url}: expected at least ${page.minProducts} SSR products, got ${productLinks.size}`)
    }

    if (!html.includes('https://api.vozmimenya.ru/uploads/') || /(?:src|srcset)=["'](?:\/uploads\/|https?:\/\/(?:127\.0\.0\.1|localhost))/.test(html)) {
      throw new Error(`${url}: SSR product image URLs are missing or not public`)
    }

    if (!html.includes('Забронировать') || !html.includes('₽') || productSchemaCount < page.minProducts) {
      throw new Error(`${url}: SSR booking action, price or Product structured data is missing`)
    }

    return { mode: 'ssr' as const, productCount: productLinks.size }
  }

  const productCount = (html.match(/data-static-product="true"/g) || []).length

  if (productCount < page.minProducts) {
    throw new Error(`${url}: expected at least ${page.minProducts} static products, got ${productCount}`)
  }

  if (!html.includes('href="/equipment/') || !html.includes('href="/booking?equipment=')) {
    throw new Error(`${url}: static product or booking links are missing`)
  }

  if (!html.includes('1 сутки —') || !html.includes('"@type":"Product"')) {
    throw new Error(`${url}: one-day price or Product structured data is missing`)
  }

  return { mode: 'static' as const, productCount }
}
