import { queryOptions } from '@tanstack/react-query'
import { ApiRequestError, apiClient } from '../lib/api'

export interface EquipmentListParams {
  page?: number
  limit?: number
  category?: string
  search?: string
}

export const equipmentQueries = {
  list: (params?: EquipmentListParams) => queryOptions({
    queryKey: ['equipment', params] as const,
    queryFn: () => apiClient.getEquipment(params),
  }),
  detail: (id: string) => queryOptions({
    queryKey: ['equipment', id] as const,
    queryFn: async () => {
      try {
        return await apiClient.getEquipmentById(id)
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) return null
        throw error
      }
    },
    enabled: Boolean(id),
  }),
  stats: () => queryOptions({
    queryKey: ['equipment-stats'] as const,
    queryFn: () => apiClient.getEquipmentStats(),
  }),
  categoryCounts: () => queryOptions({
    queryKey: ['category-counts'] as const,
    queryFn: () => apiClient.getCategoryCounts(),
  }),
  offices: () => queryOptions({
    queryKey: ['public-offices'] as const,
    queryFn: () => apiClient.getOffices(),
  }),
}
