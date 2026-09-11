import assert from 'node:assert/strict'
import { buildRentalFromBooking, formatLeadSource, formatSourcePage, matchAdminEquipment } from './adminLeadConversion'
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
  customerEmail: '',
  startDate: '2026-09-12',
  endDate: '2026-09-13',
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

assert.equal(formatLeadSource(booking), 'telegram / post / partybox')
assert.equal(formatSourcePage(booking.sourcePage), '/arenda-kolonki-dlya-vecherinki-moskva')
assert.equal(matchAdminEquipment(booking, equipment)?.id, '42')

const rental = buildRentalFromBooking(booking, equipment, 3)

assert.equal(rental.equipment_id, 42)
assert.deepEqual(rental.equipment_ids, [42])
assert.deepEqual(rental.equipment_instances, [{ equipment_id: 42, instance_number: 1 }])
assert.equal(rental.start_date, '2026-09-12T10:00')
assert.equal(rental.end_date, '2026-09-13T20:00')
assert.equal(rental.customer_name, 'Максим')
assert.equal(rental.customer_phone, '+7 999 000-00-00')
assert.equal(rental.rental_price, 2000)
assert.equal(rental.source, 'сайт')
assert.equal(rental.office_id, 3)
assert.match(rental.comment || '', /Заявка с сайта #booking-1/)
assert.match(rental.comment || '', /Оборудование на сайте: JBL PartyBox 320/)

console.log('adminLeadConversion tests passed')
