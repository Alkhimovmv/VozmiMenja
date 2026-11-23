import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const ROOT = new URL('../', import.meta.url)

test('runtime starts when PM2 loads it through a process container', async (t) => {
  const portProbe = createServer()
  portProbe.listen(0, '127.0.0.1')
  await once(portProbe, 'listening')
  const address = portProbe.address()
  assert.ok(address && typeof address === 'object')
  const port = address.port
  portProbe.close()
  await once(portProbe, 'close')

  const runtimeUrl = new URL('client/ssr-server.mjs', ROOT)
  const runtimePath = fileURLToPath(runtimeUrl)
  const child = spawn(
    process.execPath,
    ['--input-type=module', '--eval', `import(${JSON.stringify(runtimeUrl.href)})`],
    {
      cwd: fileURLToPath(new URL('client/', ROOT)),
      env: {
        ...process.env,
        PM2_HOME: '/tmp/vozmimenya-pm2-test',
        pm_id: '1',
        pm_exec_path: runtimePath,
        SSR_HOST: '127.0.0.1',
        SSR_PORT: String(port),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  t.after(() => {
    if (child.exitCode === null) child.kill('SIGTERM')
  })

  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => { stdout += chunk })
  child.stderr.on('data', (chunk) => { stderr += chunk })

  let health
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (child.exitCode !== null) break
    try {
      health = await fetch(`http://127.0.0.1:${port}/health`)
      if (health.ok) break
    } catch {
      await delay(100)
    }
  }

  assert.equal(
    health?.status,
    200,
    `PM2-style import did not start SSR (exit=${child.exitCode}, stdout=${stdout}, stderr=${stderr})`,
  )
})

test('SSR build and runtime are wired for loopback production use', async () => {
  const [clientPackageText, rootPackageText, runtime] = await Promise.all([
    readFile(new URL('client/package.json', ROOT), 'utf8'),
    readFile(new URL('package.json', ROOT), 'utf8'),
    readFile(new URL('client/ssr-server.mjs', ROOT), 'utf8'),
  ])
  const clientPackage = JSON.parse(clientPackageText)
  const rootPackage = JSON.parse(rootPackageText)

  assert.match(clientPackage.scripts['build:ssr'], /entry-server\.tsx/)
  assert.match(clientPackage.scripts['build:ssr'], /prepare-ssr-template\.mjs/)
  assert.match(clientPackage.scripts.build, /generate-static-route-entrypoints\.js/)
  assert.match(rootPackage.scripts['test:ssr-runtime'], /build:ssr/)
  assert.match(runtime, /SSR_HOST\s*\|\|\s*'127\.0\.0\.1'/)
  assert.match(runtime, /SSR_PORT\s*\|\|\s*'3004'/)
  assert.match(runtime, /\/health/)
  assert.match(runtime, /X-VozmiMenja-Render/)
})

test('built runtime returns SEO-complete HTML, safe state and failure status', async (t) => {
  const equipment = {
    id: 'karcher-puzzi-8-1',
    slug: 'karcher-puzzi-8-1',
    name: 'Karcher Puzzi 8/1',
    category: 'Пылесосы, уборка и клининг',
    pricePerDay: 1800,
    pricing: {
      day1_10to20: 1500,
      day1: 1800,
      days2: 3000,
      days3: 4200,
      days4: 1300,
      days7: 8000,
      days14: 14000,
      days30: 24000,
    },
    quantity: 2,
    availableQuantity: 2,
    images: ['/uploads/test-equipment.webp'],
    description: 'Моющий пылесос для мебели, ковров и салона автомобиля.',
    specifications: { Мощность: '1200 Вт', Бак: '8 л' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  }
  const article = {
    id: 1,
    title: 'Как выбрать технику в аренду',
    slug: 'test-article',
    excerpt: 'Практический гид по выбору оборудования для уборки и мероприятий.',
    content: '## Выбор техники\n\nСначала определите задачу и срок аренды.',
    image_url: null,
    category: 'Общее',
    tags: 'аренда,техника',
    author: 'ВозьмиМеня',
    published: true,
    views: 10,
    created_at: '2026-11-01T00:00:00.000Z',
    updated_at: '2026-11-01T00:00:00.000Z',
  }
  const api = createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1')
    const json = (payload, status = 200) => {
      response.writeHead(status, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(payload))
    }

    if (url.pathname === '/api/equipment/stats') return json({ success: true, data: { totalEquipment: 1, totalCategories: 1 } })
    if (url.pathname === '/api/equipment/categories/counts') return json({ success: true, data: { [equipment.category]: 1 } })
    if (url.pathname === `/api/equipment/${equipment.id}`) return json({ success: true, data: equipment })
    if (url.pathname === '/api/equipment') return json({ data: [equipment], total: 1, page: 1, limit: Number(url.searchParams.get('limit') || 12), totalPages: 1 })
    if (url.pathname === '/api/offices') return json({ success: true, data: [
      { id: 1, name: 'Волжская', address: 'Москва, Волжский бульвар, 51с15' },
      { id: 2, name: 'Динамо', address: 'Москва, улица Расковой, 1' },
    ] })
    if (url.pathname === `/api/articles/slug/${article.slug}`) return json(article)
    if (url.pathname === '/api/articles' || url.pathname.startsWith('/api/articles/popular') || url.pathname.startsWith('/api/articles/recent')) return json([article])

    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ message: 'not found' }))
  })
  api.listen(0, '127.0.0.1')
  await once(api, 'listening')
  t.after(() => {
    if (api.listening) api.close()
  })
  const apiAddress = api.address()
  assert.ok(apiAddress && typeof apiAddress === 'object')
  process.env.SSR_API_URL = `http://127.0.0.1:${apiAddress.port}/api`
  t.after(() => delete process.env.SSR_API_URL)

  const { createSsrServer } = await import(new URL('../client/ssr-server.mjs', import.meta.url))
  const ssr = await createSsrServer()
  ssr.listen(0, '127.0.0.1')
  await once(ssr, 'listening')
  t.after(() => ssr.close())
  const ssrAddress = ssr.address()
  assert.ok(ssrAddress && typeof ssrAddress === 'object')
  const origin = `http://127.0.0.1:${ssrAddress.port}`

  const health = await fetch(`${origin}/health`)
  assert.equal(health.status, 200)
  assert.deepEqual(await health.json(), { status: 'ok', renderer: 'ready' })

  const indexableRoutes = [
    '/',
    '/arenda-pylesosov-moskva',
    '/arenda-karaoke-komplekta-moskva',
    '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva',
    '/equipment/karcher-puzzi-8-1',
    '/blog',
    '/blog/test-article',
    '/arenda-tehniki-u-metro-volzhskaya-kuzminki',
    '/booking',
    '/rental-agreement',
  ]

  for (const route of indexableRoutes) {
    const page = await fetch(`${origin}${route}`)
    const html = await page.text()
    assert.equal(page.status, 200, route)
    assert.equal(page.headers.get('x-vozmimenja-render'), 'ssr', route)
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route} must contain one h1`)
    assert.match(html, /<meta[^>]*name="description"[^>]*content="[^"]+"[^>]*>/, route)
    assert.match(html, /<meta[^>]*name="robots"[^>]*content="index, follow"[^>]*>/, route)
    assert.match(html, /<link[^>]*rel="canonical"[^>]*href="https:\/\/vozmimenya\.ru\/[^"]*"[^>]*>/, route)
    assert.match(html, /<script>window\.__VOZMIMENYA_SSR__=/, route)

    const stateMatch = html.match(/<script>window\.__VOZMIMENYA_SSR__=([\s\S]*?)<\/script>/)
    assert.ok(stateMatch, `${route} must include dehydrated state`)
    const state = JSON.parse(stateMatch[1])
    const serializedState = JSON.stringify(state).toLowerCase()
    for (const secretMarker of ['authorization', 'cookie', 'bearer ', 'ssr_api_url', '127.0.0.1']) {
      assert.doesNotMatch(serializedState, new RegExp(secretMarker.replaceAll('.', '\\.')), `${route} leaked ${secretMarker}`)
    }
  }

  for (const route of [
    '/arenda-pylesosov-moskva',
    '/arenda-gopro-moskva',
    '/arenda-audiooborudovaniya-moskva',
  ]) {
    const page = await fetch(`${origin}${route}`)
    const html = await page.text()
    assert.match(html, /"@type":"ItemList"/, `${route} must include an ItemList`)
    assert.match(html, /"@type":"Product"/, `${route} must include Product items`)
    assert.match(html, /https:\/\/api\.vozmimenya\.ru\/uploads\/test-equipment\.webp/, `${route} must use the public product image URL`)
    assert.doesNotMatch(html, /vozmimenya\.ruhttps?:\/\//, `${route} must not concatenate URL origins`)
    assert.doesNotMatch(html, /"image":"https?:\/\/(?:localhost|127\.0\.0\.1)/, `${route} must not expose loopback images in schema`)
  }

  for (const route of ['/booking/success', '/missing-page']) {
    const page = await fetch(`${origin}${route}`)
    const html = await page.text()
    assert.equal(page.status, route === '/missing-page' ? 404 : 200, route)
    assert.match(html, /<meta[^>]*name="robots"[^>]*content="noindex, nofollow"[^>]*>/, route)
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, route)
  }

  const productPage = await fetch(`${origin}/equipment/karcher-puzzi-8-1`)
  const productHtml = await productPage.text()
  assert.match(productHtml, /<script[^>]*type="application\/ld\+json"[^>]*>/)
  assert.doesNotMatch(productHtml, /127\.0\.0\.1/, 'public HTML must not expose the loopback API origin')
  assert.match(productHtml, /https:\/\/api\.vozmimenya\.ru\/uploads\/test-equipment\.webp/)
  assert.doesNotMatch(productHtml, /(?:src|srcset)="\/uploads\//)
  assert.doesNotMatch(productHtml, /vozmimenya\.ruhttps:/)

  const homePage = await fetch(`${origin}/`)
  const homeHtml = await homePage.text()
  assert.match(homeHtml, /https:\/\/api\.vozmimenya\.ru\/uploads\/test-equipment\.webp/)
  assert.doesNotMatch(homeHtml, /(?:src|srcset)="\/uploads\//)
  assert.doesNotMatch(homeHtml, /Коротко о сервисе/)
  assert.doesNotMatch(homeHtml, /Цены на аренду техники/)

  api.close()
  await once(api, 'close')
  const unavailable = await fetch(`${origin}/equipment/karcher-puzzi-8-1`)
  assert.equal(unavailable.status, 503)
  const unavailableHome = await fetch(`${origin}/`)
  assert.equal(unavailableHome.status, 503)
})
