import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

Object.defineProperty(globalThis, 'React', { configurable: true, value: React })
const { default: CookieBanner } = await import('./CookieBanner')

const html = renderToStaticMarkup(
  <MemoryRouter>
    <CookieBanner />
  </MemoryRouter>,
)

assert.match(html, /Мы используем cookie и Яндекс\.Метрику для работы сайта и аналитики\./)
assert.match(html, /Продолжая пользоваться сайтом, вы соглашаетесь с/)
assert.match(html, /href="\/privacy"/)
assert.match(html, /href="\/cookies"/)
assert.doesNotMatch(html, /обработки пользовательских действий/)

console.log('cookie banner tests passed')
