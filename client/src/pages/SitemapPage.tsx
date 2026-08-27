import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { articlesApi } from '../api/articles'
import { apiClient } from '../lib/api'
import SEO from '../components/SEO'
import type { Article, Equipment } from '../types'

const staticPages = [
  { href: '/', label: 'Главная' },
  { href: '/arenda-pylesosov-moskva', label: 'Аренда пылесосов в Москве' },
  { href: '/arenda-gopro-moskva', label: 'Аренда GoPro и камер в Москве' },
  { href: '/arenda-audiooborudovaniya-moskva', label: 'Аренда аудиооборудования в Москве' },
  { href: '/blog', label: 'Блог' },
  { href: '/about', label: 'О нас' },
  { href: '/delivery', label: 'Условия доставки' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Контакты' },
]

export default function SitemapPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    Promise.all([
      apiClient.getEquipment({ limit: 200 }),
      articlesApi.getAll(),
    ])
      .then(([equipmentData, articlesData]) => {
        setEquipment(equipmentData.data)
        setArticles(articlesData)
      })
      .catch((error) => console.error('Error loading sitemap data:', error))
  }, [])

  const groupedEquipment = equipment.reduce<Record<string, Equipment[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] || []), item]
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Карта сайта"
        description="Карта сайта ВозьмиМеня: каталог оборудования, статьи, условия аренды и контакты."
        url="https://vozmimenya.ru/sitemap"
      />

      <section className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Карта сайта</h1>
          <p className="text-gray-500 max-w-2xl">
            Быстрый доступ к каталогу, статьям и основным страницам ВозьмиМеня.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Основные страницы</h2>
            <div className="space-y-2">
              {staticPages.map((page) => (
                <Link key={page.href} to={page.href} className="block text-gray-600 hover:text-[#2563EB] text-sm">
                  {page.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Оборудование</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedEquipment).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-bold text-gray-900 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <Link key={item.id} to={`/equipment/${item.id}`} className="block text-gray-600 hover:text-[#2563EB] text-sm">
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Статьи</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {articles.map((article) => (
                <Link key={article.id} to={`/blog/${article.slug}`} className="block text-gray-600 hover:text-[#2563EB] text-sm">
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
