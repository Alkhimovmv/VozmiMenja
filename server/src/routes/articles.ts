import { Router, Request, Response } from 'express'
import { articleModel, CreateArticleData } from '../models/Article'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Функция для преобразования camelCase -> snake_case для фронтенда
function toSnakeCase(article: any) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    image_url: article.imageUrl,
    category: article.category,
    tags: article.tags,
    author: article.author,
    published: article.published,
    views: article.views,
    created_at: article.createdAt,
    updated_at: article.updatedAt
  }
}

// PUBLIC ROUTES (без аутентификации)

// GET /api/articles - Получить все опубликованные статьи
router.get('/', async (req: Request, res: Response) => {
  try {
    const articles = await articleModel.findAll(true) // только опубликованные
    res.json(articles.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting articles:', error)
    res.status(500).json({ error: 'Ошибка получения статей' })
  }
})

// GET /api/articles/slug/:slug - Получить статью по slug (публичный доступ)
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const article = await articleModel.findBySlug(req.params.slug, true) // increment views

    if (!article || !article.published) {
      res.status(404).json({ error: 'Статья не найдена' })
      return
    }

    res.json(toSnakeCase(article))
  } catch (error) {
    console.error('Error getting article by slug:', error)
    res.status(500).json({ error: 'Ошибка получения статьи' })
  }
})

// GET /api/articles/category/:category - Получить статьи по категории
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const articles = await articleModel.findByCategory(req.params.category, true)
    res.json(articles.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting articles by category:', error)
    res.status(500).json({ error: 'Ошибка получения статей' })
  }
})

// GET /api/articles/popular - Получить популярные статьи
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
    const articles = await articleModel.findPopular(limit)
    res.json(articles.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting popular articles:', error)
    res.status(500).json({ error: 'Ошибка получения популярных статей' })
  }
})

// GET /api/articles/recent - Получить последние статьи
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
    const articles = await articleModel.findRecent(limit)
    res.json(articles.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting recent articles:', error)
    res.status(500).json({ error: 'Ошибка получения последних статей' })
  }
})

// ADMIN ROUTES (требуют аутентификации)

// GET /api/articles/admin/all - Получить все статьи (включая неопубликованные)
router.get('/admin/all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const articles = await articleModel.findAll(false) // все статьи
    res.json(articles.map(toSnakeCase))
  } catch (error) {
    console.error('Error getting all articles:', error)
    res.status(500).json({ error: 'Ошибка получения статей' })
  }
})

// GET /api/articles/admin/:id - Получить статью по ID (для редактирования)
router.get('/admin/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const article = await articleModel.findById(parseInt(req.params.id))

    if (!article) {
      res.status(404).json({ error: 'Статья не найдена' })
      return
    }

    res.json(toSnakeCase(article))
  } catch (error) {
    console.error('Error getting article:', error)
    res.status(500).json({ error: 'Ошибка получения статьи' })
  }
})

// POST /api/articles/admin - Создать статью
router.post('/admin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data: CreateArticleData = {
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      imageUrl: req.body.image_url || req.body.imageUrl,
      category: req.body.category,
      tags: req.body.tags,
      author: req.body.author || 'ВозьмиМеня',
      published: req.body.published !== undefined ? req.body.published : false
    }

    const article = await articleModel.create(data)
    res.status(201).json(toSnakeCase(article))
  } catch (error: any) {
    console.error('Error creating article:', error)
    if (error.message && error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Статья с таким slug уже существует' })
    } else {
      res.status(500).json({ error: 'Ошибка создания статьи' })
    }
  }
})

// PUT /api/admin/articles/:id - Обновить статью
router.put('/admin/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data: Partial<CreateArticleData> = {}

    if (req.body.title !== undefined) data.title = req.body.title
    if (req.body.slug !== undefined) data.slug = req.body.slug
    if (req.body.excerpt !== undefined) data.excerpt = req.body.excerpt
    if (req.body.content !== undefined) data.content = req.body.content
    if (req.body.image_url !== undefined || req.body.imageUrl !== undefined) {
      data.imageUrl = req.body.image_url || req.body.imageUrl
    }
    if (req.body.category !== undefined) data.category = req.body.category
    if (req.body.tags !== undefined) data.tags = req.body.tags
    if (req.body.author !== undefined) data.author = req.body.author
    if (req.body.published !== undefined) data.published = req.body.published

    const article = await articleModel.update(parseInt(req.params.id), data)
    res.json(toSnakeCase(article))
  } catch (error: any) {
    console.error('Error updating article:', error)
    if (error.message && error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Статья с таким slug уже существует' })
    } else if (error.message && error.message.includes('not found')) {
      res.status(404).json({ error: 'Статья не найдена' })
    } else {
      res.status(500).json({ error: 'Ошибка обновления статьи' })
    }
  }
})

// DELETE /api/admin/articles/:id - Удалить статью
router.delete('/admin/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await articleModel.delete(parseInt(req.params.id))
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting article:', error)
    res.status(500).json({ error: 'Ошибка удаления статьи' })
  }
})

export default router
