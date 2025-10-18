import type { Equipment, Booking, BookingRequest, ApiResponse, PaginatedResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Извлекаем URL сервера, убирая /api с конца
export const API_SERVER_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)  // Убираем последние 4 символа '/api'
  : API_BASE_URL

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  }

  async getEquipment(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }): Promise<PaginatedResponse<Equipment>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    return this.request(`/equipment${query ? `?${query}` : ''}`)
  }

  async getEquipmentById(id: string): Promise<ApiResponse<Equipment>> {
    return this.request(`/equipment/${id}`)
  }

  async getEquipmentStats(): Promise<ApiResponse<{ totalEquipment: number; totalCategories: number }>> {
    return this.request('/equipment/stats')
  }

  async getCategoryCounts(): Promise<ApiResponse<Record<string, number>>> {
    return this.request('/equipment/categories/counts')
  }

  async createBooking(booking: BookingRequest): Promise<ApiResponse<Booking>> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    })
  }

  async getBookings(): Promise<ApiResponse<Booking[]>> {
    return this.request('/bookings')
  }

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return this.request(`/bookings/${id}`)
  }

  // Admin methods
  async adminLogin(password: string): Promise<ApiResponse<{ token: string }>> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  }

  async createEquipment(equipment: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    const token = localStorage.getItem('adminToken')
    return this.request('/admin/equipment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(equipment),
    })
  }

  async updateEquipment(id: string, equipment: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    const token = localStorage.getItem('adminToken')
    return this.request(`/admin/equipment/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(equipment),
    })
  }

  async deleteEquipment(id: string): Promise<ApiResponse<void>> {
    const token = localStorage.getItem('adminToken')
    return this.request(`/admin/equipment/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async uploadImages(files: File[]): Promise<ApiResponse<string[]>> {
    const token = localStorage.getItem('adminToken')
    const formData = new FormData()

    files.forEach(file => {
      formData.append('images', file)
    })

    const url = `${API_BASE_URL}/admin/upload`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  async sendContactMessage(data: {
    name: string
    phone: string
    email?: string
    subject: string
    message: string
  }): Promise<ApiResponse<void>> {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()