import { dehydrate, QueryClientProvider } from '@tanstack/react-query'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { createAppQueryClient } from './query/queryClient'
import { prefetchPublicRoute } from './ssr/prefetchRoute'
import { RenderEnvironmentProvider } from './ssr/RenderEnvironmentProvider'
import { renderBufferedStream } from './ssr/renderStream'
import { resolvePublicRoute } from './ssr/publicRoutes'
import { serializeForInlineScript } from './ssr/serialize'

export type SsrPageResult =
  | { type: 'redirect'; status: 301; location: string }
  | { type: 'admin'; status: 404 }
  | {
      type: 'html'
      status: 200 | 404
      cacheable: boolean
      appHtml: string
      headHtml: string
      stateJson: string
    }

export async function renderPage(url: string): Promise<SsrPageResult> {
  const route = resolvePublicRoute(url)
  if (route.kind === 'redirect') return { type: 'redirect', status: 301, location: route.location }
  if (route.kind === 'admin') return { type: 'admin', status: 404 }

  const queryClient = createAppQueryClient(true)
  const { status } = await prefetchPublicRoute(queryClient, route)
  const nowIso = new Date().toISOString()
  const helmetContext: { helmet?: Record<string, { toString(): string }> } = {}
  const rendered = await renderBufferedStream(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <RenderEnvironmentProvider value={{ nowIso }}>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </RenderEnvironmentProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  )

  if (rendered.errors.length > 0) throw rendered.errors[0]

  const helmet = helmetContext.helmet
  const headHtml = helmet
    ? [helmet.title, helmet.priority, helmet.meta, helmet.link, helmet.script]
      .filter(Boolean)
      .map((entry) => entry.toString())
      .join('\n')
    : ''

  return {
    type: 'html',
    status,
    cacheable: route.cacheable,
    appHtml: rendered.html,
    headHtml,
    stateJson: serializeForInlineScript({ queryState: dehydrate(queryClient), nowIso }),
  }
}
