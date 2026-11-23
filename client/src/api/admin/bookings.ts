import apiClient from './client';
import type { Booking, LeadWorkflowUpdate } from '../../types';

interface BookingsResponse {
  success: boolean;
  data: Booking[];
}

interface BookingResponse {
  success: boolean;
  data: Booking;
}

export interface LeadReportRow {
  source: string;
  campaign: string;
  currentLeads: number;
  currentStartedBookings: number;
  currentConfirmedRentals: number;
  currentRevenue: number;
  currentConversion: number;
  baselineLeads: number;
  baselineStartedBookings: number;
  baselineConfirmedRentals: number;
  baselineRevenue: number;
  baselineConversion: number;
}

export interface LeadReportResponse {
  generatedAt: string;
  periodDays: 14;
  rows: LeadReportRow[];
}

interface LeadReportEnvelope {
  success: boolean;
  data: LeadReportResponse;
}

const unwrapBookings = (response: Booking[] | BookingsResponse): Booking[] =>
  Array.isArray(response) ? response : response.data;

const unwrapBooking = (response: Booking | BookingResponse): Booking =>
  'data' in response ? response.data : response;

const unwrapLeadReport = (response: LeadReportResponse | LeadReportEnvelope): LeadReportResponse =>
  'data' in response ? response.data : response;

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[] | BookingsResponse>('/bookings');
    return unwrapBookings(response.data);
  },

  getLeadReport: async (): Promise<LeadReportResponse> => {
    const response = await apiClient.get<LeadReportResponse | LeadReportEnvelope>('/lead-report');
    return unwrapLeadReport(response.data);
  },

  updateStatus: async (id: string, status: Booking['status']): Promise<Booking> => {
    const response = await apiClient.patch<Booking | BookingResponse>(`/bookings/${id}/status`, { status });
    return unwrapBooking(response.data);
  },

  updateWorkflow: async (id: string, workflow: LeadWorkflowUpdate): Promise<Booking> => {
    const response = await apiClient.patch<Booking | BookingResponse>(`/bookings/${id}/workflow`, workflow);
    return unwrapBooking(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`);
  },
};
