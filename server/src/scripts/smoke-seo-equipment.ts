export interface CatalogEquipmentSeoItem {
  slug: string
  name: string
  images: string[]
  pricePerDay: number
}

const equipmentPathPattern = /^\/equipment\/([^/?#]+)$/

export function resolveEquipmentApiBaseUrl(pageBaseUrl: string, explicitApiBaseUrl?: string): string {
  if (explicitApiBaseUrl) return explicitApiBaseUrl.replace(/\/$/, '')

  const normalizedPageBaseUrl = pageBaseUrl.replace(/\/$/, '')
  return normalizedPageBaseUrl === 'https://vozmimenya.ru'
    ? 'https://api.vozmimenya.ru'
    : normalizedPageBaseUrl
}

const countBy = (values: string[]): Map<string, number> => {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return counts
}

const findTag = (html: string, tag: string, attribute: string, value: string): string | undefined => {
  const pattern = new RegExp(`<${tag}\\b(?=[^>]*\\b${attribute}=["']${value}["'])[^>]*>`, 'i')
  return html.match(pattern)?.[0]
}

const extractAttribute = (tag: string | undefined, attribute: string): string => {
  if (!tag) return ''
  return tag.match(new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'i'))?.[1] ?? ''
}

const normalizeText = (value: string): string => value
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim()

const collectSchemaNodes = (value: unknown, result: Array<Record<string, unknown>>): void => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaNodes(item, result))
    return
  }
  if (!value || typeof value !== 'object') return
  const node = value as Record<string, unknown>
  result.push(node)
  Object.values(node).forEach((item) => collectSchemaNodes(item, result))
}

const parseSchemaNodes = (html: string, slug: string): Array<Record<string, unknown>> => {
  const nodes: Array<Record<string, unknown>> = []
  const scripts = html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of scripts) {
    try {
      collectSchemaNodes(JSON.parse(match[1]), nodes)
    } catch {
      throw new Error(`${slug}: invalid JSON-LD`)
    }
  }
  return nodes
}

export function extractEquipmentPathsFromSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>https:\/\/vozmimenya\.ru(\/equipment\/[^<]+)<\/loc>/g)]
    .map((match) => match[1])
}

export function validateCatalogSitemap(
  items: CatalogEquipmentSeoItem[],
  paths: string[],
): void {
  const catalogCounts = countBy(items.map((item) => item.slug))
  for (const [slug, count] of catalogCounts) {
    if (count > 1) throw new Error(`${slug}: duplicated in catalog`)
  }

  const pathCounts = countBy(paths)
  for (const [path, count] of pathCounts) {
    const match = path.match(equipmentPathPattern)
    if (!match) throw new Error(`${path}: invalid equipment sitemap path`)
    if (count > 1) throw new Error(`${match[1]}: duplicated in sitemap`)
  }

  for (const item of items) {
    if (!pathCounts.has(`/equipment/${item.slug}`)) {
      throw new Error(`${item.slug}: missing from sitemap`)
    }
  }

  for (const path of paths) {
    const slug = path.match(equipmentPathPattern)?.[1]
    if (slug && !catalogCounts.has(slug)) {
      throw new Error(`${slug}: sitemap product is absent from catalog`)
    }
  }
}

export function validateEquipmentSsrHtml(
  html: string,
  item: CatalogEquipmentSeoItem,
  canonicalOrigin: string,
): void {
  const prefix = `${item.slug}:`
  const normalizedHtml = normalizeText(html)
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
  if (headings.length !== 1 || !normalizeText(headings[0][1]).includes(item.name)) {
    throw new Error(`${prefix} expected one h1 containing ${item.name}`)
  }

  const title = normalizeText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  if (!title.includes(item.name)) throw new Error(`${prefix} title does not contain model name`)

  const description = extractAttribute(findTag(html, 'meta', 'name', 'description'), 'content')
  if (description.length < 40 || !description.includes(item.name)) {
    throw new Error(`${prefix} meta description is missing the model`)
  }

  const robots = extractAttribute(findTag(html, 'meta', 'name', 'robots'), 'content')
  if (robots !== 'index, follow') throw new Error(`${prefix} expected index, follow robots`)

  const canonical = extractAttribute(findTag(html, 'link', 'rel', 'canonical'), 'href')
  const expectedCanonical = `${canonicalOrigin.replace(/\/$/, '')}/equipment/${item.slug}`
  if (canonical !== expectedCanonical) {
    throw new Error(`${prefix} canonical expected ${expectedCanonical}, got ${canonical || 'missing'}`)
  }

  const schemaNodes = parseSchemaNodes(html, item.slug)
  const product = schemaNodes.find((node) => node['@type'] === 'Product')
  if (!product) throw new Error(`${prefix} Product schema is missing`)
  if (!String(product.name ?? '').includes(item.name)) {
    throw new Error(`${prefix} Product name does not contain model name`)
  }

  const offer = schemaNodes.find((node) => node['@type'] === 'Offer')
  if (!offer) throw new Error(`${prefix} Offer schema is missing`)
  if (Number(offer.price) !== item.pricePerDay) {
    throw new Error(`${prefix} price ${item.pricePerDay} differs from Offer price ${String(offer.price)}`)
  }

  const productImages = Array.isArray(product.image) ? product.image : [product.image]
  if (!productImages.some((image) => typeof image === 'string' && image.length > 0)) {
    throw new Error(`${prefix} image is missing from Product schema`)
  }

  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(item.pricePerDay)
  if (!normalizedHtml.includes(normalizeText(formattedPrice))) {
    throw new Error(`${prefix} visible price ${item.pricePerDay} is missing`)
  }
}
