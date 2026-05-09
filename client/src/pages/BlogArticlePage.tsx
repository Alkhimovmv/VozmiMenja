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

  useEffect(() => { if (slug) loadArticle() }, [slug])

  const loadArticle = async () => {
    try {
      setLoading(true)
      if (!slug) return
      const data = await articlesApi.getBySlug(slug)
      setArticle(data)
      if (data.category) {
        const related = await articlesApi.getByCategory(data.category)
        setRelatedArticles(related.filter((a) => a.id !== data.id).slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading article:', error)
      navigate('/blog')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })

  const getTags = (tagsString: string | null) =>
    tagsString ? tagsString.split(',').map((t) => t.trim()) : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#2563EB] border-t-transparent"></div>
          <p className="mt-4 text-gray-500 text-sm">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Статья не найдена</h1>
          <Link to="/blog" className="text-[#2563EB] hover:underline font-semibold">Вернуться к блогу</Link>
        </div>
      </div>
    )
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.image_url || 'https://vozmimenya.ru/og-image.jpg',
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: article.author },
    publisher: { '@type': 'Organization', name: 'ВозьмиМеня', logo: { '@type': 'ImageObject', url: 'https://vozmimenya.ru/logo.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://vozmimenya.ru/blog/${article.slug}` },
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

      <article className="min-h-screen bg-[#F8FAFC]">
        {/* Back bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Вернуться к блогу
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Meta */}
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#2563EB] text-xs font-semibold rounded-full mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">{article.title}</h1>
          <div className="flex flex-wrap gap-5 text-gray-400 text-sm mb-6">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(article.created_at)}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{article.views} просмотров</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{article.author}</span>
          </div>

          {article.image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img src={article.image_url} alt={article.title} className="w-full h-auto" />
            </div>
          )}

          <p className="text-lg text-gray-700 leading-relaxed mb-8 p-5 bg-blue-50 rounded-2xl border-l-4 border-[#2563EB]">
            {article.excerpt}
          </p>

          {/* Body */}
          <div className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-[#2563EB]
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-3
            prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-ul:my-3 prose-ol:my-3
            prose-li:text-gray-600
            prose-blockquote:border-l-4 prose-blockquote:border-[#2563EB] prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
            prose-code:text-[#2563EB] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-img:hidden">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-2 items-center">
              <Tag className="w-4 h-4 text-gray-400" />
              {getTags(article.tags).map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {/* Related */}
          {relatedArticles.length > 0 && (
            <div className="mt-14 pt-10 border-t border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие статьи</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map((rel) => (
                  <Link key={rel.id} to={`/blog/${rel.slug}`} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                    {rel.image_url && (
                      <div className="h-40 overflow-hidden">
                        <img src={rel.image_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors line-clamp-2 mb-2 text-sm">{rel.title}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" />{rel.views} просмотров</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-14 bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">Нужна помощь с выбором оборудования?</h3>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">
              Наши специалисты помогут подобрать идеальное оборудование для вашего проекта
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact" className="px-6 py-3 bg-white text-[#2563EB] rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
                Связаться с нами
              </Link>
              <a href="tel:+79933636464" className="btn bg-white text-primary hover:bg-blue-50">
                +7 (993) 363-64-64
              </a>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
