import assert from 'node:assert/strict'
import {
  buildUrgentBookingDates,
  buildSelectedEquipmentList,
  buildSingleBookingEquipmentPayload,
  calculateMultiEquipmentTotal,
  getEquipmentBookingHint,
  getJblMicrophoneUpsell,
  getPuzziDryerUpsell,
  getSelectedEquipment,
  resolveEquipmentSelection,
} from './selfServiceBooking'
import type { Equipment } from '../types'

const equipment: Equipment[] = [
  {
    id: 'speaker',
    slug: 'jbl-partybox-320',
    name: 'JBL PartyBox 710',
    category: 'Аудиооборудование',
    pricePerDay: 2300,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'camera',
    name: 'GoPro Hero',
    category: 'Камеры',
    pricePerDay: 1200,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'gopro-13-id',
    slug: 'gopro-13',
    name: 'GoPro 13',
    category: 'Камеры',
    pricePerDay: 1300,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'osmo-pocket-3-id',
    slug: 'dji-osmo-pocket-3-creator-combo',
    name: 'DJI Osmo Pocket 3 Creator Combo',
    category: 'Камеры',
    pricePerDay: 1300,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'insta360-x5-id',
    slug: 'insta360-x5',
    name: 'Insta360 X5',
    category: 'Камеры',
    pricePerDay: 1500,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'jbl-partybox-wireless-microphones',
    name: 'Микрофоны JBL',
    category: 'Аудиооборудование',
    pricePerDay: 500,
    quantity: 4,
    availableQuantity: 4,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'puzzi',
    slug: 'karcher-puzzi-8-1',
    name: 'Karcher Puzzi 8/1',
    category: 'Пылесосы, уборка и клининг',
    pricePerDay: 980,
    quantity: 2,
    availableQuantity: 2,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'puzzi-10-id',
    slug: 'karcher-puzzi-10-1',
    name: 'Karcher Puzzi 10/1',
    category: 'Пылесосы, уборка и клининг',
    pricePerDay: 980,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'vacmaster-125w-carpet-dryer',
    slug: 'sushilka-vacmaster',
    name: 'Сушилка Vacmaster',
    category: 'Пылесосы, уборка и клининг',
    pricePerDay: 400,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
]

const selected = getSelectedEquipment(equipment, ['camera', 'missing', 'speaker'])

assert.deepEqual(selected.map((item) => item.id), ['camera', 'speaker'])
assert.equal(getEquipmentBookingHint(equipment[0]), 'мощная колонка для больших помещений и мероприятий')
assert.equal(getEquipmentBookingHint(equipment[1]), 'экшн-камера для спорта, поездок и съёмки в движении')
assert.equal(getEquipmentBookingHint(equipment[6]), 'моющий пылесос для диванов, ковров и салона авто')
assert.equal(getEquipmentBookingHint(equipment[8]), 'сушилка для ковров и мебели после химчистки')
assert.match(buildSelectedEquipmentList(selected), /1\. GoPro Hero \(Камеры\)/)
assert.match(buildSelectedEquipmentList(selected), /2\. JBL PartyBox 710 \(Аудиооборудование\)/)
assert.deepEqual(buildSingleBookingEquipmentPayload(selected), {
  equipmentId: 'camera',
  equipmentIds: ['camera', 'speaker'],
})
assert.equal(calculateMultiEquipmentTotal(selected, 2, '2026-10-09', '2026-10-11', '10:00', '10:00'), 7000)
assert.equal(getJblMicrophoneUpsell(equipment, ['speaker'])?.id, 'jbl-partybox-wireless-microphones')
assert.equal(getJblMicrophoneUpsell(equipment, ['camera']), null)
assert.equal(getJblMicrophoneUpsell(equipment, ['speaker', 'jbl-partybox-wireless-microphones']), null)

const unavailableMicrophones = equipment.map((item) => (
  item.id === 'jbl-partybox-wireless-microphones' ? { ...item, availableQuantity: 0 } : item
))
assert.equal(getJblMicrophoneUpsell(unavailableMicrophones, ['speaker'])?.id, 'jbl-partybox-wireless-microphones')
assert.equal(getPuzziDryerUpsell(equipment, ['puzzi'])?.id, 'vacmaster-125w-carpet-dryer')
assert.equal(getPuzziDryerUpsell(equipment, ['camera']), null)
assert.equal(getPuzziDryerUpsell(equipment, ['puzzi', 'vacmaster-125w-carpet-dryer']), null)
const unavailableDryer = equipment.map((item) => (
  item.id === 'vacmaster-125w-carpet-dryer' ? { ...item, availableQuantity: 0 } : item
))
assert.equal(getPuzziDryerUpsell(unavailableDryer, ['puzzi'])?.id, 'vacmaster-125w-carpet-dryer')
assert.deepEqual(
  buildUrgentBookingDates('today', new Date('2026-11-05T09:00:00+03:00')),
  { startDate: '2026-11-05', endDate: '2026-11-06' },
)
assert.deepEqual(
  buildUrgentBookingDates('tomorrow', new Date('2026-11-05T09:00:00+03:00')),
  { startDate: '2026-11-06', endDate: '2026-11-07' },
)
assert.deepEqual(
  resolveEquipmentSelection(equipment, ['jbl-partybox-320', 'jbl-partybox-wireless-microphones', 'missing']),
  ['speaker', 'jbl-partybox-wireless-microphones'],
)
assert.deepEqual(
  resolveEquipmentSelection(equipment, [
    'karcher-puzzi-8-1',
    'karcher-puzzi-10-1',
    'gopro-13',
    'dji-osmo-pocket-3-creator-combo',
    'insta360-x5',
  ]),
  ['puzzi', 'puzzi-10-id', 'gopro-13-id', 'osmo-pocket-3-id', 'insta360-x5-id'],
)

console.log('selfServiceBooking tests passed')
