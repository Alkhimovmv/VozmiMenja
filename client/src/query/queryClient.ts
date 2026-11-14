import { QueryClient } from '@tanstack/react-query'

export const createAppQueryClient = (isServer = false) => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: isServer ? false : 1,
    },
  },
})
