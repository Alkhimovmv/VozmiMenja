import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import process from 'node:process'

const SSR_HOST = process.env.SSR_HOST || '127.0.0.1'
const SSR_PORT = Number(process.env.SSR_PORT || '3004')
const TEMPLATE_URL = new URL('./dist-ssr/template.html', import.meta.url)
const RENDERER_URL = new URL('./dist-ssr/entry-server.js', import.meta.url)

const writeJson = (response, status, payload) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

const buildDocument = (template, result) => template
  .replace('<!--ssr-head-->', result.headHtml)
  .replace('<div id="root"></div>', `<div id="root">${result.appHtml}</div>`)
  .replace(
    '<!--ssr-state-->',
    `<script>window.__VOZMIMENYA_SSR__=${result.stateJson}</script>`,
  )

export async function createSsrServer() {
  const [template, renderer] = await Promise.all([
    readFile(TEMPLATE_URL, 'utf8'),
    import(RENDERER_URL.href),
  ])

  if (typeof renderer.renderPage !== 'function') {
    throw new Error('SSR bundle does not export renderPage')
  }

  return createServer(async (request, response) => {
    const startedAt = performance.now()
    const url = new URL(request.url || '/', 'https://vozmimenya.ru')
    const log = (status, outcome) => process.stdout.write(`${JSON.stringify({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: url.pathname,
      status,
      outcome,
      renderMs: Math.round((performance.now() - startedAt) * 10) / 10,
    })}\n`)

    if (url.pathname === '/health') {
      writeJson(response, 200, { status: 'ok', renderer: 'ready' })
      log(200, 'health')
      return
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD')
      writeJson(response, 405, { status: 'method_not_allowed' })
      log(405, 'method_not_allowed')
      return
    }

    try {
      const result = await renderer.renderPage(`${url.pathname}${url.search}`)
      response.setHeader('X-VozmiMenja-Render', 'ssr')

      if (result.type === 'redirect') {
        response.writeHead(result.status, { Location: result.location })
        response.end()
        log(result.status, 'redirect')
        return
      }

      if (result.type === 'admin') {
        writeJson(response, 404, { status: 'admin_not_served' })
        log(404, 'admin_not_served')
        return
      }

      const document = buildDocument(template, result)
      response.writeHead(result.status, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': result.cacheable
          ? 'public, max-age=0, s-maxage=60'
          : 'private, no-store',
      })
      response.end(request.method === 'HEAD' ? undefined : document)
      log(result.status, result.status === 404 ? 'not_found' : 'rendered')
    } catch (error) {
      process.stderr.write(`${JSON.stringify({
        timestamp: new Date().toISOString(),
        path: url.pathname,
        outcome: 'render_error',
        message: error instanceof Error ? error.message : String(error),
      })}\n`)
      writeJson(response, 503, { status: 'render_unavailable' })
      log(503, 'render_error')
    }
  })
}

async function start() {
  const server = await createSsrServer()
  server.listen(SSR_PORT, SSR_HOST, () => {
    process.stdout.write(`${JSON.stringify({
      timestamp: new Date().toISOString(),
      outcome: 'listening',
      host: SSR_HOST,
      port: SSR_PORT,
    })}\n`)
  })

  const shutdown = () => server.close(() => process.exit(0))
  process.once('SIGTERM', shutdown)
  process.once('SIGINT', shutdown)
}

const isRuntimeEntrypoint = [process.argv[1], process.env.pm_exec_path]
  .some((entrypoint) => entrypoint && import.meta.url === pathToFileURL(entrypoint).href)

if (isRuntimeEntrypoint) {
  start().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
    process.exit(1)
  })
}
