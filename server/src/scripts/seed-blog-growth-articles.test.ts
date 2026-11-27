import { execFileSync } from 'child_process'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

test('a second seed preserves timestamps for already refreshed articles', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vozmimenya-blog-seed-'))
  const databasePath = path.join(directory, 'seed.sqlite')

  function sql(statement: string) {
    return execFileSync(process.execPath, ['-e', `
      const sqlite3 = require('sqlite3')
      const db = new sqlite3.Database(process.argv[1])
      db.all(process.argv[2], (error, rows) => {
        if (error) throw error
        console.log(JSON.stringify(rows))
        db.close()
      })
    `, databasePath, statement], { encoding: 'utf8' })
  }

  function seed() {
    execFileSync(process.execPath, ['--import', 'tsx', 'src/scripts/seed-blog-growth-articles.ts'], {
      env: { ...process.env, DATABASE_PATH: databasePath },
      stdio: 'pipe',
    })
  }

  try {
    sql(`CREATE TABLE articles (
      title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL,
      content TEXT NOT NULL, image_url TEXT, category TEXT NOT NULL, tags TEXT,
      author TEXT NOT NULL, published INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    sql('CREATE TABLE article_writes (slug TEXT NOT NULL)')
    sql(`CREATE TRIGGER record_article_write AFTER UPDATE OF updated_at ON articles
      BEGIN INSERT INTO article_writes VALUES (NEW.slug); END`)
    const legacySlug = 'gopro-dlya-nachinayushchih-polnoe-rukovodstvo'
    sql(`INSERT INTO articles (slug, title, excerpt, content, category, author, published)
      VALUES ('${legacySlug}', 'GoPro для начинающих: полное руководство по съемке в 2025',
      'Описание', '**Аренда у нас:** от 400₽/день

### GoPro Hero 13 Black (новинка 2025)', 'Камеры', 'Автор', 1)`)
    seed()
    expect(JSON.parse(sql(`SELECT title, content FROM articles WHERE slug = '${legacySlug}'`))).toEqual([
      { title: 'GoPro для начинающих: полное руководство по съемке', content: expect.stringMatching(/1 300 ₽\/сутки[\s\S]+### GoPro Hero 13 Black$/) },
    ])
    expect(JSON.parse(sql('SELECT slug FROM article_writes'))).toEqual([{ slug: legacySlug }])

    sql("UPDATE articles SET updated_at = '2020-01-01 00:00:00'")
    sql('DELETE FROM article_writes')
    seed()
    expect(JSON.parse(sql("SELECT slug FROM articles WHERE updated_at <> '2020-01-01 00:00:00'"))).toEqual([])
    expect(JSON.parse(sql('SELECT slug FROM article_writes'))).toEqual([])

    sql("UPDATE articles SET excerpt = 'old excerpt' WHERE slug = 'kak-ubrat-stroitelnuyu-pyl-posle-remonta'")
    seed()
    expect(JSON.parse(sql("SELECT slug FROM articles WHERE updated_at <> '2020-01-01 00:00:00'"))).toEqual([
      { slug: 'kak-ubrat-stroitelnuyu-pyl-posle-remonta' },
    ])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
