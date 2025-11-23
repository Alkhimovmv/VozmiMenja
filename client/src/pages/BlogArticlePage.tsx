import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Article } from '../types'
import { articlesApi } from '../api/articles'
import SEO from '../components/SEO'
import { Calendar, Eye, User, ArrowLeft, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      loadArticle()
    }
  }, [slug])

  const loadArticle = async () => {
    try {
      setLoading(true)
      if (!slug) return

      const data = await articlesApi.getBySlug(slug)
      setArticle(data)

      // Load related articles from the same category
      if (data.category) {
        const related = await articlesApi.getByCategory(data.category)
        setRelatedArticles(related.filter(a => a.id !== data.id).slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading article:', error)
      navigate('/blog')
    } finally {
      setLoading(false)
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

  const getTags = (tagsString: string | null) => {
    if (!tagsString) return []
    return tagsString.split(',').map(tag => tag.trim())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Статья не найдена</h1>
          <Link to="/blog" className="text-primary-600 hover:text-primary-700 font-semibold">
            Вернуться к блогу
          </Link>
        </div>
      </div>
    )
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.image_url || "https://vozmimenya.ru/og-image.jpg",
    "datePublished": article.created_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "ВозьмиМеня",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vozmimenya.ru/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://vozmimenya.ru/blog/${article.slug}`
    }
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt}
        keywords={getTags(article.tags).join(', ')}
        image={article.image_url || undefined}
        url={`https://vozmimenya.ru/blog/${article.slug}`}
        type="article"
        structuredData={structuredData}
      />

      <article className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться к блогу
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Meta Info */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              {article.category}
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-gray-600 text-sm mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(article.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {article.views} просмотров
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author}
              </span>
            </div>

            {/* Featured Image */}
            {article.image_url && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Excerpt */}
            <p className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-primary-50 rounded-xl border-l-4 border-primary-600">
              {article.excerpt}
            </p>
          </div>

          {/* Article Body with Markdown */}
          <div className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-3
            prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
            prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-primary-700
            prose-h4:text-xl prose-h4:mt-5 prose-h4:mb-2 prose-h4:text-gray-800
            prose-p:text-gray-700 prose-p:text-base prose-p:leading-relaxed prose-p:mb-3
            prose-a:text-primary-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary-700
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-ul:my-3 prose-ul:space-y-1.5 prose-ul:pl-6
            prose-ol:my-3 prose-ol:space-y-1.5 prose-ol:pl-6
            prose-li:text-gray-700 prose-li:text-base prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-primary-600 prose-blockquote:bg-primary-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-3 prose-blockquote:not-italic prose-blockquote:text-gray-700
            prose-code:text-primary-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-3
            prose-table:w-full prose-table:border-collapse prose-table:border-2 prose-table:border-gray-300 prose-table:my-5 prose-table:shadow-md
            prose-thead:bg-primary-50
            prose-th:border-2 prose-th:border-gray-300 prose-th:p-2.5 prose-th:font-bold prose-th:text-left prose-th:text-gray-900
            prose-td:border-2 prose-td:border-gray-300 prose-td:p-2.5 prose-td:text-gray-700
            prose-tr:even:bg-gray-50
            prose-hr:my-6 prose-hr:border-gray-300
            prose-img:hidden">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                {getTags(article.tags).map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 pt-12 border-t">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Похожие статьи
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(relatedArticle => (
                  <Link
                    key={relatedArticle.id}
                    to={`/blog/${relatedArticle.slug}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {relatedArticle.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={relatedArticle.image_url}
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {relatedArticle.views} просмотров
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Нужна помощь с выбором оборудования?
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Наши специалисты помогут подобрать идеальное оборудование для вашего проекта
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Связаться с нами
              </Link>
              <a
                href="tel:+79933636464"
                className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition-colors"
              >
                +7 (993) 363-64-64
              </a>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
