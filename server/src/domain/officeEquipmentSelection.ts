export interface OfficeEquipmentSelectionItem {
  equipmentId: number
  instanceNumber: number
}

export interface OfficeEquipmentInventoryItem {
  id: number
  officeId: number | null
  quantity: number
}

export type OfficeEquipmentSelectionError =
  | 'equipment-not-found'
  | 'office-mismatch'
  | 'instance-out-of-range'
  | 'duplicate-instance'

export function validateOfficeEquipmentSelection(
  selection: OfficeEquipmentSelectionItem[],
  inventory: OfficeEquipmentInventoryItem[],
  officeId: number,
): OfficeEquipmentSelectionError | null {
  const inventoryById = new Map(inventory.map((item) => [item.id, item]))
  const selectedInstances = new Set<string>()

  for (const item of selection) {
    const inventoryItem = inventoryById.get(item.equipmentId)
    if (!inventoryItem) return 'equipment-not-found'
    if (inventoryItem.officeId !== officeId) return 'office-mismatch'
    if (item.instanceNumber < 1 || item.instanceNumber > inventoryItem.quantity) {
      return 'instance-out-of-range'
    }

    const key = `${item.equipmentId}:${item.instanceNumber}`
    if (selectedInstances.has(key)) return 'duplicate-instance'
    selectedInstances.add(key)
  }

  return null
}
