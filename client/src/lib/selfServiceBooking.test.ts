import assert from 'node:assert/strict'
import { buildSelectedEquipmentList, calculateMultiEquipmentTotal, getSelectedEquipment } from './selfServiceBooking'
import type { Equipment } from '../types'

const equipment: Equipment[] = [
  {
    id: 'speaker',
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
]

const selected = getSelectedEquipment(equipment, ['camera', 'missing', 'speaker'])

assert.deepEqual(selected.map((item) => item.id), ['camera', 'speaker'])
assert.match(buildSelectedEquipmentList(selected), /1\. GoPro Hero \(Камеры\)/)
assert.match(buildSelectedEquipmentList(selected), /2\. JBL PartyBox 710 \(Аудиооборудование\)/)
assert.equal(calculateMultiEquipmentTotal(selected, 2, '2026-10-09', '10:00'), 7000)

console.log('selfServiceBooking tests passed')
