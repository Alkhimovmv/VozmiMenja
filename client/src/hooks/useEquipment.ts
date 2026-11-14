import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { equipmentQueries, type EquipmentListParams } from '../query/equipmentQueries'
import type { BookingRequest } from '../types'

export const useEquipment = (params?: EquipmentListParams) => useQuery(equipmentQueries.list(params))

export const useEquipmentById = (id: string) => useQuery(equipmentQueries.detail(id))

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

export const useEquipmentStats = () => useQuery(equipmentQueries.stats())

export const useCategoryCounts = () => useQuery(equipmentQueries.categoryCounts())

export const usePublicOffices = () => useQuery(equipmentQueries.offices())
