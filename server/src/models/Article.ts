import { run, get, all } from './database'

export interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string | null
  category: string
  tags: string | null
  author: string
  published: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export interface CreateArticleData {
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl?: string | null
  category: string
  tags?: string | null
  author?: string
  published?: boolean
}

class ArticleModel {
  // Получить все статьи (с фильтрацией для публичных)
  async findAll(onlyPublished: boolean = false): Promise<Article[]> {
    const query = onlyPublished
      ? `SELECT * FROM articles WHERE published = 1 ORDER BY created_at DESC`
      : `SELECT * FROM articles ORDER BY created_at DESC`

    const rows = await all(query) as any[]

    return rows.map(row => this.mapRowToArticle(row))
  }

  // Получить статью по ID
  async findById(id: number): Promise<Article | null> {
    const row = await get('SELECT * FROM articles WHERE id = ?', [id]) as any

    if (!row) return null

    return this.mapRowToArticle(row)
  }

  // Получить статью по slug
  async findBySlug(slug: string, incrementViews: boolean = false): Promise<Article | null> {
    const row = await get('SELECT * FROM articles WHERE slug = ?', [slug]) as any

    if (!row) return null

    // Увеличиваем счётчик просмотров
    if (incrementViews) {
      await run('UPDATE articles SET views = views + 1 WHERE id = ?', [row.id])
      row.views = row.views + 1
    }

    return this.mapRowToArticle(row)
  }

  // Получить статьи по категории
  async findByCategory(category: string, onlyPublished: boolean = true): Promise<Article[]> {
    const query = onlyPublished
      ? `SELECT * FROM articles WHERE category = ? AND published = 1 ORDER BY created_at DESC`
      : `SELECT * FROM articles WHERE category = ? ORDER BY created_at DESC`

    const rows = await all(query, [category]) as any[]

    return rows.map(row => this.mapRowToArticle(row))
  }

  // Получить популярные статьи
  async findPopular(limit: number = 5): Promise<Article[]> {
    const rows = await all(`
      SELECT * FROM articles
      WHERE published = 1
      ORDER BY views DESC
      LIMIT ?
    `, [limit]) as any[]

    return rows.map(row => this.mapRowToArticle(row))
  }

  // Получить последние статьи
  async findRecent(limit: number = 5): Promise<Article[]> {
    const rows = await all(`
      SELECT * FROM articles
      WHERE published = 1
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]) as any[]

    return rows.map(row => this.mapRowToArticle(row))
  }

  // Создать статью
  async create(data: CreateArticleData): Promise<Article> {
    const result = await run(`
      INSERT INTO articles (
        title, slug, excerpt, content, image_url, category, tags, author, published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.imageUrl || null,
      data.category,
      data.tags || null,
      data.author || 'ВозьмиМеня',
      data.published ? 1 : 0
    ])

    const article = await this.findById(result.lastID)
    if (!article) {
      throw new Error('Failed to create article')
    }

    return article
  }

  // Обновить статью
  async update(id: number, data: Partial<CreateArticleData>): Promise<Article> {
    const updates: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?')
      values.push(data.slug)
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?')
      values.push(data.excerpt)
    }
    if (data.content !== undefined) {
      updates.push('content = ?')
      values.push(data.content)
    }
    if (data.imageUrl !== undefined) {
      updates.push('image_url = ?')
      values.push(data.imageUrl)
    }
    if (data.category !== undefined) {
      updates.push('category = ?')
      values.push(data.category)
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?')
      values.push(data.tags)
    }
    if (data.author !== undefined) {
      updates.push('author = ?')
      values.push(data.author)
    }
    if (data.published !== undefined) {
      updates.push('published = ?')
      values.push(data.published ? 1 : 0)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await run(`
      UPDATE articles
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values)

    const article = await this.findById(id)
    if (!article) {
      throw new Error('Article not found')
    }

    return article
  }

  // Удалить статью
  async delete(id: number): Promise<void> {
    await run('DELETE FROM articles WHERE id = ?', [id])
  }

  // Вспомогательная функция для преобразования строки БД в объект Article
  private mapRowToArticle(row: any): Article {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      imageUrl: row.image_url,
      category: row.category,
      tags: row.tags,
      author: row.author,
      published: Boolean(row.published),
      views: row.views,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

export const articleModel = new ArticleModel()
