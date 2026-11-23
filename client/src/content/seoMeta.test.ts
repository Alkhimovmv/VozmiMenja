import assert from 'node:assert/strict'
import fs from 'node:fs'
import seoMeta from './seoMeta.json'

// seoMeta.json — единый источник title/description/h1 для пререндера и SEO.tsx.
// Каждый статический маршрут генератора должен в нём быть, иначе пререндер и React снова разойдутся.
const generator = fs.readFileSync(new URL('../../scripts/generate-static-route-entrypoints.js', import.meta.url), 'utf8')
const staticRoutesBlock = generator.split('const staticRoutes = [')[1].split(']')[0]
const staticRoutes = [...staticRoutesBlock.matchAll(/'([^']+)'/g)].map((match) => match[1])

const meta: Record<string, { title?: string; description?: string; h1?: string }> = seoMeta

assert.ok(staticRoutes.length > 20, 'static routes parsed')
for (const route of staticRoutes) {
  const entry = meta[route]
  assert.ok(entry, `seoMeta.json: нет записи для ${route}`)
  assert.ok(entry.title && entry.title.length <= 70, `seoMeta.json: title ${route} пустой или длиннее 70`)
  assert.ok(entry.description && entry.description.length >= 40, `seoMeta.json: description ${route} короче 40`)
  assert.ok(entry.h1, `seoMeta.json: нет h1 для ${route}`)
}

console.log('seo meta tests passed')
