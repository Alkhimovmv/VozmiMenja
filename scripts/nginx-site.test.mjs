import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const ROOT = new URL('../', import.meta.url)

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('every frontend redirect is a permanent Nginx redirect that preserves query parameters', async () => {
  const [config, redirectsText] = await Promise.all([
    readFile(new URL('nginx/vozmimenya-site.conf', ROOT), 'utf8'),
    readFile(new URL('client/src/content/redirects.json', ROOT), 'utf8'),
  ])
  const redirects = JSON.parse(redirectsText)

  for (const [source, target] of Object.entries(redirects)) {
    const location = config.match(
      new RegExp(`location\\s*=\\s*${escapeRegExp(source)}\\s*\\{([^}]*)\\}`),
    )
    assert.ok(location, `${source} must have an exact Nginx location`)
    assert.match(
      location[1],
      new RegExp(`return\\s+301\\s+${escapeRegExp(target)}\\$is_args\\$args;`),
      `${source} must redirect permanently to ${target}`,
    )
  }
})

test('public HTML uses SSR microcache with a static failure fallback', async () => {
  const config = await readFile(new URL('nginx/vozmimenya-site.conf', ROOT), 'utf8')

  assert.match(config, /upstream\s+vozmimenya_ssr\s*\{[\s\S]*server\s+127\.0\.0\.1:3004;/)
  assert.match(config, /proxy_cache_path[\s\S]*keys_zone=vozmimenya_ssr:/)
  assert.match(config, /proxy_cache_valid\s+200\s+60s;/)
  assert.match(config, /proxy_cache_key\s+"\$scheme\$request_method\$host\$uri";/)
  assert.doesNotMatch(config, /proxy_cache_key[^;]*(?:\$args|\$request_uri)/)
  assert.match(config, /map\s+\$uri\s+\$ssr_cache_bypass\s*\{[\s\S]*~\^\/booking\(\?:\/success\)\?\$/)

  const publicLocation = [...config.matchAll(/location\s+\/\s*\{([\s\S]*?)\n\s*\}/g)]
    .find((match) => match[1].includes('proxy_pass'))
  assert.ok(publicLocation, 'public location must exist')
  assert.match(publicLocation[1], /proxy_pass\s+http:\/\/vozmimenya_ssr;/)
  assert.match(publicLocation[1], /proxy_intercept_errors\s+on;/)
  assert.match(publicLocation[1], /error_page\s+502\s+503\s+504\s+=\s+@static_fallback;/)
  assert.match(publicLocation[1], /proxy_cache_use_stale[^;]*timeout[^;]*http_500[^;]*http_504;/)
})

test('admin and assets stay static while fallback preserves real 404 responses', async () => {
  const config = await readFile(new URL('nginx/vozmimenya-site.conf', ROOT), 'utf8')

  const adminLocation = config.match(/location\s+\^~\s+\/admin\s*\{([\s\S]*?)\n\s*\}/)
  assert.ok(adminLocation, 'admin SPA location must exist')
  assert.match(adminLocation[1], /try_files[^;]*\/index\.html;/)
  assert.doesNotMatch(adminLocation[1], /proxy_pass/)

  const fallback = config.match(/location\s+@static_fallback\s*\{([\s\S]*?)\n\s*\}/)
  assert.ok(fallback, 'named static fallback must exist')
  assert.match(fallback[1], /try_files\s+\$uri\s+\$uri\.html\s+\$uri\/index\.html\s+=404;/)
  assert.match(fallback[1], /X-SSR-Fallback\s+"?static"?\s+always;/)

  const assets = config.match(/location\s+\/assets\/\s*\{([\s\S]*?)\n\s*\}/)
  assert.ok(assets, 'static asset location must exist')
  assert.match(assets[1], /try_files\s+\$uri\s+=404;/)
  assert.match(assets[1], /max-age=31536000, immutable/)
  assert.doesNotMatch(assets[1], /proxy_pass/)
})
