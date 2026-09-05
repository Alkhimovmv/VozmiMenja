import apiClient from './client';
import type { Booking } from '../../types';

interface BookingsResponse {
  success: boolean;
  data: Booking[];
}

interface BookingResponse {
  success: boolean;
  data: Booking;
}

const unwrapBookings = (response: Booking[] | BookingsResponse): Booking[] =>
  Array.isArray(response) ? response : response.data;

const unwrapBooking = (response: Booking | BookingResponse): Booking =>
  'data' in response ? response.data : response;

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[] | BookingsResponse>('/bookings');
    return unwrapBookings(response.data);
  },

  updateStatus: async (id: string, status: Booking['status']): Promise<Booking> => {
    const response = await apiClient.patch<Booking | BookingResponse>(`/bookings/${id}/status`, { status });
    return unwrapBooking(response.data);
  },
};
