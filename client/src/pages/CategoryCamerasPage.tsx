import { useState, useEffect } from 'react'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import { Check, Star, Clock, Shield, Truck, Phone, Camera, Video, Zap } from 'lucide-react'

export default function CategoryCamerasPage() {
  const [page, setPage] = useState(1)
  const category = 'Камеры'

  const { data, isLoading, error } = useEquipment({
    page,
    limit: 12,
    category
  })

  // Автоматическая прокрутка к каталогу при загрузке страницы
  useEffect(() => {
    const timer = setTimeout(() => {
      const catalogElement = document.getElementById('catalog')
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const categoryStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Аренда GoPro и камер в Москве",
    "description": "Профессиональные экшн-камеры GoPro и видеокамеры в аренду. Низкие цены от 400₽/день.",
    "url": "https://vozmimenya.ru/arenda-gopro-moskva"
  }

  const advantages = [
    { icon: Camera, title: 'Последние модели', description: 'GoPro Hero 13, DJI Osmo Pocket 3,  Insta 360 X5 и другие новинки' },
    { icon: Video, title: '4K/5.3K видео', description: 'Профессиональное качество съемки' },
    { icon: Zap, title: 'Полный комплект', description: 'Крепления, аккумуляторы, карты памяти' },
    { icon: Clock, title: 'Гибкие сроки', description: 'От 1 дня до нескольких месяцев' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Аренда GoPro в Москве от 400₽/день - Прокат экшн-камер и фототехники"
        description="✅ Аренда GoPro Hero 11/12 и других экшн-камер в Москве. Полный комплект креплений. Доставка 24/7. ☎️ +7 (917) 525-50-95"
        keywords="аренда gopro москва, прокат экшн камер, аренда gopro hero 12, прокат видеокамер, фототехника напрокат москва"
        url="https://vozmimenya.ru/arenda-gopro-moskva"
        structuredData={categoryStructuredData}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="text-sm mb-4 text-orange-100">
              <a href="/" className="hover:text-white">Главная</a>
              <span className="mx-2">/</span>
              <span>Аренда камер</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Аренда GoPro и экшн-камер в Москве
            </h1>

            <p className="text-xl md:text-2xl text-orange-50 mb-8">
              Профессиональные камеры для съемки спорта, путешествий, влогов.
              От <span className="font-bold text-white">400₽/день</span>. Полный комплект креплений в подарок.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+79175255095" className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-xl">
                <Phone className="w-5 h-5 mr-2" />
                +7 (917) 525-50-95
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Каталог */}
      <section id="catalog" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Камеры в аренду</h2>
          <EquipmentGrid equipment={data?.data || []} loading={isLoading} error={error?.message || null} />
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((adv, i) => {
              const Icon = adv.icon
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-gray-600">{adv.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Для чего подходит */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Для каких задач подходят</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Экстремальный спорт</h3>
              <p className="text-gray-600 mb-4">
                Сноуборд, серфинг, скейтбординг, BMX, паркур. Защита от воды, ударов и пыли.
                Съемка в разрешении 4K/60fps.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Водонепроницаемость до 10м</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Стабилизация HyperSmooth</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Путешествия и влоги</h3>
              <p className="text-gray-600 mb-4">
                Компактные и легкие камеры для съемки путешествий, видеоблогов, обзоров.
                Длительная автономность, голосовое управление.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Автономность до 2-3 часов</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Передний дисплей для селфи</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Профессиональная съемка</h3>
              <p className="text-gray-600 mb-4">
                Высокое качество видео 5.3K, RAW фото, замедленная съемка до 240fps.
                Для музыкальных клипов, рекламы, документального кино.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">5.3K видео 60fps</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">23MP фото RAW</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Готовы снимать крутые видео?</h2>
          <p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Арендуйте GoPro сегодня и получите полный комплект креплений бесплатно!
          </p>
          <a href="tel:+79175255095" className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all shadow-xl">
            <Phone className="w-5 h-5 mr-2" />
            +7 (917) 525-50-95
          </a>
        </div>
      </section>
    </div>
  )
}
