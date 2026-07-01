import apiClient from './client';
import { type RentalEquipment, type CreateRentalEquipmentDto } from '../../types/admin';

export const equipmentApi = {
  getAll: async (officeId?: number): Promise<RentalEquipment[]> => {
    const params = officeId ? `?officeId=${officeId}` : '';
    const response = await apiClient.get(`/equipment${params}`);
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<RentalEquipment> => {
    const response = await apiClient.get(`/equipment/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateRentalEquipmentDto): Promise<RentalEquipment> => {
    const response = await apiClient.post('/equipment', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<CreateRentalEquipmentDto>): Promise<RentalEquipment> => {
    const response = await apiClient.put(`/equipment/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/equipment/${id}`);
  },

  getForRental: async (officeId?: number): Promise<RentalEquipment[]> => {
    const params = officeId ? `?officeId=${officeId}` : '';
    const response = await apiClient.get(`/equipment/for-rental${params}`);
    return response.data;
  },
};
