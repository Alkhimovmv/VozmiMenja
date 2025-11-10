/**
 * Конвертация логотипов в WebP
 */
import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function convertLogo(inputPath, outputPath, quality = 90) {
  const originalSize = (await fs.stat(inputPath)).size

  await sharp(inputPath)
    .webp({ quality })
    .toFile(outputPath)

  const newSize = (await fs.stat(outputPath)).size
  const saved = originalSize - newSize

  console.log(`✓ ${path.basename(inputPath)}`)
  console.log(`  Было: ${(originalSize / 1024).toFixed(1)} КБ`)
  console.log(`  Стало: ${(newSize / 1024).toFixed(1)} КБ`)
  console.log(`  Экономия: ${(saved / 1024).toFixed(1)} КБ (${((saved / originalSize) * 100).toFixed(1)}%)`)
  console.log('')
}

async function main() {
  const assetsDir = path.join(__dirname, '../client/src/assets')

  console.log('🎨 Конвертация логотипов в WebP...\n')

  // logo-footer.png
  await convertLogo(
    path.join(assetsDir, 'logo-footer.png'),
    path.join(assetsDir, 'logo-footer.webp'),
    90
  )

  // logo-header.png
  await convertLogo(
    path.join(assetsDir, 'logo-header.png'),
    path.join(assetsDir, 'logo-header.webp'),
    90
  )

  console.log('✨ Готово! Не забудьте обновить импорты в компонентах.')
}

main().catch(console.error)
