import {
  normalizeCatalogEquipmentName,
  planCatalogEquipmentLinkBackfill,
} from './catalogEquipmentLinks'

describe('catalog equipment links', () => {
  test('normalizes only exact names across punctuation and case', () => {
    expect(normalizeCatalogEquipmentName('Kärcher Puzzi 8/1')).toBe('kärcherpuzzi81')
    expect(normalizeCatalogEquipmentName('Сушилка Vacmaster')).toBe('сушилкаvacmaster')
  })

  test('backfills only an unambiguous exact match in the same office', () => {
    const result = planCatalogEquipmentLinkBackfill(
      [
        { id: 'puzzi-8', name: 'Karcher Puzzi 8/1' },
        { id: 'puzzi-10', name: 'Karcher Puzzi 10/1' },
      ],
      [
        { id: 11, name: 'Karcher Puzzi 8/1', officeId: 1, catalogEquipmentId: null },
        { id: 12, name: 'Puzzi 10', officeId: 1, catalogEquipmentId: null },
      ],
    )

    expect(result.updates).toEqual([{ rentalEquipmentId: 11, catalogEquipmentId: 'puzzi-8' }])
    expect(result.skipped).toEqual([
      { rentalEquipmentId: 12, name: 'Puzzi 10', reason: 'catalog-name-not-unique' },
    ])
  })

  test('does not guess when an office or catalog contains duplicate names', () => {
    const result = planCatalogEquipmentLinkBackfill(
      [
        { id: 'camera-a', name: 'GoPro 13' },
        { id: 'camera-b', name: 'GoPro 13' },
        { id: 'speaker', name: 'JBL PartyBox 320' },
      ],
      [
        { id: 21, name: 'GoPro 13', officeId: 1, catalogEquipmentId: null },
        { id: 22, name: 'JBL PartyBox 320', officeId: 1, catalogEquipmentId: null },
        { id: 23, name: 'JBL PartyBox 320', officeId: 1, catalogEquipmentId: null },
      ],
    )

    expect(result.updates).toEqual([])
    expect(result.skipped.map((item) => item.reason)).toEqual([
      'catalog-name-not-unique',
      'office-name-not-unique',
      'office-name-not-unique',
    ])
  })

  test('does not create a second link for the same catalog item and office', () => {
    const result = planCatalogEquipmentLinkBackfill(
      [{ id: 'dryer', name: 'Сушилка Vacmaster' }],
      [
        { id: 31, name: 'Сушилка Vacmaster', officeId: 2, catalogEquipmentId: 'dryer' },
        { id: 32, name: 'Сушилка Vacmaster', officeId: 2, catalogEquipmentId: null },
      ],
    )

    expect(result.updates).toEqual([])
    expect(result.skipped).toEqual([
      { rentalEquipmentId: 32, name: 'Сушилка Vacmaster', reason: 'office-name-not-unique' },
    ])
  })
})
