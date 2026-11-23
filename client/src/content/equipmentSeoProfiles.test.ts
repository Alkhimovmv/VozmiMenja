import assert from 'node:assert/strict'
import test from 'node:test'
import productScenarios from './productScenarios.json'
import { equipmentSeoProfiles, getEquipmentSeoProfile } from './equipmentSeoProfiles'

const expectedSlugs = [
  'dji-mic-2',
  'dji-osmo-pocket-3-creator-combo',
  'gopro-13',
  'insta360-x5',
  'jbl-partybox-320',
  'jbl-partybox-710',
  'karcher-puzzi-10-1',
  'karcher-puzzi-8-1',
  'karcher-sc4',
  'karcher-wd5',
  'mikrofony-jbl',
  'okami-q75',
  'sushilka-vacmaster',
]

test('covers every production equipment slug with unique useful copy', () => {
  assert.deepEqual(Object.keys(equipmentSeoProfiles).sort(), expectedSlugs)
  assert.equal(new Set(Object.values(equipmentSeoProfiles).map((item) => item.primaryQuery)).size, expectedSlugs.length)
  assert.equal(new Set(Object.values(equipmentSeoProfiles).map((item) => item.intro)).size, expectedSlugs.length)

  for (const slug of expectedSlugs) {
    const profile = getEquipmentSeoProfile(slug)
    assert.ok(profile)
    assert.ok(profile.primaryQuery.includes('аренда'))
    assert.ok(profile.primaryQuery.includes('Москва'))
    assert.ok(profile.intro.length >= 90)
    assert.ok(profile.scenarios.length >= 3)
    assert.ok(profile.faq.length >= 2)
    assert.doesNotMatch(JSON.stringify(profile), /\b\d[\d ]*\s*₽/)
  }
})

test('returns undefined for an unknown or missing slug', () => {
  assert.equal(getEquipmentSeoProfile(undefined), undefined)
  assert.equal(getEquipmentSeoProfile('unknown-model'), undefined)
})

test('links every production model to an existing canonical landing intent', () => {
  const linksBySlug = productScenarios as Record<string, Array<{ href: string; label: string }>>
  for (const slug of expectedSlugs) {
    const links = linksBySlug[slug]
    assert.ok(links?.length, `${slug} must have at least one scenario link`)
    for (const link of links) {
      assert.match(link.href, /^\/[^?#]+$/)
      assert.ok(link.label.length >= 12)
    }
  }
  assert.equal(
    linksBySlug['sushilka-vacmaster'][0].href,
    '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva',
  )
})

