import assert from 'node:assert/strict'
import { buildAvitoBookingUrl } from './avitoBookingLink'

assert.equal(
  buildAvitoBookingUrl('jbl-partybox-320', 'https://vozmimenya.ru'),
  'https://vozmimenya.ru/booking?equipment=jbl-partybox-320&utm_source=avito&utm_medium=messenger&utm_campaign=manual-booking',
)

assert.equal(
  buildAvitoBookingUrl('camera & kit', 'https://example.test/'),
  'https://example.test/booking?equipment=camera+%26+kit&utm_source=avito&utm_medium=messenger&utm_campaign=manual-booking',
)

console.log('avitoBookingLink tests passed')
