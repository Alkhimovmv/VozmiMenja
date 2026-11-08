import fs from 'fs/promises'
import path from 'path'
import { all, database } from '../models/database'
import { auditPublicContentPrices, CatalogPriceRow } from '../domain/publicContentPriceAudit'

const projectRoot = path.resolve(__dirname, '../../..')

const read = (relativePath: string) => fs.readFile(path.join(projectRoot, relativePath), 'utf8')

async function audit() {
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
  const issues = auditPublicContentPrices(equipment, { business, home, faq, karaoke, booking, delivery, articles })

  if (issues.length > 0) {
    console.error('❌ Проверка публичных цен нашла расхождения:')
    issues.forEach((issue) => console.error(`- ${issue.location}: ${issue.message}`))
    process.exitCode = 1
    return
  }

  console.log(`✅ Публичные цены согласованы с каталогом: проверено ${equipment.length} позиций и ${articleRows.length} статьи`)
}

audit()
  .catch((error) => {
    console.error('❌ Не удалось проверить публичные цены:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await database.close()
  })
