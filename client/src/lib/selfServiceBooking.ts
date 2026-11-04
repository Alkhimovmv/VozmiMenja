import type { Equipment } from '../types'

export const getEquipmentBookingHint = (item: Equipment) => {
  const name = item.name.toLocaleLowerCase('ru-RU')
  const category = item.category.toLocaleLowerCase('ru-RU')

  if (name.includes('puzzi')) return 'моющий пылесос'
  if (name.includes('wd5')) return 'строительный пылесос'
  if (name.includes('sc4') || name.includes('пароочист')) return 'пароочиститель'
  if (name.includes('vacmaster') || name.includes('сушил')) return 'сушилка'
  if (name.includes('робот') && name.includes('окон')) return 'робот-мойщик окон'
  if (name.includes('okami')) return 'клининговое оборудование'

  if (name.includes('jbl') && name.includes('микроф')) return 'караоке-микрофоны'
  if (name.includes('dji mic') || name.includes('радиомикроф')) return 'радиомикрофон'
  if (name.includes('partybox')) return 'портативная колонка'

  if (name.includes('gopro')) return 'экшн-камера'
  if (name.includes('insta360')) return 'камера 360°'
  if (name.includes('osmo pocket')) return 'компактная камера'

  if (category.includes('камер')) return 'камера'
  if (category.includes('аудио')) return 'аудиооборудование'
  if (category.includes('клининг') || category.includes('пылесос') || category.includes('уборк')) {
    return 'клининговое оборудование'
  }

  return 'оборудование в аренду'
}

const getBookingCategoryPriority = (category: string) => {
  const normalized = category.toLocaleLowerCase('ru-RU')
  if (normalized.includes('клининг') || normalized.includes('пылесос') || normalized.includes('уборк')) return 0
  if (normalized.includes('аудио')) return 1
  if (normalized.includes('камер')) return 2
  return 3
}

export const groupBookingEquipment = (equipment: Equipment[]) => {
  const groups = new Map<string, Equipment[]>()

  equipment.forEach((item) => {
    const group = groups.get(item.category) || []
    group.push(item)
    groups.set(item.category, group)
  })

  return [...groups.entries()].sort(([categoryA], [categoryB]) => {
    const priorityDifference = getBookingCategoryPriority(categoryA) - getBookingCategoryPriority(categoryB)
    return priorityDifference || categoryA.localeCompare(categoryB, 'ru-RU')
  })
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
