import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

const redirectSearch = window.location.search

if (redirectSearch.startsWith('?/')) {
  const redirectPath = redirectSearch.slice(2)
  const queryStartIndex = redirectPath.indexOf('&')
  const pathname =
    (queryStartIndex === -1
      ? redirectPath
      : redirectPath.slice(0, queryStartIndex)
    ).replace(/~and~/g, '&')
  const search =
    queryStartIndex === -1
      ? ''
      : `?${redirectPath.slice(queryStartIndex + 1).replace(/~and~/g, '&')}`

  window.history.replaceState(
    null,
    '',
    `/${pathname}${search}${window.location.hash}`,
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))

    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
    }
  })
}
