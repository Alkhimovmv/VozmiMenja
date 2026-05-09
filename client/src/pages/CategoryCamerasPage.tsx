import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import { Check, Clock, Camera, Video, Zap } from 'lucide-react'

export default function CategoryCamerasPage() {
  const [page] = useState(1)
  const category = 'Камеры'

  const { data, isLoading, error } = useEquipment({ page, limit: 12, category })

  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const categoryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Аренда GoPro и камер в Москве',
    description: 'Профессиональные экшн-камеры GoPro и видеокамеры в аренду. Низкие цены от 400₽/день.',
    url: 'https://vozmimenya.ru/arenda-gopro-moskva',
  }

  const advantages = [
    { icon: Camera, title: 'Последние модели', description: 'GoPro Hero 13, DJI Osmo Pocket 3, Insta 360 X5 и другие новинки' },
    { icon: Video, title: '4K/5.3K видео', description: 'Профессиональное качество съемки' },
    { icon: Zap, title: 'Полный комплект', description: 'Крепления, аккумуляторы, карты памяти' },
    { icon: Clock, title: 'Гибкие сроки', description: 'От 1 дня до нескольких месяцев' },
  ]

  const useCases = [
    {
      title: 'Экстремальный спорт',
      description: 'Сноуборд, серфинг, скейтбординг, BMX, паркур. Защита от воды, ударов и пыли. Съемка в разрешении 4K/60fps.',
      features: ['Водонепроницаемость до 10м', 'Стабилизация HyperSmooth'],
    },
    {
      title: 'Путешествия и влоги',
      description: 'Компактные и легкие камеры для съемки путешествий, видеоблогов, обзоров. Длительная автономность, голосовое управление.',
      features: ['Автономность до 2-3 часов', 'Передний дисплей для селфи'],
    },
    {
      title: 'Профессиональная съемка',
      description: 'Высокое качество видео 5.3K, RAW фото, замедленная съемка до 240fps. Для музыкальных клипов, рекламы, документального кино.',
      features: ['5.3K видео 60fps', '23MP фото RAW'],
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Аренда GoPro в Москве от 400₽/день - Прокат экшн-камер и фототехники"
        description="✅ Аренда GoPro Hero 11/12 и других экшн-камер в Москве. Полный комплект креплений. Доставка 24/7. ☎️ +7 (993) 363-64-64"
        keywords="аренда gopro москва, прокат экшн камер, аренда gopro hero 12, прокат видеокамер, фототехника напрокат москва"
        url="https://vozmimenya.ru/arenda-gopro-moskva"
        structuredData={categoryStructuredData}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-sm mb-4 text-blue-200">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span className="mx-2">/</span>
            <span>Аренда камер</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Аренда GoPro и экшн-камер в Москве
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8">
            Профессиональные камеры для съемки спорта, путешествий, влогов.
            От <span className="font-bold text-white">400₽/день</span>. Полный комплект креплений в подарок.
          </p>
          <a
            href="tel:+79933636464"
            className="btn bg-white text-primary hover:bg-blue-50 shadow-sm"
          >
            +7 (993) 363-64-64
          </a>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Камеры в аренду</h2>
          <EquipmentGrid equipment={data?.data || []} loading={isLoading} error={error?.message || null} />
        </div>
      </section>

      {/* Advantages */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, i) => {
              const Icon = adv.icon
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-gray-500 text-sm">{adv.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Для каких задач подходят</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{uc.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{uc.description}</p>
                <ul className="space-y-2">
                  {uc.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] rounded-2xl p-10 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">Готовы снимать крутые видео?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">Арендуйте камеру сегодня и получите полный комплект креплений!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+79933636464" className="btn bg-white text-primary hover:bg-blue-50">
                +7 (993) 363-64-64
              </a>
              <Link to="/contact" className="btn bg-white text-primary hover:bg-blue-50">
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
