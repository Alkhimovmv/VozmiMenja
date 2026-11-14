import { queryOptions } from '@tanstack/react-query'
import { ApiRequestError } from '../lib/api'
import { articlesApi } from '../api/articles'

export const articleQueries = {
  list: (category = 'all') => queryOptions({
    queryKey: ['articles', 'list', category] as const,
    queryFn: () => category === 'all' ? articlesApi.getAll() : articlesApi.getByCategory(category),
  }),
  popular: (limit = 5) => queryOptions({
    queryKey: ['articles', 'popular', limit] as const,
    queryFn: () => articlesApi.getPopular(limit),
  }),
  recent: (limit = 5) => queryOptions({
    queryKey: ['articles', 'recent', limit] as const,
    queryFn: () => articlesApi.getRecent(limit),
  }),
  detail: (slug: string) => queryOptions({
    queryKey: ['articles', 'detail', slug] as const,
    queryFn: async () => {
      try {
        return await articlesApi.getBySlug(slug)
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) return null
        throw error
      }
    },
    enabled: Boolean(slug),
  }),
}
