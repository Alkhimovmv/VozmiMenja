export interface CatalogEquipmentLinkSource {
  id: string
  name: string
}

export interface RentalEquipmentLinkSource {
  id: number
  name: string
  officeId: number | null
  catalogEquipmentId: string | null
}

export interface CatalogEquipmentLinkUpdate {
  rentalEquipmentId: number
  catalogEquipmentId: string
}

export type CatalogEquipmentLinkSkipReason =
  | 'missing-office'
  | 'catalog-name-not-unique'
  | 'office-name-not-unique'
  | 'catalog-already-linked'

export interface CatalogEquipmentLinkSkip {
  rentalEquipmentId: number
  name: string
  reason: CatalogEquipmentLinkSkipReason
}

export const normalizeCatalogEquipmentName = (name: string) =>
  name.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, '')

export function planCatalogEquipmentLinkBackfill(
  catalogEquipment: CatalogEquipmentLinkSource[],
  rentalEquipment: RentalEquipmentLinkSource[],
): { updates: CatalogEquipmentLinkUpdate[]; skipped: CatalogEquipmentLinkSkip[] } {
  const catalogByNormalizedName = new Map<string, CatalogEquipmentLinkSource[]>()
  for (const item of catalogEquipment) {
    const normalizedName = normalizeCatalogEquipmentName(item.name)
    const matches = catalogByNormalizedName.get(normalizedName) || []
    matches.push(item)
    catalogByNormalizedName.set(normalizedName, matches)
  }

  const officeRowsByNormalizedName = new Map<string, RentalEquipmentLinkSource[]>()
  for (const item of rentalEquipment) {
    if (item.officeId === null) continue
    const key = `${item.officeId}:${normalizeCatalogEquipmentName(item.name)}`
    const matches = officeRowsByNormalizedName.get(key) || []
    matches.push(item)
    officeRowsByNormalizedName.set(key, matches)
  }

  const linkedCatalogIdsByOffice = new Set(
    rentalEquipment
      .filter((item) => item.officeId !== null && Boolean(item.catalogEquipmentId))
      .map((item) => `${item.officeId}:${item.catalogEquipmentId}`),
  )

  const updates: CatalogEquipmentLinkUpdate[] = []
  const skipped: CatalogEquipmentLinkSkip[] = []

  for (const item of rentalEquipment) {
    if (item.catalogEquipmentId) continue
    if (item.officeId === null) {
      skipped.push({ rentalEquipmentId: item.id, name: item.name, reason: 'missing-office' })
      continue
    }

    const normalizedName = normalizeCatalogEquipmentName(item.name)
    const catalogMatches = catalogByNormalizedName.get(normalizedName) || []
    if (catalogMatches.length !== 1) {
      skipped.push({ rentalEquipmentId: item.id, name: item.name, reason: 'catalog-name-not-unique' })
      continue
    }

    const officeMatches = officeRowsByNormalizedName.get(`${item.officeId}:${normalizedName}`) || []
    if (officeMatches.length !== 1) {
      skipped.push({ rentalEquipmentId: item.id, name: item.name, reason: 'office-name-not-unique' })
      continue
    }

    const catalogEquipmentId = catalogMatches[0].id
    const officeCatalogKey = `${item.officeId}:${catalogEquipmentId}`
    if (linkedCatalogIdsByOffice.has(officeCatalogKey)) {
      skipped.push({ rentalEquipmentId: item.id, name: item.name, reason: 'catalog-already-linked' })
      continue
    }

    updates.push({ rentalEquipmentId: item.id, catalogEquipmentId })
    linkedCatalogIdsByOffice.add(officeCatalogKey)
  }

  return { updates, skipped }
}
