import fs from 'fs/promises'
import path from 'path'
import { all } from '../models/database'
import {
  auditPublicContentPrices,
  type CatalogPriceRow,
  type ContentPriceIssue,
} from '../domain/publicContentPriceAudit'

const projectRoot = path.resolve(__dirname, '../../..')
const read = (relativePath: string) => fs.readFile(path.join(projectRoot, relativePath), 'utf8')

export type PublicContentPriceAuditReport = {
  checkedAt: string
  equipmentCount: number
  articleCount: number
  issues: ContentPriceIssue[]
}

export async function getPublicContentPriceAuditReport(): Promise<PublicContentPriceAuditReport> {
  const [business, home, faq, karaoke, booking, delivery, equipment, articleRows] = await Promise.all([
    read('client/src/content/business.json'),
    read('client/src/pages/HomePage.tsx'),
    read('client/src/content/faq.json'),
    read('client/src/pages/KaraokeKitRentalPage.tsx'),
    read('client/src/pages/SelfServiceBookingPage.tsx'),
    read('client/src/pages/DeliveryPage.tsx'),
    all('SELECT name, price_per_day, pricing FROM equipment') as Promise<CatalogPriceRow[]>,
    all(`
      SELECT slug, content, excerpt
      FROM articles
      WHERE published = 1 AND slug IN (
        'gopro-dlya-nachinayushchih-polnoe-rukovodstvo',
        'professionalny-pylesy-dlya-klininga',
        'top-3-kamery-dlya-svadeb-2025',
        'kachestvennyj-zvuk-dlya-video-dji-mic-2'
      )
    `) as Promise<Array<{ slug: string; content: string; excerpt: string }>>,
  ])

  const articles = Object.fromEntries(articleRows.map((row) => [row.slug, `${row.excerpt}\n${row.content}`]))
  const issues = auditPublicContentPrices(equipment, {
    business,
    home,
    faq,
    karaoke,
    booking,
    delivery,
    articles,
  })

  return {
    checkedAt: new Date().toISOString(),
    equipmentCount: equipment.length,
    articleCount: articleRows.length,
    issues,
  }
}
