import assert from 'node:assert/strict'
import test from 'node:test'
import { equipmentQueries } from '../query/equipmentQueries'
import { articleQueries } from '../query/articleQueries'
import { getPageLeadMessage } from '../lib/contactLinks'

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
