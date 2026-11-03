import { validateOfficeEquipmentSelection } from './officeEquipmentSelection'

const inventory = [
  { id: 10, officeId: 1, quantity: 2 },
  { id: 20, officeId: 2, quantity: 1 },
]

describe('validateOfficeEquipmentSelection', () => {
  it('accepts unique existing instances from the selected office', () => {
    expect(validateOfficeEquipmentSelection([
      { equipmentId: 10, instanceNumber: 1 },
      { equipmentId: 10, instanceNumber: 2 },
    ], inventory, 1)).toBeNull()
  })

  it('rejects missing equipment and equipment from another office', () => {
    expect(validateOfficeEquipmentSelection([{ equipmentId: 99, instanceNumber: 1 }], inventory, 1))
      .toBe('equipment-not-found')
    expect(validateOfficeEquipmentSelection([{ equipmentId: 20, instanceNumber: 1 }], inventory, 1))
      .toBe('office-mismatch')
  })

  it('rejects impossible and duplicate instances', () => {
    expect(validateOfficeEquipmentSelection([{ equipmentId: 10, instanceNumber: 3 }], inventory, 1))
      .toBe('instance-out-of-range')
    expect(validateOfficeEquipmentSelection([
      { equipmentId: 10, instanceNumber: 1 },
      { equipmentId: 10, instanceNumber: 1 },
    ], inventory, 1)).toBe('duplicate-instance')
  })
})
