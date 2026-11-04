import {
  CLASSIFIED_EXPENSE_CATEGORY_VALUES,
  getExpenseType,
  normalizeExpenseCategory,
} from './expenseCategories'

describe('expense categories', () => {
  it('separates investments from operating expenses', () => {
    expect(getExpenseType('Покупка оборудования')).toBe('capital')
    expect(getExpenseType('Постамат и инфраструктура')).toBe('capital')
    expect(getExpenseType('Аренда помещения')).toBe('operational')
  })

  it('normalizes legacy categories and exposes ambiguous rows', () => {
    expect(normalizeExpenseCategory('Реклама')).toBe('Реклама и продвижение')
    expect(normalizeExpenseCategory('Упаковка и расходники')).toBe('Расходники и химия')
    expect(normalizeExpenseCategory('Прочее')).toBe('Требует разбора')
    expect(normalizeExpenseCategory()).toBe('Требует разбора')
  })

  it('does not allow the review queue as a category for new entries', () => {
    expect(CLASSIFIED_EXPENSE_CATEGORY_VALUES).toContain('Доставка и топливо')
    expect(CLASSIFIED_EXPENSE_CATEGORY_VALUES).not.toContain('Требует разбора')
  })
})
