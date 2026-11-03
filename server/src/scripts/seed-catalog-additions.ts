import { database, get, run, all } from '../models/database'

const PRODUCT_ID = 'jbl-partybox-wireless-microphones'
const PRODUCT_NAME = 'Микрофоны JBL'
const LEGACY_PRODUCT_NAME = 'Набор беспроводных микрофонов JBL PartyBox'
const PURCHASE_PRICE = 10_000

const pricing = {
  day1_10to20: 0,
  day1: 500,
  days2: 0,
  days3: 0,
  days4: 400,
  days7: 300,
  days14: 200,
  days30: 100,
  weekendDay: 0,
  weekendDay10to20: 0,
}

const description = 'Комплект из двух беспроводных вокальных микрофонов и передатчика для колонок с микрофонным входом 6,3 мм. Подходит для караоке, праздников и мероприятий.'

const specifications = {
  'Количество микрофонов': '2',
  'Тип': 'ручные динамические',
  'Подключение': 'беспроводное',
  'Разъём передатчика': 'Jack 6,3 мм',
  'Радиус действия': 'до 30 м',
  'Частотный диапазон': '50 Гц – 15 кГц',
  'Зарядка': 'USB Type-C',
}

async function seedCatalogAdditions() {
  try {
    await database.init()

    await run(`UPDATE equipment SET name = ? WHERE id = ?`, [PRODUCT_NAME, PRODUCT_ID])
    await run(`UPDATE rental_equipment SET name = ? WHERE name = ?`, [PRODUCT_NAME, LEGACY_PRODUCT_NAME])
    await run(`UPDATE rental_equipment SET base_price = ? WHERE name = ?`, [PURCHASE_PRICE, PRODUCT_NAME])

    await run(`
      INSERT OR IGNORE INTO equipment (
        id, name, category, price_per_day, pricing, quantity, available_quantity,
        images, description, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      PRODUCT_ID,
      PRODUCT_NAME,
      'Аудиооборудование',
      pricing.day1,
      JSON.stringify(pricing),
      4,
      4,
      JSON.stringify([
        'https://c.dns-shop.ru/thumb/st1/fit/500/500/3fa4cd7577856bf4a805c22eb92261fa/17308335de239047ccd63d1e5fac39c2a8b8cc0a7ac5a765314d08def597f832.jpg',
      ]),
      description,
      JSON.stringify(specifications),
    ])

    const offices = await all(`
      SELECT id, name
      FROM offices
      WHERE name LIKE 'Волж%' OR name LIKE 'Динамо%'
      ORDER BY id
    `) as Array<{ id: number; name: string }>

    if (offices.length !== 2) throw new Error('Не найдены оба офиса для добавления микрофонов')

    for (const office of offices) {
      await run(`
        INSERT INTO rental_equipment (
          name, quantity, description, base_price, catalog_equipment_id, office_id
        )
        SELECT ?, 2, ?, ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM rental_equipment WHERE name = ? AND office_id = ?
        )
      `, [PRODUCT_NAME, description, PURCHASE_PRICE, PRODUCT_ID, office.id, PRODUCT_NAME, office.id])

      const adminEquipment = await get(`
        SELECT id FROM rental_equipment WHERE name = ? AND office_id = ? LIMIT 1
      `, [PRODUCT_NAME, office.id]) as { id?: number } | undefined

      if (adminEquipment?.id) {
        await run(`
          INSERT OR IGNORE INTO rental_equipment_instances (equipment_id, instance_number)
          VALUES (?, 1), (?, 2)
        `, [adminEquipment.id, adminEquipment.id])
      }
    }

    console.log(`✅ Каталог: ${PRODUCT_NAME}`)
  } finally {
    await database.close()
  }
}

seedCatalogAdditions().catch((error) => {
  console.error('❌ Ошибка обновления каталога:', error)
  process.exit(1)
})
