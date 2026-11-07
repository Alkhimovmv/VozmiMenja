import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { MAX_IMAGE_WIDTH, optimizeImageFile } from './imageOptimizer'

async function noisyImage(width: number, height: number, channels: 3 | 4) {
  const pixels = Buffer.alloc(width * height * channels)
  for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 7919) % 251
  return sharp(pixels, { raw: { width, height, channels } })
}

describe('optimizeImageFile', () => {
  let dir: string

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'img-opt-'))
  })

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true })
  })

  it('downsizes and recompresses a heavy JPEG in place, keeping the file name', async () => {
    const file = path.join(dir, 'big.jpg')
    await (await noisyImage(3000, 2000, 3)).jpeg({ quality: 100 }).toFile(file)

    const result = await optimizeImageFile(file)
    const meta = await sharp(file).metadata()

    expect(result.changed).toBe(true)
    expect(result.after).toBeLessThan(result.before)
    expect(meta.width).toBe(MAX_IMAGE_WIDTH)
    expect(meta.format).toBe('jpeg')
  })

  it('does not touch the file in dry-run mode', async () => {
    const file = path.join(dir, 'big.jpg')
    await (await noisyImage(2400, 1600, 3)).jpeg({ quality: 100 }).toFile(file)
    const before = await fs.readFile(file)

    const result = await optimizeImageFile(file, { dryRun: true })

    expect(result.changed).toBe(true)
    expect((await fs.readFile(file)).equals(before)).toBe(true)
  })

  it('keeps PNG transparency', async () => {
    const file = path.join(dir, 'logo.png')
    await (await noisyImage(2000, 1000, 4)).png({ compressionLevel: 0 }).toFile(file)

    await optimizeImageFile(file)
    const meta = await sharp(file).metadata()

    expect(meta.format).toBe('png')
    expect(meta.hasAlpha).toBe(true)
    expect(meta.width).toBe(MAX_IMAGE_WIDTH)
  })

  it('skips small already-compressed images and unsupported formats', async () => {
    const small = path.join(dir, 'small.jpg')
    await sharp({ create: { width: 200, height: 200, channels: 3, background: '#ffffff' } }).jpeg({ quality: 70 }).toFile(small)
    const gif = path.join(dir, 'anim.gif')
    await fs.writeFile(gif, 'GIF89a')

    expect((await optimizeImageFile(small)).changed).toBe(false)
    expect((await optimizeImageFile(gif)).skipped).toBe('unsupported format')
  })
})
