import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_ORIGIN = 'https://vozmimenya.ru'

const fallbackRoutes = [
  '/arenda-pylesosov-moskva',
  '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva',
  '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva',
  '/arenda-mikrofona-dlya-intervyu-moskva',
  '/arenda-kolonki-dlya-vecherinki-moskva',
  '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva',
  '/arenda-gopro-moskva',
  '/arenda-audiooborudovaniya-moskva',
  '/blog',
  '/sitemap',
  '/about',
  '/contact',
  '/delivery',
  '/faq',
  '/privacy',
  '/return-policy',
  '/cookies',
  '/terms',
  '/offer',
  '/rental-agreement',
  '/requisites',
]

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const clientDir = path.resolve(scriptDir, '..')
const distDir = path.resolve(clientDir, 'dist')
const distIndexPath = path.join(distDir, 'index.html')
const distSitemapPath = path.join(distDir, 'sitemap.xml')

function normalizeRoute(rawPathname) {
  if (!rawPathname || rawPathname === '/') return null

  const withoutTrailingSlash = rawPathname.replace(/\/+$/, '')
  const decoded = decodeURIComponent(withoutTrailingSlash)
  const normalized = path.posix.normalize(decoded)

  if (!normalized.startsWith('/') || normalized.includes('\0') || normalized.includes('..')) {
    return null
  }

  return normalized
}

function assertInsideDist(outputPath, route) {
  const relativeOutput = path.relative(distDir, outputPath)

  if (relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) {
    throw new Error(`Refusing to write outside dist for route: ${route}`)
  }
}

function routeIndexOutputPath(route) {
  const relativeRoute = route.replace(/^\/+/, '')
  const outputPath = path.resolve(distDir, relativeRoute, 'index.html')
  assertInsideDist(outputPath, route)

  return outputPath
}

function routeHtmlOutputPath(route) {
  const relativeRoute = route.replace(/^\/+/, '')
  const outputPath = path.resolve(distDir, `${relativeRoute}.html`)
  assertInsideDist(outputPath, route)

  return outputPath
}

async function getRoutesFromSitemap() {
  try {
    const sitemap = await fs.readFile(distSitemapPath, 'utf8')
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

    const routes = locs
      .map((loc) => {
        try {
          const url = new URL(loc)
          if (url.origin !== SITE_ORIGIN) return null
          return normalizeRoute(url.pathname)
        } catch {
          return normalizeRoute(loc)
        }
      })
      .filter(Boolean)

    return [...new Set(routes)]
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    return fallbackRoutes
  }
}

async function main() {
  const indexHtml = await fs.readFile(distIndexPath, 'utf8')
  const routes = await getRoutesFromSitemap()

  await Promise.all(
    routes.map(async (route) => {
      const indexOutputPath = routeIndexOutputPath(route)
      const htmlOutputPath = routeHtmlOutputPath(route)

      await fs.mkdir(path.dirname(indexOutputPath), { recursive: true })
      await fs.mkdir(path.dirname(htmlOutputPath), { recursive: true })
      await fs.writeFile(indexOutputPath, indexHtml, 'utf8')
      await fs.writeFile(htmlOutputPath, indexHtml, 'utf8')
    }),
  )

  console.log(`Static route entrypoints generated: ${routes.length} routes, ${routes.length * 2} files`)
}

main().catch((error) => {
  console.error('Static route entrypoint generation failed:', error)
  process.exit(1)
})
