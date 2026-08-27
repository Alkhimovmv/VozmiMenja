const defaultBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://vozmimenya.ru'
  : 'http://localhost:5173'

const baseUrl = (process.env.SMOKE_BASE_URL || defaultBaseUrl).replace(/\/$/, '')
const sitemapLimit = Number(process.env.SMOKE_SITEMAP_LIMIT || 25)

const requiredPaths = [
  '/',
  '/arenda-pylesosov-moskva',
  '/arenda-gopro-moskva',
  '/arenda-audiooborudovaniya-moskva',
  '/blog',
  '/sitemap',
  '/contact',
  '/faq',
  '/delivery',
  '/sitemap.xml',
]

function toPath(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}` || '/'
  } catch {
    return url.startsWith('/') ? url : `/${url}`
  }
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

async function getSitemapPaths() {
  const response = await fetch(`${baseUrl}/sitemap.xml`)

  if (!response.ok) {
    throw new Error(`${baseUrl}/sitemap.xml returned ${response.status}`)
  }

  const xml = await response.text()
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => toPath(match[1]))
    .slice(0, sitemapLimit)
}

async function checkUrl(path: string) {
  const url = `${baseUrl}${path}`
  const response = await fetch(url, { redirect: 'manual' })

  if (response.status < 200 || response.status >= 400) {
    throw new Error(`${url} returned ${response.status}`)
  }

  return { url, status: response.status }
}

async function smokePublicUrls() {
  console.log(`🔎 Smoke base URL: ${baseUrl}`)
  console.log(`🔎 Sitemap sample limit: ${sitemapLimit}`)

  const sitemapPaths = await getSitemapPaths()
  const paths = unique([...requiredPaths, ...sitemapPaths])
  const results = await Promise.all(paths.map(checkUrl))
  results.forEach((result) => console.log(`✅ ${result.status} ${result.url}`))
  console.log(`✅ Public URL smoke check passed: ${results.length} URLs`)
}

smokePublicUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Public URL smoke check failed:', error)
    process.exit(1)
  })
