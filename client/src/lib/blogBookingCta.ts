export type ArticleBookingLink = {
  href: string
  label: string
  equipment: string
}

export function extractArticleBookingLinks(content: string): ArticleBookingLink[] {
  const links = [...content.matchAll(/\[([^\]]+)\]\((\/booking\?[^)]+)\)/g)]
  const unique = new Map<string, ArticleBookingLink>()

  for (const [, label, href] of links) {
    const params = new URLSearchParams(href.split('?')[1] || '')
    const equipment = params.get('equipment')?.trim()
    if (!equipment || unique.has(href)) continue
    unique.set(href, { href, label: label.trim(), equipment })
  }

  return [...unique.values()].slice(0, 3)
}

