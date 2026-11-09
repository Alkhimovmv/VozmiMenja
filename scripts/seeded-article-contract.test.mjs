import assert from 'node:assert/strict'
import test from 'node:test'
import {
  articleItemsFromPayload,
  extractSeededArticleSlugs,
  missingSeededArticleSlugs,
  resolveRedirectPath,
} from './seeded-article-contract.mjs'

test('extracts literal article slugs without interface declarations or duplicates', () => {
  const source = `
    interface Item { slug: string }
    const articles = [
      { slug: 'first-article' },
      { slug: "second-article" },
      { slug: 'first-article' },
    ]
  `

  assert.deepEqual(extractSeededArticleSlugs(source), [
    'first-article',
    'second-article',
    'first-article',
  ])
})

test('normalizes API envelopes and reports missing published slugs', () => {
  const articles = articleItemsFromPayload({
    data: [
      { slug: 'published', published: 1 },
      { slug: 'draft', published: 0 },
    ],
  })

  assert.deepEqual(
    missingSeededArticleSlugs(['published', 'draft', 'missing'], articles),
    ['draft', 'missing'],
  )
})

test('resolves declared redirect chains and rejects loops', () => {
  assert.equal(resolveRedirectPath('/old', { '/old': '/new', '/new': '/final' }), '/final')
  assert.throws(
    () => resolveRedirectPath('/a', { '/a': '/b', '/b': '/a' }),
    /Redirect loop detected/,
  )
})

