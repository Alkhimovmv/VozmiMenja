import redirects from '../content/redirects.json'
import seoMeta from '../content/seoMeta.json'

export type PublicRoute =
  | { kind: 'page'; path: string; cacheable: boolean }
  | { kind: 'equipment'; id: string; cacheable: true }
  | { kind: 'article'; slug: string; cacheable: true }
  | { kind: 'redirect'; location: string; cacheable: false }
  | { kind: 'admin' }
  | { kind: 'not-found'; cacheable: false }

const publicPages = new Set(Object.keys(seoMeta))
const redirectMap = redirects as Record<string, string>

const normalizePathname = (pathname: string) => pathname === '/'
  ? '/'
  : pathname.replace(/\/+$/, '')

const decodeSegment = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

export function resolvePublicRoute(input: string): PublicRoute {
  const url = new URL(input, 'https://vozmimenya.ru')
  const pathname = normalizePathname(url.pathname)

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return { kind: 'admin' }
  }

  const redirectTarget = redirectMap[pathname]
  if (redirectTarget) {
    return {
      kind: 'redirect',
      location: `${redirectTarget}${url.search}${url.hash}`,
      cacheable: false,
    }
  }

  const equipmentMatch = pathname.match(/^\/equipment\/([^/]+)$/)
  if (equipmentMatch) {
    const id = decodeSegment(equipmentMatch[1])
    return id
      ? { kind: 'equipment', id, cacheable: true }
      : { kind: 'not-found', cacheable: false }
  }

  const articleMatch = pathname.match(/^\/blog\/([^/]+)$/)
  if (articleMatch) {
    const slug = decodeSegment(articleMatch[1])
    return slug
      ? { kind: 'article', slug, cacheable: true }
      : { kind: 'not-found', cacheable: false }
  }

  if (publicPages.has(pathname)) {
    return {
      kind: 'page',
      path: pathname,
      cacheable: pathname !== '/booking' && pathname !== '/booking/success',
    }
  }

  return { kind: 'not-found', cacheable: false }
}
