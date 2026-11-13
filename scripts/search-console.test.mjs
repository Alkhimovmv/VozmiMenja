import test from 'node:test'
import assert from 'node:assert/strict'
import {
  chooseGoogleProperty,
  chooseYandexHost,
  csvEscape,
  parseEnv,
  parseSitemapUrls,
  toCsv,
} from './search-console.mjs'

test('parseEnv reads quoted values and ignores comments', () => {
  assert.deepEqual(parseEnv('# comment\nA=one\nB="two words"\n'), { A: 'one', B: 'two words' })
})

test('CSV helpers preserve commas, quotes and new lines', () => {
  assert.equal(csvEscape('a,"b"'), '"a,""b"""')
  assert.equal(toCsv(['query', 'clicks'], [{ query: 'one,two', clicks: 3 }]), 'query,clicks\n"one,two",3\n')
})

test('parseSitemapUrls extracts URL locations', () => {
  const xml = '<urlset><url><loc>https://vozmimenya.ru/</loc></url><url><loc>https://vozmimenya.ru/blog/a</loc></url></urlset>'
  assert.deepEqual(parseSitemapUrls(xml), ['https://vozmimenya.ru/', 'https://vozmimenya.ru/blog/a'])
})

test('provider selectors prefer the VozmiMenja domain', () => {
  assert.equal(chooseGoogleProperty([
    { siteUrl: 'https://other.example/' },
    { siteUrl: 'sc-domain:vozmimenya.ru' },
  ], '', 'https://vozmimenya.ru/'), 'sc-domain:vozmimenya.ru')
  assert.equal(chooseYandexHost([
    { host_id: 'one', ascii_host_url: 'https://other.example/' },
    { host_id: 'two', ascii_host_url: 'https://vozmimenya.ru/' },
  ], 'https://vozmimenya.ru/').host_id, 'two')
})
