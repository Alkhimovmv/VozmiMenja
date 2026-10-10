import assert from 'node:assert/strict'
import { buildRentalFromBooking, extractBookingRentalTimes, formatLeadSource, formatSourcePage, matchAdminEquipment, normalizeAdminPhone } from './adminLeadConversion'
import type { Booking, Equipment } from '../types'

const booking: Booking = {
  id: 'booking-1',
  equipmentId: 'public-1',
  equipment: {
    id: 'public-1',
    name: 'JBL PartyBox 320',
    category: 'Аудиооборудование',
    pricePerDay: 1000,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
  customerName: 'Максим',
  customerPhone: '+7 999 000-00-00',
  startDate: '2026-09-12',
  endDate: '2026-09-13',
  startTime: '12:30',
  endTime: '14:00',
  officeId: 2,
  officeName: 'Офис 2',
  totalPrice: 2000,
  comment: 'Нужна колонка на дачу',
  sourcePage: 'https://vozmimenya.ru/arenda-kolonki-dlya-vecherinki-moskva?utm_source=test',
  utmSource: 'telegram',
  utmMedium: 'post',
  utmCampaign: 'partybox',
  status: 'pending',
  createdAt: '2026-09-10T10:00:00Z',
  updatedAt: '2026-09-10T10:00:00Z',
}

const equipment: Equipment[] = [
  {
    id: '42',
    name: 'JBL PartyBox 320',
    category: 'Аудиооборудование',
    pricePerDay: 1000,
    quantity: 1,
    availableQuantity: 1,
    images: [],
    description: '',
    specifications: {},
    createdAt: '',
    updatedAt: '',
  },
]

const unavailableOfficeEquipment: Equipment[] = [
  {
    ...equipment[0],
    quantity: 0,
    availableQuantity: 0,
  },
]

assert.equal(formatLeadSource(booking), 'telegram / post / partybox')
assert.equal(formatSourcePage(booking.sourcePage), '/arenda-kolonki-dlya-vecherinki-moskva')
assert.equal(matchAdminEquipment(booking, equipment)?.id, '42')
assert.equal(normalizeAdminPhone('+7 999 000-00-00'), '89990000000')
assert.equal(normalizeAdminPhone('8 (999) 000-00-00'), '89990000000')
assert.equal(normalizeAdminPhone('9990000000'), '89990000000')

const rental = buildRentalFromBooking(booking, equipment, 3)

assert.equal(rental.equipment_id, 42)
assert.deepEqual(rental.equipment_ids, [42])
assert.deepEqual(rental.equipment_instances, [{ equipment_id: 42, instance_number: 1 }])
assert.equal(rental.start_date, '2026-09-12T12:30')
assert.equal(rental.end_date, '2026-09-13T14:00')
assert.equal(rental.customer_name, 'Максим')
assert.equal(rental.customer_phone, '89990000000')
assert.equal(rental.rental_price, 2000)
assert.equal(rental.source, 'сайт')
assert.equal(rental.office_id, 2)
assert.match(rental.comment || '', /Заявка с сайта #booking-1/)
assert.match(rental.comment || '', /Оборудование на сайте: JBL PartyBox 320/)
assert.match(rental.comment || '', /Офис заявки: Офис 2/)

const rentalWithoutOfficeEquipment = buildRentalFromBooking(booking, unavailableOfficeEquipment, 3)
assert.equal(rentalWithoutOfficeEquipment.equipment_id, 0)
assert.deepEqual(rentalWithoutOfficeEquipment.equipment_ids, [])
assert.deepEqual(rentalWithoutOfficeEquipment.equipment_instances, [])

assert.deepEqual(extractBookingRentalTimes({
  comment: 'Самостоятельное оформление брони клиентом.\nВремя аренды: 11:00 — 19:30',
}), { startTime: '11:00', endTime: '19:30' })

console.log('adminLeadConversion tests passed')
