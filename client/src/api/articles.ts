import axios from 'axios'
import { Article, CreateArticleDto } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'

export const articlesApi = {
  // Публичные методы
  getAll: async (): Promise<Article[]> => {
    const response = await axios.get(`${API_URL}/articles`)
    return response.data
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const response = await axios.get(`${API_URL}/articles/slug/${slug}`)
    return response.data
  },

  getByCategory: async (category: string): Promise<Article[]> => {
    const response = await axios.get(`${API_URL}/articles/category/${category}`)
    return response.data
  },

  getPopular: async (limit: number = 5): Promise<Article[]> => {
    const response = await axios.get(`${API_URL}/articles/popular?limit=${limit}`)
    return response.data
  },

  getRecent: async (limit: number = 5): Promise<Article[]> => {
    const response = await axios.get(`${API_URL}/articles/recent?limit=${limit}`)
    return response.data
  },

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
