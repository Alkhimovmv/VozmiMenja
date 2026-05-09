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

  useEffect(() => { loadArticles() }, [selectedCategory])
  useEffect(() => { loadPopularArticles() }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const data = selectedCategory === 'all'
        ? await articlesApi.getAll()
        : await articlesApi.getByCategory(selectedCategory)
      setArticles(data)
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })

  const categories = [
    { id: 'all', name: 'Все статьи' },
    { id: 'Камеры', name: 'Камеры' },
    { id: 'Пылесосы', name: 'Пылесосы' },
    { id: 'Аудиооборудование', name: 'Аудиооборудование' },
    { id: 'Общее', name: 'Общее' },
  ]

  return (
    <>
      <SEO
        title="Блог о прокате оборудования - Советы и гайды"
        description="Полезные статьи и гайды по выбору и использованию оборудования для съемки, уборки и записи звука. Профессиональные советы от экспертов ВозьмиМеня."
        keywords="блог аренда оборудования, гайды по съемке, советы по клинингу, подкастинг, видеография"
        url="https://vozmimenya.ru/blog"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Блог ВозьмиМеня',
          description: 'Статьи о прокате и использовании профессионального оборудования',
          url: 'https://vozmimenya.ru/blog',
          publisher: { '@type': 'Organization', name: 'ВозьмиМеня', logo: { '@type': 'ImageObject', url: 'https://vozmimenya.ru/logo.png' } },
        }}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Полезное</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Блог ВозьмиМеня</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Полезные статьи и гайды по выбору оборудования для съемки, уборки и записи звука.
              Профессиональные советы от экспертов проката.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main */}
            <div className="lg:col-span-2">
              {/* Category filter */}
              <div className="mb-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#2563EB] border-t-transparent"></div>
                  <p className="mt-4 text-gray-500 text-sm">Загрузка статей...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500">Статьи в этой категории пока не добавлены</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {articles.map((article) => (
                    <article key={article.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
                      <div className="md:flex">
                        {article.image_url && (
                          <div className="w-full md:w-64 md:min-w-64 h-52 md:h-auto overflow-hidden flex-shrink-0">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-6 flex-1">
                          <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(article.created_at)}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views} просмотров</span>
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{article.author}</span>
                          </div>
                          <span className="inline-block px-2.5 py-1 bg-blue-50 text-[#2563EB] text-xs font-semibold rounded-full mb-3">
                            {article.category}
                          </span>
                          <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#2563EB] transition-colors">
                            <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                          </h2>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                          <Link to={`/blog/${article.slug}`} className="inline-flex items-center gap-1 text-[#2563EB] text-sm font-semibold hover:gap-2 transition-all">
                            Читать далее <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#2563EB]" /> Популярные статьи
                </h3>
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <Link key={article.id} to={`/blog/${article.slug}`} className="flex gap-3 group">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#2563EB] transition-colors line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" />{article.views} просмотров
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Нужна консультация?</h4>
                  <p className="text-xs text-gray-500 mb-3">Поможем выбрать оборудование под вашу задачу</p>
                  <Link to="/contact" className="block w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-center py-2 rounded-xl text-sm font-semibold transition-colors">
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
