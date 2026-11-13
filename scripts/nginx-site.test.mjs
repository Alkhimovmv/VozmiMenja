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
