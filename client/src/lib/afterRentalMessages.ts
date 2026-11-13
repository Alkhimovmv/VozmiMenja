import business from '../content/business.json'

// Сообщения клиенту после возврата техники. Просьба об отзыве и «приведи друга» — два отдельных
// текста: Яндекс Карты запрещают поощрять отзывы, поэтому бонус не должен звучать как плата за отзыв.

const BOOKING_URL = 'vozmimenya.ru/booking'

type OfficeRating = { metro: string; url: string }

const officeRatings: OfficeRating[] = business.offices.flatMap((office) => (
  'yandexMaps' in office && office.yandexMaps
    ? [{ metro: office.metro, url: office.yandexMaps.url }]
    : []
))

// В админке офис называется «Волжский», на сайте — «м. Волжская»: сравниваем по общему началу.
const normalize = (value: string) => value.toLowerCase().replace(/ё/g, 'е').slice(0, 5)

export function findOfficeReviewUrl(officeName?: string): string {
  const fallback = officeRatings[0]?.url || 'https://yandex.ru/maps/'
  if (!officeName) return `${fallback}reviews/`
  const match = officeRatings.find((office) => normalize(officeName).startsWith(normalize(office.metro)))
  return `${(match || officeRatings[0])?.url || fallback}reviews/`
}

export function buildReviewRequestMessage(params: { equipmentNames?: string; officeName?: string }): string {
  const what = params.equipmentNames?.trim() ? `${params.equipmentNames.trim()} ` : 'технику '
  return [
    `Здравствуйте! Спасибо, что взяли ${what}в ВозьмиМеня.`,
    `Если всё прошло хорошо, оставьте, пожалуйста, пару слов на Яндекс Картах — по отзывам нас находят другие: ${findOfficeReviewUrl(params.officeName)}`,
    'Если что-то было не так, ответьте на это сообщение — разберёмся.',
  ].join('\n\n')
}

export function buildReferralMessage(): string {
  return [
    'Здравствуйте! Если знакомым понадобится колонка, камера или пылесос, пусть при брони на '
      + `${BOOKING_URL} укажут ваш телефон в поле «Кто посоветовал».`,
    'Другу — скидка 10% на аренду, вам — 10% на следующую.',
  ].join('\n\n')
}
