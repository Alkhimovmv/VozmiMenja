import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'

const dbPath = path.join(__dirname, '../../database.sqlite')
const dryRun = process.argv.includes('--dry-run')

const db = new sqlite3.Database(dbPath)

const all = <T = any>(sql: string, params: any[] = []) =>
  new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows as T[]))
  })

const run = (sql: string, params: any[] = []) =>
  new Promise<sqlite3.RunResult>((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve(this)
    })
  })

type MismatchRow = {
  item_id: number
  rental_id: number
  rental_equipment_id: number
  rental_office_id: number
  source_equipment_id: number
  source_equipment_name: string
  source_instance_number: number
  source_equipment_office_id: number
  target_equipment_id: number | null
  target_quantity: number | null
}

async function main() {
  const mismatches = await all<MismatchRow>(`
    SELECT
      rei.id AS item_id,
      r.id AS rental_id,
      r.equipment_id AS rental_equipment_id,
      r.office_id AS rental_office_id,
      rei.equipment_id AS source_equipment_id,
      re.name AS source_equipment_name,
      rei.instance_number AS source_instance_number,
      re.office_id AS source_equipment_office_id,
      target.id AS target_equipment_id,
      target.quantity AS target_quantity
    FROM rental_equipment_items rei
    JOIN rentals r ON r.id = rei.rental_id
    JOIN rental_equipment re ON re.id = rei.equipment_id
    LEFT JOIN rental_equipment target
      ON target.office_id = r.office_id
     AND target.name = re.name
    WHERE r.office_id IS NOT NULL
      AND re.office_id IS NOT NULL
      AND r.office_id != re.office_id
    ORDER BY r.id ASC, rei.id ASC
  `)

  const repairable = mismatches.filter((row) => row.target_equipment_id && row.target_quantity && row.target_quantity > 0)
  const blocked = mismatches.filter((row) => !row.target_equipment_id || !row.target_quantity || row.target_quantity <= 0)

  console.log(`Найдено несовпадающих связей: ${mismatches.length}`)
  console.log(`Можно исправить автоматически: ${repairable.length}`)
  console.log(`Нужна ручная проверка: ${blocked.length}`)

  if (blocked.length > 0) {
    console.table(blocked.map((row) => ({
      rental_id: row.rental_id,
      item_id: row.item_id,
      equipment: row.source_equipment_name,
      rental_office_id: row.rental_office_id,
      equipment_office_id: row.source_equipment_office_id,
    })))
  }

  if (repairable.length === 0 || dryRun) {
    console.table(repairable.map((row) => ({
      rental_id: row.rental_id,
      item_id: row.item_id,
      from: `${row.source_equipment_id}#${row.source_instance_number}`,
      to: `${row.target_equipment_id}#${Math.min(row.source_instance_number, row.target_quantity!)}`,
      equipment: row.source_equipment_name,
    })))
    return
  }

  const backupPath = `${dbPath}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`
  fs.copyFileSync(dbPath, backupPath)
  console.log(`Бэкап базы создан: ${backupPath}`)

  await run('BEGIN TRANSACTION')
  try {
    for (const row of repairable) {
      const nextInstanceNumber = Math.min(row.source_instance_number, row.target_quantity!)

      await run(`
        UPDATE rental_equipment_items
        SET equipment_id = ?, instance_number = ?
        WHERE id = ?
      `, [row.target_equipment_id, nextInstanceNumber, row.item_id])

      if (row.rental_equipment_id === row.source_equipment_id) {
        await run(`
          UPDATE rentals
          SET equipment_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [row.target_equipment_id, row.rental_id])
      }
    }

    await run('COMMIT')
    console.log(`Исправлено связей: ${repairable.length}`)
  } catch (error) {
    await run('ROLLBACK')
    throw error
  }
}

main()
  .catch((error) => {
    console.error('Ошибка ремонта связей аренд:', error)
    process.exitCode = 1
  })
  .finally(() => db.close())
