import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

const dbPath = path.join(__dirname, '../../database.sqlite')

async function migrate() {
  const db = new sqlite3.Database(dbPath)
  const run = promisify(db.run.bind(db))

  try {
    console.log('🔄 Начало миграции базы данных...')

    // Проверяем, существует ли уже колонка pricing
    const all = promisify(db.all.bind(db))
    const columns = await all(`PRAGMA table_info(equipment)`) as any[]

    const hasPricing = columns.some(col => col.name === 'pricing')

    if (!hasPricing) {
      console.log('📝 Добавление колонки pricing...')
      await run('ALTER TABLE equipment ADD COLUMN pricing TEXT')
      console.log('✅ Колонка pricing добавлена')
    } else {
      console.log('ℹ️  Колонка pricing уже существует')
    }

    console.log('✅ Миграция завершена успешно')
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
