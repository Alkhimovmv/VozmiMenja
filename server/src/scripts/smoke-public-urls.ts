const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:5173').replace(/\/$/, '')

const paths = [
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

async function checkUrl(path: string) {
  const url = `${baseUrl}${path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }

  return { url, status: response.status }
}

async function smokePublicUrls() {
  console.log(`🔎 Smoke base URL: ${baseUrl}`)

  const results = await Promise.all(paths.map(checkUrl))
  results.forEach((result) => console.log(`✅ ${result.status} ${result.url}`))
}

smokePublicUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Public URL smoke check failed:', error)
    process.exit(1)
  })
