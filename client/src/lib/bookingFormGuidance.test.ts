import assert from 'node:assert/strict'
import { getCommentPlaceholder, getScenarioPresets } from './bookingFormGuidance'
import type { Equipment } from '../types'

function equipment(overrides: Partial<Equipment>): Equipment {
  return {
    id: '1',
    name: 'Тестовая модель',
    category: 'Тест',
    pricePerDay: 1000,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

const partybox = equipment({ name: 'JBL PartyBox 320', category: 'Аудиооборудование' })
const vacuum = equipment({ name: 'Karcher WD5', category: 'Пылесосы и клининг' })
const camera = equipment({ name: 'GoPro Hero 13', category: 'Камеры' })

assert.match(getCommentPlaceholder(partybox), /дача/)
assert.equal(getScenarioPresets(partybox)[0].label, 'Квартира')

assert.match(getCommentPlaceholder(vacuum), /ремонта/)
assert.equal(getScenarioPresets(vacuum)[0].label, 'После ремонта')

assert.match(getCommentPlaceholder(camera), /поездка/)
assert.equal(getScenarioPresets(camera)[0].label, 'Спорт/актив')

console.log('bookingFormGuidance tests passed')
