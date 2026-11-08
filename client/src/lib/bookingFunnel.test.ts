import assert from 'node:assert/strict'
import { buildBookingFunnelRows } from './bookingFunnel'

const rows = buildBookingFunnelRows({
  days: 30,
  stages: {
    equipmentView: 100,
    bookingView: 40,
    equipmentSelected: 30,
    formStarted: 20,
    bookingSubmitted: 10,
  },
})

assert.equal(rows[0].widthPercent, 100)
assert.equal(rows[2].conversionFromBooking, 75)
assert.equal(rows[4].conversionFromBooking, 25)

const empty = buildBookingFunnelRows({
  days: 7,
  stages: {
    equipmentView: 0,
    bookingView: 0,
    equipmentSelected: 0,
    formStarted: 0,
    bookingSubmitted: 0,
  },
})
assert.equal(empty.every((row) => row.widthPercent === 0), true)
assert.equal(empty.every((row) => row.conversionFromBooking === null), true)

console.log('bookingFunnel tests passed')
