import apiClient from './client';
import { type FinancialSummary, type MonthlyRevenue, type EquipmentUtilization } from '../types/index.ts';

export const analyticsApi = {
  getMonthlyRevenue: async (officeId?: number): Promise<MonthlyRevenue[]> => {
    const params = officeId ? `?officeId=${officeId}` : '';
    const response = await apiClient.get(`/analytics/monthly-revenue${params}`);
    return response.data;
  },

  getEquipmentUtilization: async (): Promise<EquipmentUtilization[]> => {
    const response = await apiClient.get('/analytics/equipment-utilization');
    return response.data;
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