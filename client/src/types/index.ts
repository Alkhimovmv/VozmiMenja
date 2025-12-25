// Export admin types
export * from './admin'

export interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  image_url: string | null
  category: string
  tags: string | null
  author: string
  published: boolean
  views: number
  created_at: string
  updated_at: string
}

export interface CreateArticleDto {
  title: string
  slug: string
  excerpt: string
  content: string
  image_url?: string | null
  category: string
  tags?: string | null
  author?: string
  published?: boolean
}

export interface PricingTier {
  day1_10to20: number  // 1 день с 10:00 до 20:00
  day1: number         // 1 сутки
  days2: number        // 2 суток
  days3: number        // 3 суток
  days7: number        // неделя
  days14: number       // 2 недели
  days30: number       // месяц
  days1_2?: number     // Старое поле для обратной совместимости
}

export interface PublicEquipment {
  id: string
  name: string
  category: string
  pricePerDay: number
  pricing?: PricingTier  // Новая структура цен
  quantity: number
  availableQuantity: number
  images: string[]
  description: string
  specifications: Record<string, string>
  createdAt: string
  updatedAt: string
}

// Keep Equipment exported for backward compatibility with public API
export type { PublicEquipment as Equipment }

export interface CreateEquipmentDto {
  name: string
  category: string
  pricePerDay: number
  pricing?: PricingTier
  quantity: number
  availableQuantity?: number
  images: string[]
  description: string
  specifications: Record<string, string>
}

export interface Booking {
  id: string
  equipmentId: string
  equipment?: PublicEquipment
  customerName: string
  customerPhone: string
  customerEmail: string
  startDate: string
  endDate: string
  totalPrice: number
  comment?: string
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface BookingRequest {
  equipmentId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  startDate: string
  endDate: string
  comment?: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}