import assert from 'node:assert/strict'
import axios from 'axios'
import type { LeadWorkflowUpdate } from '../../types'

const storage = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  },
})

axios.defaults.adapter = async (config) => ({
  config,
  data: {},
  headers: {},
  status: 200,
  statusText: 'OK',
})

const [{ apiClientPromise }, { bookingsApi }, { contactLeadsApi }] = await Promise.all([
  import('./client'),
  import('./bookings'),
  import('./contactLeads'),
])
const client = await apiClientPromise
const calls: Array<{ method?: string; url?: string; body?: LeadWorkflowUpdate }> = []

client.defaults.adapter = async (config) => {
  const body = typeof config.data === 'string' ? JSON.parse(config.data) as LeadWorkflowUpdate : config.data
  calls.push({ method: config.method, url: config.url, body })

  const data = config.url === '/lead-report'
    ? {
        success: true,
        data: {
          generatedAt: '2030-01-29T12:00:00.000Z',
          periodDays: 14,
          rows: [{
            source: 'yandex',
            campaign: 'winter',
            currentLeads: 4,
            currentStartedBookings: 3,
            currentConfirmedRentals: 2,
            currentRevenue: 15_000,
            currentConversion: 50,
            baselineLeads: 2,
            baselineStartedBookings: 1,
            baselineConfirmedRentals: 1,
            baselineRevenue: 5_000,
            baselineConversion: 50,
          }],
        },
      }
    : config.url?.startsWith('/bookings/')
    ? {
        success: true,
        data: {
          id: 'booking-1',
          equipmentId: 'camera',
          customerName: 'Customer',
          customerPhone: '89990000000',
          startDate: '2030-01-01',
          endDate: '2030-01-02',
          totalPrice: 5000,
          status: 'pending',
          leadResult: body.result,
          leadRevenue: body.revenue,
          lastContactedAt: '2030-01-01 10:00:00',
          createdAt: '',
          updatedAt: '',
        },
      }
    : {
        id: 7,
        name: 'Customer',
        phone: '89990000000',
        subject: 'Rental',
        message: '',
        status: 'pending',
        leadResult: body.result,
        leadRevenue: body.revenue,
        lastContactedAt: '2030-01-01 10:00:00',
        createdAt: '',
        updatedAt: '',
      }

  return { config, data, headers: {}, status: 200, statusText: 'OK' }
}

const bookingPayload: LeadWorkflowUpdate = { result: 'booked', revenue: 5000 }
const contactPayload: LeadWorkflowUpdate = { result: 'thinking', revenue: 1200 }
const booking = await bookingsApi.updateWorkflow('booking-1', bookingPayload)
const contact = await contactLeadsApi.updateWorkflow(7, contactPayload)
const report = await bookingsApi.getLeadReport()

assert.deepEqual(calls, [
  { method: 'patch', url: '/bookings/booking-1/workflow', body: bookingPayload },
  { method: 'patch', url: '/contact-leads/7/workflow', body: contactPayload },
  { method: 'get', url: '/lead-report', body: undefined },
])
assert.equal(booking.id, 'booking-1')
assert.equal(booking.leadResult, 'booked')
assert.equal(booking.leadRevenue, 5000)
assert.equal(contact.id, 7)
assert.equal(contact.leadResult, 'thinking')
assert.equal(contact.leadRevenue, 1200)
assert.equal(report.periodDays, 14)
assert.equal(report.rows[0].source, 'yandex')
assert.equal(report.rows[0].currentRevenue, 15_000)
console.log('lead workflow client API tests passed')
