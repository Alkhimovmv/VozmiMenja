import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

describe('lead attribution persistence', () => {
  const tempDirectory = mkdtempSync(path.join(tmpdir(), 'vozmimenya-leads-'))
  const databasePath = path.join(tempDirectory, 'test.sqlite')
  let database: typeof import('./database').database
  let contactLeadModel: typeof import('./ContactLead').contactLeadModel
  let bookingModel: typeof import('./Booking').bookingModel

  beforeAll(async () => {
    process.env.DATABASE_PATH = databasePath
    jest.resetModules()
    ;({ database } = await import('./database'))
    ;({ contactLeadModel } = await import('./ContactLead'))
    ;({ bookingModel } = await import('./Booking'))
    await database.init()

    await database.run(`
      INSERT INTO equipment (
        id, name, category, price_per_day, quantity, available_quantity,
        images, description, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['camera', 'Camera', 'camera', 1000, 1, 1, '[]', 'Camera', '{}'])
  })

  afterAll(async () => {
    await database.close()
    rmSync(tempDirectory, { recursive: true, force: true })
  })

  it('persists and maps booking utmContent and scenario', async () => {
    const booking: any = await bookingModel.create({
      id: 'booking-attribution',
      equipmentId: 'camera',
      customerName: 'Иван Иванов',
      customerPhone: '89991234567',
      startDate: '2030-01-10',
      endDate: '2030-01-11',
      totalPrice: 1000,
      utmContent: 'account-2',
      scenario: 'travel-camera',
    } as any)

    expect(booking.utmContent).toBe('account-2')
    expect(booking.scenario).toBe('travel-camera')
  })

  it('persists contact context and maps sorted unique equipment IDs', async () => {
    const lead = await contactLeadModel.create({
      name: 'Иван',
      phone: '89991234567',
      subject: 'Аренда',
      message: 'Хочу арендовать комплект',
      utmContent: 'community-post',
      scenario: 'karaoke-kit',
      officeId: 2,
      officeName: 'Волжская',
      deliveryMethod: 'pickup',
      preferredContact: 'telegram',
      equipmentIds: ['microphone', 'speaker', 'microphone'],
    } as any)

    expect(lead).toMatchObject({
      utmContent: 'community-post',
      scenario: 'karaoke-kit',
      officeId: 2,
      officeName: 'Волжская',
      deliveryMethod: 'pickup',
      preferredContact: 'telegram',
      equipmentIds: ['microphone', 'speaker'],
    })

    const row = await database.get('SELECT equipment_ids FROM contact_leads WHERE id = ?', [lead.id])
    expect(row.equipment_ids).toBe('["microphone","speaker"]')
  })

  it('maps malformed legacy contact equipment IDs to an empty selection', async () => {
    const result = await database.run(`
      INSERT INTO contact_leads (name, phone, subject, message, equipment_ids)
      VALUES (?, ?, ?, ?, ?)
    `, ['Legacy', '89990000000', 'Other', 'Legacy message', '{broken'])

    await expect(contactLeadModel.findById(result.lastID)).resolves.toMatchObject({ equipmentIds: [] })
  })

  it('finds a recent duplicate by normalized phone, scenario, and equipment set', async () => {
    const created = await contactLeadModel.create({
      name: 'Анна',
      phone: '8 (999) 555-44-33',
      subject: 'Первый текст',
      message: 'Первое описание комплекта',
      scenario: 'karaoke-kit',
      equipmentIds: ['speaker', 'microphone'],
    } as any)

    const duplicate = await contactLeadModel.findRecentDuplicate({
      name: 'Анна',
      phone: '+7 999 555-44-33',
      subject: 'Другой текст',
      message: 'Совсем другое описание',
      scenario: 'karaoke-kit',
      equipmentIds: ['microphone', 'speaker', 'speaker'],
    } as any)

    expect(duplicate?.id).toBe(created.id)
  })

  it('keeps legacy subject and message duplicate matching without a scenario', async () => {
    const created = await contactLeadModel.create({
      name: 'Олег',
      phone: '89991112233',
      subject: 'Вопрос',
      message: 'Подскажите условия аренды',
    })

    await expect(contactLeadModel.findRecentDuplicate({
      name: 'Олег',
      phone: '+7 (999) 111-22-33',
      subject: 'Вопрос',
      message: 'Подскажите условия аренды',
    })).resolves.toMatchObject({ id: created.id })

    await expect(contactLeadModel.findRecentDuplicate({
      name: 'Олег',
      phone: '+7 (999) 111-22-33',
      subject: 'Другая тема',
      message: 'Подскажите условия аренды',
    })).resolves.toBeNull()
  })
})
