import type { Equipment } from '../types'
import { calculateRentalTotal } from '../utils/pricing'

export const getSelectedEquipment = (equipment: Equipment[], equipmentIds: string[]) => {
  const byId = new Map(equipment.map((item) => [item.id, item]))
  return equipmentIds
    .map((id) => byId.get(id))
    .filter((item): item is Equipment => Boolean(item))
}

export const buildSelectedEquipmentList = (items: Equipment[]) =>
  items.map((item, index) => `${index + 1}. ${item.name} (${item.category})`).join('\n')

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
