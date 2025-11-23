import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Article, type CreateArticleDto } from '../../types/index'
import { articlesApi } from '../../api/articles'
import { X, Save } from 'lucide-react'

interface ArticleModalProps {
  article?: Article | null
  onClose: () => void
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateArticleDto>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category: 'Общее',
    tags: '',
    author: 'ВозьмиМеня',
    published: false
  })

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        image_url: article.image_url || '',
        category: article.category,
        tags: article.tags || '',
        author: article.author,
        published: article.published
      })
    }
  }, [article])

  const createMutation = useMutation({
    mutationFn: (data: CreateArticleDto) => {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No token')
      return articlesApi.admin.create(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CreateArticleDto) => {
      const token = localStorage.getItem('adminToken')
      if (!token || !article) throw new Error('No token or article')
      return articlesApi.admin.update(article.id, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.slug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^а-яa-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      formData.slug = slug
    }

    if (article) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  const modalContent = (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center z-50 sm:items-start sm:p-4 sm:pb-8 overflow-y-auto">
      <div className="relative mx-auto border shadow-lg bg-white w-full h-full sm:w-11/12 sm:max-w-4xl sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:rounded-md overflow-y-auto flex flex-col">
        <div className="flex-1 flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {article ? 'Редактировать статью' : 'Создать статью'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="Введите заголовок статьи"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL (slug) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="url-stati"
              />
              <p className="text-xs text-gray-500 mt-1">
                Если оставить пустым, будет сгенерирован автоматически
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="Общее">Общее</option>
                  <option value="Камеры">Камеры</option>
                  <option value="Пылесосы">Пылесосы</option>
                  <option value="Аудиооборудование">Аудиооборудование</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Автор
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ВозьмиМеня"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Краткое описание *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
                placeholder="Краткое описание статьи для превью"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Содержание (Markdown) *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                required
                placeholder="## Заголовок&#10;&#10;Текст статьи"
              />
              <p className="text-xs text-gray-500 mt-1">
                Поддерживается Markdown-разметка
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Теги
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="тег1, тег2, тег3"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">
                Опубликовать статью
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {article ? 'Сохранить' : 'Создать'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
