import assert from 'node:assert/strict'
import {
  buildLeadReply,
  getLeadResultLabel,
  getLeadScenarioLabel,
  parseLeadRevenue,
  resolveLeadScenario,
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

const legacyKaraokeScenario = resolveLeadScenario(undefined, 'Праздник на даче с PartyBox и танцами')
assert.equal(legacyKaraokeScenario, 'karaoke-kit')
assert.equal(getLeadScenarioLabel(legacyKaraokeScenario), 'Караоке-комплект JBL с микрофонами')
assert.equal(
  buildLeadReply({ customerName: 'Олег Петров', scenario: legacyKaraokeScenario }),
  'Олег, здравствуйте! Вы оставляли заявку на караоке-комплект JBL с микрофонами в «ВозьмиМеня». Подскажите, даты ещё актуальны?',
)
assert.equal(resolveLeadScenario(undefined, 'Химчистка дивана и ковра'), 'puzzi-cleaning')
assert.equal(resolveLeadScenario(undefined, 'GoPro для поездки и съёмки влога'), 'travel-camera')
assert.equal(resolveLeadScenario(undefined, 'Нужна техника'), undefined)

assert.equal(
  buildLeadReply({ customerName: 'Иван Петров', scenario: 'puzzi-cleaning' }),
  'Иван, здравствуйте! Вы оставляли заявку на моющий пылесос для химчистки в «ВозьмиМеня». Подскажите, даты ещё актуальны?',
)
assert.equal(
  buildLeadReply({ customerName: '  Анна   Смирнова  ', scenario: 'karaoke-kit', officeName: 'Бауманская' }),
  'Анна, здравствуйте! Вы оставляли заявку на караоке-комплект JBL с микрофонами в «ВозьмиМеня». Подскажите, даты ещё актуальны? Офис: Бауманская.',
)
assert.equal(
  buildLeadReply({ customerName: 'Мария', scenario: 'travel-camera' }),
  'Мария, здравствуйте! Вы оставляли заявку на камеру для поездки или съёмки в «ВозьмиМеня». Подскажите, даты ещё актуальны?',
)
assert.equal(
  buildLeadReply({ customerName: 'Павел' }),
  'Павел, здравствуйте! Вы оставляли заявку на оборудование в «ВозьмиМеня». Подскажите, даты ещё актуальны?',
)

assert.deepEqual(parseLeadRevenue(''), { ok: true, revenue: null })
assert.deepEqual(parseLeadRevenue('0'), { ok: true, revenue: 0 })
assert.deepEqual(parseLeadRevenue(' 2500.50 '), { ok: true, revenue: 2500.5 })
assert.deepEqual(parseLeadRevenue('10000000'), { ok: true, revenue: 10_000_000 })
assert.deepEqual(parseLeadRevenue('10000000.01'), { ok: false })
assert.deepEqual(parseLeadRevenue('10000001'), { ok: false })
assert.deepEqual(parseLeadRevenue('-1'), { ok: false })
assert.deepEqual(parseLeadRevenue('NaN'), { ok: false })
assert.deepEqual(parseLeadRevenue('тысяча'), { ok: false })

console.log('lead workflow helper tests passed')
