import fs from 'node:fs/promises'
import path from 'node:path'
import {
  getPublishedArticles,
  getSeededArticleSlugs,
  missingSeededArticleSlugs,
  repositoryRoot,
  resolveRedirectPath,
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

async function responseResource(url) {
  const response = await fetch(url, { headers: { accept: 'text/html,application/xml' } })
  const body = await response.text()

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }

  return { body, finalUrl: response.url }
}

async function checkRelease() {
  const expectedSlugs = await getSeededArticleSlugs()
  const redirects = JSON.parse(await fs.readFile(
    path.join(repositoryRoot, 'client/src/content/redirects.json'),
    'utf8',
  ))
  const articles = await getPublishedArticles(apiOrigin)
  const missingFromApi = missingSeededArticleSlugs(expectedSlugs, articles)

  if (missingFromApi.length > 0) {
    throw new Error(`Public API is missing seeded articles: ${missingFromApi.join(', ')}`)
  }

  const { body: sitemap } = await responseResource(`${siteOrigin}/sitemap.xml`)
  const failures = []

  for (const slug of expectedSlugs) {
    const publicPath = resolveRedirectPath(`/blog/${slug}`, redirects)
    const sourceUrl = `${siteOrigin}/blog/${slug}`
    const expectedCanonical = `${siteOrigin}${publicPath}`

    try {
      const sourcePage = await responseResource(sourceUrl)
      let html = sourcePage.body

      if (sourceUrl !== expectedCanonical) {
        if (canonicalHref(sourcePage.body) !== expectedCanonical) {
          failures.push(`${slug}: redirect canonical is ${canonicalHref(sourcePage.body) || 'missing'}`)
        }
        const targetPage = await responseResource(expectedCanonical)
        html = targetPage.body
      } else if (sourcePage.finalUrl !== expectedCanonical) {
        failures.push(`${slug}: final URL is ${sourcePage.finalUrl}`)
      }

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

