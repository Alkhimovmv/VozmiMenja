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

const isFullName = (value: string) => value
  .trim()
  .split(/\s+/)
  .filter((part) => part.replace(/[-']/g, '').length >= 2)
  .length >= 2

const equipmentIdSchema = z.string()
  .trim()
  .min(1, 'Не выбрано оборудование')
  .max(120, 'Некорректный ID оборудования')

const dateInputSchema = (label: string) => z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, `Некорректная дата ${label}`)
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year
      && date.getMonth() === month - 1
      && date.getDate() === day
  }, `Некорректная дата ${label}`)

const timeInputSchema = (label: string) => z.string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, `Некорректное время ${label}`)

const phoneSchema = z.string()
  .transform(normalizeAdminPhone)
  .refine((value) => /^8\d{10}$/.test(value), 'Некорректный номер телефона')

export const createBookingSchema = z.object({
  equipmentId: equipmentIdSchema.optional(),
  equipmentIds: z.array(equipmentIdSchema)
    .min(1, 'Не выбрано оборудование')
    .max(20, 'В одной заявке можно выбрать не более 20 позиций')
    .refine((ids) => new Set(ids).size === ids.length, 'Оборудование не должно повторяться')
    .optional(),
  customerName: z.string()
    .min(5, 'Укажите ФИО полностью')
    .max(200, 'ФИО слишком длинное')
    .refine(isFullName, 'Укажите минимум фамилию и имя'),
  customerPhone: phoneSchema,
  startDate: dateInputSchema('начала'),
  endDate: dateInputSchema('окончания'),
  startTime: timeInputSchema('начала').optional(),
  endTime: timeInputSchema('окончания').optional(),
  officeId: z.coerce.number().int().positive('Выберите офис получения').optional(),
  officeName: optionalLeadField(160),
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
}).refine((data) => Boolean(data.equipmentIds?.length || data.equipmentId), {
  message: 'Не выбрано оборудование',
  path: ['equipmentIds'],
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export const getBookingEquipmentIds = (data: Pick<CreateBookingInput, 'equipmentId' | 'equipmentIds'>) =>
  data.equipmentIds?.length ? data.equipmentIds : [data.equipmentId!]
