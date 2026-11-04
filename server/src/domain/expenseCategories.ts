export const CLASSIFIED_EXPENSE_CATEGORY_VALUES = [
  'Покупка оборудования',
  'Постамат и инфраструктура',
  'Аренда помещения',
  'Реклама и продвижение',
  'Доставка и топливо',
  'Ремонт и обслуживание',
  'Расходники и химия',
  'Офис и хозяйственные расходы',
  'Интернет и связь',
  'Комиссии и сервисы',
  'Налоги и сборы',
  'Зарплата и подрядчики',
  'Прочие операционные',
] as const

export const EXPENSE_CATEGORY_VALUES = [
  ...CLASSIFIED_EXPENSE_CATEGORY_VALUES,
  'Требует разбора',
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORY_VALUES[number]
export type ExpenseType = 'operational' | 'capital'

const CAPITAL_CATEGORIES = new Set<ExpenseCategory>([
  'Покупка оборудования',
  'Постамат и инфраструктура',
])

export const getExpenseType = (category: ExpenseCategory): ExpenseType =>
  CAPITAL_CATEGORIES.has(category) ? 'capital' : 'operational'

export const normalizeExpenseCategory = (category?: string | null): ExpenseCategory => {
  const normalized = category?.trim() || ''
  const aliases: Record<string, ExpenseCategory> = {
    'Покупка оборудования': 'Покупка оборудования',
    'Топливо': 'Доставка и топливо',
    'Ремонт оборудования': 'Ремонт и обслуживание',
    'Реклама': 'Реклама и продвижение',
    'Аренда': 'Аренда помещения',
    'Аренда помещения': 'Аренда помещения',
    'Аренда помещений': 'Аренда помещения',
    'Арендв': 'Аренда помещения',
    'Интернет и связь': 'Интернет и связь',
    'Упаковка и расходники': 'Расходники и химия',
    'Прочее': 'Требует разбора',
  }

  if (aliases[normalized]) return aliases[normalized]
  if ((EXPENSE_CATEGORY_VALUES as readonly string[]).includes(normalized)) {
    return normalized as ExpenseCategory
  }
  return 'Требует разбора'
}
