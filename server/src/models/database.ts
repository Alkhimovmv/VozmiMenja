import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

const dbPath = path.join(__dirname, '../../database.sqlite')

class Database {
  private db: sqlite3.Database

  constructor() {
    // Открываем базу данных в режиме чтения и записи с созданием при отсутствии
    this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('❌ Ошибка открытия базы данных:', err)
        throw err
      }
    })
  }

  async init(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db))

    // Таблица для аренды помещений (VozmiMenja)
    await run(`
      CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price_per_day REAL NOT NULL,
        pricing TEXT,
        quantity INTEGER NOT NULL,
        available_quantity INTEGER NOT NULL,
        images TEXT NOT NULL,
        description TEXT NOT NULL,
        specifications TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Бронирования помещений (VozmiMenja)
    await run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_price REAL NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment (id)
      )
    `)

    // Таблица для оборудования (RentAdmin)
    await run(`
      CREATE TABLE IF NOT EXISTS rental_equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        description TEXT,
        base_price REAL NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица для аренды оборудования (RentAdmin)
    await run(`
      CREATE TABLE IF NOT EXISTS rentals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        needs_delivery INTEGER NOT NULL DEFAULT 0,
        delivery_address TEXT,
        rental_price REAL,
        delivery_price REAL,
        delivery_costs REAL,
        source TEXT NOT NULL CHECK (source IN ('авито', 'сайт', 'рекомендация', 'карты')),
        comment TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'overdue')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES rental_equipment (id) ON DELETE CASCADE
      )
    `)

    // Таблица для связи многие-ко-многим между арендой и оборудованием
    await run(`
      CREATE TABLE IF NOT EXISTS rental_equipment_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rental_id INTEGER NOT NULL,
        equipment_id INTEGER NOT NULL,
        instance_number INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rental_id) REFERENCES rentals (id) ON DELETE CASCADE,
        FOREIGN KEY (equipment_id) REFERENCES rental_equipment (id) ON DELETE CASCADE
      )
    `)

    // Добавляем колонку instance_number к существующим таблицам (миграция)
    try {
      await run(`
        ALTER TABLE rental_equipment_items ADD COLUMN instance_number INTEGER DEFAULT 1
      `)
    } catch (error: any) {
      // Игнорируем ошибку, если колонка уже существует
      if (!error.message?.includes('duplicate column name')) {
        throw error
      }
    }

    // Таблица расходов (RentAdmin)
    await run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        date DATETIME NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица статей блога
    await run(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        category TEXT NOT NULL,
        tags TEXT,
        author TEXT NOT NULL DEFAULT 'ВозьмиМеня',
        published INTEGER NOT NULL DEFAULT 0,
        views INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица ячеек постомата
    await run(`
      CREATE TABLE IF NOT EXISTS lockers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        locker_number TEXT NOT NULL UNIQUE,
        access_code TEXT NOT NULL,
        description TEXT,
        size TEXT NOT NULL DEFAULT 'medium',
        row_number INTEGER NOT NULL DEFAULT 1,
        position_in_row INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Добавляем поля size, row_number, position_in_row если их нет
    try {
      await run(`ALTER TABLE lockers ADD COLUMN size TEXT NOT NULL DEFAULT 'medium'`)
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        throw error
      }
    }

    try {
      await run(`ALTER TABLE lockers ADD COLUMN row_number INTEGER NOT NULL DEFAULT 1`)
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        throw error
      }
    }

    try {
      await run(`ALTER TABLE lockers ADD COLUMN position_in_row INTEGER NOT NULL DEFAULT 1`)
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        throw error
      }
    }

    // Добавляем поле items для хранения списка предметов в ячейке
    try {
      await run(`ALTER TABLE lockers ADD COLUMN items TEXT`)
    } catch (error: any) {
      if (!error.message?.includes('duplicate column name')) {
        throw error
      }
    }

    // Индексы для VozmiMenja
    await run(`
      CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_bookings_equipment_id ON bookings(equipment_id);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
    `)

    // Индексы для RentAdmin
    await run(`
      CREATE INDEX IF NOT EXISTS idx_rentals_equipment_id ON rentals(equipment_id);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(start_date, end_date);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_rental_equipment_items_rental_id ON rental_equipment_items(rental_id);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_rental_equipment_items_equipment_id ON rental_equipment_items(equipment_id);
    `)

    // Индексы для блога
    await run(`
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    `)
  }

  get instance(): sqlite3.Database {
    return this.db
  }

  // Helper methods with proper typing
  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err)
        else resolve(this)
      })
    })
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

export const database = new Database()

// Export helper functions
export const run = (sql: string, params: any[] = []) => database.run(sql, params)
export const get = (sql: string, params: any[] = []) => database.get(sql, params)
export const all = (sql: string, params: any[] = []) => database.all(sql, params)