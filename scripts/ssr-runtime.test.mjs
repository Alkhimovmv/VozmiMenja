import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { once } from 'node:events'

const ROOT = new URL('../', import.meta.url)

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

test('built runtime returns health and complete SSR HTML', async (t) => {
  const api = createServer((request, response) => {
    if (request.url?.startsWith('/api/equipment')) {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ success: true, data: [], total: 0, page: 1, limit: 200 }))
      return
    }
    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ message: 'not found' }))
  })
  api.listen(0, '127.0.0.1')
  await once(api, 'listening')
  t.after(() => api.close())
  const apiAddress = api.address()
  assert.ok(apiAddress && typeof apiAddress === 'object')
  process.env.SSR_API_URL = `http://127.0.0.1:${apiAddress.port}/api`

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

  const page = await fetch(`${origin}/about`)
  const html = await page.text()
  assert.equal(page.status, 200)
  assert.equal(page.headers.get('x-vozmimenja-render'), 'ssr')
  assert.match(html, /<div id="root">[\s\S]*<h1/)
  assert.match(html, /rel="canonical"/)
  assert.match(html, /window\.__VOZMIMENYA_SSR__/)
})
