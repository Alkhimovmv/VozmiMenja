import assert from 'node:assert/strict'
import { buildReviewRequestMessage, findOfficeReviewUrl } from './afterRentalMessages'

// Название офиса в админке («Волжский») отличается от станции на сайте («Волжская»).
assert.equal(findOfficeReviewUrl('Волжский'), 'https://yandex.ru/maps/org/vozmi_menya/206350428739/reviews/')
assert.equal(findOfficeReviewUrl('Динамо'), 'https://yandex.ru/maps/org/vozmi_menya/95879395485/reviews/')
// Неизвестный офис и пустое значение не ломают текст: ведём на основную карточку.
assert.equal(findOfficeReviewUrl('Офис 1'), 'https://yandex.ru/maps/org/vozmi_menya/206350428739/reviews/')
assert.equal(findOfficeReviewUrl(undefined), 'https://yandex.ru/maps/org/vozmi_menya/206350428739/reviews/')

const review = buildReviewRequestMessage({ equipmentNames: 'JBL Partybox 710', officeName: 'Динамо' })
assert.match(review, /взяли JBL Partybox 710 в ВозьмиМеня/)
assert.match(review, /95879395485\/reviews\//)
// Просьба об отзыве не должна содержать бонусов: правила Яндекс Карт запрещают поощрять отзывы.
assert.doesNotMatch(review, /скидк|%|бонус/i)
assert.match(buildReviewRequestMessage({}), /взяли технику в ВозьмиМеня/)

console.log('after rental messages tests passed')
