// Подбор похожих статей — общий для пререндера (scripts/generate-static-route-entrypoints.js)
// и React (BlogArticlePage.tsx), чтобы блок «Другие статьи по теме» совпадал в обеих версиях.
// Порядок: та же тематическая категория, затем число общих тегов, затем порядок списка (свежие выше).

export const RELATED_ARTICLES_LIMIT = 3

export const articleCategoryHubs = [
  { match: /пылесос|клининг|уборк/i, href: '/arenda-pylesosov-moskva', label: 'Пылесосы, Puzzi и пароочистители в аренду' },
  { match: /камер/i, href: '/arenda-gopro-moskva', label: 'GoPro, Insta360 и DJI в аренду' },
  { match: /аудио/i, href: '/arenda-audiooborudovaniya-moskva', label: 'Колонки JBL и микрофоны в аренду' },
]

function articleTags(article) {
  return new Set(String(article?.tags || '').toLowerCase().split(',').map((tag) => tag.trim()).filter(Boolean))
}

export function pickRelatedArticles(article, articles, limit = RELATED_ARTICLES_LIMIT) {
  const hub = articleCategoryHubs.find((item) => item.match.test(article.category || ''))
  const tags = articleTags(article)
  return articles
    .filter((other) => other?.slug && other.slug !== article.slug)
    .map((other, index) => {
      const sameHub = hub && hub.match.test(other.category || '') ? 10 : 0
      const sharedTags = [...articleTags(other)].filter((tag) => tags.has(tag)).length
      return { other, score: sameHub + sharedTags, index }
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ other }) => other)
}
