import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

const dbPath = path.join(__dirname, '../../database.sqlite')

class Database {
  private db: sqlite3.Database

  constructor() {
    this.db = new sqlite3.Database(dbPath)
  }

  async init(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db))

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

    await run(`
      CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_bookings_equipment_id ON bookings(equipment_id);
    `)

    await run(`
      CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
    `)
  }

  get instance(): sqlite3.Database {
    return this.db
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