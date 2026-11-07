import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

// Уменьшенные копии фото для srcset: карточка каталога ~300 px, на Retina ~600 px.
export const VARIANT_WIDTHS = [400, 800] as const
const VARIANT_SUFFIX = /-w\d+\.webp$/i
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export const uploadsDir = path.resolve(__dirname, '../../uploads')

export interface ImageVariant {
  width: number
  url: string
}

export const isVariantFile = (fileName: string) => VARIANT_SUFFIX.test(fileName)

export const variantFileName = (originalName: string, width: number) =>
  `${path.basename(originalName, path.extname(originalName))}-w${width}.webp`

// Создаёт недостающие копии рядом с оригиналом. Копии шире оригинала не делаем.
export async function generateImageVariants(filePath: string, options: { dryRun?: boolean } = {}): Promise<ImageVariant[]> {
  const name = path.basename(filePath)
  if (isVariantFile(name) || !SUPPORTED.has(path.extname(name).toLowerCase())) return []

  const { width = 0 } = await sharp(filePath).metadata()
  const created: ImageVariant[] = []

  for (const variantWidth of VARIANT_WIDTHS) {
    if (width <= variantWidth) continue
    const variantPath = path.join(path.dirname(filePath), variantFileName(name, variantWidth))
    if (fs.existsSync(variantPath)) continue

    if (!options.dryRun) {
      const tmpPath = `${variantPath}.tmp-${process.pid}`
      await sharp(filePath, { failOn: 'none' })
        .rotate()
        .resize({ width: variantWidth, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(tmpPath)
      await fsp.rename(tmpPath, variantPath)
    }
    created.push({ width: variantWidth, url: `/uploads/${variantFileName(name, variantWidth)}` })
  }

  return created
}

// Кеш проверок наличия файлов: ответ каталога строится на каждый запрос.
const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map<string, { variants: ImageVariant[]; expiresAt: number }>()

export function clearImageVariantsCache() {
  cache.clear()
}

// Варианты существующего фото по его пути из базы (/uploads/x.jpg, http://localhost:3002/uploads/x.jpg).
// Внешние URL и фото без копий возвращают пустой список — фронт тогда показывает оригинал.
export function getImageVariants(imagePath: string, dir = uploadsDir, now = Date.now()): ImageVariant[] {
  const match = /\/uploads\/([^/?#]+)$/.exec(imagePath || '')
  if (!match) return []
  const fileName = decodeURIComponent(match[1])

  const cacheKey = `${dir}|${fileName}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > now) return cached.variants

  const variants = VARIANT_WIDTHS
    .map((width) => ({ width, url: `/uploads/${variantFileName(fileName, width)}` }))
    .filter((variant) => fs.existsSync(path.join(dir, path.basename(variant.url))))

  cache.set(cacheKey, { variants, expiresAt: now + CACHE_TTL_MS })
  return variants
}
