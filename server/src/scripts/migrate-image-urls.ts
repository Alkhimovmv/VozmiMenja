import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

const dbPath = path.join(__dirname, '../../database.sqlite')

async function migrate() {
  const db = new sqlite3.Database(dbPath)
  const run = promisify(db.run.bind(db))
  const all = promisify(db.all.bind(db))

  try {
    console.log('🔄 Начало миграции URL картинок...')

    // Получаем все записи оборудования
    const equipment = await all('SELECT id, images FROM equipment') as Array<{ id: string; images: string }>

    let updatedCount = 0
    let totalImages = 0

    for (const item of equipment) {
      try {
        const images = JSON.parse(item.images)
        let hasChanges = false

        // Заменяем localhost:3002 на относительные пути
        const updatedImages = images.map((img: string) => {
          totalImages++
          if (img.includes('localhost:3002')) {
            hasChanges = true
            // Заменяем http://localhost:3002/uploads/file.jpg на /uploads/file.jpg
            return img.replace('http://localhost:3002', '')
          }
          if (img.includes('localhost:3001')) {
            hasChanges = true
            // Также заменяем localhost:3001 если такие есть
            return img.replace('http://localhost:3001', '')
          }
          return img
        })

        if (hasChanges) {
          // Обновляем запись в БД
          await run(
            'UPDATE equipment SET images = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(updatedImages), item.id]
          )
          updatedCount++
          console.log(`✅ Обновлено оборудование: ${item.id}`)
        }
      } catch (error) {
        console.error(`❌ Ошибка обработки ${item.id}:`, error)
      }
    }

    console.log('\n📊 Результаты миграции:')
    console.log(`   Всего записей оборудования: ${equipment.length}`)
    console.log(`   Обновлено записей: ${updatedCount}`)
    console.log(`   Всего картинок обработано: ${totalImages}`)
    console.log('\n✅ Миграция завершена успешно')
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
    throw error
  } finally {
    await new Promise<void>((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
