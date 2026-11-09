import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
export const repositoryRoot = path.resolve(scriptsDir, '..')

export function extractSeededArticleSlugs(source) {
  return [...source.matchAll(/\bslug:\s*(['"])([^'"\n]+)\1/g)]
    .map((match) => match[2].trim())
    .filter(Boolean)
}

export async function getSeededArticleSlugs(root = repositoryRoot) {
  const articleScriptsDir = path.join(root, 'server/src/scripts')
  const filenames = (await fs.readdir(articleScriptsDir))
    .filter((filename) => filename.endsWith('.ts') && filename.includes('article'))
    .sort()

  const sources = await Promise.all(
    filenames.map((filename) => fs.readFile(path.join(articleScriptsDir, filename), 'utf8')),
  )

  return [...new Set(sources.flatMap(extractSeededArticleSlugs))].sort()
}

export function articleItemsFromPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: { accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }

  return response.json()
}

export async function getPublishedArticles(apiOrigin, fetchImpl = fetch) {
  const origin = apiOrigin.replace(/\/$/, '')

  try {
    return articleItemsFromPayload(await fetchJson(`${origin}/articles/recent?limit=200`, fetchImpl))
  } catch (recentError) {
    try {
      return articleItemsFromPayload(await fetchJson(`${origin}/articles`, fetchImpl))
    } catch {
      throw recentError
    }
  }
}

export function missingSeededArticleSlugs(expectedSlugs, articles) {
  const publishedSlugs = new Set(
    articles
      .filter((article) => article?.published !== false && article?.published !== 0)
      .map((article) => String(article.slug || '')),
  )

  return expectedSlugs.filter((slug) => !publishedSlugs.has(slug))
}

export function resolveRedirectPath(initialPath, redirects) {
  let currentPath = initialPath
  const visited = new Set()

  while (redirects[currentPath]) {
    if (visited.has(currentPath)) {
      throw new Error(`Redirect loop detected for ${initialPath}`)
    }
    visited.add(currentPath)
    currentPath = redirects[currentPath]
  }

  return currentPath
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

