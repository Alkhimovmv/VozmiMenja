import type { EquipmentUtilization } from '../types/admin'

export type EquipmentPerformancePeriod = 30 | 90 | 365

export type EquipmentPerformancePeriods = Record<
  EquipmentPerformancePeriod,
  EquipmentUtilization[]
>

export type EquipmentDecision = {
  label: string
  reason: string
  tone: 'green' | 'blue' | 'amber' | 'gray'
}

const findSnapshot = (
  reports: EquipmentPerformancePeriods,
  period: EquipmentPerformancePeriod,
  equipmentId: number
) => reports[period].find((item) => item.id === equipmentId)

export const getEquipmentDecision = (
  reports: EquipmentPerformancePeriods,
  equipmentId: number
): EquipmentDecision => {
  const month = findSnapshot(reports, 30, equipmentId)
  const quarter = findSnapshot(reports, 90, equipmentId)
  const year = findSnapshot(reports, 365, equipmentId)

  if (!month || !quarter || !year || year.observation_days < 60) {
    return {
      label: 'Мало данных',
      reason: 'Позиция новая или статистика ещё не накопилась',
      tone: 'gray',
    }
  }

  if (
    month.total_rentals >= 2 &&
    month.utilization_percent >= 40 &&
    quarter.utilization_percent >= 25
  ) {
    return {
      label: 'Рассмотреть докупку',
      reason: 'Высокая загрузка держится не только последний месяц',
      tone: 'blue',
    }
  }

  if (
    year.observation_days >= 180 &&
    year.total_rentals <= 1 &&
    year.utilization_percent <= 1 &&
    (year.gross_return_percent === null || year.gross_return_percent < 30)
  ) {
    return {
      label: 'Проверить продажу',
      reason: 'За длительный период почти нет аренды и возврата вложений',
      tone: 'amber',
    }
  }

  if (
    (year.gross_return_percent !== null && year.gross_return_percent >= 100) ||
    quarter.total_rentals >= 3 ||
    quarter.utilization_percent >= 10
  ) {
    return {
      label: 'Оставить',
      reason: year.gross_return_percent !== null && year.gross_return_percent >= 100
        ? 'Стоимость оборудования уже покрыта валовой выручкой'
        : 'Есть устойчивый спрос за последние 90 дней',
      tone: 'green',
    }
  }

  return {
    label: 'Наблюдать',
    reason: 'Недостаточно сигнала для закупки или продажи',
    tone: 'gray',
  }
}
