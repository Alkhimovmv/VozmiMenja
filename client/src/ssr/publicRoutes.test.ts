import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePublicRoute } from './publicRoutes'

test('resolves public, dynamic, admin and missing routes', () => {
  assert.equal(resolvePublicRoute('/').kind, 'page')
  assert.deepEqual(resolvePublicRoute('/equipment/karcher-puzzi-8-1'), {
    kind: 'equipment', id: 'karcher-puzzi-8-1', cacheable: true,
  })
  assert.deepEqual(resolvePublicRoute('/blog/test-article'), {
    kind: 'article', slug: 'test-article', cacheable: true,
  })
  assert.deepEqual(resolvePublicRoute('/admin/rentals'), { kind: 'admin' })
  assert.equal(resolvePublicRoute('/booking').cacheable, false)
  assert.deepEqual(resolvePublicRoute('/missing-page'), { kind: 'not-found', cacheable: false })
})

test('normalizes trailing slashes and preserves redirect query strings', () => {
  assert.equal(resolvePublicRoute('/about/').kind, 'page')
  assert.deepEqual(resolvePublicRoute('/equipment/%6Barcher-puzzi-8-1'), {
    kind: 'equipment', id: 'karcher-puzzi-8-1', cacheable: true,
  })
  const redirect = resolvePublicRoute('/equipment?utm_source=test')
  assert.deepEqual(redirect, { kind: 'redirect', location: '/?utm_source=test', cacheable: false })
})
