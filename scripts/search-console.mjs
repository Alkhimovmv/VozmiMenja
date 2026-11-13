#!/usr/bin/env node

import { createSign } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/webmasters'
const YANDEX_API = 'https://api.webmaster.yandex.net'
const GOOGLE_API = 'https://www.googleapis.com/webmasters/v3'

export function parseEnv(text) {
  const result = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator < 1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    result[key] = value
  }
  return result
}

export function csvEscape(value) {
  const string = value == null ? '' : String(value)
  return /[",\r\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string
}

export function toCsv(columns, rows) {
  return [columns, ...rows.map(row => columns.map(column => row[column]))]
    .map(row => row.map(csvEscape).join(','))
    .join('\n') + '\n'
}

export function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(match => match[1].trim())
}

export function chooseGoogleProperty(entries, configured, siteUrl) {
  const sites = (entries || []).map(entry => entry.siteUrl).filter(Boolean)
  if (configured && sites.includes(configured)) return configured
  const hostname = new URL(siteUrl).hostname.replace(/^www\./, '')
  const domainProperty = `sc-domain:${hostname}`
  if (sites.includes(domainProperty)) return domainProperty
  return sites.find(value => {
    try { return new URL(value).hostname.replace(/^www\./, '') === hostname } catch { return false }
  })
}

export function chooseYandexHost(hosts, siteUrl) {
  const hostname = new URL(siteUrl).hostname.replace(/^www\./, '')
  return (hosts || []).find(host => [host.ascii_host_url, host.unicode_host_url]
    .filter(Boolean)
    .some(value => {
      try { return new URL(value).hostname.replace(/^www\./, '') === hostname } catch { return false }
    }))
}

export function normalizeSitemapRecrawlError(error) {
  if (error.status !== 504) throw error
  return { gatewayTimeout: true, httpStatus: 504 }
}

export function normalizeRecrawlQueueError(error, url) {
  if (error.status === 409) return { url, status: 'already-added' }
  if (error.status === 504) return { url, status: 'gateway-timeout', httpStatus: 504 }
  throw error
}

function base64url(value) {
  return Buffer.from(value).toString('base64url')
}

async function loadLocalEnv() {
  const envPath = path.join(ROOT, '.env.search.local')
  if (!existsSync(envPath)) return
  const parsed = parseEnv(await readFile(envPath, 'utf8'))
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options)
  const text = await response.text()
  let body = null
  if (text) {
    try { body = JSON.parse(text) } catch { body = text }
  }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body)
    const error = new Error(`${options.method || 'GET'} ${url} -> ${response.status}: ${detail}`)
    error.status = response.status
    error.body = body
    throw error
  }
  return body
}

async function getGoogleToken() {
  if (process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) return process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsPath) throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN')
  const resolvedPath = path.isAbsolute(credentialsPath) ? credentialsPath : path.resolve(ROOT, credentialsPath)
  const credentials = JSON.parse(await readFile(resolvedPath, 'utf8'))
  if (!credentials.client_email || !credentials.private_key) throw new Error('Google service-account JSON is missing client_email/private_key')
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: GOOGLE_SCOPE,
    aud: credentials.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const unsigned = `${header}.${claims}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const assertion = `${unsigned}.${signer.sign(credentials.private_key).toString('base64url')}`
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  })
  const token = await apiRequest(credentials.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!token?.access_token) throw new Error('Google OAuth response did not contain access_token')
  return token.access_token
}

function googleUrl(relative) {
  const url = new URL(`${GOOGLE_API}${relative}`)
  if (process.env.GOOGLE_API_KEY) url.searchParams.set('key', process.env.GOOGLE_API_KEY)
  return url
}

async function googleContext(config) {
  const token = await getGoogleToken()
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
  const sites = await apiRequest(googleUrl('/sites'), { headers })
  const property = chooseGoogleProperty(sites?.siteEntry, config.googleProperty, config.siteUrl)
  if (!property) throw new Error(`No Search Console property for ${config.siteUrl}; grant the service account access first`)
  return { headers, property, sites: sites?.siteEntry || [] }
}

async function yandexContext(config) {
  const token = process.env.YANDEX_WEBMASTER_TOKEN
  if (!token) throw new Error('Set YANDEX_WEBMASTER_TOKEN')
  const headers = { authorization: `OAuth ${token}`, 'content-type': 'application/json' }
  const user = await apiRequest(`${YANDEX_API}/v4/user`, { headers })
  const userId = user?.user_id
  if (!userId) throw new Error('Yandex Webmaster API did not return user_id')
  const result = await apiRequest(`${YANDEX_API}/v4/user/${userId}/hosts`, { headers })
  const host = chooseYandexHost(result?.hosts, config.siteUrl)
  if (!host) throw new Error(`No verified Yandex Webmaster host for ${config.siteUrl}`)
  return { headers, userId, host, hosts: result?.hosts || [] }
}

function dateRange(days) {
  const end = new Date()
  end.setUTCDate(end.getUTCDate() - 1)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - days + 1)
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) }
}

async function submitGoogle(config) {
  const context = await googleContext(config)
  const relative = `/sites/${encodeURIComponent(context.property)}/sitemaps/${encodeURIComponent(config.sitemapUrl)}`
  await apiRequest(googleUrl(relative), { method: 'PUT', headers: context.headers })
  return { property: context.property, sitemap: config.sitemapUrl, submitted: true }
}

async function exportGoogle(config, outputDir) {
  const context = await googleContext(config)
  const range = dateRange(config.days)
  const rows = []
  for (let startRow = 0; startRow < 100000; startRow += 25000) {
    const relative = `/sites/${encodeURIComponent(context.property)}/searchAnalytics/query`
    const response = await apiRequest(googleUrl(relative), {
      method: 'POST', headers: context.headers,
      body: JSON.stringify({ ...range, dimensions: ['query', 'page'], type: 'web', dataState: 'all', rowLimit: 25000, startRow }),
    })
    const batch = response?.rows || []
    rows.push(...batch)
    if (batch.length < 25000) break
  }
  const daily = await apiRequest(googleUrl(`/sites/${encodeURIComponent(context.property)}/searchAnalytics/query`), {
    method: 'POST', headers: context.headers,
    body: JSON.stringify({ ...range, dimensions: ['date'], type: 'web', dataState: 'all', rowLimit: 25000 }),
  })
  const normalized = rows.map(row => ({
    query: row.keys?.[0] || '', page: row.keys?.[1] || '', clicks: row.clicks || 0,
    impressions: row.impressions || 0, ctr: row.ctr || 0, position: row.position || 0,
  }))
  await writeFile(path.join(outputDir, 'gsc-query-pages.json'), JSON.stringify({ property: context.property, range, rows }, null, 2))
  await writeFile(path.join(outputDir, 'gsc-query-pages.csv'), toCsv(['query', 'page', 'clicks', 'impressions', 'ctr', 'position'], normalized))
  await writeFile(path.join(outputDir, 'gsc-daily.json'), JSON.stringify({ property: context.property, range, rows: daily?.rows || [] }, null, 2))
  return { property: context.property, range, queryPageRows: rows.length, dailyRows: daily?.rows?.length || 0 }
}

async function submitYandex(config) {
  const context = await yandexContext(config)
  const base = `${YANDEX_API}/v4/user/${context.userId}/hosts/${encodeURIComponent(context.host.host_id)}`
  const sitemapResult = await apiRequest(`${base}/sitemaps?limit=100`, { headers: context.headers })
  const sitemap = (sitemapResult?.sitemaps || []).find(item => item.sitemap_url === config.sitemapUrl)
  let sitemapRecrawl = null
  if (sitemap) {
    try {
      sitemapRecrawl = await apiRequest(`${YANDEX_API}/v4.1/user/${context.userId}/hosts/${encodeURIComponent(context.host.host_id)}/sitemaps/${encodeURIComponent(sitemap.sitemap_id)}/recrawl`, {
        method: 'POST', headers: context.headers,
      }) || { accepted: true }
    } catch (error) {
      if (error.status === 409) sitemapRecrawl = { alreadyInProgress: true, detail: error.body }
      else sitemapRecrawl = normalizeSitemapRecrawlError(error)
    }
  }
  const quota = await apiRequest(`${base}/recrawl/quota`, { headers: context.headers })
  const xml = await apiRequest(config.sitemapUrl, { headers: { accept: 'application/xml,text/xml' } })
  const urls = parseSitemapUrls(typeof xml === 'string' ? xml : '')
  const available = Math.max(0, Number(quota?.quota_remainder ?? quota?.daily_quota ?? 0))
  const maximum = Math.min(config.yandexMaxUrls, available, urls.length)
  const submitted = []
  for (const url of urls.slice(0, maximum)) {
    try {
      const result = await apiRequest(`${base}/recrawl/queue`, {
        method: 'POST', headers: context.headers, body: JSON.stringify({ url }),
      })
      submitted.push({ url, status: 'accepted', taskId: result?.task_id })
    } catch (error) {
      if (error.status === 429) break
      submitted.push(normalizeRecrawlQueueError(error, url))
    }
  }
  return { host: context.host.host_id, sitemapFound: Boolean(sitemap), sitemapRecrawl, quotaBefore: quota, submitted }
}

async function exportYandex(config, outputDir) {
  const context = await yandexContext(config)
  const range = dateRange(config.days)
  const base = `${YANDEX_API}/v4/user/${context.userId}/hosts/${encodeURIComponent(context.host.host_id)}`
  const params = new URLSearchParams({
    order_by: 'TOTAL_SHOWS', date_from: range.startDate, date_to: range.endDate,
    device_type_indicator: 'ALL', offset: '0', limit: '500',
  })
  for (const indicator of ['TOTAL_SHOWS', 'TOTAL_CLICKS', 'AVG_SHOW_POSITION', 'AVG_CLICK_POSITION']) {
    params.append('query_indicator', indicator)
  }
  const popular = await apiRequest(`${base}/search-queries/popular?${params}`, { headers: context.headers })
  const historyParams = new URLSearchParams({ date_from: range.startDate, date_to: range.endDate, device_type_indicator: 'ALL' })
  for (const indicator of ['TOTAL_SHOWS', 'TOTAL_CLICKS', 'AVG_SHOW_POSITION', 'AVG_CLICK_POSITION']) {
    historyParams.append('query_indicator', indicator)
  }
  const history = await apiRequest(`${base}/search-queries/all/history?${historyParams}`, { headers: context.headers })
  const normalized = (popular?.queries || []).map(row => ({
    query: row.query_text || '', query_id: row.query_id || '',
    shows: row.indicators?.TOTAL_SHOWS ?? '', clicks: row.indicators?.TOTAL_CLICKS ?? '',
    avg_show_position: row.indicators?.AVG_SHOW_POSITION ?? '', avg_click_position: row.indicators?.AVG_CLICK_POSITION ?? '',
  }))
  await writeFile(path.join(outputDir, 'yandex-popular-queries.json'), JSON.stringify(popular, null, 2))
  await writeFile(path.join(outputDir, 'yandex-popular-queries.csv'), toCsv(['query', 'query_id', 'shows', 'clicks', 'avg_show_position', 'avg_click_position'], normalized))
  await writeFile(path.join(outputDir, 'yandex-query-history.json'), JSON.stringify(history, null, 2))
  return { host: context.host.host_id, range, popularQueries: normalized.length, historyRows: history?.indicators?.length || history?.history?.length || 0 }
}

async function providerStatus(config) {
  const status = {}
  try {
    const google = await googleContext(config)
    status.google = { connected: true, property: google.property, permission: google.sites.find(site => site.siteUrl === google.property)?.permissionLevel }
  } catch (error) { status.google = { connected: false, error: error.message } }
  try {
    const yandex = await yandexContext(config)
    status.yandex = { connected: true, host: yandex.host.host_id, verified: yandex.host.verified }
  } catch (error) { status.yandex = { connected: false, error: error.message } }
  return status
}

async function main() {
  await loadLocalEnv()
  const command = process.argv[2] || 'status'
  const config = {
    siteUrl: process.env.SITE_URL || 'https://vozmimenya.ru/',
    sitemapUrl: process.env.SITEMAP_URL || 'https://vozmimenya.ru/sitemap.xml',
    googleProperty: process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY || 'sc-domain:vozmimenya.ru',
    yandexMaxUrls: Math.max(0, Number(process.env.YANDEX_RECRAWL_MAX_URLS || 20)),
    days: Math.max(1, Number(process.env.SEARCH_EXPORT_DAYS || 90)),
  }
  if (!['status', 'submit', 'export', 'all'].includes(command)) throw new Error('Usage: search-console.mjs status|submit|export|all')
  const result = { command, createdAt: new Date().toISOString() }
  if (command === 'status') result.status = await providerStatus(config)
  if (command === 'submit' || command === 'all') {
    result.submit = {}
    try { result.submit.google = await submitGoogle(config) } catch (error) { result.submit.google = { error: error.message } }
    try { result.submit.yandex = await submitYandex(config) } catch (error) { result.submit.yandex = { error: error.message } }
  }
  if (command === 'export' || command === 'all') {
    const outputDir = path.resolve(ROOT, process.env.SEARCH_EXPORT_DIR || path.join('seo-agent', 'exports', new Date().toISOString().slice(0, 10)))
    await mkdir(outputDir, { recursive: true })
    result.export = { outputDir }
    try { result.export.google = await exportGoogle(config, outputDir) } catch (error) { result.export.google = { error: error.message } }
    try { result.export.yandex = await exportYandex(config, outputDir) } catch (error) { result.export.yandex = { error: error.message } }
    await writeFile(path.join(outputDir, 'summary.json'), JSON.stringify(result, null, 2))
  }
  console.log(JSON.stringify(result, null, 2))
  const sections = [result.status, result.submit, result.export].filter(Boolean)
  if (sections.some(section => Object.values(section).some(value => value?.connected === false || value?.error))) process.exitCode = 2
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
