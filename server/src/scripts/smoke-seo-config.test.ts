import fs from 'fs'
import path from 'path'
import { pagesToCheck, requiredCanonicalPaths } from './smoke-seo-config'

describe('SEO smoke config', () => {
  it('keeps canonical smoke paths in generated sitemap', () => {
    const sitemap = fs.readFileSync(path.resolve(__dirname, '../../../client/public/sitemap.xml'), 'utf8')

    for (const pagePath of requiredCanonicalPaths) {
      expect(sitemap).toContain(`<loc>https://vozmimenya.ru${pagePath}</loc>`)
    }
  })

  it('checks legacy category query URLs against clean canonical category pages', () => {
    expect(pagesToCheck).toEqual(expect.arrayContaining([
      { path: '/?category=Камеры', canonicalPath: '/arenda-gopro-moskva' },
      { path: '/?category=Пылесосы%2C%20уборка%20и%20клининг', canonicalPath: '/arenda-pylesosov-moskva' },
      { path: '/?category=Аудиооборудование', canonicalPath: '/arenda-audiooborudovaniya-moskva' },
    ]))
  })
})
