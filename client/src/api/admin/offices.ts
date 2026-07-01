import apiClient from './client';
import type { LockerCommand, PostomatStatus } from '../../types/admin';

export interface LockerRow {
  row: number;
  count: number;
  size: 'small' | 'medium' | 'large';
}

export interface Office {
  id: number;
  name: string;
  address: string;
  locker_rows: LockerRow[];
  postomat_status?: PostomatStatus | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOfficeDto {
  name: string;
  address?: string;
  locker_rows?: LockerRow[];
}

export interface CreateLockerCommandDto {
  lockerId: number;
}

export const officesApi = {
  getAll: async (): Promise<Office[]> => {
    const response = await apiClient.get('/offices');
    return response.data;
  },

  create: async (data: CreateOfficeDto): Promise<Office> => {
    const response = await apiClient.post('/offices', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateOfficeDto>): Promise<Office> => {
    const response = await apiClient.put(`/offices/${id}`, data);
    return response.data;
  },

  createLockerCommand: async (officeId: number, data: CreateLockerCommandDto): Promise<LockerCommand> => {
    const response = await apiClient.post(`/offices/${officeId}/locker-commands`, data);
    return response.data;
  },

  getLockerCommands: async (officeId: number): Promise<LockerCommand[]> => {
    const response = await apiClient.get(`/offices/${officeId}/locker-commands`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/offices/${id}`);
  },
};
