import express from 'express'
import request from 'supertest'
import type { Equipment } from '../models/Equipment'
import type { RentalEquipment } from '../models/RentalEquipment'
import { createYandexBusinessFeedsRouter } from './yandexBusinessFeeds'

const equipment: Equipment[] = [{
  id: 'jbl-710',
  slug: 'jbl-710',
  name: 'JBL Partybox 710',
  category: 'Аудиооборудование',
  pricePerDay: 2300,
  quantity: 1,
  availableQuantity: 1,
  images: ['/uploads/jbl.jpg'],
  description: 'Колонка в аренду',
  specifications: {},
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
}]

const inventory: RentalEquipment[] = [{
  id: 1,
  name: 'JBL Partybox 710',
  quantity: 1,
  basePrice: 50000,
  officeId: 1,
  instances: [{ instanceNumber: 1 }],
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
}]

const createApp = (loadInventory: (officeId: number) => Promise<RentalEquipment[]> = async () => inventory) => {
  const app = express()
  app.use('/api/yandex-business/feeds', createYandexBusinessFeedsRouter({
    loadEquipment: async () => equipment,
    loadInventory,
  }))
  return app
}

describe('Yandex Business feed routes', () => {
  it.each([
    ['volzhskaya', 'volzhskaya', 'true'],
    ['dinamo', 'dinamo', 'unknown'],
  ])('serves the %s YML feed with location-specific tracking and stock', async (slug, campaign, availability) => {
    const loadInventory = jest.fn(async () => inventory)
    const response = await request(createApp(loadInventory)).get(`/api/yandex-business/feeds/${slug}.yml`)

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^application\/xml/)
    expect(response.headers['cache-control']).toBe('public, max-age=300')
    expect(response.text).toContain(`<offer id="jbl-710" available="${availability}">`)
    expect(response.text).toContain(`utm_campaign=${campaign}`)
    expect(loadInventory).toHaveBeenCalledWith(slug === 'volzhskaya' ? 1 : 2)
  })

  it('returns 404 for an unsupported office without loading data', async () => {
    const loadEquipment = jest.fn(async () => equipment)
    const app = express()
    app.use('/api/yandex-business/feeds', createYandexBusinessFeedsRouter({
      loadEquipment,
      loadInventory: async () => inventory,
    }))

    const response = await request(app).get('/api/yandex-business/feeds/other.yml')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ success: false, message: 'Feed not found' })
    expect(loadEquipment).not.toHaveBeenCalled()
  })

  it('returns 500 when feed data cannot be loaded', async () => {
    const app = express()
    app.use('/api/yandex-business/feeds', createYandexBusinessFeedsRouter({
      loadEquipment: async () => { throw new Error('database unavailable') },
      loadInventory: async () => inventory,
    }))

    const response = await request(app).get('/api/yandex-business/feeds/volzhskaya.yml')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ success: false, message: 'Feed generation failed' })
  })
})
