import express from 'express'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import request from 'supertest'

jest.mock('../services/scheduler', () => ({
  schedulerService: { sendDailyRentalsReminder: jest.fn() },
}))
jest.mock('../services/emailBackup', () => ({
  emailBackupService: { sendDatabaseBackup: jest.fn() },
}))

describe('admin lead workflow routes', () => {
  const tempDirectory = mkdtempSync(path.join(tmpdir(), 'vozmimenya-admin-workflow-'))
  const databasePath = path.join(tempDirectory, 'test.sqlite')
  let database: typeof import('../models/database').database
  let bookingModel: typeof import('../models/Booking').bookingModel
  let contactLeadModel: typeof import('../models/ContactLead').contactLeadModel
  let signToken: typeof import('../middleware/auth').signToken
  let app: express.Express
  let adminOneToken: string
  let adminTwoToken: string
  let superadminToken: string
  let adminOneId: number
  let adminTwoId: number
  let officeTwoId: number
  let officeOneLeadId: number
  let officeOneDeleteLeadId: number
  let officeTwoLeadId: number
  let legacyLeadId: number

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

  beforeAll(async () => {
    process.env.DATABASE_PATH = databasePath
    jest.resetModules()
    ;({ database } = await import('../models/database'))
    ;({ bookingModel } = await import('../models/Booking'))
    ;({ contactLeadModel } = await import('../models/ContactLead'))
    ;({ signToken } = await import('../middleware/auth'))
    const { default: adminRouter } = await import('./admin')

    await database.init()

    const adminOne = await database.run(`
      INSERT INTO admin_users (phone, password_hash, role, name)
      VALUES ('79990000001', 'not-used', 'admin', 'Admin One')
    `)
    const adminTwo = await database.run(`
      INSERT INTO admin_users (phone, password_hash, role, name)
      VALUES ('79990000002', 'not-used', 'admin', 'Admin Two')
    `)
    const superadmin = await database.run(`
      INSERT INTO admin_users (phone, password_hash, role, name)
      VALUES ('79990000003', 'not-used', 'superadmin', 'Superadmin')
    `)
    adminOneId = adminOne.lastID
    adminTwoId = adminTwo.lastID

    await database.run('UPDATE offices SET user_id = ? WHERE id = 1', [adminOneId])
    const officeTwo = await database.run(
      'INSERT INTO offices (name, address, user_id) VALUES (?, ?, ?)',
      ['Office Two', '', adminTwoId],
    )
    officeTwoId = officeTwo.lastID

    await database.run(`
      INSERT INTO equipment (
        id, name, category, price_per_day, quantity, available_quantity,
        images, description, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['workflow-camera', 'Camera', 'camera', 1000, 1, 1, '[]', 'Camera', '{}'])

    adminOneToken = signToken({ userId: adminOneId, phone: '79990000001', role: 'admin' })
    adminTwoToken = signToken({ userId: adminTwoId, phone: '79990000002', role: 'admin' })
    superadminToken = signToken({ userId: superadmin.lastID, phone: '79990000003', role: 'superadmin' })
    app = express().use(express.json()).use('/admin', adminRouter)
  })

  beforeEach(async () => {
    await database.run('DELETE FROM bookings')
    await database.run('DELETE FROM contact_leads')

    await bookingModel.create({
      id: 'booking-office-one',
      equipmentId: 'workflow-camera',
      customerName: 'Office One Customer',
      customerPhone: '89990000001',
      startDate: '2030-01-10',
      endDate: '2030-01-11',
      officeId: 1,
      totalPrice: 1000,
    })
    await bookingModel.updateStatus('booking-office-one', 'confirmed')
    await bookingModel.create({
      id: 'booking-office-two',
      equipmentId: 'workflow-camera',
      customerName: 'Office Two Customer',
      customerPhone: '89990000002',
      startDate: '2030-01-10',
      endDate: '2030-01-11',
      officeId: officeTwoId,
      totalPrice: 1000,
    })

    officeOneLeadId = (await contactLeadModel.create({
      name: 'Office One Lead',
      phone: '89990000011',
      subject: 'Rental',
      message: 'Office one',
      officeId: 1,
    })).id
    officeOneDeleteLeadId = (await contactLeadModel.create({
      name: 'Office One Delete Lead',
      phone: '89990000012',
      subject: 'Rental',
      message: 'Office one delete',
      officeId: 1,
    })).id
    officeTwoLeadId = (await contactLeadModel.create({
      name: 'Office Two Lead',
      phone: '89990000021',
      subject: 'Rental',
      message: 'Office two',
      officeId: officeTwoId,
    })).id
    legacyLeadId = (await contactLeadModel.create({
      name: 'Legacy Lead',
      phone: '89990000031',
      subject: 'Rental',
      message: 'No office',
    })).id
  })

  afterAll(async () => {
    await database.close()
    rmSync(tempDirectory, { recursive: true, force: true })
  })

  it('updates booking workflow fields and leaves operational status unchanged', async () => {
    const response = await request(app)
      .patch('/admin/bookings/booking-office-one/workflow')
      .set(auth(adminOneToken))
      .send({ result: 'booked', revenue: 7250 })
      .expect(200)

    expect(response.body).toMatchObject({
      id: 'booking-office-one',
      status: 'confirmed',
      leadResult: 'booked',
      leadRevenue: 7250,
    })
    expect(response.body.lastContactedAt).toEqual(expect.any(String))
    await expect(database.get(`
      SELECT status, lead_result, lead_revenue, last_contacted_at
      FROM bookings WHERE id = ?
    `, ['booking-office-one'])).resolves.toMatchObject({
      status: 'confirmed',
      lead_result: 'booked',
      lead_revenue: 7250,
      last_contacted_at: expect.any(String),
    })
  })

  it('updates contact workflow fields and leaves operational status unchanged', async () => {
    await contactLeadModel.updateStatus(officeOneLeadId, 'completed')

    const response = await request(app)
      .patch(`/admin/contact-leads/${officeOneLeadId}/workflow`)
      .set(auth(adminOneToken))
      .send({ result: 'declined', revenue: null })
      .expect(200)

    expect(response.body).toMatchObject({
      id: officeOneLeadId,
      status: 'completed',
      leadResult: 'declined',
    })
    expect(response.body.leadRevenue).toBeUndefined()
    expect(response.body.lastContactedAt).toEqual(expect.any(String))
  })

  it.each([
    ['/admin/bookings/booking-office-one/workflow', { result: 'won' }],
    ['/admin/bookings/booking-office-one/workflow', { result: 'booked', revenue: -1 }],
    ['/admin/contact-leads/1/workflow', { result: 'booked', revenue: 10_000_001 }],
    ['/admin/contact-leads/not-an-id/workflow', { result: 'booked' }],
  ])('rejects invalid workflow input for %s', async (url, payload) => {
    await request(app).patch(url).set(auth(adminOneToken)).send(payload).expect(400)
  })

  it('returns 404 when an office-scoped admin updates another office workflow', async () => {
    await request(app)
      .patch('/admin/bookings/booking-office-two/workflow')
      .set(auth(adminOneToken))
      .send({ result: 'thinking' })
      .expect(404)
    await request(app)
      .patch(`/admin/contact-leads/${officeTwoLeadId}/workflow`)
      .set(auth(adminOneToken))
      .send({ result: 'thinking' })
      .expect(404)
  })

  it('scopes contact list, status, and delete by office while treating legacy NULL as office 1', async () => {
    const list = await request(app)
      .get('/admin/contact-leads')
      .set(auth(adminOneToken))
      .expect(200)
    expect(list.body.map((lead: { id: number }) => lead.id)).toEqual(expect.arrayContaining([
      officeOneLeadId,
      officeOneDeleteLeadId,
      legacyLeadId,
    ]))
    expect(list.body.map((lead: { id: number }) => lead.id)).not.toContain(officeTwoLeadId)

    await request(app)
      .patch(`/admin/contact-leads/${officeTwoLeadId}/status`)
      .set(auth(adminOneToken))
      .send({ status: 'confirmed' })
      .expect(404)
    await request(app)
      .delete(`/admin/contact-leads/${officeTwoLeadId}`)
      .set(auth(adminOneToken))
      .expect(404)

    await request(app)
      .patch(`/admin/contact-leads/${legacyLeadId}/status`)
      .set(auth(adminOneToken))
      .send({ status: 'confirmed' })
      .expect(200)
    await request(app)
      .delete(`/admin/contact-leads/${officeOneDeleteLeadId}`)
      .set(auth(adminOneToken))
      .expect(204)
  })

  it('preserves superadmin access and applies view-as office scoping', async () => {
    const allLeads = await request(app)
      .get('/admin/contact-leads')
      .set(auth(superadminToken))
      .expect(200)
    expect(allLeads.body).toHaveLength(4)

    const viewedAsOfficeTwo = await request(app)
      .get('/admin/contact-leads')
      .set(auth(superadminToken))
      .set('X-View-As-User', String(adminTwoId))
      .expect(200)
    expect(viewedAsOfficeTwo.body.map((lead: { id: number }) => lead.id)).toEqual([officeTwoLeadId])

    await request(app)
      .patch('/admin/bookings/booking-office-one/workflow')
      .set(auth(superadminToken))
      .send({ result: 'unreached' })
      .expect(200)
    await request(app)
      .patch('/admin/bookings/booking-office-one/workflow')
      .set(auth(superadminToken))
      .set('X-View-As-User', String(adminTwoId))
      .send({ result: 'unreached' })
      .expect(404)
  })

  it('allows the second office admin to work with their own lead', async () => {
    await request(app)
      .patch(`/admin/contact-leads/${officeTwoLeadId}/workflow`)
      .set(auth(adminTwoToken))
      .send({ result: 'thinking', revenue: 0 })
      .expect(200)
  })
})
