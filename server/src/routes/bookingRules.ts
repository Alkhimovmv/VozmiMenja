import { z } from 'zod'

export const parseDateInput = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const calculateRentalDays = (startDate: Date, endDate: Date) => {
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}

const optionalLeadField = (maxLength: number) =>
  z.string().optional().transform((value) => value?.slice(0, maxLength))

export const createBookingSchema = z.object({
  equipmentId: z.string().min(1, 'Не выбрано оборудование').max(120, 'Некорректный ID оборудования'),
  customerName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  customerPhone: z.string().min(10, 'Некорректный номер телефона'),
  customerEmail: z.string().email('Некорректный email').optional().or(z.literal('')),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата начала'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата окончания'),
  comment: z.string().max(1000).optional(),
  sourcePage: optionalLeadField(500),
  referrer: optionalLeadField(500),
  utmSource: optionalLeadField(120),
  utmMedium: optionalLeadField(120),
  utmCampaign: optionalLeadField(180)
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
