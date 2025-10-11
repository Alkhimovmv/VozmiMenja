import { useState, useEffect } from 'react'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import { Check, Mic, Music, Radio, Phone } from 'lucide-react'

export default function CategoryAudioPage() {
  const [page] = useState(1)
  const category = 'Аудиооборудование'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Аренда аудиооборудования в Москве - Микрофоны, колонки, акустика"
        description="✅ Аренда профессионального аудиооборудования в Москве. Микрофоны, колонки, акустические системы. Доставка 24/7. ☎️ +7 (917) 525-50-95"
        keywords="аренда аудиооборудования москва, прокат микрофонов, аренда колонок, звуковое оборудование напрокат, акустика в аренду"
        url="https://vozmimenya.ru/arenda-audiooborudovaniya-moskva"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="text-sm mb-4 text-purple-100">
              <a href="/" className="hover:text-white">Главная</a>
              <span className="mx-2">/</span>
              <span>Аренда аудиооборудования</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Аренда аудиооборудования в Москве
            </h1>

            <p className="text-xl md:text-2xl text-purple-50 mb-8">
              Профессиональные микрофоны, колонки и акустика для любых мероприятий.
              Студийное качество звука от <span className="font-bold text-white">450₽/день</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+79175255095" className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-xl">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Аудиооборудование в аренду</h2>
          <EquipmentGrid equipment={data?.data || []} loading={isLoading} error={error?.message || null} />
        </div>
      </section>

      {/* Виды оборудования */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Что можно взять в аренду</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Микрофоны</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Студийные конденсаторные</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Динамические для живых выступлений</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Беспроводные петличные</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Shotgun для видео</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mb-4">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Колонки и акустика</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Портативные Bluetooth колонки</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Профессиональная PA-акустика</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Студийные мониторы</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Сабвуферы</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mb-4">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Звуковое оборудование</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Аудиоинтерфейсы</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Микшерные пульты</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Рекордеры и диктофоны</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Наушники профессиональные</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Применение */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Для каких задач</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Подкасты и стримы</h3>
              <p className="text-sm text-gray-600">Студийные микрофоны для чистого звука</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Мероприятия</h3>
              <p className="text-sm text-gray-600">PA-системы для конференций и презентаций</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Съемки видео</h3>
              <p className="text-sm text-gray-600">Петличные и shotgun микрофоны</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Музыкальные выступления</h3>
              <p className="text-sm text-gray-600">Вокальные микрофоны и акустика</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Нужно качественное звуковое оборудование?</h2>
          <p className="text-xl text-purple-50 mb-8 max-w-2xl mx-auto">
            Звоните прямо сейчас — подберем оптимальное решение для ваших задач!
          </p>
          <a href="tel:+79175255095" className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all shadow-xl">
            <Phone className="w-5 h-5 mr-2" />
            +7 (917) 525-50-95
          </a>
        </div>
      </section>
    </div>
  )
}
