import apiClient from './client';
import { type FinancialSummary, type MonthlyRevenue, type EquipmentUtilization } from '../../types/admin';
import type {
  EquipmentPerformancePeriod,
  EquipmentPerformancePeriods,
} from '../../lib/equipmentPerformance';

const equipmentPerformancePeriods: EquipmentPerformancePeriod[] = [30, 90, 365];

export const analyticsApi = {
  getMonthlyRevenue: async (officeId?: number): Promise<MonthlyRevenue[]> => {
    const params = officeId ? `?officeId=${officeId}` : '';
    const response = await apiClient.get(`/analytics/monthly-revenue${params}`);
    return response.data;
  },

  getEquipmentUtilization: async (officeId?: number, days = 365): Promise<EquipmentUtilization[]> => {
    const params = new URLSearchParams({ days: String(days) });
    if (officeId) params.set('officeId', String(officeId));
    const response = await apiClient.get(`/analytics/equipment-utilization?${params.toString()}`);
    return response.data;
  },

  getEquipmentPerformancePeriods: async (officeId?: number): Promise<EquipmentPerformancePeriods> => {
    const reports = await Promise.all(
      equipmentPerformancePeriods.map((period) => analyticsApi.getEquipmentUtilization(officeId, period))
    );

    return {
      30: reports[0],
      90: reports[1],
      365: reports[2],
    };
  },

  getFinancialSummary: async (year?: number, month?: number, officeId?: number): Promise<FinancialSummary> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (officeId) params.append('officeId', officeId.toString());

    const response = await apiClient.get(`/analytics/financial-summary?${params.toString()}`);
    return response.data;
  },
};
