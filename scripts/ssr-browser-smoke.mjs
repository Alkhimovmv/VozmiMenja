import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { once } from 'node:events'
import path from 'node:path'
import { tmpdir } from 'node:os'

const DIST = new URL('../client/dist/', import.meta.url)
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))

const equipment = {
  id: 'karcher-puzzi-8-1', slug: 'karcher-puzzi-8-1', name: 'Karcher Puzzi 8/1',
  category: 'Пылесосы, уборка и клининг', pricePerDay: 1800,
  pricing: { day1_10to20: 1500, day1: 1800, days2: 3000, days3: 4200, days7: 8000, days14: 14000, days30: 24000 },
  quantity: 2, availableQuantity: 2, images: ['/logo.png'],
  description: 'Моющий пылесос для мебели и ковров.', specifications: { Мощность: '1200 Вт' },
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z',
}
const article = {
  id: 1, title: 'Как выбрать технику в аренду', slug: 'test-article',
  excerpt: 'Практический гид по выбору оборудования.', content: '## Выбор техники\n\nОпределите задачу.',
  image_url: null, category: 'Общее', tags: 'аренда,техника', author: 'ВозьмиМеня',
  published: true, views: 10, created_at: '2026-11-01T00:00:00.000Z', updated_at: '2026-11-01T00:00:00.000Z',
}

const json = (response, payload, status = 200) => {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(payload))
}

function createMockApi() {
  return createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1')
    if (url.pathname === '/api/equipment/stats') return json(response, { success: true, data: { totalEquipment: 1, totalCategories: 1 } })
    if (url.pathname === '/api/equipment/categories/counts') return json(response, { success: true, data: { [equipment.category]: 1 } })
    if (url.pathname === `/api/equipment/${equipment.id}`) return json(response, { success: true, data: equipment })
    if (url.pathname === '/api/equipment') return json(response, { data: [equipment], total: 1, page: 1, limit: Number(url.searchParams.get('limit') || 12), totalPages: 1 })
    if (url.pathname === '/api/offices') return json(response, { success: true, data: [
      { id: 1, name: 'Волжская', address: 'Москва, Волжский бульвар, 51с15' },
      { id: 2, name: 'Динамо', address: 'Москва, улица Расковой, 1' },
    ] })
    if (url.pathname === '/api/analytics/booking-funnel' && request.method === 'POST') {
      response.writeHead(204)
      response.end()
      return
    }
    if (url.pathname === `/api/articles/slug/${article.slug}`) return json(response, article)
    if (url.pathname === '/api/articles' || url.pathname.startsWith('/api/articles/popular') || url.pathname.startsWith('/api/articles/recent')) return json(response, [article])
    return json(response, { message: 'not found' }, 404)
  })
}

const instrumentation = `<script>
(() => {
  const errors = [];
  const record = (value) => errors.push(String(value && value.message ? value.message : value));
  const originalError = console.error.bind(console);
  console.error = (...args) => { record(args.join(' ')); originalError(...args); };
  addEventListener('error', (event) => { if (event.error) record(event.error); });
  addEventListener('unhandledrejection', (event) => record(event.reason));
  const originalFetch = fetch.bind(window);
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      const url = String(args[0]);
      if (url.includes('/api/') && !response.ok) record('API ' + response.status + ' ' + url);
      return response;
    } catch (error) {
      record(error);
      throw error;
    }
  };
  if (location.pathname === '/') {
    setTimeout(() => document.querySelector('a[href="/blog"]')?.click(), 1000);
  }
  setTimeout(() => {
    document.documentElement.dataset.hydrationErrors = JSON.stringify(errors);
    document.documentElement.dataset.hydrationReady = String(Boolean(document.querySelector('#root h1')));
    document.documentElement.dataset.spaPath = location.pathname;
    document.documentElement.dataset.cookieBanner = String(document.body.textContent.includes('Мы используем cookie'));
    document.documentElement.dataset.whatsapp = String(Boolean(document.querySelector('a[href^="https://wa.me/"]')));
    document.documentElement.dataset.bookingForm = String(Boolean(document.querySelector('form')));
  }, 3500);
})();
</script>`

const contentTypes = new Map([
  ['.js', 'text/javascript; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'], ['.woff2', 'font/woff2'], ['.ico', 'image/x-icon'],
])

function createGateway({ apiOrigin, ssrOrigin }) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1')
      if (url.pathname.startsWith('/api/')) {
        const chunks = []
        for await (const chunk of request) chunks.push(chunk)
        const body = chunks.length ? Buffer.concat(chunks) : undefined
        const upstream = await fetch(`${apiOrigin}${url.pathname}${url.search}`, {
          method: request.method,
          headers: request.headers['content-type'] ? { 'Content-Type': request.headers['content-type'] } : undefined,
          body,
        })
        response.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') || 'application/json' })
        response.end(Buffer.from(await upstream.arrayBuffer()))
        return
      }

      if (url.pathname.startsWith('/assets/') || /\.(?:png|jpe?g|svg|ico|woff2|css|js|json|webmanifest|txt)$/.test(url.pathname)) {
        const relativePath = url.pathname.replace(/^\/+/, '')
        const fileUrl = new URL(relativePath, DIST)
        if (!fileUrl.href.startsWith(DIST.href)) throw new Error('invalid static path')
        const body = await readFile(fileUrl)
        response.writeHead(200, { 'Content-Type': contentTypes.get(path.extname(relativePath)) || 'application/octet-stream' })
        response.end(body)
        return
      }

      const upstream = await fetch(`${ssrOrigin}${url.pathname}${url.search}`)
      let body = await upstream.text()
      if ((upstream.headers.get('content-type') || '').includes('text/html')) {
        body = body.replace('</body>', `${instrumentation}</body>`)
      }
      response.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') || 'text/html; charset=utf-8' })
      response.end(body)
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end(error instanceof Error ? error.message : String(error))
    }
  })
}

async function listen(server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  return `http://127.0.0.1:${address.port}`
}

async function close(server) {
  if (!server.listening) return
  server.close()
  await once(server, 'close')
}

async function dumpDom(url) {
  const userDataDir = await mkdtemp(path.join(tmpdir(), 'vozmimenya-ssr-smoke-'))
  try {
    return await new Promise((resolve, reject) => {
      const child = spawn(chromePath, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
        '--disable-background-networking', '--disable-extensions', '--hide-scrollbars',
        `--user-data-dir=${userDataDir}`, '--virtual-time-budget=5000', '--dump-dom', url,
      ], { stdio: ['ignore', 'pipe', 'pipe'] })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8') })
      child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8') })
      child.once('error', reject)
      child.once('close', (code) => code === 0 ? resolve(stdout) : reject(new Error(`Chrome exited ${code}: ${stderr.slice(-2000)}`)))
    })
  } finally {
    await rm(userDataDir, { recursive: true, force: true })
  }
}

function attribute(html, name) {
  return html.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
}

async function main() {
  assert.ok(chromePath, 'Chrome/Chromium not found; set CHROME_PATH')
  assert.ok(existsSync(new URL('../client/dist/index.html', import.meta.url)), 'Run the client build before browser smoke')

  const api = createMockApi()
  const apiOrigin = await listen(api)
  process.env.SSR_API_URL = `${apiOrigin}/api`
  const { createSsrServer } = await import(new URL('../client/ssr-server.mjs', import.meta.url))
  const ssr = await createSsrServer()
  const ssrOrigin = await listen(ssr)
  const gateway = createGateway({ apiOrigin, ssrOrigin })
  const origin = await listen(gateway)

  try {
    const canaryRoutes = ['/', '/arenda-pylesosov-moskva', '/equipment/karcher-puzzi-8-1', '/blog/test-article']
    const timings = []
    for (const route of canaryRoutes) {
      const startedAt = performance.now()
      const response = await fetch(`${origin}${route}`)
      await response.arrayBuffer()
      const elapsedMs = performance.now() - startedAt
      assert.equal(response.status, 200, route)
      assert.ok(elapsedMs < 500, `${route} exceeded 500ms (${elapsedMs.toFixed(1)}ms)`)
      timings.push(elapsedMs)
    }
    for (let iteration = 0; iteration < 5; iteration += 1) {
      await Promise.all(canaryRoutes.map(async (route) => {
        const response = await fetch(`${origin}${route}`)
        await response.arrayBuffer()
        assert.equal(response.status, 200, route)
      }))
    }

    const home = await dumpDom(`${origin}/`)
    assert.equal(attribute(home, 'data-hydration-errors'), '[]')
    assert.equal(attribute(home, 'data-hydration-ready'), 'true')
    assert.equal(attribute(home, 'data-spa-path'), '/blog')
    assert.equal(attribute(home, 'data-cookie-banner'), 'true')
    assert.equal(attribute(home, 'data-whatsapp'), 'true')

    const booking = await dumpDom(`${origin}/booking`)
    assert.equal(attribute(booking, 'data-hydration-errors'), '[]')
    assert.equal(attribute(booking, 'data-hydration-ready'), 'true')
    assert.equal(attribute(booking, 'data-booking-form'), 'true')
    const rssMb = process.memoryUsage().rss / 1024 / 1024
    assert.ok(rssMb < 256, `SSR smoke process exceeded 256MB RSS (${rssMb.toFixed(1)}MB)`)
    process.stdout.write(`SSR browser hydration smoke passed; max local TTFB ${Math.max(...timings).toFixed(1)}ms; RSS ${rssMb.toFixed(1)}MB\n`)
  } finally {
    await Promise.all([close(gateway), close(ssr), close(api)])
    delete process.env.SSR_API_URL
  }
}

await main()
