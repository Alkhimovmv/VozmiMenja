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

const legacyKaraokeScenario = resolveLeadScenario(undefined, 'праздник на даче. Нужна колонка на выходные и запас по громкости.')
assert.equal(legacyKaraokeScenario, 'karaoke-kit')
assert.equal(getLeadScenarioLabel(legacyKaraokeScenario), 'Караоке-комплект JBL с микрофонами')
assert.equal(
  buildLeadReply({ customerName: 'Олег Петров', scenario: legacyKaraokeScenario }),
  'Олег, здравствуйте! Вы оставляли заявку на караоке-комплект JBL с микрофонами в «ВозьмиМеня». Подскажите, даты ещё актуальны?',
)
assert.equal(
  resolveLeadScenario(undefined, 'видео или блог. Нужно уточнить камеру/телефон и условия съемки.'),
  undefined,
)
assert.equal(resolveLeadScenario(undefined, 'запись интервью. Нужен чистый звук речи.'), undefined)
assert.equal(resolveLeadScenario(undefined, 'поездка на дачу с PartyBox'), undefined)
assert.equal(resolveLeadScenario(undefined, 'Нужна техника'), undefined)

const exactLegacyScenarios = {
  'puzzi-cleaning': [
    'химчистка дивана/ковра. Нужна подсказка по химии и насадке.',
    'химчистка салона авто. Нужно уточнить количество сидений и пятна.',
    'несколько зон чистки. Нужно понять, хватит ли этой модели или лучше Puzzi 10/1.',
  ],
  'travel-camera': [
    'активная съемка на GoPro. Нужны крепления под спорт/поездку.',
    'поездка/путешествие. Нужна камера на несколько дней и запас питания.',
    'короткие ролики/Reels. Нужно понять, важна ли речь в кадре.',
    '360-видео и необычные ракурсы. Нужна подсказка по креплению.',
    'съемка себя в поездке/прогулке. Нужен удобный комплект без оператора.',
    'мероприятие с эффектными проходками. Нужно уточнить длительность съемки.',
    'влог/разговорные видео. Нужен стабильный кадр и хороший звук.',
    'прогулочная съемка. Нужна компактная камера и плавная картинка.',
    'обзор или мероприятие. Нужно уточнить свет, звук и длительность.',
  ],
  'karaoke-kit': [
    'домашняя вечеринка в квартире. Нужно уточнить гостей, площадь и громкость.',
    'праздник на даче. Нужна колонка на выходные и запас по громкости.',
    'большой зал или танцы. Нужно понять, хватит ли модели или нужен PartyBox 710.',
  ],
} as const

for (const [scenario, values] of Object.entries(exactLegacyScenarios)) {
  for (const value of values) {
    assert.equal(resolveLeadScenario(undefined, value), scenario)
  }
}

assert.equal(resolveLeadScenario('karaoke-kit', 'произвольный текст'), 'karaoke-kit')

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
