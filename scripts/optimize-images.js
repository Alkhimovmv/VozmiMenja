/**
 * Скрипт для оптимизации изображений
 *
 * Использование:
 * 1. npm install sharp --save-dev
 * 2. node scripts/optimize-images.js
 *
 * Что делает:
 * - Конвертирует PNG/JPG в WebP (качество 85%)
 * - Создает несколько размеров для srcset (320w, 640w, 960w, оригинал)
 * - Сохраняет оригиналы как fallback
 */

import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Конфигурация
const CONFIG = {
  // Директория с загруженными изображениями на сервере
  uploadsDir: path.join(__dirname, '../server/uploads'),

  // Директория для статических изображений (логотипы)
  clientPublicDir: path.join(__dirname, '../client/public'),

  // Размеры для responsive изображений (для карточек оборудования)
  sizes: [320, 640, 960],

  // Качество WebP (85% - хороший баланс)
  webpQuality: 85,

  // Расширения для конвертации
  extensions: ['.jpg', '.jpeg', '.png'],
}

// Статистика
const stats = {
  processed: 0,
  errors: 0,
  savedBytes: 0,
  skipped: 0,
}

/**
 * Конвертирует изображение в WebP и создает несколько размеров
 */
async function optimizeImage(filePath, createResponsive = true) {
  try {
    const ext = path.extname(filePath).toLowerCase()

    // Пропускаем уже конвертированные WebP
    if (ext === '.webp') {
      stats.skipped++
      return
    }

    // Проверяем расширение
    if (!CONFIG.extensions.includes(ext)) {
      stats.skipped++
      return
    }

    const dir = path.dirname(filePath)
    const basename = path.basename(filePath, ext)

    // Получаем размеры оригинала
    const image = sharp(filePath)
    const metadata = await image.metadata()
    const originalSize = (await fs.stat(filePath)).size

    console.log(`\n📸 Обработка: ${path.basename(filePath)}`)
    console.log(`   Оригинал: ${metadata.width}x${metadata.height} (${(originalSize / 1024).toFixed(1)} КБ)`)

    let totalSaved = 0

    // Создаем WebP версии разных размеров для responsive images
    if (createResponsive) {
      for (const width of CONFIG.sizes) {
        // Пропускаем размеры больше оригинала
        if (width > metadata.width) continue

        const outputPath = path.join(dir, `${basename}-${width}w.webp`)

        await sharp(filePath)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .webp({ quality: CONFIG.webpQuality })
          .toFile(outputPath)

        const newSize = (await fs.stat(outputPath)).size
        totalSaved += originalSize - newSize

        console.log(`   ✓ ${width}w: ${(newSize / 1024).toFixed(1)} КБ`)
      }
    }

    // Создаем WebP версию оригинального размера
    const webpPath = path.join(dir, `${basename}.webp`)
    await sharp(filePath)
      .webp({ quality: CONFIG.webpQuality })
      .toFile(webpPath)

    const webpSize = (await fs.stat(webpPath)).size
    const saved = originalSize - webpSize
    totalSaved += saved

    console.log(`   ✓ WebP: ${(webpSize / 1024).toFixed(1)} КБ`)
    console.log(`   💾 Экономия: ${(totalSaved / 1024).toFixed(1)} КБ (${((totalSaved / originalSize) * 100).toFixed(1)}%)`)

    stats.processed++
    stats.savedBytes += totalSaved

  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message)
    stats.errors++
  }
}

/**
 * Рекурсивно обходит директорию и обрабатывает изображения
 */
async function processDirectory(dirPath, createResponsive = true) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        await processDirectory(fullPath, createResponsive)
      } else if (entry.isFile()) {
        await optimizeImage(fullPath, createResponsive)
      }
    }
  } catch (error) {
    console.error(`❌ Ошибка при обработке директории ${dirPath}:`, error.message)
  }
}

/**
 * Главная функция
 */
async function main() {
  console.log('🚀 Запуск оптимизации изображений...\n')

  // Проверяем наличие sharp
  try {
    await sharp(Buffer.from([0x89, 0x50, 0x4e, 0x47])).metadata()
  } catch (error) {
    console.error('❌ Sharp не установлен. Запустите: npm install sharp --save-dev')
    process.exit(1)
  }

  // Обрабатываем загруженные изображения (с responsive версиями)
  console.log('📂 Обработка /server/uploads (с responsive версиями)...')
  if (await fs.access(CONFIG.uploadsDir).then(() => true).catch(() => false)) {
    await processDirectory(CONFIG.uploadsDir, true)
  } else {
    console.log('   ⚠️  Директория не найдена')
  }

  // Обрабатываем статические файлы (без responsive, только WebP)
  console.log('\n📂 Обработка /client/public (только WebP)...')
  if (await fs.access(CONFIG.clientPublicDir).then(() => true).catch(() => false)) {
    await processDirectory(CONFIG.clientPublicDir, false)
  } else {
    console.log('   ⚠️  Директория не найдена')
  }

  // Итоговая статистика
  console.log('\n' + '='.repeat(60))
  console.log('📊 ИТОГОВАЯ СТАТИСТИКА')
  console.log('='.repeat(60))
  console.log(`✅ Обработано:        ${stats.processed} изображений`)
  console.log(`⏭️  Пропущено:         ${stats.skipped} файлов`)
  console.log(`❌ Ошибок:            ${stats.errors}`)
  console.log(`💾 Общая экономия:    ${(stats.savedBytes / 1024 / 1024).toFixed(2)} МБ`)
  console.log('='.repeat(60))

  if (stats.processed > 0) {
    console.log('\n✨ Оптимизация завершена!')
    console.log('\n📝 Следующие шаги:')
    console.log('   1. Протестируйте сайт локально')
    console.log('   2. Проверьте отображение изображений')
    console.log('   3. Запустите production build: npm run build')
    console.log('   4. Задеплойте на сервер')
  }
}

// Запуск
main().catch(console.error)
