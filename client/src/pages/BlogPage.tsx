import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Article } from '../types'
import { articlesApi } from '../api/articles'
import SEO from '../components/SEO'
import { Calendar, Eye, User, ChevronRight } from 'lucide-react'

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadArticles()
    loadPopularArticles()
  }, [selectedCategory])

  const loadArticles = async () => {
    try {
      setLoading(true)
      if (selectedCategory === 'all') {
        const data = await articlesApi.getAll()
        setArticles(data)
      } else {
        const data = await articlesApi.getByCategory(selectedCategory)
        setArticles(data)
      }
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPopularArticles = async () => {
    try {
      const data = await articlesApi.getPopular(5)
      setPopularArticles(data)
    } catch (error) {
      console.error('Error loading popular articles:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const categories = [
    { id: 'all', name: 'Все статьи' },
    { id: 'Камеры', name: 'Камеры' },
    { id: 'Пылесосы', name: 'Пылесосы' },
    { id: 'Аудиооборудование', name: 'Аудиооборудование' },
    { id: 'Общее', name: 'Общее' }
  ]

  return (
    <>
      <SEO
        title="Блог о прокате оборудования - Советы и гайды"
        description="Полезные статьи и гайды по выбору и использованию оборудования для съемки, уборки и записи звука. Профессиональные советы от экспертов ВозьмиМеня."
        keywords="блог аренда оборудования, гайды по съемке, советы по клинингу, подкастинг, видеография"
        url="https://vozmimenya.ru/blog"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Блог ВозьмиМеня",
          "description": "Статьи о прокате и использовании профессионального оборудования",
          "url": "https://vozmimenya.ru/blog",
          "publisher": {
            "@type": "Organization",
            "name": "ВозьмиМеня",
            "logo": {
              "@type": "ImageObject",
              "url": "https://vozmimenya.ru/logo.png"
            }
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Блог ВозьмиМеня
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl">
              Полезные статьи и гайды по выбору оборудования для съемки, уборки и записи звука.
              Профессиональные советы от экспертов проката.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Category Filter */}
              <div className="mb-8 flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Articles Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Загрузка статей...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                  <p className="text-gray-600 text-lg">Статьи в этой категории пока не добавлены</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {articles.map(article => (
                    <article
                      key={article.id}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                      <div className="md:flex">
                        {article.image_url && (
                          <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className={`p-6 ${article.image_url ? 'md:w-2/3' : 'w-full'}`}>
                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(article.created_at)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4" />
                              {article.views} просмотров
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              {article.author}
                            </span>
                          </div>

                          {/* Category Badge */}
                          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
                            {article.category}
                          </span>

                          {/* Title */}
                          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                            <Link to={`/blog/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h2>

                          {/* Excerpt */}
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>

                          {/* Read More */}
                          <Link
                            to={`/blog/${article.slug}`}
                            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
                          >
                            Читать далее
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Popular Articles */}
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary-600" />
                  Популярные статьи
                </h3>
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views} просмотров
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Нужна консультация?
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Поможем выбрать оборудование под вашу задачу
                  </p>
                  <Link
                    to="/contact"
                    className="block w-full bg-primary-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Связаться с нами
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
