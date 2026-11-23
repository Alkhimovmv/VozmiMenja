import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const browserIndex = path.join(clientDir, 'dist', 'index.html')
const serverDir = path.join(clientDir, 'dist-ssr')
const serverTemplate = path.join(serverDir, 'template.html')

const source = await readFile(browserIndex, 'utf8')
const template = source.replace(
  /<title>ВозьмиМеня<\/title>\s*<!--ssr-head-->/,
  '<!--ssr-head-->',
)

for (const marker of ['<!--ssr-head-->', '<div id="root"></div>', '<!--ssr-state-->']) {
  if (!template.includes(marker)) {
    throw new Error(`SSR template marker is missing: ${marker}`)
  }
}

await mkdir(serverDir, { recursive: true })
await writeFile(serverTemplate, template)
