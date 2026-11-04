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

export const getLeadResultLabel = (result: LeadResult) => LEAD_RESULT_LABELS[result]

export const resolveLeadScenario = (...candidates: Array<string | null | undefined>): LeadScenario | undefined => {
  for (const candidate of candidates) {
    if (candidate && candidate in SCENARIO_LABELS) return candidate as LeadScenario
  }

  for (const candidate of candidates) {
    if (!candidate) continue
    const normalized = candidate.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е')
    if (/химчист|диван|ковр|салон/.test(normalized)) return 'puzzi-cleaning'
    if (/gopro|камер|поезд|reels|влог|съемк/.test(normalized)) return 'travel-camera'
    if (/partybox|караок|вечерин|праздник|дач|зал|танц/.test(normalized)) return 'karaoke-kit'
  }

  return undefined
}

export const getLeadScenarioLabel = (scenario?: LeadScenario | string) => {
  if (!scenario) return 'Не указано'
  return scenario in SCENARIO_DISPLAY_LABELS
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
  const offer = scenario && scenario in SCENARIO_LABELS
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
