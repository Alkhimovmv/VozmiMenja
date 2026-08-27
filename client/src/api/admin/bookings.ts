import apiClient from './client';
import type { Booking } from '../../types';

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  updateStatus: async (id: string, status: Booking['status']): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },
};
