import type { Booking, CreateRentalDto, PublicEquipment } from '../types'
import type { RentalEquipment } from '../types/admin'

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

export const getBookingEquipmentItems = (booking: Booking) =>
  booking.equipmentItems?.length
    ? booking.equipmentItems
    : booking.equipment
    ? [booking.equipment]
    : []

export const getBookingEquipmentNames = (booking: Booking) =>
  getBookingEquipmentItems(booking).map((item) => item.name)

export interface BookingEquipmentMapping {
  bookingEquipment: PublicEquipment
  adminEquipment?: RentalEquipment
}

export const resolveBookingEquipmentMappings = (
  booking: Booking,
  equipment: RentalEquipment[],
): BookingEquipmentMapping[] => getBookingEquipmentItems(booking).map((bookingEquipment) => {
  const exactMatches = equipment.filter((item) => item.catalog_equipment_id === bookingEquipment.id)
  return {
    bookingEquipment,
    adminEquipment: exactMatches.length === 1 ? exactMatches[0] : undefined,
  }
})

export const matchAdminEquipment = (booking: Booking, equipment: RentalEquipment[]) =>
  resolveBookingEquipmentMappings(booking, equipment)[0]?.adminEquipment

export const matchAdminEquipmentItems = (booking: Booking, equipment: RentalEquipment[]) =>
  resolveBookingEquipmentMappings(booking, equipment)
    .flatMap((mapping) => mapping.adminEquipment ? [mapping.adminEquipment] : [])

export interface BookingRentalBuildOptions {
  availableInstancesByEquipmentId?: Record<number, number[]>
  availabilityCheckFailedEquipmentIds?: number[]
}

const getFirstAvailableInstance = (
  item: RentalEquipment,
  availableInstancesByEquipmentId?: Record<number, number[]>,
) => {
  if (availableInstancesByEquipmentId) {
    return availableInstancesByEquipmentId[item.id]?.[0]
  }

  return item.quantity > 0 ? 1 : undefined
}

export const buildRentalFromBooking = (
  booking: Booking,
  equipment: RentalEquipment[],
  currentOfficeId: number,
  origin = 'https://vozmimenya.ru',
  options: BookingRentalBuildOptions = {},
): Partial<CreateRentalDto> => {
  const bookingEquipmentNames = getBookingEquipmentNames(booking)
  const mappings = resolveBookingEquipmentMappings(booking, equipment)
  const equipmentInstances = mappings.flatMap(({ adminEquipment }) => {
    if (!adminEquipment) return []
    const matchedInstanceNumber = getFirstAvailableInstance(
      adminEquipment,
      options.availableInstancesByEquipmentId,
    )
    return matchedInstanceNumber
      ? [{ equipment_id: Number(adminEquipment.id), instance_number: matchedInstanceNumber }]
      : []
  })
  const missingEquipmentNames = mappings
    .filter((mapping) => !mapping.adminEquipment)
    .map((mapping) => mapping.bookingEquipment.name)
  const unavailableEquipmentNames = options.availableInstancesByEquipmentId
    ? mappings
        .filter((mapping) => (
          mapping.adminEquipment
          && !options.availabilityCheckFailedEquipmentIds?.includes(mapping.adminEquipment.id)
          && (options.availableInstancesByEquipmentId?.[mapping.adminEquipment.id]?.length || 0) === 0
        ))
        .map((mapping) => mapping.bookingEquipment.name)
    : []
  const failedAvailabilityEquipmentNames = mappings
    .filter((mapping) => (
      mapping.adminEquipment
      && options.availabilityCheckFailedEquipmentIds?.includes(mapping.adminEquipment.id)
    ))
    .map((mapping) => mapping.bookingEquipment.name)
  const sourceText = [
    `Заявка с сайта #${booking.id}`,
    bookingEquipmentNames.length ? `Оборудование на сайте: ${bookingEquipmentNames.join(', ')}` : '',
    missingEquipmentNames.length
      ? `Требует ручного выбора: нет связи с оборудованием офиса — ${missingEquipmentNames.join(', ')}`
      : '',
    unavailableEquipmentNames.length
      ? `Все экземпляры заняты на даты заявки — ${unavailableEquipmentNames.join(', ')}`
      : '',
    failedAvailabilityEquipmentNames.length
      ? `Не удалось проверить занятость — ${failedAvailabilityEquipmentNames.join(', ')}`
      : '',
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
