import assert from 'node:assert/strict'
import test from 'node:test'
import React, { lazy, Suspense } from 'react'
import { renderBufferedStream } from './renderStream'

test('waits for lazy content before returning HTML', async () => {
  const LazyHeading = lazy(async () => ({ default: () => <h1>SSR готов</h1> }))
  const result = await renderBufferedStream(
    <Suspense fallback={<p>Загрузка</p>}><LazyHeading /></Suspense>,
  )
  assert.match(result.html, /SSR готов/)
  assert.doesNotMatch(result.html, /Загрузка/)
  assert.deepEqual(result.errors, [])
})
