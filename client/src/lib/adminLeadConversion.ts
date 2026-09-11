import type { Booking, CreateRentalDto, Equipment } from '../types'

export const normalizeEquipmentName = (name: string) =>
  name.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '')

export const formatBookingDateTime = (date: string, time: '10:00' | '20:00') => `${date}T${time}`

export const formatLeadSource = (lead: {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
}) => {
  if (lead.utmSource) {
    return [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ')
  }

  if (lead.referrer) {
    try {
      return new URL(lead.referrer).hostname.replace(/^www\./, '')
    } catch {
      return lead.referrer
    }
  }

  return 'Прямой заход'
}

export const formatSourcePage = (sourcePage?: string, origin = 'https://vozmimenya.ru') => {
  if (!sourcePage) return 'Страница не передана'
  try {
    const url = sourcePage.startsWith('http') ? new URL(sourcePage) : new URL(sourcePage, origin)
    return url.pathname === '/' ? 'Главная' : url.pathname
  } catch {
    return sourcePage
  }
}

export const matchAdminEquipment = (booking: Booking, equipment: Equipment[]) => {
  const bookingEquipmentName = normalizeEquipmentName(booking.equipment?.name || '')
  if (!bookingEquipmentName) return undefined

  return equipment.find((item) => {
    const adminName = normalizeEquipmentName(item.name)
    return adminName === bookingEquipmentName || adminName.includes(bookingEquipmentName) || bookingEquipmentName.includes(adminName)
  })
}

export const buildRentalFromBooking = (
  booking: Booking,
  equipment: Equipment[],
  currentOfficeId: number,
  origin = 'https://vozmimenya.ru',
): Partial<CreateRentalDto> => {
  const matchedEquipment = matchAdminEquipment(booking, equipment)
  const equipmentInstances = matchedEquipment
    ? [{ equipment_id: Number(matchedEquipment.id), instance_number: 1 }]
    : []
  const sourceText = [
    `Заявка с сайта #${booking.id}`,
    booking.equipment?.name ? `Оборудование на сайте: ${booking.equipment.name}` : '',
    booking.comment ? `Комментарий клиента: ${booking.comment}` : '',
    `Страница: ${formatSourcePage(booking.sourcePage, origin)}`,
    `Источник: ${formatLeadSource(booking)}`,
  ].filter(Boolean).join('\n')

  return {
    equipment_id: equipmentInstances[0]?.equipment_id || 0,
    equipment_ids: equipmentInstances.map(item => item.equipment_id),
    equipment_instances: equipmentInstances,
    start_date: formatBookingDateTime(booking.startDate, '10:00'),
    end_date: formatBookingDateTime(booking.endDate, '20:00'),
    customer_name: booking.customerName,
    customer_phone: booking.customerPhone,
    needs_delivery: false,
    rental_price: booking.totalPrice,
    delivery_price: null,
    delivery_costs: null,
    source: 'сайт',
    comment: sourceText,
    office_id: currentOfficeId,
  }
}
