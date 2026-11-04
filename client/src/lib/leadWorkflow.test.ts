import assert from 'node:assert/strict'
import {
  buildLeadReply,
  getLeadResultLabel,
  getLeadScenarioLabel,
  parseLeadRevenue,
} from './leadWorkflow'

assert.equal(getLeadResultLabel('unreached'), 'Не связались')
assert.equal(getLeadResultLabel('thinking'), 'Думает')
assert.equal(getLeadResultLabel('booked'), 'Забронировано')
assert.equal(getLeadResultLabel('declined'), 'Отказ')
assert.equal(getLeadResultLabel('duplicate'), 'Дубль')

assert.equal(getLeadScenarioLabel('puzzi-cleaning'), 'Моющий пылесос для химчистки')
assert.equal(getLeadScenarioLabel('karaoke-kit'), 'Караоке-комплект JBL с микрофонами')
assert.equal(getLeadScenarioLabel('travel-camera'), 'Камера для поездки или съёмки')
assert.equal(getLeadScenarioLabel(undefined), 'Не указано')

assert.equal(
  buildLeadReply({ customerName: 'Иван Петров', scenario: 'puzzi-cleaning' }),
  'Здравствуйте, Иван! Спасибо за обращение. Поможем подобрать моющий пылесос для химчистки.',
)
assert.equal(
  buildLeadReply({ customerName: '  Анна   Смирнова  ', scenario: 'karaoke-kit', officeName: 'Бауманская' }),
  'Здравствуйте, Анна! Спасибо за обращение. Поможем подобрать караоке-комплект JBL с микрофонами. Офис: Бауманская.',
)
assert.equal(
  buildLeadReply({ customerName: 'Мария', scenario: 'travel-camera' }),
  'Здравствуйте, Мария! Спасибо за обращение. Поможем подобрать камеру для поездки или съёмки.',
)
assert.equal(
  buildLeadReply({ customerName: 'Павел' }),
  'Здравствуйте, Павел! Спасибо за обращение. Поможем подобрать оборудование.',
)

assert.deepEqual(parseLeadRevenue(''), { ok: true, revenue: null })
assert.deepEqual(parseLeadRevenue('0'), { ok: true, revenue: 0 })
assert.deepEqual(parseLeadRevenue(' 2500.50 '), { ok: true, revenue: 2500.5 })
assert.deepEqual(parseLeadRevenue('-1'), { ok: false })
assert.deepEqual(parseLeadRevenue('тысяча'), { ok: false })

console.log('lead workflow helper tests passed')
