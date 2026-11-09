import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { getStaticEquipment } from '../lib/staticData'
import type { BookingRequest } from '../types'

export const useEquipment = (params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['equipment', params],
    queryFn: () => apiClient.getEquipment(params),
  })
}

export const useEquipmentById = (id: string) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => apiClient.getEquipmentById(id),
    enabled: !!id,
    // Данные из пререндера показываем сразу, а свежие подтягиваем в фоне (initialDataUpdatedAt: 0 = устарели).
    initialData: () => {
      const equipment = getStaticEquipment(window.location.pathname)
      return equipment ? { success: true, data: equipment } : undefined
    },
    initialDataUpdatedAt: 0,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (booking: BookingRequest) => apiClient.createBooking(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiClient.getBookings(),
  })
}

export const useEquipmentStats = () => {
  return useQuery({
    queryKey: ['equipment-stats'],
    queryFn: () => apiClient.getEquipmentStats(),
  })
}

export const useCategoryCounts = () => {
  return useQuery({
    queryKey: ['category-counts'],
    queryFn: () => apiClient.getCategoryCounts(),
  })
}

export const usePublicOffices = () => {
  return useQuery({
    queryKey: ['public-offices'],
    queryFn: () => apiClient.getOffices(),
  })
}
