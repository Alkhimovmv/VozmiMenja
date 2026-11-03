export interface RentalPriceSuggestion {
  rentalDays: number
  baselineTariffTotal: number
  currentTariffTotal: number
  tariffDelta: number
  suggestedTotal: number
}

export function buildRentalPriceSuggestion(
  savedRentalPrice: number | null,
  baselineTariffTotal: number,
  currentTariffTotal: number,
  rentalDays: number,
): RentalPriceSuggestion {
  const tariffDelta = currentTariffTotal - baselineTariffTotal

  return {
    rentalDays,
    baselineTariffTotal,
    currentTariffTotal,
    tariffDelta,
    suggestedTotal: savedRentalPrice === null
      ? currentTariffTotal
      : Math.max(0, savedRentalPrice + tariffDelta),
  }
}
