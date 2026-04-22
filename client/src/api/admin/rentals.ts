import apiClient from './client';
import { type CreateRentalDto, type Rental } from '../types/index';

export interface Customer {
  customerName: string;
  customerPhone: string;
  rentalCount: number;
}

export const rentalsApi = {
  getAll: async (officeId?: number): Promise<Rental[]> => {
    const params = officeId ? `?officeId=${officeId}` : '';
    const response = await apiClient.get(`/rentals${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Rental> => {
    const response = await apiClient.get(`/rentals/${id}`);
    return response.data;
  },

  getGanttData: async (startDate?: string, endDate?: string, officeId?: number): Promise<Rental[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (officeId) params.append('officeId', String(officeId));

    const response = await apiClient.get(`/rentals/gantt?${params.toString()}`);
    return response.data;
  },

  getCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/rentals/customers');
    return response.data;
  },

  create: async (data: CreateRentalDto): Promise<Rental> => {
    const response = await apiClient.post('/rentals', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateRentalDto & { status: string }>): Promise<Rental> => {
    const response = await apiClient.put(`/rentals/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rentals/${id}`);
  },
};