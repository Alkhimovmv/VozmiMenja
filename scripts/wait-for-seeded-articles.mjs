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
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

const apiOrigin = process.env.ARTICLE_API_ORIGIN || 'https://api.vozmimenya.ru/api'
const timeoutMs = numberArg('--timeout-ms', 0)
const intervalMs = Math.max(1_000, numberArg('--interval-ms', 15_000))
const deadline = Date.now() + timeoutMs
const expectedSlugs = await getSeededArticleSlugs()

if (expectedSlugs.length === 0) {
  throw new Error('Seeded article contract is empty')
}

let attempt = 0

while (true) {
  attempt += 1

  try {
    const articles = await getPublishedArticles(apiOrigin)
    const missing = missingSeededArticleSlugs(expectedSlugs, articles)

    if (missing.length === 0) {
      console.log(`✅ Article API is ready: ${expectedSlugs.length} seeded articles`)
      break
    }

    console.log(`⏳ Article API is waiting for ${missing.length} seeded articles: ${missing.join(', ')}`)
  } catch (error) {
    console.log(`⏳ Article API attempt ${attempt} failed: ${error.message}`)
  }

  if (Date.now() >= deadline) {
    throw new Error(`Article API did not satisfy the seed contract within ${timeoutMs} ms`)
  }

  await sleep(Math.min(intervalMs, Math.max(0, deadline - Date.now())))
}

