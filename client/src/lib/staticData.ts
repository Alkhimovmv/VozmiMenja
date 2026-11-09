import type { Article, Equipment } from '../types'

// Данные, которые генератор статики (client/scripts/generate-static-route-entrypoints.js)
// кладёт в <script id="__STATIC_DATA__"> для статьи или карточки товара.
interface StaticData {
  route: string
  article?: Article
  equipment?: Equipment
}

let cached: StaticData | null | undefined

function readStaticData(): StaticData | null {
  if (cached !== undefined) return cached
  cached = null
  if (typeof document === 'undefined') return cached
  const element = document.getElementById('__STATIC_DATA__')
  if (!element?.textContent) return cached
  try {
    cached = JSON.parse(element.textContent) as StaticData
  } catch {
    cached = null
  }
  return cached
}

const normalizePath = (pathname: string) => {
  try {
    return decodeURIComponent(pathname).replace(/\/+$/, '') || '/'
  } catch {
    return pathname.replace(/\/+$/, '') || '/'
  }
}

// Отдаём данные только той странице, для которой они собраны: после SPA-перехода
// на другую статью или товар они не подходят.
function staticDataFor(pathname: string): StaticData | null {
  const data = readStaticData()
  if (!data || normalizePath(data.route) !== normalizePath(pathname)) return null
  return data
}

export function getStaticArticle(pathname: string): Article | undefined {
  return staticDataFor(pathname)?.article
}

export function getStaticEquipment(pathname: string): Equipment | undefined {
  return staticDataFor(pathname)?.equipment
}
