import {
  getPublishedArticles,
  getSeededArticleSlugs,
  missingSeededArticleSlugs,
  sleep,
} from './seeded-article-contract.mjs'

function numberArg(name, fallback) {
  const index = process.argv.indexOf(name)
  if (index === -1) return fallback
  const value = Number(process.argv[index + 1])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function canonicalHref(html) {
  const tag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0] || ''
  return tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || ''
}

async function responseText(url) {
  const response = await fetch(url, { headers: { accept: 'text/html,application/xml' } })
  const body = await response.text()

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }

  return body
}

async function checkRelease() {
  const expectedSlugs = await getSeededArticleSlugs()
  const articles = await getPublishedArticles(apiOrigin)
  const missingFromApi = missingSeededArticleSlugs(expectedSlugs, articles)

  if (missingFromApi.length > 0) {
    throw new Error(`Public API is missing seeded articles: ${missingFromApi.join(', ')}`)
  }

  const sitemap = await responseText(`${siteOrigin}/sitemap.xml`)
  const failures = []

  for (const slug of expectedSlugs) {
    const url = `${siteOrigin}/blog/${slug}`

    try {
      const html = await responseText(url)
      const expectedCanonical = url

      if (canonicalHref(html) !== expectedCanonical) {
        failures.push(`${slug}: canonical is ${canonicalHref(html) || 'missing'}`)
      }

      if (!html.includes('"@type":"BlogPosting"')) {
        failures.push(`${slug}: BlogPosting is missing`)
      }

      const sitemapPattern = new RegExp(`<loc>${escapeRegExp(expectedCanonical)}</loc>`)
      if (!sitemapPattern.test(sitemap)) {
        failures.push(`${slug}: sitemap entry is missing`)
      }
    } catch (error) {
      failures.push(`${slug}: ${error.message}`)
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join('\n'))
  }

  console.log(`✅ Article release smoke passed: ${expectedSlugs.length} API/pages/canonicals/schema/sitemap entries`)
}

const siteOrigin = (process.env.ARTICLE_SITE_ORIGIN || 'https://vozmimenya.ru').replace(/\/$/, '')
const apiOrigin = (process.env.ARTICLE_API_ORIGIN || 'https://api.vozmimenya.ru/api').replace(/\/$/, '')
const attempts = numberArg('--attempts', 1)
const intervalMs = Math.max(1_000, numberArg('--interval-ms', 10_000))

let lastError

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    await checkRelease()
    process.exit(0)
  } catch (error) {
    lastError = error
    console.warn(`⚠️ Article release smoke attempt ${attempt}/${attempts} failed: ${error.message}`)
    if (attempt < attempts) await sleep(intervalMs)
  }
}

throw lastError

