import assert from 'node:assert/strict'
import {
  buildAttributedBookingHref,
  buildAttributedBookingLinks,
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

const karaokeLinkItems = [{
  id: 'partybox-320',
  equipment: ['jbl-partybox-320', 'jbl-partybox-wireless-microphones'],
}]
const avitoLinks = buildAttributedBookingLinks(karaokeLinkItems, 'karaoke-kit', avitoAttribution)
const vkLinks = buildAttributedBookingLinks(
  karaokeLinkItems,
  'karaoke-kit',
  parseLeadAttribution(
    'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=vk&utm_medium=social&utm_campaign=karaoke-kit',
    'https://vk.com/',
  ),
)

assert.match(avitoLinks[0].href, /utm_source=avito/)
assert.match(vkLinks[0].href, /utm_source=vk/)
assert.doesNotMatch(vkLinks[0].href, /utm_source=avito/)

const partialVkAttribution = parseLeadAttribution(
  'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=vk&utm_content=community-post',
  'https://vk.com/',
)
const partialVkBookingHref = buildAttributedBookingHref(
  ['jbl-partybox-320', 'jbl-partybox-wireless-microphones'],
  'karaoke-kit',
  partialVkAttribution,
)

assert.equal(
  partialVkBookingHref,
  '/booking?equipment=jbl-partybox-320%2Cjbl-partybox-wireless-microphones&utm_source=vk&utm_medium=landing&utm_campaign=karaoke-kit&utm_content=community-post',
)
assert.equal(
  parseLeadAttribution(new URL(partialVkBookingHref, 'https://vozmimenya.ru').href, '').scenario,
  'karaoke-kit',
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
assert.equal(inferLeadScenario('not-karaoke-kit', '/booking'), undefined)
assert.equal(inferLeadScenario('not-karaoke-kit', '/arenda-kamery-dlya-puteshestviya-vloga-moskva'), 'travel-camera')
assert.equal(inferLeadScenario(undefined, '/blog/arenda-karaoke-komplekta-moskva-review'), undefined)
assert.equal(inferLeadScenario(undefined, '/arenda-karaoke-komplekta-moskva'), 'karaoke-kit')
assert.equal(inferLeadScenario(undefined, '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva'), 'puzzi-cleaning')
assert.equal(inferLeadScenario(undefined, '/arenda-kamery-dlya-puteshestviya-vloga-moskva'), 'travel-camera')

const storage = new MemoryStorage()
const originalWindow = globalThis.window
const originalDocument = globalThis.document
const mockWindow = {
  location: {
    href: 'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=vk&utm_campaign=autumn-promo',
  },
  sessionStorage: storage,
}

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: mockWindow,
})
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: { referrer: 'https://vk.com/' },
})

const promotionalLandingContext = getLeadContext()
assert.equal(promotionalLandingContext.utmCampaign, 'autumn-promo')
assert.equal(promotionalLandingContext.scenario, 'karaoke-kit')
const promotionalBookingHref = buildAttributedBookingHref(
  ['jbl-partybox-320', 'jbl-partybox-wireless-microphones'],
  'karaoke-kit',
  promotionalLandingContext,
)
mockWindow.location.href = new URL(promotionalBookingHref, 'https://vozmimenya.ru').href
const promotionalBookingContext = getLeadContext()
assert.equal(promotionalBookingContext.utmCampaign, 'autumn-promo')
assert.equal(promotionalBookingContext.scenario, 'karaoke-kit')

storage.clear()
mockWindow.location.href = 'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=vk'
const firstExternalContext = getLeadContext()
assert.equal(firstExternalContext.utmSource, 'vk')
assert.equal(firstExternalContext.utmMedium, 'landing')
assert.equal(firstExternalContext.utmCampaign, 'karaoke-kit')
assert.equal(firstExternalContext.scenario, 'karaoke-kit')

const secondExternalUrl = 'https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=avito&utm_medium=listing&utm_campaign=travel-camera&utm_content=account-2'
mockWindow.location.href = secondExternalUrl
const secondExternalContext = getLeadContext()
assert.equal(secondExternalContext.sourcePage, secondExternalUrl)
assert.equal(secondExternalContext.utmSource, 'vk')
assert.equal(secondExternalContext.utmMedium, 'landing')
assert.equal(secondExternalContext.utmCampaign, 'karaoke-kit')
assert.equal(secondExternalContext.utmContent, undefined)
assert.equal(secondExternalContext.scenario, 'karaoke-kit')

storage.clear()
mockWindow.location.href = 'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva?utm_source=vk&utm_content=community-post'
const partialLandingContext = getLeadContext()
assert.equal(partialLandingContext.utmSource, 'vk')
assert.equal(partialLandingContext.utmMedium, 'landing')
assert.equal(partialLandingContext.utmCampaign, 'karaoke-kit')
assert.equal(partialLandingContext.utmContent, 'community-post')
assert.equal(storage.length, 1)

const sessionBookingHref = buildAttributedBookingHref(
  ['jbl-partybox-320', 'jbl-partybox-wireless-microphones'],
  'karaoke-kit',
  partialLandingContext,
)
const sessionBookingUrl = new URL(sessionBookingHref, 'https://vozmimenya.ru').href
mockWindow.location.href = sessionBookingUrl
const bookingContext = getLeadContext()
assert.equal(bookingContext.sourcePage, sessionBookingUrl)
assert.equal(bookingContext.utmSource, 'vk')
assert.equal(bookingContext.utmMedium, 'landing')
assert.equal(bookingContext.utmCampaign, 'karaoke-kit')
assert.equal(bookingContext.utmContent, 'community-post')
assert.equal(bookingContext.scenario, 'karaoke-kit')

const storageKey = storage.key(0)
assert.ok(storageKey)
storage.setItem(storageKey, '{broken json')
mockWindow.location.href = 'https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva'
const recoveredContext = getLeadContext()
assert.equal(recoveredContext.utmSource, undefined)
assert.equal(recoveredContext.scenario, 'travel-camera')
assert.equal(storage.length, 0)

Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow })
Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument })

console.log('leadAttribution tests passed')
