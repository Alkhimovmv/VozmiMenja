export const EXPENSE_CATEGORIES = [
  { value: 'Покупка оборудования', label: 'Покупка оборудования', type: 'capital' },
  { value: 'Постамат и инфраструктура', label: 'Постамат и инфраструктура', type: 'capital' },
  { value: 'Аренда помещения', label: 'Аренда помещения', type: 'operational' },
  { value: 'Реклама и продвижение', label: 'Реклама и продвижение', type: 'operational' },
  { value: 'Доставка и топливо', label: 'Доставка и топливо', type: 'operational' },
  { value: 'Ремонт и обслуживание', label: 'Ремонт и обслуживание', type: 'operational' },
  { value: 'Расходники и химия', label: 'Расходники и химия', type: 'operational' },
  { value: 'Офис и хозяйственные расходы', label: 'Офис и хозяйственные расходы', type: 'operational' },
  { value: 'Интернет и связь', label: 'Интернет и связь', type: 'operational' },
  { value: 'Комиссии и сервисы', label: 'Комиссии и сервисы', type: 'operational' },
  { value: 'Налоги и сборы', label: 'Налоги и сборы', type: 'operational' },
  { value: 'Зарплата и подрядчики', label: 'Зарплата и подрядчики', type: 'operational' },
  { value: 'Прочие операционные', label: 'Прочие операционные', type: 'operational' },
] as const;

export const UNCATEGORIZED_EXPENSE = 'Требует разбора';
