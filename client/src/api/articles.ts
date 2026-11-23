import axios from 'axios'
import { Article, CreateArticleDto } from '../types'
import { ApiRequestError, getPublicApiBaseUrl } from '../lib/api'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3002/api'

const publicArticleRequest = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${getPublicApiBaseUrl()}${path}`)
  if (!response.ok) {
    throw new ApiRequestError(`HTTP error! status: ${response.status}`, response.status)
  }
  return response.json() as Promise<T>
}

export const articlesApi = {
  // Публичные методы
  getAll: (): Promise<Article[]> => publicArticleRequest('/articles'),

  getBySlug: (slug: string): Promise<Article> => publicArticleRequest(`/articles/slug/${encodeURIComponent(slug)}`),

  getByCategory: (category: string): Promise<Article[]> => publicArticleRequest(`/articles/category/${encodeURIComponent(category)}`),

  getPopular: (limit: number = 5): Promise<Article[]> => publicArticleRequest(`/articles/popular?limit=${limit}`),

  getRecent: (limit: number = 5): Promise<Article[]> => publicArticleRequest(`/articles/recent?limit=${limit}`),

  // Админ методы
  admin: {
    getAll: async (token: string): Promise<Article[]> => {
      const response = await axios.get(`${API_URL}/articles/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },

    getById: async (id: number, token: string): Promise<Article> => {
      const response = await axios.get(`${API_URL}/articles/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },

    create: async (data: CreateArticleDto, token: string): Promise<Article> => {
      const response = await axios.post(`${API_URL}/articles/admin`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },

    update: async (id: number, data: Partial<CreateArticleDto>, token: string): Promise<Article> => {
      const response = await axios.put(`${API_URL}/articles/admin/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },

    delete: async (id: number, token: string): Promise<void> => {
      await axios.delete(`${API_URL}/articles/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  }
}
