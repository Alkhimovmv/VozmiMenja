import fs from 'fs/promises'
import path from 'path'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const SITE_URL = 'https://vozmimenya.ru'
const dbPath = path.resolve(__dirname, '../../database.sqlite')
const sitemapPath = path.resolve(__dirname, '../../../client/public/sitemap.xml')

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: string
}

interface EquipmentRow {
  id: string
  updated_at?: string
  created_at?: string
}

interface ArticleRow {
  slug: string
  updated_at?: string
  created_at?: string
}

const staticUrls: SitemapUrl[] = [
  { loc: '/', lastmod: today(), changefreq: 'daily', priority: '1.0' },
  { loc: '/arenda-pylesosov-moskva', lastmod: today(), changefreq: 'weekly', priority: '0.9' },
  { loc: '/arenda-gopro-moskva', lastmod: today(), changefreq: 'weekly', priority: '0.9' },
  { loc: '/arenda-audiooborudovaniya-moskva', lastmod: today(), changefreq: 'weekly', priority: '0.9' },
  { loc: '/blog', lastmod: today(), changefreq: 'weekly', priority: '0.8' },
  { loc: '/sitemap', lastmod: today(), changefreq: 'weekly', priority: '0.6' },
  { loc: '/about', lastmod: today(), changefreq: 'weekly', priority: '0.8' },
  { loc: '/contact', lastmod: today(), changefreq: 'monthly', priority: '0.8' },
  { loc: '/delivery', lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: '/faq', lastmod: today(), changefreq: 'monthly', priority: '0.7' },
  { loc: '/privacy', lastmod: today(), changefreq: 'yearly', priority: '0.3' },
  { loc: '/cookies', lastmod: today(), changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', lastmod: today(), changefreq: 'yearly', priority: '0.3' },
  { loc: '/offer', lastmod: today(), changefreq: 'yearly', priority: '0.3' },
  { loc: '/rental-agreement', lastmod: today(), changefreq: 'yearly', priority: '0.3' },
  { loc: '/requisites', lastmod: today(), changefreq: 'yearly', priority: '0.3' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function toDateOnly(value?: string) {
  if (!value) return today()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? today() : date.toISOString().slice(0, 10)
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildXml(urls: SitemapUrl[]) {
  const items = urls
    .map((url) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${url.loc}`)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`)
    .join('\n\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${items}

</urlset>
`
}

async function generateSitemap() {
  const db = new sqlite3.Database(dbPath)
  const all = promisify(db.all.bind(db))

  try {
    const equipmentRows = await all(`
      SELECT id, updated_at, created_at
      FROM equipment
      ORDER BY updated_at DESC, created_at DESC
    `) as EquipmentRow[]

    const articleRows = await all(`
      SELECT slug, updated_at, created_at
      FROM articles
      WHERE published = 1
      ORDER BY updated_at DESC, created_at DESC
    `) as ArticleRow[]

    const dynamicUrls: SitemapUrl[] = [
      ...equipmentRows.map((item) => ({
        loc: `/equipment/${item.id}`,
        lastmod: toDateOnly(item.updated_at || item.created_at),
        changefreq: 'weekly' as const,
        priority: '0.8',
      })),
      ...articleRows.map((article) => ({
        loc: `/blog/${article.slug}`,
        lastmod: toDateOnly(article.updated_at || article.created_at),
        changefreq: 'monthly' as const,
        priority: '0.7',
      })),
    ]

    const urls = [...staticUrls, ...dynamicUrls]
    await fs.writeFile(sitemapPath, buildXml(urls), 'utf8')
    console.log(`✅ Sitemap generated: ${urls.length} URLs -> ${sitemapPath}`)
  } finally {
    await new Promise<void>((resolve, reject) => {
      db.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
}

generateSitemap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Sitemap generation failed:', error)
    process.exit(1)
  })
