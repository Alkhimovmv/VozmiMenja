import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Article } from '../types'
import { articlesApi } from '../api/articles'
import SEO from '../components/SEO'
import { Calendar, Eye, User, ArrowLeft, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const rentalCtas = {
  cleaning: {
    title: 'Нужно оборудование для уборки?',
    description: 'Посмотрите моющие и строительные пылесосы в аренду. Подберем модель под квартиру, диван, ковер или уборку после ремонта.',
    primaryHref: '/arenda-pylesosov-moskva',
    primaryLabel: 'Смотреть пылесосы',
    links: [
      { href: '/equipment/51022efa-99b7-4c93-a5ad-0f19851f6c1a', label: 'Karcher Puzzi 8/1' },
      { href: '/equipment/f2260efd-d0e7-4622-91b0-c90a2cbc64ad', label: 'Karcher Puzzi 10/1' },
      { href: '/equipment/0519e3d0-e02f-4f8e-b77d-0c80fe58a9cc', label: 'Karcher WD5' },
    ],
  },
  cameras: {
    title: 'Хотите снять видео без покупки камеры?',
    description: 'Возьмите GoPro, DJI Osmo Pocket или Insta360 на нужные даты. Поможем выбрать камеру под поездку, влог или мероприятие.',
    primaryHref: '/arenda-gopro-moskva',
    primaryLabel: 'Смотреть камеры',
    links: [
      { href: '/equipment/64e19704-b0dc-4879-9b90-6adc4eddd923', label: 'GoPro 13' },
      { href: '/equipment/5e1bd056-e6e8-4e92-ae17-519a56f564ad', label: 'DJI Osmo Pocket 3' },
      { href: '/equipment/98794938-b0c8-4a7d-b182-b6645ba8039b', label: 'Insta360 X5' },
    ],
  },
  audio: {
    title: 'Нужен звук для съемки или праздника?',
    description: 'Посмотрите микрофоны и колонки в аренду. Подскажем, что подойдет для видео, подкаста, вечеринки или небольшого события.',
    primaryHref: '/arenda-audiooborudovaniya-moskva',
    primaryLabel: 'Смотреть аудио',
    links: [
      { href: '/equipment/1232f00f-dc96-46df-b1e4-2d724ede3ef8', label: 'DJI Mic 2' },
      { href: '/equipment/fd15952980910f1f05be88fa6853e1fd', label: 'JBL PartyBox 320' },
      { href: '/equipment/e609e0bec87c0653a070088843f2df8c', label: 'JBL PartyBox 710' },
    ],
  },
  default: {
    title: 'Хотите подобрать оборудование под задачу?',
    description: 'Откройте каталог или напишите нам: поможем выбрать технику, срок аренды и удобный способ получения.',
    primaryHref: '/',
    primaryLabel: 'Открыть каталог',
    links: [
      { href: '/arenda-pylesosov-moskva', label: 'Пылесосы' },
      { href: '/arenda-gopro-moskva', label: 'Камеры' },
      { href: '/arenda-audiooborudovaniya-moskva', label: 'Аудио' },
    ],
  },
}

function getRentalCta(category: string) {
  if (category.includes('Пылесос') || category.includes('клининг')) return rentalCtas.cleaning
  if (category.includes('Камер')) return rentalCtas.cameras
  if (category.includes('Аудио')) return rentalCtas.audio
  return rentalCtas.default
}

function extractFaqFromMarkdown(content: string) {
  const faqStart = content.search(/^##\s+Частые вопросы\s*$/m)
  if (faqStart === -1) return []

  const faqContent = content.slice(faqStart)
  const nextSection = faqContent.slice(1).search(/^##\s+/m)
  const section = nextSection === -1 ? faqContent : faqContent.slice(0, nextSection + 1)
  const matches = [...section.matchAll(/^###\s+(.+?)\s*\n+([\s\S]*?)(?=\n###\s+|\n##\s+|$)/gm)]

  return matches
    .map((match) => ({
      question: match[1].trim(),
      answer: match[2]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`>#-]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    }))
    .filter((item) => item.question && item.answer)
}

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
  const faqItems = extractFaqFromMarkdown(article.content)
  const faqStructuredData = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null
  const rentalCta = getRentalCta(article.category)

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt}
        keywords={getTags(article.tags).join(', ')}
        image={article.image_url || undefined}
        url={`https://vozmimenya.ru/blog/${article.slug}`}
        type="article"
        structuredData={faqStructuredData ? [structuredData, faqStructuredData] : structuredData}
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

          <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{rentalCta.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{rentalCta.description}</p>
              </div>
              <Link
                to={rentalCta.primaryHref}
                className="inline-flex items-center justify-center px-5 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors text-sm shrink-0"
              >
                {rentalCta.primaryLabel}
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {rentalCta.links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-1.5 bg-[#F8FAFC] text-gray-700 rounded-lg border border-gray-100 hover:text-[#2563EB] hover:border-blue-100 transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

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
