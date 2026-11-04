import type { Equipment } from '../types'

export const getEquipmentBookingHint = (item: Equipment) => {
  const name = item.name.toLocaleLowerCase('ru-RU')
  const category = item.category.toLocaleLowerCase('ru-RU')

  if (name.includes('puzzi')) return 'моющий пылесос для диванов, ковров и салона авто'
  if (name.includes('wd5')) return 'строительный пылесос для сухой и влажной уборки'
  if (name.includes('sc4') || name.includes('пароочист')) return 'пароочиститель для кухни, плитки и сантехники'
  if (name.includes('vacmaster') || name.includes('сушил')) return 'сушилка для ковров и мебели после химчистки'
  if (name.includes('робот') && name.includes('окон')) return 'робот для мойки окон и зеркал'
  if (name.includes('okami')) return 'пылесос для уборки больших площадей'

  if (name.includes('partybox 710')) return 'мощная колонка для больших помещений и мероприятий'
  if (name.includes('partybox')) return 'портативная колонка для вечеринок и караоке'
  if (name.includes('jbl') && name.includes('микроф')) return 'беспроводные караоке-микрофоны для PartyBox'
  if (name.includes('dji mic') || name.includes('радиомикроф')) return 'радиомикрофон для интервью, видео и блога'

  if (name.includes('gopro')) return 'экшн-камера для спорта, поездок и съёмки в движении'
  if (name.includes('insta360')) return '360°-камера для необычных ракурсов и съёмки себя'
  if (name.includes('osmo pocket')) return 'компактная камера со стабилизацией для влога'

  if (category.includes('камер')) return 'камера для фото и видеосъёмки'
  if (category.includes('аудио')) return 'оборудование для музыки, речи или записи звука'
  if (category.includes('клининг') || category.includes('пылесос') || category.includes('уборк')) {
    return 'оборудование для уборки и клининга'
  }

  return 'оборудование в аренду'
}
import { calculateRentalTotal } from '../utils/pricing'

export type UrgentBookingStart = 'today' | 'tomorrow'

const getMoscowDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

const addDays = (dateKey: string, days: number) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

export const buildUrgentBookingDates = (start: UrgentBookingStart, now = new Date()) => {
  const today = getMoscowDateKey(now)
  const startDate = start === 'tomorrow' ? addDays(today, 1) : today
  return { startDate, endDate: addDays(startDate, 1) }
}

export const getSelectedEquipment = (equipment: Equipment[], equipmentIds: string[]) => {
  const byId = new Map(equipment.map((item) => [item.id, item]))
  return equipmentIds
    .map((id) => byId.get(id))
    .filter((item): item is Equipment => Boolean(item))
}

const isJblPartyBox = (item: Equipment) => {
  const normalizedName = item.name.toLocaleLowerCase('ru-RU')
  return normalizedName.includes('jbl') && normalizedName.includes('partybox') && !normalizedName.includes('микрофон')
}

const isJblMicrophones = (item: Equipment) =>
  item.id === 'jbl-partybox-wireless-microphones'
  || (item.name.toLocaleLowerCase('ru-RU').includes('jbl') && item.name.toLocaleLowerCase('ru-RU').includes('микрофон'))

export const getJblMicrophoneUpsell = (equipment: Equipment[], selectedEquipmentIds: string[]) => {
  const selectedIds = new Set(selectedEquipmentIds)
  const hasPartyBox = equipment.some((item) => selectedIds.has(item.id) && isJblPartyBox(item))

  if (!hasPartyBox) return null

  return equipment.find((item) => (
    !selectedIds.has(item.id)
    && isJblMicrophones(item)
  )) || null
}

export const getPuzziDryerUpsell = (equipment: Equipment[], selectedEquipmentIds: string[]) => {
  const selectedIds = new Set(selectedEquipmentIds)
  const hasPuzzi = equipment.some((item) => (
    selectedIds.has(item.id) && item.name.toLocaleLowerCase('ru-RU').includes('puzzi')
  ))

  if (!hasPuzzi) return null

  return equipment.find((item) => (
    !selectedIds.has(item.id)
    && (
      item.id === 'vacmaster-125w-carpet-dryer'
      || (item.name.toLocaleLowerCase('ru-RU').includes('vacmaster') && item.name.toLocaleLowerCase('ru-RU').includes('сушил'))
    )
  )) || null
}

export const resolveEquipmentSelection = (equipment: Equipment[], identifiers: string[]) => {
  const byIdentifier = new Map<string, Equipment>()
  equipment.forEach((item) => {
    byIdentifier.set(item.id, item)
    if (item.slug) byIdentifier.set(item.slug, item)
  })

  return [...new Set(identifiers)]
    .map((identifier) => byIdentifier.get(identifier)?.id)
    .filter((id): id is string => Boolean(id))
    .slice(0, 20)
}

export const buildSelectedEquipmentList = (items: Equipment[]) =>
  items.map((item, index) => `${index + 1}. ${item.name} (${item.category})`).join('\n')

export const buildSingleBookingEquipmentPayload = (items: Equipment[]) => {
  if (items.length === 0) return null
  return {
    equipmentId: items[0].id,
    equipmentIds: items.map((item) => item.id),
  }
}

export const calculateMultiEquipmentTotal = (
  items: Equipment[],
  rentalDays: number,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
) => {
  if (rentalDays <= 0) return 0

  return items.reduce((sum, item) => sum + calculateRentalTotal(item.pricing, rentalDays, item.pricePerDay, {
    startDate,
    endDate,
    startTime,
    endTime,
  }), 0)
}
