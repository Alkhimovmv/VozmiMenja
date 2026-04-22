import { CreateLockerDto, Locker, SetLockerEquipmentDto } from '../../types/admin';
import apiClient from './client';

export const lockersApi = {
  async getAll(officeId?: number): Promise<Locker[]> {
    const params = officeId ? `?officeId=${officeId}` : '';
    const response = await apiClient.get(`/lockers${params}`);
    return response.data;
  },

  async getById(id: number): Promise<Locker> {
    const response = await apiClient.get(`/lockers/${id}`);
    return response.data;
  },

  async create(data: CreateLockerDto): Promise<Locker> {
    const response = await apiClient.post('/lockers', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateLockerDto>): Promise<Locker> {
    const response = await apiClient.put(`/lockers/${id}`, data);
    return response.data;
  },

  async setEquipment(id: number, data: SetLockerEquipmentDto): Promise<Locker> {
    const response = await apiClient.put(`/lockers/${id}/equipment`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/lockers/${id}`);
  },

  async generateCode(): Promise<{ code: string }> {
    const response = await apiClient.get('/lockers/generate-code');
    return response.data;
  },
};
