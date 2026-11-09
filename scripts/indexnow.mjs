// IndexNow: сообщаем Яндексу и Bing (а через них — Copilot) об изменённых страницах сразу после деплоя.
// Протокол: https://www.indexnow.org/documentation — одного POST на общий endpoint достаточно,
// дополнительно шлём в Яндекс напрямую, чтобы не зависеть от обмена между поисковиками.

export const INDEXNOW_ENDPOINTS = ['https://api.indexnow.org/indexnow', 'https://yandex.com/indexnow']
export const INDEXNOW_MAX_URLS = 10000

// { url: lastmod } из XML sitemap; lastmod может отсутствовать.
export function parseSitemap(xml) {
  const entries = new Map()
  for (const match of String(xml || '').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = match[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1]
    if (!loc) continue
    const lastmod = match[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] || ''
    entries.set(loc, lastmod)
  }
  return entries
}

// Новые и изменённые (другой lastmod) страницы, плюс исчезнувшие из sitemap: для них поисковик заберёт 404 или редирект.
export function changedUrls(oldEntries, newEntries) {
  const changed = []
  for (const [url, lastmod] of newEntries) {
    if (!oldEntries.has(url) || oldEntries.get(url) !== lastmod) changed.push(url)
  }
  for (const url of oldEntries.keys()) {
    if (!newEntries.has(url)) changed.push(url)
  }
  return changed
}

export function buildPayload({ siteOrigin, key, urls }) {
  const host = new URL(siteOrigin).host
  const urlList = [...new Set(urls)].filter((url) => {
    try {
      return new URL(url).host === host
    } catch {
      return false
    }
  }).slice(0, INDEXNOW_MAX_URLS)
  return {
    host,
    key,
    keyLocation: `${siteOrigin.replace(/\/$/, '')}/${key}.txt`,
    urlList,
  }
}
