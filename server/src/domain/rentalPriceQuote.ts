import type { Equipment } from '../models/Equipment'
import { calculateBillableRentalDays } from '../routes/bookingRules'
import { calculateRentalTotal } from '../utils/pricing'

export interface RentalPriceQuoteItem {
  rentalEquipmentId: number
  rentalEquipmentName: string
  catalogEquipment: Equipment
}

export interface RentalPriceQuoteResult {
  rentalDays: number
  total: number
  items: Array<{
    rentalEquipmentId: number
    rentalEquipmentName: string
    catalogEquipmentId: string
    catalogEquipmentName: string
    total: number
  }>
}

const parseRentalDateTime = (value: string) => {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (!match) throw new Error('Некорректная дата и время аренды')
  return { date: match[1], time: match[2] }
}

export function calculateRentalPriceQuote(
  equipmentItems: RentalPriceQuoteItem[],
  startDateTime: string,
  endDateTime: string,
): RentalPriceQuoteResult {
  const start = parseRentalDateTime(startDateTime)
  const end = parseRentalDateTime(endDateTime)
  const rentalDays = calculateBillableRentalDays(start.date, end.date, start.time, end.time)

  if (rentalDays <= 0) {
    throw new Error('Дата и время окончания должны быть позже начала аренды')
  }

  const items = equipmentItems.map((item) => ({
    rentalEquipmentId: item.rentalEquipmentId,
    rentalEquipmentName: item.rentalEquipmentName,
    catalogEquipmentId: item.catalogEquipment.id,
    catalogEquipmentName: item.catalogEquipment.name,
    total: calculateRentalTotal(
      item.catalogEquipment.pricing,
      rentalDays,
      item.catalogEquipment.pricePerDay,
      {
        startDate: start.date,
        endDate: end.date,
        startTime: start.time,
        endTime: end.time,
      },
    ),
  }))

  return {
    rentalDays,
    total: items.reduce((sum, item) => sum + item.total, 0),
    items,
  }
}
