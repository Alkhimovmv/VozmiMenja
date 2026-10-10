import type { Booking, CreateRentalDto, Equipment } from '../types'

export const normalizeEquipmentName = (name: string) =>
  name.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '')

export const normalizeAdminPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('7')) {
    return `8${digits.slice(1, 11)}`
  }

  if (digits.startsWith('8')) {
    return digits.slice(0, 11)
  }

  return digits.length === 10 ? `8${digits}` : digits.slice(0, 11)
}

export const formatBookingDateTime = (date: string, time: string) => `${date}T${time}`

const normalizeTime = (time?: string) => {
  const match = time?.match(/^(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : undefined
}

export const extractBookingRentalTimes = (booking: Pick<Booking, 'startTime' | 'endTime' | 'comment'>) => {
  const commentTimes = booking.comment?.match(/Время аренды:\s*(\d{2}:\d{2})\s*[—-]\s*(\d{2}:\d{2})/)
  return {
    startTime: normalizeTime(booking.startTime) || commentTimes?.[1] || '10:00',
    endTime: normalizeTime(booking.endTime) || commentTimes?.[2] || '20:00',
  }
}

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

const getFirstAvailableInstance = (item: Equipment) => {
  const availableQuantity = Number(
    item.availableQuantity ?? (item as unknown as { available_quantity?: number }).available_quantity ?? item.quantity
  ) || 0

  return availableQuantity > 0 && item.quantity > 0 ? 1 : undefined
}

export const buildRentalFromBooking = (
  booking: Booking,
  equipment: Equipment[],
  currentOfficeId: number,
  origin = 'https://vozmimenya.ru',
): Partial<CreateRentalDto> => {
  const matchedEquipment = matchAdminEquipment(booking, equipment)
  const matchedInstanceNumber = matchedEquipment ? getFirstAvailableInstance(matchedEquipment) : undefined
  const equipmentInstances = matchedEquipment && matchedInstanceNumber
    ? [{ equipment_id: Number(matchedEquipment.id), instance_number: matchedInstanceNumber }]
    : []
  const sourceText = [
    `Заявка с сайта #${booking.id}`,
    booking.equipment?.name ? `Оборудование на сайте: ${booking.equipment.name}` : '',
    booking.preferredContact ? `Предпочтительный канал связи: ${booking.preferredContact}` : '',
    booking.deliveryMethod ? `Получение: ${booking.deliveryMethod === 'delivery' ? 'доставка' : 'самовывоз'}` : '',
    booking.officeName ? `Офис заявки: ${booking.officeName}` : '',
    booking.deliveryAddress ? `Адрес доставки: ${booking.deliveryAddress}` : '',
    booking.comment ? `Комментарий клиента: ${booking.comment}` : '',
    booking.legalOfferAcceptedAt
      ? `Юридическое согласие: оферта/договор/ПДн приняты ${booking.legalOfferAcceptedAt}; версия: ${booking.legalTermsVersion || 'не указана'}`
      : '',
    `Страница: ${formatSourcePage(booking.sourcePage, origin)}`,
    `Источник: ${formatLeadSource(booking)}`,
  ].filter(Boolean).join('\n')
  const rentalTimes = extractBookingRentalTimes(booking)

  return {
    equipment_id: equipmentInstances[0]?.equipment_id || 0,
    equipment_ids: equipmentInstances.map(item => item.equipment_id),
    equipment_instances: equipmentInstances,
    start_date: formatBookingDateTime(booking.startDate, rentalTimes.startTime),
    end_date: formatBookingDateTime(booking.endDate, rentalTimes.endTime),
    customer_name: booking.customerName,
    customer_phone: normalizeAdminPhone(booking.customerPhone),
    needs_delivery: booking.deliveryMethod === 'delivery',
    delivery_address: booking.deliveryMethod === 'delivery' ? booking.deliveryAddress || '' : '',
    rental_price: booking.totalPrice,
    delivery_price: null,
    delivery_costs: null,
    source: 'сайт',
    comment: sourceText,
    office_id: booking.officeId || currentOfficeId,
  }
}
