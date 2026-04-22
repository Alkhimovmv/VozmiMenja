import apiClient from './client';

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
  created_at: string;
  updated_at: string;
}

export interface CreateOfficeDto {
  name: string;
  address?: string;
  locker_rows?: LockerRow[];
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

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/offices/${id}`);
  },
};
