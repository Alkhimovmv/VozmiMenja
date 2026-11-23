import { resolveDeliveryOfficeId } from './bookingOffice'

describe('resolveDeliveryOfficeId', () => {
  it('chooses the office containing the most selected catalog items', () => {
    expect(resolveDeliveryOfficeId([
      { officeId: 1, matchedEquipment: 1, totalQuantity: 5 },
      { officeId: 2, matchedEquipment: 2, totalQuantity: 2 },
    ])).toBe(2)
  })

  it('uses quantity and then office id as stable tie breakers', () => {
    expect(resolveDeliveryOfficeId([
      { officeId: 2, matchedEquipment: 1, totalQuantity: 1 },
      { officeId: 1, matchedEquipment: 1, totalQuantity: 3 },
    ])).toBe(1)

    expect(resolveDeliveryOfficeId([
      { officeId: 2, matchedEquipment: 1, totalQuantity: 3 },
      { officeId: 1, matchedEquipment: 1, totalQuantity: 3 },
    ])).toBe(1)
  })

  it('falls back when catalog equipment is not linked to an office', () => {
    expect(resolveDeliveryOfficeId([], 2)).toBe(2)
  })
})
