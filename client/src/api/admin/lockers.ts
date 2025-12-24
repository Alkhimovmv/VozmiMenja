import { CreateLockerDto, Locker } from '../../types/admin';
import { authenticatedRequest } from './client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const lockersApi = {
  async getAll(): Promise<Locker[]> {
    return authenticatedRequest(`${API_URL}/api/admin/lockers`);
  },

  async getById(id: number): Promise<Locker> {
    return authenticatedRequest(`${API_URL}/api/admin/lockers/${id}`);
  },

  async create(data: CreateLockerDto): Promise<Locker> {
    return authenticatedRequest(`${API_URL}/api/admin/lockers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<CreateLockerDto>): Promise<Locker> {
    return authenticatedRequest(`${API_URL}/api/admin/lockers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return authenticatedRequest(`${API_URL}/api/admin/lockers/${id}`, {
      method: 'DELETE',
    });
  },

  async generateCode(): Promise<{ code: string }> {
    return authenticatedRequest(`${API_URL}/api/admin/lockers/generate-code`);
  },
};
