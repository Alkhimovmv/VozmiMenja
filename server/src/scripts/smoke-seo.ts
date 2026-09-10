import { execFile } from 'child_process'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const defaultBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://vozmimenya.ru'
  : 'http://localhost:5173'

const baseUrl = (process.env.SMOKE_BASE_URL || defaultBaseUrl).replace(/\/$/, '')
const canonicalOrigin = (process.env.SMOKE_CANONICAL_ORIGIN || 'https://vozmimenya.ru').replace(/\/$/, '')
const chromePath = process.env.CHROME_PATH || '/usr/bin/google-chrome'

const pagesToCheck = [
  { path: '/', canonicalPath: '/' },
  { path: '/?category=Камеры', canonicalPath: '/arenda-gopro-moskva' },
  { path: '/?category=Пылесосы%2C%20уборка%20и%20клининг', canonicalPath: '/arenda-pylesosov-moskva' },
  { path: '/?category=Аудиооборудование', canonicalPath: '/arenda-audiooborudovaniya-moskva' },
  { path: '/arenda-pylesosov-moskva', canonicalPath: '/arenda-pylesosov-moskva' },
  { path: '/arenda-gopro-moskva', canonicalPath: '/arenda-gopro-moskva' },
  { path: '/arenda-audiooborudovaniya-moskva', canonicalPath: '/arenda-audiooborudovaniya-moskva' },
  { path: '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva', canonicalPath: '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva' },
  { path: '/arenda-kolonki-dlya-vecherinki-moskva', canonicalPath: '/arenda-kolonki-dlya-vecherinki-moskva' },
  { path: '/arenda-kamery-dlya-puteshestviya-vloga-moskva', canonicalPath: '/arenda-kamery-dlya-puteshestviya-vloga-moskva' },
  { path: '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva', canonicalPath: '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva' },
  { path: '/kak-prohodit-arenda-tehniki', canonicalPath: '/kak-prohodit-arenda-tehniki' },
  { path: '/about', canonicalPath: '/about' },
  { path: '/rental-agreement', canonicalPath: '/rental-agreement' },
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

async function dumpRenderedDom(url: string, userDataDir: string) {
  const { stdout } = await execFileAsync('timeout', [
    '25s',
    chromePath,
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
  ], {
    maxBuffer: 5 * 1024 * 1024,
  })

  return stdout
}

async function checkSitemap() {
  const response = await fetch(`${baseUrl}/sitemap.xml`)

  if (!response.ok) {
    throw new Error(`sitemap.xml returned ${response.status}`)
  }

  const xml = await response.text()
  const requiredCanonicalPaths = [...new Set(pagesToCheck.map((page) => page.canonicalPath).filter((pagePath) => pagePath !== '/'))]
  const missing = requiredCanonicalPaths.filter((pagePath) => !xml.includes(`<loc>${canonicalUrl(pagePath)}</loc>`))

  if (missing.length > 0) {
    throw new Error(`sitemap.xml missing canonical URLs: ${missing.join(', ')}`)
  }

  console.log(`✅ sitemap.xml contains ${requiredCanonicalPaths.length} key canonical URLs`)
}

async function checkPage(page: { path: string; canonicalPath: string }, userDataDir: string) {
  const url = absoluteUrl(page.path)
  const html = await dumpRenderedDom(url, userDataDir)
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

  console.log(`✅ SEO ${page.path} -> ${page.canonicalPath}`)
}

async function smokeSeo() {
  console.log(`🔎 SEO smoke base URL: ${baseUrl}`)
  console.log(`🔎 SEO canonical origin: ${canonicalOrigin}`)
  console.log(`🔎 Chrome: ${chromePath}`)

  await checkSitemap()

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
