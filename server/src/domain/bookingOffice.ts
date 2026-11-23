export interface DeliveryOfficeCandidate {
  officeId: number
  matchedEquipment: number
  totalQuantity: number
}

export const resolveDeliveryOfficeId = (
  candidates: DeliveryOfficeCandidate[],
  fallbackOfficeId = 1,
) => {
  const [bestCandidate] = [...candidates].sort((left, right) =>
    right.matchedEquipment - left.matchedEquipment
      || right.totalQuantity - left.totalQuantity
      || left.officeId - right.officeId
  )

  return bestCandidate?.officeId || fallbackOfficeId
}
