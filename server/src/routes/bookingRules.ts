import { z } from 'zod'

export const parseDateInput = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const calculateRentalDays = (startDate: Date, endDate: Date) => {
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}

export const parseDateTimeInput = (date: string, time = '10:00') => {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hours || 0, minutes || 0)
}

export const calculateBillableRentalDays = (
  startDate: string,
  endDate: string,
  startTime = '10:00',
  endTime = '10:00'
) => {
  const start = parseDateTimeInput(startDate, startTime)
  const end = parseDateTimeInput(endDate, endTime)
  if (end <= start) return 0

  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return Math.max(1, Math.ceil(diffHours / 24))
}

const optionalLeadField = (maxLength: number) =>
  z.string().optional().transform((value) => value?.slice(0, maxLength))

export function normalizeAdminPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('7')) {
    return `8${digits.slice(1, 11)}`
  }

  if (digits.startsWith('8')) {
    return digits.slice(0, 11)
  }

  return digits.length === 10 ? `8${digits}` : digits.slice(0, 11)
}

export const createBookingSchema = z.object({
  equipmentId: z.string().min(1, 'Не выбрано оборудование').max(120, 'Некорректный ID оборудования'),
  customerName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  customerPhone: z.string().min(10, 'Некорректный номер телефона').transform(normalizeAdminPhone),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата начала'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата окончания'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Некорректное время начала').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Некорректное время окончания').optional(),
  comment: z.string().max(1000).optional(),
  preferredContact: optionalLeadField(80),
  deliveryMethod: z.enum(['pickup', 'delivery']).optional(),
  deliveryAddress: optionalLeadField(500),
  sourcePage: optionalLeadField(500),
  referrer: optionalLeadField(500),
  utmSource: optionalLeadField(120),
  utmMedium: optionalLeadField(120),
  utmCampaign: optionalLeadField(180),
  legal: z.object({
    offerAccepted: z.literal(true),
    agreementAccepted: z.literal(true),
    privacyAccepted: z.literal(true),
    termsVersion: z.string().min(3).max(120),
  }).optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
