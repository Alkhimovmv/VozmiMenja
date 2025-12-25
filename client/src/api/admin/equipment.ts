import apiClient from './client';
import { type Equipment, type CreateEquipmentDto } from '../types/index';

export const equipmentApi = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/equipment');
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await apiClient.get(`/equipment/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateEquipmentDto): Promise<Equipment> => {
    const response = await apiClient.post('/equipment', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<CreateEquipmentDto>): Promise<Equipment> => {
    const response = await apiClient.put(`/equipment/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/equipment/${id}`);
  },

  // Получить оборудование с виртуальными экземплярами для аренды
  getForRental: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/equipment/for-rental');
    return response.data;
  },
};