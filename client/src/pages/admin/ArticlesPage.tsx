import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { articlesApi } from '../../api/articles'
import { type Article } from '../../types/index'
import ArticleModal from '../../components/admin/ArticleModal'
import { Eye, Calendar, Edit2, Trash2, Plus, FileText, CheckCircle, XCircle } from 'lucide-react'

export default function ArticlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const queryClient = useQueryClient()

  const token = localStorage.getItem('adminToken')

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: () => articlesApi.admin.getAll(token!),
    enabled: !!token
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      articlesApi.admin.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })

  const handleDeleteArticle = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      const token = localStorage.getItem('adminToken')
      if (token) {
        deleteMutation.mutate({ id, token })
      }
    }
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingArticle(null)
  }

  const publishedArticles = articles.filter(a => a.published).length
  const draftArticles = articles.filter(a => !a.published).length
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Управление блогом</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium w-full sm:w-auto min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Создать статью
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{articles.length}</div>
              <div className="text-sm text-gray-600">Всего статей</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{publishedArticles}</div>
              <div className="text-sm text-gray-600">Опубликовано</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <XCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{draftArticles}</div>
              <div className="text-sm text-gray-600">Черновики</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalViews}</div>
              <div className="text-sm text-gray-600">Просмотров</div>
            </div>
          </div>
        </div>
      </div>

      {/* Список статей */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статья
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Просмотры
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Статьи не найдены. Создайте первую статью!
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {article.image_url && (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 line-clamp-2">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                            {article.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Опубликовано
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <XCircle className="w-3 h-3" />
                          Черновик
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">{article.views}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(article.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ArticleModal
          article={editingArticle}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
