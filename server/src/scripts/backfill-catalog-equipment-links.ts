import { database, all, run } from '../models/database'
import { planCatalogEquipmentLinkBackfill } from '../domain/catalogEquipmentLinks'

interface CatalogRow {
  id: string
  name: string
}

interface RentalEquipmentRow {
  id: number
  name: string
  office_id: number | null
  catalog_equipment_id: string | null
}

async function backfillCatalogEquipmentLinks() {
  try {
    await database.init()

    const catalogEquipment = await all(`
      SELECT id, name
      FROM equipment
      ORDER BY id ASC
    `) as CatalogRow[]
    const rentalEquipment = await all(`
      SELECT id, name, office_id, catalog_equipment_id
      FROM rental_equipment
      ORDER BY id ASC
    `) as RentalEquipmentRow[]

    const plan = planCatalogEquipmentLinkBackfill(
      catalogEquipment,
      rentalEquipment.map((item) => ({
        id: item.id,
        name: item.name,
        officeId: item.office_id,
        catalogEquipmentId: item.catalog_equipment_id,
      })),
    )

    await run('BEGIN TRANSACTION')
    try {
      for (const update of plan.updates) {
        await run(`
          UPDATE rental_equipment
          SET catalog_equipment_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND catalog_equipment_id IS NULL
        `, [update.catalogEquipmentId, update.rentalEquipmentId])
      }
      await run('COMMIT')
    } catch (error) {
      await run('ROLLBACK')
      throw error
    }

    console.log(`✅ Связано с каталогом: ${plan.updates.length}`)
    if (plan.skipped.length > 0) {
      console.log(`⚠️ Нужна ручная привязка: ${plan.skipped.length}`)
      console.table(plan.skipped)
    }
  } finally {
    await database.close()
  }
}

backfillCatalogEquipmentLinks().catch((error) => {
  console.error('❌ Ошибка привязки офисного оборудования к каталогу:', error)
  process.exit(1)
})
