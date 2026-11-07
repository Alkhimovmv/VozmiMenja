import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

Object.defineProperty(globalThis, 'React', { configurable: true, value: React })
const { default: EquipmentTrustStrip } = await import('./EquipmentTrustStrip')

const html = renderToStaticMarkup(
  <MemoryRouter>
    <EquipmentTrustStrip />
  </MemoryRouter>,
)

assert.match(html, /5,0 · 35 отзывов/)
assert.match(html, /href="https:\/\/yandex\.ru\/maps\/org\/vozmi_menya\/206350428739\/reviews\/"/)
assert.match(html, /Самовывоз 24\/7/)
assert.match(html, /href="\/samovyvoz-24-7-postamat"/)

console.log('equipment trust strip tests passed')
