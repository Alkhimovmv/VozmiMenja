import assert from 'node:assert/strict'
import { getEquipmentDecision, type EquipmentPerformancePeriods } from './equipmentPerformance'
import type { EquipmentUtilization } from '../types/admin'

const snapshot = (overrides: Partial<EquipmentUtilization> = {}): EquipmentUtilization => ({
  id: 1,
  name: 'Тестовое оборудование',
  quantity: 1,
  office_id: 1,
  total_rentals: 4,
  rented_days: 15,
  idle_days: 15,
  observation_days: 30,
  total_revenue: 10_000,
  average_revenue: 2_500,
  utilization_percent: 50,
  investment_value: 20_000,
  gross_return_percent: 50,
  ...overrides,
})

const reports = (
  month: Partial<EquipmentUtilization>,
  quarter: Partial<EquipmentUtilization>,
  year: Partial<EquipmentUtilization>
): EquipmentPerformancePeriods => ({
  30: [snapshot({ observation_days: 30, ...month })],
  90: [snapshot({ observation_days: 90, ...quarter })],
  365: [snapshot({ observation_days: 365, ...year })],
})

assert.equal(getEquipmentDecision(reports(
  { total_rentals: 3, utilization_percent: 45 },
  { utilization_percent: 30 },
  {}
), 1).label, 'Рассмотреть докупку')

assert.equal(getEquipmentDecision(reports(
  { utilization_percent: 0 },
  { total_rentals: 0, utilization_percent: 0 },
  { total_rentals: 0, utilization_percent: 0, gross_return_percent: 0 }
), 1).label, 'Проверить продажу')

assert.equal(getEquipmentDecision(reports(
  { utilization_percent: 5 },
  { total_rentals: 3, utilization_percent: 12 },
  { gross_return_percent: 60 }
), 1).label, 'Оставить')

assert.equal(getEquipmentDecision(reports(
  {},
  {},
  { observation_days: 45, total_rentals: 0 }
), 1).label, 'Мало данных')

console.log('equipmentPerformance tests passed')
