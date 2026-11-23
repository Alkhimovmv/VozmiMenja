import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HydrationBoundary, QueryClientProvider, type DehydratedState } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { createAppQueryClient } from './query/queryClient'
import { RenderEnvironmentProvider } from './ssr/RenderEnvironmentProvider'
import './index.css'

declare global {
  interface Window {
    __VOZMIMENYA_SSR__?: {
      queryState: DehydratedState
      nowIso: string
    }
  }
}

function normalizeLegacyPagesRedirect() {
  const redirectSearch = window.location.search
  if (!redirectSearch.startsWith('?/')) return

  const redirectPath = redirectSearch.slice(2)
  const queryStartIndex = redirectPath.indexOf('&')
  const pathname = (queryStartIndex === -1 ? redirectPath : redirectPath.slice(0, queryStartIndex))
    .replace(/~and~/g, '&')
  const search = queryStartIndex === -1
    ? ''
    : `?${redirectPath.slice(queryStartIndex + 1).replace(/~and~/g, '&')}`

  window.history.replaceState(null, '', `/${pathname}${search}${window.location.hash}`)
}

normalizeLegacyPagesRedirect()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

const ssrState = window.__VOZMIMENYA_SSR__
const queryClient = createAppQueryClient(false)
const tree = (
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={ssrState?.queryState}>
          <RenderEnvironmentProvider value={{ nowIso: ssrState?.nowIso || new Date().toISOString() }}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </RenderEnvironmentProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
)

if (ssrState) hydrateRoot(root, tree)
else createRoot(root).render(tree)

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
