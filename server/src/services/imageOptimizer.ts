import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

// Карточки и галерея показывают фото не шире ~1200 px; 1600 px — запас под Retina.
export const MAX_IMAGE_WIDTH = 1600
// Перезаписываем файл, только если выигрыш заметный: иначе это лишняя потеря качества.
const MIN_SAVING_RATIO = 0.9
// Лёгкие фото нормального размера не пережимаем: выигрыш копеечный, а качество теряется.
const SMALL_FILE_BYTES = 200 * 1024

export interface OptimizeResult {
  file: string
  before: number
  after: number
  changed: boolean
  skipped?: string
}

// Пережимает изображение в том же формате и с тем же именем: URL в базе не меняются.
// dryRun считает результат, но файл не трогает.
export async function optimizeImageFile(filePath: string, options: { dryRun?: boolean } = {}): Promise<OptimizeResult> {
  const ext = path.extname(filePath).toLowerCase()
  const before = (await fs.stat(filePath)).size
  const result: OptimizeResult = { file: filePath, before, after: before, changed: false }

  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return { ...result, skipped: 'unsupported format' }
  }

  const input = await fs.readFile(filePath)
  const metadata = await sharp(input).metadata()
  if ((metadata.width || 0) <= MAX_IMAGE_WIDTH && before <= SMALL_FILE_BYTES) {
    return { ...result, skipped: 'already small' }
  }
  let pipeline = sharp(input, { failOn: 'none' }).rotate() // применяем EXIF-ориентацию до удаления метаданных
  if ((metadata.width || 0) > MAX_IMAGE_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true })
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 80 })
  } else {
    // PNG сохраняем PNG (с прозрачностью), но с палитрой и максимальным сжатием.
    pipeline = pipeline.png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 })
  }

  const output = await pipeline.toBuffer()
  if (output.length >= before * MIN_SAVING_RATIO) {
    return { ...result, skipped: 'already optimized' }
  }

  if (!options.dryRun) {
    const tmpPath = `${filePath}.tmp-${process.pid}`
    await fs.writeFile(tmpPath, output)
    await fs.rename(tmpPath, filePath)
  }

  return { ...result, after: output.length, changed: true }
}
