import apiClient from './client';
import { type Equipment, type CreateEquipmentDto } from '../types/index';

export const equipmentApi = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/admin/equipment');
    return response.data;
  },

  getById: async (id: number): Promise<Equipment> => {
    const response = await apiClient.get(`/admin/equipment/${id}`);
    return response.data;
  },

  create: async (data: CreateEquipmentDto): Promise<Equipment> => {
    const response = await apiClient.post('/admin/equipment', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateEquipmentDto>): Promise<Equipment> => {
    const response = await apiClient.put(`/admin/equipment/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/equipment/${id}`);
  },

  // Получить оборудование с виртуальными экземплярами для аренды
  getForRental: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/admin/equipment/for-rental');
    return response.data;
  },
};