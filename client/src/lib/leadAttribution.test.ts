import assert from 'node:assert/strict'
import {
  buildAttributedBookingHref,
  getLeadContext,
  inferLeadScenario,
  parseLeadAttribution,
} from './leadAttribution'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

const avitoAttribution = parseLeadAttribution(
  'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=avito&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=volzhskaya-account-1',
  'https://www.avito.ru/moskva/predlozheniya_uslug',
)

assert.deepEqual(avitoAttribution, {
  sourcePage: 'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=avito&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=volzhskaya-account-1',
  referrer: 'https://www.avito.ru/moskva/predlozheniya_uslug',
  utmSource: 'avito',
  utmMedium: 'listing',
  utmCampaign: 'karaoke-kit',
  utmContent: 'volzhskaya-account-1',
  scenario: 'karaoke-kit',
})

assert.equal(
  buildAttributedBookingHref(
    ['jbl-partybox-320', 'jbl-partybox-wireless-microphones'],
    'karaoke-kit',
    avitoAttribution,
  ),
  '/booking?equipment=jbl-partybox-320%2Cjbl-partybox-wireless-microphones&utm_source=avito&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=volzhskaya-account-1',
)

const directPuzziAttribution = parseLeadAttribution(
  'https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva',
  '',
)

assert.equal(
  buildAttributedBookingHref('karcher-puzzi-8-1', 'puzzi-cleaning', directPuzziAttribution),
  '/booking?equipment=karcher-puzzi-8-1&utm_source=site&utm_medium=landing&utm_campaign=puzzi-cleaning',
)

assert.equal(inferLeadScenario('travel-camera', '/booking'), 'travel-camera')
assert.equal(inferLeadScenario('travel-camera', '/arenda-karaoke-komplekta-moskva'), 'travel-camera')
assert.equal(inferLeadScenario(undefined, '/arenda-karaoke-komplekta-moskva'), 'karaoke-kit')
assert.equal(inferLeadScenario(undefined, '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva'), 'puzzi-cleaning')

const storage = new MemoryStorage()
const originalWindow = globalThis.window
const originalDocument = globalThis.document

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: {
    location: new URL('https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=avito&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=first-ad'),
    sessionStorage: storage,
  },
})
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: { referrer: 'https://www.avito.ru/' },
})

assert.equal(getLeadContext().utmContent, 'first-ad')
assert.equal(storage.length, 1)

window.location = new URL('https://vozmimenya.ru/booking?equipment=jbl-partybox-320') as unknown as Location
const bookingContext = getLeadContext()
assert.equal(bookingContext.sourcePage, 'https://vozmimenya.ru/booking?equipment=jbl-partybox-320')
assert.equal(bookingContext.utmSource, 'avito')
assert.equal(bookingContext.utmMedium, 'listing')
assert.equal(bookingContext.utmCampaign, 'karaoke-kit')
assert.equal(bookingContext.utmContent, 'first-ad')
assert.equal(bookingContext.scenario, 'karaoke-kit')

const storageKey = storage.key(0)
assert.ok(storageKey)
storage.setItem(storageKey, '{broken json')
window.location = new URL('https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva') as unknown as Location
const recoveredContext = getLeadContext()
assert.equal(recoveredContext.utmSource, undefined)
assert.equal(recoveredContext.scenario, 'travel-camera')
assert.equal(storage.length, 0)

Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow })
Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument })

console.log('leadAttribution tests passed')
