import type { QueryClient } from '@tanstack/react-query'
import { articleQueries } from '../query/articleQueries'
import { equipmentQueries } from '../query/equipmentQueries'
import type { PublicRoute } from './publicRoutes'

const categoryByPath: Record<string, string> = {
  '/arenda-pylesosov-moskva': 'Пылесосы, уборка и клининг',
  '/arenda-gopro-moskva': 'Камеры',
  '/arenda-audiooborudovaniya-moskva': 'Аудиооборудование',
}

export async function prefetchPublicRoute(
  queryClient: QueryClient,
  route: PublicRoute,
): Promise<{ status: 200 | 404 }> {
  if (route.kind === 'not-found') return { status: 404 }
  if (route.kind === 'admin' || route.kind === 'redirect') return { status: 200 }

  if (route.kind === 'equipment') {
    const response = await queryClient.fetchQuery(equipmentQueries.detail(route.id))
    if (!response?.success || !response.data) return { status: 404 }
    await queryClient.fetchQuery(equipmentQueries.list({ limit: 3, category: response.data.category }))
    return { status: 200 }
  }

  if (route.kind === 'article') {
    const [article] = await Promise.all([
      queryClient.fetchQuery(articleQueries.detail(route.slug)),
      queryClient.fetchQuery(articleQueries.recent(100)),
    ])
    return { status: article ? 200 : 404 }
  }

  if (route.path === '/') {
    await Promise.all([
      queryClient.fetchQuery(equipmentQueries.list({ page: 1, limit: 12 })),
      queryClient.fetchQuery(equipmentQueries.stats()),
      queryClient.fetchQuery(equipmentQueries.categoryCounts()),
      queryClient.fetchQuery(articleQueries.recent(3)),
    ])
    return { status: 200 }
  }

  if (route.path === '/blog') {
    await Promise.all([
      queryClient.fetchQuery(articleQueries.list('all')),
      queryClient.fetchQuery(articleQueries.popular(5)),
    ])
    return { status: 200 }
  }

  if (route.path === '/sitemap') {
    await Promise.all([
      queryClient.fetchQuery(equipmentQueries.list({ limit: 200 })),
      queryClient.fetchQuery(articleQueries.list('all')),
    ])
    return { status: 200 }
  }

  if (route.path === '/booking') {
    await Promise.all([
      queryClient.fetchQuery(equipmentQueries.list({ limit: 100 })),
      queryClient.fetchQuery(equipmentQueries.offices()),
    ])
    return { status: 200 }
  }

  if (route.path === '/booking/success') return { status: 200 }

  if (route.path === '/arenda-tehniki-na-mesyac-moskva') {
    await queryClient.fetchQuery(equipmentQueries.list({ limit: 100 }))
    return { status: 200 }
  }

  const category = categoryByPath[route.path]
  if (category) {
    await Promise.all([
      queryClient.fetchQuery(equipmentQueries.list({ page: 1, limit: 12, category })),
      queryClient.fetchQuery(equipmentQueries.list({ limit: 200 })),
    ])
    return { status: 200 }
  }

  await queryClient.fetchQuery(equipmentQueries.list({ limit: 200 }))
  return { status: 200 }
}
