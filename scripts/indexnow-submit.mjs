#!/usr/bin/env node
// Использование:
//   node scripts/indexnow-submit.mjs diff --new client/dist/sitemap.xml --old-url https://vozmimenya.ru/sitemap.xml --out indexnow-urls.txt
//     — до публикации: какие URL изменились относительно живого sitemap.
//   node scripts/indexnow-submit.mjs submit --file indexnow-urls.txt --key-file client/public/<key>.txt
//     — после публикации: отправить их в IndexNow.
import fs from 'node:fs/promises'
import path from 'node:path'
import { buildPayload, changedUrls, INDEXNOW_ENDPOINTS, parseSitemap } from './indexnow.mjs'

const SITE_ORIGIN = 'https://vozmimenya.ru'

function arg(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index > 0 ? process.argv[index + 1] : undefined
}

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return response.text()
}

async function diff() {
  const newXml = await fs.readFile(arg('new'), 'utf8')
  let oldXml = ''
  try {
    oldXml = await fetchText(arg('old-url'))
  } catch (error) {
    // Без старого sitemap отправляем всё: это безопасно, лимит IndexNow — 10 000 URL.
    console.warn(`IndexNow: live sitemap unavailable, submitting all URLs (${error.message})`)
  }
  const urls = changedUrls(parseSitemap(oldXml), parseSitemap(newXml))
  await fs.writeFile(arg('out'), urls.join('\n') + (urls.length ? '\n' : ''), 'utf8')
  console.log(`IndexNow: ${urls.length} changed URLs`)
}

async function submit() {
  const urls = (await fs.readFile(arg('file'), 'utf8')).split('\n').map((line) => line.trim()).filter(Boolean)
  if (!urls.length) {
    console.log('IndexNow: nothing to submit')
    return
  }
  const keyFile = arg('key-file')
  const key = path.basename(keyFile, '.txt')
  const keyContent = (await fs.readFile(keyFile, 'utf8')).trim()
  if (keyContent !== key) throw new Error(`IndexNow key file ${keyFile} must contain its own name`)

  const payload = buildPayload({ siteOrigin: SITE_ORIGIN, key, urls })
  let ok = 0
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      })
      // 200 — принято, 202 — принято, ключ проверяется позже.
      console.log(`IndexNow ${endpoint}: HTTP ${response.status}, ${payload.urlList.length} URLs`)
      if (response.status === 200 || response.status === 202) ok += 1
    } catch (error) {
      console.warn(`IndexNow ${endpoint}: ${error.message}`)
    }
  }
  if (!ok) process.exitCode = 1
}

const command = process.argv[2]
if (command === 'diff') await diff()
else if (command === 'submit') await submit()
else {
  console.error('Usage: indexnow-submit.mjs diff|submit ...')
  process.exitCode = 2
}
