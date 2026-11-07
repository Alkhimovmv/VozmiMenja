import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { clearImageVariantsCache, generateImageVariants, getImageVariants, isVariantFile, variantFileName } from './imageVariants'

describe('image variants', () => {
  let dir: string

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'img-var-'))
    clearImageVariantsCache()
  })

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true })
  })

  const createImage = (name: string, width: number) =>
    sharp({ create: { width, height: Math.round(width * 0.75), channels: 3, background: '#3366cc' } })
      .jpeg()
      .toFile(path.join(dir, name))

  it('creates 400 and 800 px WebP copies next to the original', async () => {
    await createImage('photo.jpg', 1600)

    const created = await generateImageVariants(path.join(dir, 'photo.jpg'))

    expect(created.map((variant) => variant.width)).toEqual([400, 800])
    const meta = await sharp(path.join(dir, 'photo-w400.webp')).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.width).toBe(400)
  })

  it('does not upscale and does not recreate existing copies', async () => {
    await createImage('small.jpg', 600)

    expect((await generateImageVariants(path.join(dir, 'small.jpg'))).map((v) => v.width)).toEqual([400])
    expect(await generateImageVariants(path.join(dir, 'small.jpg'))).toEqual([])
  })

  it('ignores variant files and dry-run writes nothing', async () => {
    await createImage('photo.jpg', 1200)

    expect(await generateImageVariants(path.join(dir, 'photo.jpg'), { dryRun: true })).toHaveLength(2)
    expect(await fs.readdir(dir)).toEqual(['photo.jpg'])
    expect(isVariantFile(variantFileName('photo.jpg', 400))).toBe(true)
  })

  it('resolves only existing copies for stored image paths', async () => {
    await createImage('photo.jpg', 1000)
    await generateImageVariants(path.join(dir, 'photo.jpg'))

    expect(getImageVariants('http://localhost:3002/uploads/photo.jpg', dir)).toEqual([
      { width: 400, url: '/uploads/photo-w400.webp' },
      { width: 800, url: '/uploads/photo-w800.webp' },
    ])
    expect(getImageVariants('/uploads/missing.jpg', dir)).toEqual([])
    expect(getImageVariants('https://example.com/photo.jpg', dir)).toEqual([])
  })
})
