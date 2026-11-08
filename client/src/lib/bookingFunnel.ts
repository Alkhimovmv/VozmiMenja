import type { BookingFunnelReport } from '../api/admin/analytics'

export type BookingFunnelRow = {
  key: keyof BookingFunnelReport['stages']
  label: string
  value: number
  widthPercent: number
  conversionFromBooking: number | null
}

const labels: Array<[keyof BookingFunnelReport['stages'], string]> = [
  ['equipmentView', 'Открыли карточку'],
  ['bookingView', 'Открыли бронь'],
  ['equipmentSelected', 'Выбрали оборудование'],
  ['formStarted', 'Начали заполнять'],
  ['bookingSubmitted', 'Отправили бронь'],
]

export const buildBookingFunnelRows = (report: BookingFunnelReport): BookingFunnelRow[] => {
  const maximum = Math.max(1, ...Object.values(report.stages))
  const bookingViews = report.stages.bookingView

  return labels.map(([key, label]) => ({
    key,
    label,
    value: report.stages[key],
    widthPercent: Math.round((report.stages[key] / maximum) * 100),
    conversionFromBooking: key === 'equipmentView' || key === 'bookingView' || bookingViews === 0
      ? null
      : Math.round((report.stages[key] / bookingViews) * 100),
  }))
}
