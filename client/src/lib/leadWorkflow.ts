import type { LeadResult, LeadScenario } from '../types'

const LEAD_RESULT_LABELS: Record<LeadResult, string> = {
  unreached: 'Не связались',
  thinking: 'Думает',
  booked: 'Забронировано',
  declined: 'Отказ',
  duplicate: 'Дубль',
}

const SCENARIO_LABELS: Record<LeadScenario, string> = {
  'puzzi-cleaning': 'моющий пылесос для химчистки',
  'karaoke-kit': 'караоке-комплект JBL с микрофонами',
  'travel-camera': 'камеру для поездки или съёмки',
}

const SCENARIO_DISPLAY_LABELS: Record<LeadScenario, string> = {
  'puzzi-cleaning': 'Моющий пылесос для химчистки',
  'karaoke-kit': 'Караоке-комплект JBL с микрофонами',
  'travel-camera': 'Камера для поездки или съёмки',
}

const hasOwn = (object: object, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(object, key)

export const LEGACY_LEAD_SCENARIO_VALUES: Readonly<Record<LeadScenario, readonly string[]>> = {
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
}

const normalizeLegacyScenario = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru-RU').replaceAll('ё', 'е')

const LEGACY_LEAD_SCENARIO_LOOKUP = new Map<string, LeadScenario>(
  (Object.entries(LEGACY_LEAD_SCENARIO_VALUES) as Array<[LeadScenario, readonly string[]]>).flatMap(
    ([scenario, values]) => values.map((value) => [normalizeLegacyScenario(value), scenario]),
  ),
)

export const getLeadResultLabel = (result: LeadResult) => LEAD_RESULT_LABELS[result]

export const resolveLeadScenario = (...candidates: Array<string | null | undefined>): LeadScenario | undefined => {
  for (const candidate of candidates) {
    if (candidate && hasOwn(SCENARIO_LABELS, candidate)) return candidate as LeadScenario
  }

  for (const candidate of candidates) {
    if (!candidate) continue
    const resolved = LEGACY_LEAD_SCENARIO_LOOKUP.get(normalizeLegacyScenario(candidate))
    if (resolved) return resolved
  }

  return undefined
}

export const getLeadScenarioLabel = (scenario?: LeadScenario | string) => {
  if (!scenario) return 'Не указано'
  return hasOwn(SCENARIO_DISPLAY_LABELS, scenario)
    ? SCENARIO_DISPLAY_LABELS[scenario as LeadScenario]
    : scenario
}

export const buildLeadReply = ({
  customerName,
  scenario,
  officeName,
}: {
  customerName: string
  scenario?: LeadScenario | string
  officeName?: string
}) => {
  const firstName = customerName.trim().split(/\s+/)[0] || 'клиент'
  const offer = scenario && hasOwn(SCENARIO_LABELS, scenario)
    ? SCENARIO_LABELS[scenario as LeadScenario]
    : 'оборудование'
  const officeSuffix = officeName?.trim() ? ` Офис: ${officeName.trim()}.` : ''

  return `${firstName}, здравствуйте! Вы оставляли заявку на ${offer} в «ВозьмиМеня». Подскажите, даты ещё актуальны?${officeSuffix}`
}

export const parseLeadRevenue = (value: string): { ok: true; revenue: number | null } | { ok: false } => {
  if (!value.trim()) return { ok: true, revenue: null }

  const revenue = Number(value)
  return Number.isFinite(revenue) && revenue >= 0 && revenue <= 10_000_000
    ? { ok: true, revenue }
    : { ok: false }
}
