import { execFileSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { optimizeImageFile } from '../services/imageOptimizer'

// Пережимает уже загруженные фото в server/uploads тем же форматом и с тем же именем —
// ссылки в базе не меняются. По умолчанию только показывает, сколько сэкономится.
//   npm run optimize:uploads            — пробный прогон, файлы не меняются
//   npm run optimize:uploads -- --apply — оптимизировать; оригиналы копируются в uploads/_originals/
// Файлы, которые лежат в git, по умолчанию пропускаются: их оптимизированные версии приходят
// через git pull, а локальная правка отслеживаемого файла сломала бы следующий pull при деплое.
// --include-tracked — обработать и их (только в рабочей копии разработчика, с последующим коммитом).
const uploadsDir = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.resolve(__dirname, '../../uploads')
const originalsDir = path.join(uploadsDir, '_originals')
const apply = process.argv.includes('--apply')
const includeTracked = process.argv.includes('--include-tracked')

function getGitTrackedNames(): Set<string> {
  try {
    const output = execFileSync('git', ['ls-files', '-z', '--', '.'], { cwd: uploadsDir, encoding: 'utf8' })
    return new Set(output.split('\0').filter(Boolean).map((name) => path.basename(name)))
  } catch {
    return new Set() // не git-репозиторий или git недоступен
  }
}

const kb = (bytes: number) => `${Math.round(bytes / 1024)} КБ`

async function main() {
  const entries = await fs.readdir(uploadsDir, { withFileTypes: true })
  const tracked = includeTracked ? new Set<string>() : getGitTrackedNames()
  const files = entries
    .filter((entry) => entry.isFile() && !tracked.has(entry.name))
    .map((entry) => path.join(uploadsDir, entry.name))
  if (tracked.size) console.log(`Пропущено файлов из git: ${tracked.size} (обновляются через git pull)`)
  if (apply) await fs.mkdir(originalsDir, { recursive: true })

  let before = 0
  let after = 0
  let changed = 0

  for (const file of files) {
    try {
      const preview = await optimizeImageFile(file, { dryRun: true })
      before += preview.before
      if (!preview.changed) {
        after += preview.before
        continue
      }

      if (apply) {
        const backup = path.join(originalsDir, path.basename(file))
        // Оригинал не перезаписываем при повторном запуске: в бэкапе остаётся самая первая версия.
        await fs.copyFile(file, backup, fs.constants.COPYFILE_EXCL).catch((error) => {
          if (error.code !== 'EEXIST') throw error
        })
        const result = await optimizeImageFile(file)
        after += result.after
      } else {
        after += preview.after
      }
      changed++
      console.log(`${apply ? '✅' : '🔎'} ${path.basename(file)}: ${kb(preview.before)} → ${kb(preview.after)}`)
    } catch (error: any) {
      after += (await fs.stat(file)).size
      console.warn(`⚠️ ${path.basename(file)} пропущен: ${error?.message || error}`)
    }
  }

  console.log(`\n${apply ? 'Оптимизировано' : 'Можно оптимизировать'}: ${changed} из ${files.length} файлов, ${kb(before)} → ${kb(after)}`)
  if (!apply && changed > 0) console.log('Запустите с --apply, чтобы применить. Оригиналы сохранятся в uploads/_originals/.')
}

main().catch((error) => {
  console.error('❌ Оптимизация не удалась:', error)
  process.exit(1)
})
