import assert from 'node:assert/strict'
import test from 'node:test'
import { equipmentQueries } from '../query/equipmentQueries'
import { articleQueries } from '../query/articleQueries'
import { getPageLeadMessage } from '../lib/contactLinks'
import { ApiRequestError, apiClient } from '../lib/api'
import { articlesApi } from '../api/articles'
import { createAppQueryClient } from '../query/queryClient'
import { prefetchPublicRoute } from './prefetchRoute'
import { resolvePublicRoute } from './publicRoutes'

test('public query keys are stable across server and browser', () => {
  assert.deepEqual(equipmentQueries.list({ limit: 200 }).queryKey, ['equipment', { limit: 200 }])
  assert.deepEqual(equipmentQueries.detail('karcher-puzzi-8-1').queryKey, ['equipment', 'karcher-puzzi-8-1'])
  assert.deepEqual(articleQueries.list('all').queryKey, ['articles', 'list', 'all'])
  assert.deepEqual(articleQueries.detail('test-article').queryKey, ['articles', 'detail', 'test-article'])
})

test('contact links have a deterministic server fallback', () => {
  assert.equal(
    getPageLeadMessage('Аренда техники', 'https://vozmimenya.ru/'),
    'Здравствуйте! Хочу уточнить аренду. Страница: Аренда техники https://vozmimenya.ru/',
  )
})

test('prefetches the home page queries consumed by React', async () => {
  const originals = {
    getEquipment: apiClient.getEquipment,
    getEquipmentStats: apiClient.getEquipmentStats,
    getCategoryCounts: apiClient.getCategoryCounts,
    getRecent: articlesApi.getRecent,
  }
  apiClient.getEquipment = async (params) => ({ success: true, data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10 })
  apiClient.getEquipmentStats = async () => ({ success: true, data: { totalEquipment: 0, totalCategories: 0 } })
  apiClient.getCategoryCounts = async () => ({ success: true, data: {} })
  articlesApi.getRecent = async () => []

  try {
    const queryClient = createAppQueryClient(true)
    const result = await prefetchPublicRoute(queryClient, resolvePublicRoute('/'))
    assert.deepEqual(result, { status: 200 })
    assert.ok(queryClient.getQueryData(['equipment', { page: 1, limit: 12 }]))
    assert.equal(queryClient.getQueryData(['equipment', { limit: 200 }]), undefined)
    assert.ok(queryClient.getQueryData(['equipment-stats']))
    assert.ok(queryClient.getQueryData(['category-counts']))
    assert.deepEqual(queryClient.getQueryData(['articles', 'recent', 3]), [])
  } finally {
    Object.assign(apiClient, originals)
  }
})

test('prefetches equipment details and related items', async () => {
  const originals = { getEquipment: apiClient.getEquipment, getEquipmentById: apiClient.getEquipmentById }
  apiClient.getEquipmentById = async (id) => ({
    success: true,
    data: { id, slug: id, name: 'Puzzi', category: 'Пылесосы' },
  } as Awaited<ReturnType<typeof apiClient.getEquipmentById>>)
  apiClient.getEquipment = async (params) => ({ success: true, data: [], total: 0, page: 1, limit: params?.limit || 10 })

  try {
    const queryClient = createAppQueryClient(true)
    const result = await prefetchPublicRoute(queryClient, resolvePublicRoute('/equipment/karcher-puzzi-8-1'))
    assert.deepEqual(result, { status: 200 })
    assert.ok(queryClient.getQueryData(['equipment', 'karcher-puzzi-8-1']))
    assert.ok(queryClient.getQueryData(['equipment', { limit: 3, category: 'Пылесосы' }]))
  } finally {
    Object.assign(apiClient, originals)
  }
})

test('turns dynamic 404 into a page status but propagates upstream failures', async () => {
  const original = apiClient.getEquipmentById
  try {
    apiClient.getEquipmentById = async () => { throw new ApiRequestError('missing', 404) }
    const missingClient = createAppQueryClient(true)
    assert.deepEqual(
      await prefetchPublicRoute(missingClient, resolvePublicRoute('/equipment/missing')),
      { status: 404 },
    )

    apiClient.getEquipmentById = async () => { throw new ApiRequestError('upstream', 500) }
    const failingClient = createAppQueryClient(true)
    await assert.rejects(
      prefetchPublicRoute(failingClient, resolvePublicRoute('/equipment/failing')),
      /upstream/,
    )
  } finally {
    apiClient.getEquipmentById = original
  }
})
