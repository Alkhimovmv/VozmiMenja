import { CreateLockerDto, Locker } from '../../types/admin';
import apiClient from './client';

export const lockersApi = {
  async getAll(): Promise<Locker[]> {
    const response = await apiClient.get('/lockers');
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

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/lockers/${id}`);
  },

  async generateCode(): Promise<{ code: string }> {
    const response = await apiClient.get('/lockers/generate-code');
    return response.data;
  },
};
