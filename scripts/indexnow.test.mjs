import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPayload, changedUrls, parseSitemap } from './indexnow.mjs'

const sitemap = (entries) => `<?xml version="1.0"?><urlset>${entries
  .map(([loc, lastmod]) => `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
  .join('')}</urlset>`

test('parses loc and optional lastmod', () => {
  const entries = parseSitemap(sitemap([['https://vozmimenya.ru/', '2026-11-09'], ['https://vozmimenya.ru/faq', '']]))
  assert.deepEqual([...entries], [['https://vozmimenya.ru/', '2026-11-09'], ['https://vozmimenya.ru/faq', '']])
})

test('reports new, changed and removed URLs, skips unchanged', () => {
  const oldEntries = parseSitemap(sitemap([
    ['https://vozmimenya.ru/', '2026-11-07'],
    ['https://vozmimenya.ru/faq', '2026-11-01'],
    ['https://vozmimenya.ru/old-page', '2026-10-01'],
  ]))
  const newEntries = parseSitemap(sitemap([
    ['https://vozmimenya.ru/', '2026-11-09'],
    ['https://vozmimenya.ru/faq', '2026-11-01'],
    ['https://vozmimenya.ru/new-page', '2026-11-09'],
  ]))
  assert.deepEqual(changedUrls(oldEntries, newEntries), [
    'https://vozmimenya.ru/',
    'https://vozmimenya.ru/new-page',
    'https://vozmimenya.ru/old-page',
  ])
})

test('submits everything when the live sitemap is unavailable', () => {
  const newEntries = parseSitemap(sitemap([['https://vozmimenya.ru/', '2026-11-09']]))
  assert.deepEqual(changedUrls(parseSitemap(''), newEntries), ['https://vozmimenya.ru/'])
})

test('payload keeps only own-host URLs without duplicates', () => {
  const payload = buildPayload({
    siteOrigin: 'https://vozmimenya.ru',
    key: 'abc123',
    urls: ['https://vozmimenya.ru/', 'https://vozmimenya.ru/', 'https://evil.example/x', 'not a url'],
  })
  assert.deepEqual(payload, {
    host: 'vozmimenya.ru',
    key: 'abc123',
    keyLocation: 'https://vozmimenya.ru/abc123.txt',
    urlList: ['https://vozmimenya.ru/'],
  })
})
