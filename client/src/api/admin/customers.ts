import apiClient from './client';
import { type Customer, type CustomerNote, type CustomerTag, type Rental } from '../../types/admin';

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  getCustomerRentals: async (phone: string): Promise<Rental[]> => {
    const response = await apiClient.get(`/customers/${encodeURIComponent(phone)}/rentals`);
    return response.data;
  },

  getNote: async (phone: string): Promise<CustomerNote> => {
    const response = await apiClient.get(`/customers/${encodeURIComponent(phone)}/note`);
    return response.data;
  },

  saveNote: async (phone: string, tag: CustomerTag, note: string | null): Promise<CustomerNote> => {
    const response = await apiClient.put(`/customers/${encodeURIComponent(phone)}/note`, { tag, note });
    return response.data;
  },

  deleteNote: async (phone: string): Promise<void> => {
    await apiClient.delete(`/customers/${encodeURIComponent(phone)}/note`);
  },
};
