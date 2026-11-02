import type { Equipment } from '../types'
import { calculateRentalTotal } from '../utils/pricing'

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
    && item.availableQuantity > 0
    && isJblMicrophones(item)
  )) || null
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
