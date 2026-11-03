import type { Equipment } from '../models/Equipment'
import type { RentalEquipment } from '../models/RentalEquipment'
import { XMLValidator } from 'fast-xml-parser'
import {
  buildYandexBusinessFeed,
  getYandexBusinessLocation,
} from './yandexBusinessFeed'

const makeEquipment = (overrides: Partial<Equipment> = {}): Equipment => ({
  id: 'camera-1',
  slug: 'camera-1',
  name: 'DJI & GoPro <комплект>',
  category: 'Камеры',
  pricePerDay: 1300,
  quantity: 2,
  availableQuantity: 2,
  images: [
    '/uploads/preview.webp',
    'http://localhost:3002/uploads/camera.jpg',
  ],
  description: 'Камера для съёмки',
  specifications: {},
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
  ...overrides,
})

const makeInventory = (overrides: Partial<RentalEquipment> = {}): RentalEquipment => ({
  id: 1,
  name: 'DJI & GoPro <комплект>',
  quantity: 1,
  basePrice: 99999,
  officeId: 1,
  instances: [{ instanceNumber: 1 }],
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
  ...overrides,
})

describe('Yandex Business location feed', () => {
  it('uses the exact one-day catalog price and never the inventory purchase price', () => {
    const location = getYandexBusinessLocation('volzhskaya')
    const xml = buildYandexBusinessFeed({
      location,
      equipment: [makeEquipment()],
      inventory: [makeInventory()],
      generatedAt: new Date('2026-11-04T10:30:00+03:00'),
    })

    expect(xml).toContain('<price>1300</price>')
    expect(xml).not.toContain('99999')
    expect(xml).toContain('available="true"')
  })

  it('escapes XML, assigns category and vendor, normalizes a compatible image, and adds location UTM tags', () => {
    const location = getYandexBusinessLocation('volzhskaya')
    const xml = buildYandexBusinessFeed({
      location,
      equipment: [makeEquipment()],
      inventory: [makeInventory()],
      generatedAt: new Date('2026-11-04T10:30:00+03:00'),
    })

    expect(xml).toContain('<category id="101">Аренда камер и съемочного оборудования</category>')
    expect(xml).toContain('<name>DJI &amp; GoPro &lt;комплект&gt;</name>')
    expect(xml).toContain('<vendor>DJI</vendor>')
    expect(xml).toContain('<picture>https://api.vozmimenya.ru/uploads/camera.jpg</picture>')
    expect(xml).not.toContain('preview.webp')
    expect(xml).toContain('utm_source=yandex_maps&amp;utm_medium=organic&amp;utm_campaign=volzhskaya')
  })

  it('matches normalized inventory names but isolates stock by office', () => {
    const item = makeEquipment({ id: 'cleaner-1', name: 'Karcher SC4', category: 'Пылесосы, уборка и клининг' })
    const volzhskaya = buildYandexBusinessFeed({
      location: getYandexBusinessLocation('volzhskaya'),
      equipment: [item],
      inventory: [makeInventory({ name: 'Karcher SC-4', officeId: 1 })],
    })
    const dinamo = buildYandexBusinessFeed({
      location: getYandexBusinessLocation('dinamo'),
      equipment: [item],
      inventory: [makeInventory({ name: 'Karcher SC-4', officeId: 1 })],
    })

    expect(volzhskaya).toContain('available="true"')
    expect(dinamo).toContain('available="unknown"')
    expect(dinamo).toContain('utm_campaign=dinamo')
  })

  it('does not claim availability for globally unavailable, missing, zero, or ambiguous office stock', () => {
    const catalog = [
      makeEquipment({ id: 'global-zero', name: 'DJI Global Zero', availableQuantity: 0 }),
      makeEquipment({ id: 'missing', name: 'DJI Missing Stock' }),
      makeEquipment({ id: 'local-zero', name: 'DJI Local Zero' }),
      makeEquipment({ id: 'ambiguous', name: 'DJI Ambiguous Stock' }),
    ]
    const inventory = [
      makeInventory({ id: 1, name: 'DJI Global Zero', quantity: 1 }),
      makeInventory({ id: 2, name: 'DJI Local Zero', quantity: 0 }),
      makeInventory({ id: 3, name: 'DJI Ambiguous Stock', quantity: 1 }),
      makeInventory({ id: 4, name: 'DJI Ambiguous-Stock', quantity: 1 }),
    ]

    const xml = buildYandexBusinessFeed({
      location: getYandexBusinessLocation('volzhskaya'),
      equipment: catalog,
      inventory,
    })

    expect(xml.match(/available="unknown"/g)).toHaveLength(4)
    expect(xml).not.toContain('available="true"')
  })

  it('rejects unsupported location slugs', () => {
    expect(() => getYandexBusinessLocation('other')).toThrow('Unknown Yandex Business location: other')
  })

  it('uses the canonical catalog slug for the product URL while keeping the stable catalog id as offer id', () => {
    const xml = buildYandexBusinessFeed({
      location: getYandexBusinessLocation('volzhskaya'),
      equipment: [makeEquipment({ id: 'stable-uuid', slug: 'canonical-camera-slug' })],
      inventory: [makeInventory()],
    })

    expect(xml).toContain('<offer id="stable-uuid"')
    expect(xml).toContain('/equipment/canonical-camera-slug?')
    expect(xml).not.toContain('/equipment/stable-uuid?')
  })

  it('excludes rows with an unknown brand, category, invalid price, invalid id, or oversized text and reports diagnostics', () => {
    const diagnostics: Array<{ equipmentId: string; reason: string }> = []
    const equipment = [
      makeEquipment({ id: 'unknown-brand', slug: 'unknown-brand', name: 'Робот-мойщик окон' }),
      makeEquipment({ id: 'unknown-category', slug: 'unknown-category', category: 'Другое' }),
      makeEquipment({ id: 'zero-price', slug: 'zero-price', pricePerDay: 0 }),
      makeEquipment({ id: 'invalid id', slug: 'invalid-id' }),
      makeEquipment({ id: 'long-name', slug: 'long-name', name: `DJI ${'x'.repeat(247)}` }),
      makeEquipment({ id: 'long-description', slug: 'long-description', description: 'x'.repeat(3001) }),
    ]

    const xml = buildYandexBusinessFeed({
      location: getYandexBusinessLocation('volzhskaya'),
      equipment,
      inventory: [],
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    })

    equipment.forEach((item) => expect(xml).not.toContain(`<offer id="${item.id}"`))
    expect(diagnostics).toEqual([
      { equipmentId: 'unknown-brand', reason: 'unknown_vendor' },
      { equipmentId: 'unknown-category', reason: 'unknown_category' },
      { equipmentId: 'zero-price', reason: 'invalid_price' },
      { equipmentId: 'invalid id', reason: 'invalid_offer_id' },
      { equipmentId: 'long-name', reason: 'invalid_name' },
      { equipmentId: 'long-description', reason: 'invalid_description' },
    ])
  })

  it('produces parseable XML when catalog text contains XML 1.0 forbidden control characters', () => {
    const xml = buildYandexBusinessFeed({
      location: getYandexBusinessLocation('volzhskaya'),
      equipment: [makeEquipment({ description: 'valid\u0001\u000B\u000C text' })],
      inventory: [makeInventory()],
    })

    expect(XMLValidator.validate(xml)).toBe(true)
    expect(xml).toContain('<description>valid text</description>')
  })
})
