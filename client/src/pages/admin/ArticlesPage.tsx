import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
)
import { articlesApi } from '../../api/articles'
import { type Article } from '../../types/index'
import ArticleModal from '../../components/admin/ArticleModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Eye, Calendar, Edit2, Trash2, Plus, FileText, CheckCircle, XCircle, Tag } from 'lucide-react'

export default function ArticlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; articleId: number | null }>({ isOpen: false, articleId: null })
  const queryClient = useQueryClient()

  const token = localStorage.getItem('authToken')

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
    setDeleteConfirm({ isOpen: true, articleId: id })
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
    <div className="h-full overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Управление блогом</h1>
          <p className="mt-1 text-sm text-gray-500">Статьи, черновики и публикации сайта</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium w-full sm:w-auto min-h-[44px] touch-manipulation flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Создать статью
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{articles.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Всего статей</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{publishedArticles}</div>
              <div className="text-xs sm:text-sm text-gray-600">Опубликовано</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-yellow-100 rounded-lg">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{draftArticles}</div>
              <div className="text-xs sm:text-sm text-gray-600">Черновики</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalViews}</div>
              <div className="text-xs sm:text-sm text-gray-600">Просмотров</div>
            </div>
          </div>
        </div>
      </div>

      {/* Список статей */}
      <div className="md:hidden space-y-3">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
            Статьи не найдены. Создайте первую статью!
          </div>
        ) : (
          articles.map((article) => (
            <article key={article.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-16 w-20 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-3 text-base font-bold leading-snug text-gray-900">
                    {article.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                  <Tag className="h-3 w-3" />
                  {article.category}
                </span>
                {article.published ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
                    <CheckCircle className="h-3 w-3" />
                    Опубликовано
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                    <XCircle className="h-3 w-3" />
                    Черновик
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(article.created_at)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    {article.views} просмотров
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="min-h-[40px] rounded-xl bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                  >
                    Править
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    disabled={deleteMutation.isPending}
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
                    title="Удалить"
                  >
                    {deleteMutation.isPending ? <Spinner /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-60"
                          title="Удалить"
                        >
                          {deleteMutation.isPending ? <Spinner /> : <Trash2 className="w-4 h-4" />}
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление статьи"
        message="Вы уверены, что хотите удалить эту статью? Это действие нельзя будет отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        onConfirm={() => {
          if (deleteConfirm.articleId) {
            const token = localStorage.getItem('authToken')
            if (token) deleteMutation.mutate({ id: deleteConfirm.articleId, token })
          }
          setDeleteConfirm({ isOpen: false, articleId: null })
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, articleId: null })}
      />
    </div>
  )
}
