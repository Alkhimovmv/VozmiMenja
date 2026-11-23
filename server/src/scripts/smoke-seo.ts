import { spawn } from 'child_process'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import { existsSync } from 'fs'
import { pagesToCheck, requiredCanonicalPaths } from './smoke-seo-config'
import { validateRawCatalogHtml } from './smoke-seo-catalog'
import {
  extractEquipmentPathsFromSitemap,
  validateCatalogSitemap,
  validateEquipmentSsrHtml,
  type CatalogEquipmentSeoItem,
} from './smoke-seo-equipment'

const defaultBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://vozmimenya.ru'
  : 'http://localhost:5173'

const baseUrl = (process.env.SMOKE_BASE_URL || defaultBaseUrl).replace(/\/$/, '')
const canonicalOrigin = (process.env.SMOKE_CANONICAL_ORIGIN || 'https://vozmimenya.ru').replace(/\/$/, '')
const chromeCandidates = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter((candidate): candidate is string => Boolean(candidate))
const chromePath = chromeCandidates.find((candidate) => existsSync(candidate)) || chromeCandidates[0]
const chromeTimeout = process.env.SMOKE_SEO_CHROME_TIMEOUT || '35s'
const maxRenderAttempts = Number(process.env.SMOKE_SEO_RENDER_ATTEMPTS || 2)
const maxChromeOutputBytes = 5 * 1024 * 1024
const staticCatalogPages = [
  { path: '/arenda-pylesosov-moskva', minProducts: 3 },
  { path: '/arenda-gopro-moskva', minProducts: 3 },
  { path: '/arenda-audiooborudovaniya-moskva', minProducts: 3 },
]

function absoluteUrl(pagePath: string) {
  return new URL(pagePath, `${baseUrl}/`).toString()
}

function canonicalUrl(pagePath: string) {
  return new URL(pagePath, `${canonicalOrigin}/`).toString()
}

function findTags(html: string, tag: string, attrName: string, attrValue: string) {
  const pattern = new RegExp(`<${tag}\\b(?=[^>]*\\b${attrName}=["']${attrValue}["'])[^>]*>`, 'gi')
  return html.match(pattern) ?? []
}

function extractAttr(tag: string, attrName: string) {
  const match = tag.match(new RegExp(`\\b${attrName}=["']([^"']+)["']`, 'i'))
  return match?.[1] ?? ''
}

function timeoutToMs(value: string) {
  const match = value.match(/^(\d+)(ms|s)?$/)

  if (!match) {
    return 35000
  }

  const amount = Number(match[1])
  return match[2] === 'ms' ? amount : amount * 1000
}

async function dumpRenderedDom(url: string, userDataDir: string) {
  return new Promise<string>((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-extensions',
      '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      `--user-data-dir=${userDataDir}`,
      '--virtual-time-budget=5000',
      '--dump-dom',
      url,
    ]

    const child = spawn(chromePath, args, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      callback()
    }

    const killChrome = () => {
      if (!child.pid) return

      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch {
        child.kill('SIGKILL')
      }
    }

    const timer = setTimeout(() => {
      killChrome()
      finish(() => reject(new Error(`${url}: Chrome render timed out after ${chromeTimeout}. ${stderr.trim()}`)))
    }, timeoutToMs(chromeTimeout))

    child.stdout.on('data', (chunk: Buffer) => {
      if (stdout.length < maxChromeOutputBytes) {
        stdout += chunk.toString('utf8')
      }
    })

    child.stderr.on('data', (chunk: Buffer) => {
      if (stderr.length < 10000) {
        stderr += chunk.toString('utf8')
      }
    })

    child.on('error', (error) => {
      finish(() => reject(error))
    })

    child.on('close', (code, signal) => {
      finish(() => {
        if (code === 0 && stdout.trim()) {
          resolve(stdout)
          return
        }

        reject(new Error(`${url}: Chrome exited with code ${code ?? 'null'} signal ${signal ?? 'null'}. ${stderr.trim()}`))
      })
    })
  })
}

async function checkSitemap() {
  const response = await fetch(`${baseUrl}/sitemap.xml`)

  if (!response.ok) {
    throw new Error(`sitemap.xml returned ${response.status}`)
  }

  const xml = await response.text()
  const missing = requiredCanonicalPaths.filter((pagePath) => !xml.includes(`<loc>${canonicalUrl(pagePath)}</loc>`))

  if (missing.length > 0) {
    throw new Error(`sitemap.xml missing canonical URLs: ${missing.join(', ')}`)
  }

  console.log(`✅ sitemap.xml contains ${requiredCanonicalPaths.length} key canonical URLs`)
}

async function checkAllEquipmentPages() {
  const [catalogResponse, sitemapResponse] = await Promise.all([
    fetch(`${baseUrl}/api/equipment?limit=200`),
    fetch(`${baseUrl}/sitemap.xml`),
  ])

  if (!catalogResponse.ok) {
    throw new Error(`equipment catalog returned ${catalogResponse.status}`)
  }
  if (!sitemapResponse.ok) {
    throw new Error(`sitemap.xml returned ${sitemapResponse.status}`)
  }

  const payload = await catalogResponse.json() as { data?: CatalogEquipmentSeoItem[] }
  const items = payload.data ?? []
  if (items.length === 0) throw new Error('equipment catalog returned no items')

  const sitemap = await sitemapResponse.text()
  const equipmentPaths = extractEquipmentPathsFromSitemap(sitemap)
  validateCatalogSitemap(items, equipmentPaths)

  for (const item of items) {
    const response = await fetch(`${baseUrl}/equipment/${encodeURIComponent(item.slug)}`)
    if (!response.ok) {
      throw new Error(`${item.slug}: product page returned ${response.status}`)
    }
    validateEquipmentSsrHtml(await response.text(), item, canonicalOrigin)
  }

  console.log(`✅ Equipment SEO: ${items.length} catalog pages match sitemap and raw SSR`)
}

async function checkStaticCatalog(page: { path: string; minProducts: number }) {
  const url = absoluteUrl(page.path)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`${url}: static catalog returned ${response.status}`)
  }

  const html = await response.text()
  const result = validateRawCatalogHtml(html, url, page)
  console.log(`✅ ${result.mode === 'ssr' ? 'SSR' : 'Static'} catalog ${page.path}: ${result.productCount} products`)
}

async function checkPage(page: { path: string; canonicalPath: string }, userDataDir: string) {
  const url = absoluteUrl(page.path)
  let html = ''
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxRenderAttempts; attempt += 1) {
    try {
      html = await dumpRenderedDom(url, userDataDir)
      lastError = null
      break
    } catch (error) {
      lastError = error
      console.warn(`⚠️ SEO render retry ${attempt}/${maxRenderAttempts} failed for ${url}`)
    }
  }

  if (lastError) {
    throw lastError
  }
  const descriptions = findTags(html, 'meta', 'name', 'description')
  const canonicals = findTags(html, 'link', 'rel', 'canonical')

  if (descriptions.length !== 1) {
    throw new Error(`${url}: expected 1 meta description, got ${descriptions.length}`)
  }

  if (canonicals.length !== 1) {
    throw new Error(`${url}: expected 1 canonical, got ${canonicals.length}`)
  }

  const description = extractAttr(descriptions[0], 'content')
  const canonical = extractAttr(canonicals[0], 'href')
  const expectedCanonical = canonicalUrl(page.canonicalPath)

  if (description.trim().length < 40) {
    throw new Error(`${url}: meta description is too short`)
  }

  if (canonical !== expectedCanonical) {
    throw new Error(`${url}: expected canonical ${expectedCanonical}, got ${canonical}`)
  }

  if (staticCatalogPages.some((item) => item.path === page.canonicalPath) && html.includes('data-static-product-catalog="true"')) {
    throw new Error(`${url}: static product catalog remains after React render and would duplicate the visible catalog`)
  }

  console.log(`✅ SEO ${page.path} -> ${page.canonicalPath}`)
}

async function smokeSeo() {
  console.log(`🔎 SEO smoke base URL: ${baseUrl}`)
  console.log(`🔎 SEO canonical origin: ${canonicalOrigin}`)
  console.log(`🔎 Chrome: ${chromePath}`)

  if (!existsSync(chromePath)) {
    throw new Error(
      `Chrome/Chromium not found at ${chromePath}. Install chromium/google-chrome or set CHROME_PATH=/path/to/chrome.`,
    )
  }

  await checkSitemap()
  await checkAllEquipmentPages()

  for (const page of staticCatalogPages) {
    await checkStaticCatalog(page)
  }

  for (const page of pagesToCheck) {
    const userDataDir = await mkdtemp(path.join(tmpdir(), 'vozmimenya-seo-smoke-'))

    try {
      await checkPage(page, userDataDir)
    } finally {
      await rm(userDataDir, { recursive: true, force: true })
    }
  }

  console.log(`✅ SEO smoke check passed: ${pagesToCheck.length} rendered pages`)
}

smokeSeo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ SEO smoke check failed:', error)
    process.exit(1)
  })
