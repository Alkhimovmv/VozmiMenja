import assert from 'node:assert/strict'
import type { Booking, ContactLead, LeadResult, LeadWorkflowUpdate } from '../../types'

type BookingWorkflowUpdater = typeof import('./bookings')['bookingsApi']['updateWorkflow']
type ContactWorkflowUpdater = typeof import('./contactLeads')['contactLeadsApi']['updateWorkflow']

const result: LeadResult = 'booked'
const payload: LeadWorkflowUpdate = { result, revenue: 5000 }
const booking: Pick<Booking, 'leadResult' | 'leadRevenue' | 'lastContactedAt'> = {
  leadResult: result,
  leadRevenue: payload.revenue ?? undefined,
  lastContactedAt: '2030-01-01 10:00:00',
}
const contactLead: Pick<ContactLead, 'leadResult' | 'leadRevenue' | 'lastContactedAt'> = booking

const bookingUpdater: BookingWorkflowUpdater = async (_id, workflow) => ({
  ...booking,
  id: 'booking-1',
  equipmentId: 'camera',
  customerName: 'Customer',
  customerPhone: '89990000000',
  startDate: '2030-01-01',
  endDate: '2030-01-02',
  totalPrice: workflow.revenue ?? 0,
  status: 'pending',
  createdAt: '',
  updatedAt: '',
})
const contactUpdater: ContactWorkflowUpdater = async (id, workflow) => ({
  ...contactLead,
  id,
  name: 'Customer',
  phone: '89990000000',
  subject: workflow.result,
  message: '',
  status: 'pending',
  createdAt: '',
  updatedAt: '',
})

assert.equal((await bookingUpdater('booking-1', payload)).leadRevenue, 5000)
assert.equal((await contactUpdater(1, payload)).leadResult, 'booked')
console.log('lead workflow client types tests passed')
