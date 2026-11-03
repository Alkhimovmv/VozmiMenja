import type { Equipment } from '../models/Equipment'
import type { RentalEquipment } from '../models/RentalEquipment'

export type YandexBusinessLocationSlug = 'volzhskaya' | 'dinamo'

export interface YandexBusinessLocation {
  slug: YandexBusinessLocationSlug
  officeId: number
  yandexOrgId: string
  shopName: string
  landingUrl: string
}

interface BuildFeedInput {
  location: YandexBusinessLocation
  equipment: Equipment[]
  inventory: RentalEquipment[]
  generatedAt?: Date
  onDiagnostic?: (diagnostic: YandexBusinessFeedDiagnostic) => void
}

export interface YandexBusinessFeedDiagnostic {
  equipmentId: string
  reason: string
}

const SITE_URL = 'https://vozmimenya.ru'
const API_URL = 'https://api.vozmimenya.ru'

const LOCATIONS: Record<YandexBusinessLocationSlug, YandexBusinessLocation> = {
  volzhskaya: {
    slug: 'volzhskaya',
    officeId: 1,
    yandexOrgId: '206350428739',
    shopName: 'ВозьмиМеня — Волжская',
    landingUrl: `${SITE_URL}/arenda-tehniki-u-metro-volzhskaya-kuzminki`,
  },
  dinamo: {
    slug: 'dinamo',
    officeId: 2,
    yandexOrgId: '95879395485',
    shopName: 'ВозьмиМеня — Динамо',
    landingUrl: `${SITE_URL}/arenda-tehniki-u-metro-dinamo`,
  },
}

const CATEGORIES: Record<string, { id: string; name: string }> = {
  'камеры': { id: '101', name: 'Аренда камер и съемочного оборудования' },
  'аудиооборудование': { id: '102', name: 'Аренда колонок и микрофонов' },
  'пылесосы, уборка и клининг': { id: '103', name: 'Аренда пылесосов и клининговой техники' },
}

const VENDORS = ['Insta360', 'Karcher', 'Kärcher', 'Vacmaster', 'GoPro', 'Okami', 'DJI', 'JBL']

const stripInvalidXmlCharacters = (value: string): string => Array.from(value)
  .filter((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint === 0x09
      || codePoint === 0x0A
      || codePoint === 0x0D
      || (codePoint >= 0x20 && codePoint <= 0xD7FF)
      || (codePoint >= 0xE000 && codePoint <= 0xFFFD)
      || (codePoint >= 0x10000 && codePoint <= 0x10FFFF)
  })
  .join('')

const escapeXml = (value: string | number): string => stripInvalidXmlCharacters(String(value))
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const normalizeName = (value: string): string => value
  .trim()
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9]+/g, '')

const normalizeImageUrl = (value: string): string | null => {
  const trimmed = value.trim()
  const pathname = trimmed.split(/[?#]/, 1)[0].toLowerCase()
  if (!/\.(?:jpe?g|png)$/.test(pathname)) return null

  if (trimmed.startsWith('/uploads/')) return `${API_URL}${trimmed}`
  if (/^https?:\/\/localhost(?::\d+)?\/uploads\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/localhost(?::\d+)?/i, API_URL)
  }
  if (/^https:\/\//i.test(trimmed)) return trimmed
  return null
}

const getCategory = (category: string): { id: string; name: string } | undefined => (
  CATEGORIES[category.trim().toLowerCase()]
)

const getVendor = (name: string): string | undefined => {
  const lowerName = name.toLowerCase()
  const vendor = VENDORS
    .map((candidate) => ({ candidate, index: lowerName.indexOf(candidate.toLowerCase()) }))
    .filter(({ index }) => index >= 0)
    .sort((left, right) => left.index - right.index)[0]?.candidate
  return vendor === 'Kärcher' ? 'Karcher' : vendor
}

const isValidOfferId = (value: string): boolean => (
  value.length > 0
  && value.length <= 80
  && !value.includes('ё')
  && /^[A-Za-zА-Яа-я0-9.,\\/()[\]=-]+$/u.test(value)
)

const isValidPrice = (value: number): boolean => {
  const rendered = String(value)
  return Number.isFinite(value)
    && value > 0
    && rendered.length <= 20
    && /^\d+(?:[.,]\d+)?$/.test(rendered)
}

const formatYmlDate = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}`
}

const buildTrackingQuery = (location: YandexBusinessLocation): string => new URLSearchParams({
  utm_source: 'yandex_maps',
  utm_medium: 'organic',
  utm_campaign: location.slug,
}).toString()

const buildInventoryIndex = (
  inventory: RentalEquipment[],
  location: YandexBusinessLocation,
): Map<string, RentalEquipment[]> => {
  const index = new Map<string, RentalEquipment[]>()
  inventory
    .filter((item) => item.officeId === location.officeId)
    .forEach((item) => {
      const key = normalizeName(item.name)
      index.set(key, [...(index.get(key) ?? []), item])
    })
  return index
}

export const getYandexBusinessLocation = (slug: string): YandexBusinessLocation => {
  const location = LOCATIONS[slug as YandexBusinessLocationSlug]
  if (!location) throw new Error(`Unknown Yandex Business location: ${slug}`)
  return location
}

export const getYandexBusinessLocations = (): YandexBusinessLocation[] => Object.values(LOCATIONS)

export const buildYandexBusinessFeed = ({
  location,
  equipment,
  inventory,
  generatedAt = new Date(),
  onDiagnostic = () => undefined,
}: BuildFeedInput): string => {
  const inventoryIndex = buildInventoryIndex(inventory, location)
  const trackingQuery = buildTrackingQuery(location)
  const validEquipment = equipment.flatMap((item) => {
    const vendor = getVendor(item.name)
    const category = getCategory(item.category)
    const name = item.name.trim()
    const description = item.description.trim()

    const reject = (reason: string): [] => {
      onDiagnostic({ equipmentId: item.id, reason })
      return []
    }

    if (!vendor) return reject('unknown_vendor')
    if (!category) return reject('unknown_category')
    if (!isValidPrice(item.pricePerDay)) return reject('invalid_price')
    if (!isValidOfferId(item.id)) return reject('invalid_offer_id')
    if (!name || name.length > 250) return reject('invalid_name')
    if (description.length > 3000) return reject('invalid_description')
    if (!item.slug) return reject('missing_slug')

    const productUrl = `${SITE_URL}/equipment/${encodeURIComponent(item.slug)}?${trackingQuery}`
    if (productUrl.length > 512) return reject('invalid_url')

    return [{ item, vendor, category, name, description, productUrl }]
  })
  const categories = [...new Map(validEquipment.map(({ category }) => [category.id, category] as const)).values()]

  const offers = validEquipment.map(({ item, vendor, category, name, description, productUrl }) => {
    const matches = inventoryIndex.get(normalizeName(item.name)) ?? []
    const available = item.availableQuantity > 0 && matches.length === 1 && matches[0].quantity > 0
      ? 'true'
      : 'unknown'
    const image = item.images.map(normalizeImageUrl).find((candidate): candidate is string => Boolean(candidate))

    return [
      `      <offer id="${escapeXml(item.id)}" available="${available}">`,
      `        <name>${escapeXml(name)}</name>`,
      `        <vendor>${escapeXml(vendor)}</vendor>`,
      `        <url>${escapeXml(productUrl)}</url>`,
      ...(image ? [`        <picture>${escapeXml(image)}</picture>`] : []),
      `        <price>${escapeXml(item.pricePerDay)}</price>`,
      '        <currencyId>RUB</currencyId>',
      `        <categoryId>${escapeXml(category.id)}</categoryId>`,
      ...(description ? [`        <description>${escapeXml(description)}</description>`] : []),
      '      </offer>',
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<yml_catalog date="${formatYmlDate(generatedAt)}">`,
    '  <shop>',
    `    <name>${escapeXml(location.shopName)}</name>`,
    `    <company>${escapeXml('ВозьмиМеня')}</company>`,
    `    <url>${escapeXml(`${location.landingUrl}?${trackingQuery}`)}</url>`,
    '    <currencies>',
    '      <currency id="RUB" rate="1"/>',
    '    </currencies>',
    '    <categories>',
    ...categories.map((category) => `      <category id="${escapeXml(category.id)}">${escapeXml(category.name)}</category>`),
    '    </categories>',
    '    <offers>',
    ...offers,
    '    </offers>',
    '  </shop>',
    '</yml_catalog>',
    '',
  ].join('\n')
}
