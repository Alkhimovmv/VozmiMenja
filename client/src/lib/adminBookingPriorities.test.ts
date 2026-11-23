import assert from 'node:assert/strict'
import {
  getBookingUrgency,
  getCustomerSegment,
  isCustomerInSegment,
  sortBookingsByOperationalPriority,
} from './adminBookingPriorities'

const moscowLateEvening = new Date('2026-11-04T21:30:00.000Z') // 5 ноября, 00:30 в Москве

assert.equal(getBookingUrgency('2026-11-04', moscowLateEvening), 'past')
assert.equal(getBookingUrgency('2026-11-05', moscowLateEvening), 'today')
assert.equal(getBookingUrgency('2026-11-06', moscowLateEvening), 'tomorrow')
assert.equal(getBookingUrgency('2026-11-07', moscowLateEvening), 'later')

assert.equal(getCustomerSegment(0), 'new')
assert.equal(getCustomerSegment(1), 'single')
assert.equal(getCustomerSegment(2), 'repeat')
assert.equal(getCustomerSegment(3), 'loyal')
assert.equal(getCustomerSegment(12), 'loyal')

assert.equal(isCustomerInSegment(1, 'single'), true)
assert.equal(isCustomerInSegment(2, 'repeat'), true)
assert.equal(isCustomerInSegment(3, 'repeat'), true)
assert.equal(isCustomerInSegment(3, 'loyal'), true)
assert.equal(isCustomerInSegment(2, 'loyal'), false)

const bookings = [
  { id: 'later', startDate: '2026-11-08', status: 'pending' as const, createdAt: '2026-11-04T12:00:00Z' },
  { id: 'tomorrow-confirmed', startDate: '2026-11-06', status: 'confirmed' as const, createdAt: '2026-11-04T15:00:00Z' },
  { id: 'today-old', startDate: '2026-11-05', status: 'pending' as const, createdAt: '2026-11-04T10:00:00Z' },
  { id: 'today-new', startDate: '2026-11-05', status: 'pending' as const, createdAt: '2026-11-04T16:00:00Z' },
  { id: 'past', startDate: '2026-11-04', status: 'confirmed' as const, createdAt: '2026-11-04T17:00:00Z' },
]

assert.deepEqual(
  sortBookingsByOperationalPriority(bookings, moscowLateEvening).map((booking) => booking.id),
  ['past', 'today-new', 'today-old', 'tomorrow-confirmed', 'later'],
)

console.log('adminBookingPriorities tests passed')
