import assert from 'node:assert/strict'
import test from 'node:test'
import { serializeForInlineScript } from './serialize'

test('escapes characters that can break an inline script', () => {
  const value = serializeForInlineScript({ text: '</script><script>alert(1)</script>\u2028\u2029&' })
  assert.doesNotMatch(value, /<\/script>/i)
  assert.match(value, /\\u003c/)
  assert.match(value, /\\u2028/)
  assert.match(value, /\\u2029/)
  assert.deepEqual(JSON.parse(value), { text: '</script><script>alert(1)</script>\u2028\u2029&' })
})
