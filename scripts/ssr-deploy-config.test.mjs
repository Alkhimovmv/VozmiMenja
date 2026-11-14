import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const ROOT = new URL('../', import.meta.url)
const require = createRequire(import.meta.url)

test('PM2 keeps the API unchanged and runs SSR as an isolated loopback service', () => {
  const ecosystem = require(fileURLToPath(new URL('../ecosystem.config.js', import.meta.url)))
  const api = ecosystem.apps.find((app) => app.name === 'vozmimenya-api')
  const ssr = ecosystem.apps.find((app) => app.name === 'vozmimenya-ssr')

  assert.ok(api, 'API process must remain configured')
  assert.equal(api.script, '/var/www/vozmimenya/server/dist/index.js')
  assert.equal(api.cwd, '/var/www/vozmimenya/server')
  assert.equal(api.instances, 1)
  assert.equal(api.env.PORT, 3003)

  assert.ok(ssr, 'SSR process must be configured separately')
  assert.equal(ssr.script, './ssr-server.mjs')
  assert.equal(ssr.cwd, '/var/www/vozmimenya/client')
  assert.equal(ssr.instances, 1)
  assert.equal(ssr.exec_mode, 'fork')
  assert.equal(ssr.env.SSR_HOST, '127.0.0.1')
  assert.equal(ssr.env.SSR_PORT, 3004)
  assert.equal(ssr.env.SSR_API_URL, 'http://127.0.0.1:3003/api')
  assert.equal(ssr.max_memory_restart, '256M')
  assert.equal(ssr.max_restarts, 10)
  assert.equal(ssr.min_uptime, '10s')
  assert.match(ssr.error_file, /ssr-error\.log$/)
  assert.match(ssr.out_file, /ssr-out\.log$/)
})

test('deployment validates SSR artifacts and health before reloading Nginx', async () => {
  const deploy = await readFile(new URL('deploy-local.sh', ROOT), 'utf8')

  for (const artifact of [
    '$PROJECT_DIR/client/dist-ssr/entry-server.js',
    '$PROJECT_DIR/client/dist-ssr/template.html',
    '$PROJECT_DIR/client/ssr-server.mjs',
  ]) {
    assert.match(deploy, new RegExp(`-f "${artifact.replaceAll('$', '\\$')}"`))
  }

  assert.match(deploy, /wait_for_health\s+"http:\/\/127\.0\.0\.1:3003\/health"/)
  assert.match(deploy, /wait_for_health\s+"http:\/\/127\.0\.0\.1:3004\/health"/)
  assert.match(deploy, /reload_nginx_after_health/)
  assert.match(deploy, /pm2\s+stop\s+vozmimenya-api\s+vozmimenya-ssr/)
})
