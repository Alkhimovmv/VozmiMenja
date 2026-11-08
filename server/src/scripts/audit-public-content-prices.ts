import { database } from '../models/database'
import { getPublicContentPriceAuditReport } from '../services/publicContentPriceAuditReport'

async function audit() {
  const report = await getPublicContentPriceAuditReport()

  if (report.issues.length > 0) {
    console.error('❌ Проверка публичных цен нашла расхождения:')
    report.issues.forEach((issue) => console.error(`- ${issue.location}: ${issue.message}`))
    process.exitCode = 1
    return
  }

  console.log(`✅ Публичные цены согласованы с каталогом: проверено ${report.equipmentCount} позиций и ${report.articleCount} статьи`)
}

audit()
  .catch((error) => {
    console.error('❌ Не удалось проверить публичные цены:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await database.close()
  })
