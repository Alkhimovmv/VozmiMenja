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

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Какую камеру лучше взять для путешествия?', acceptedAnswer: { '@type': 'Answer', text: 'Для активного отдыха и креплений подойдет GoPro, для влогов и прогулок - DJI Osmo Pocket 3, для необычных 360-градусных ракурсов - Insta360.' } },
      { '@type': 'Question', name: 'Что входит в комплект при аренде камеры?', acceptedAnswer: { '@type': 'Answer', text: 'Комплект зависит от модели, но обычно можно подобрать камеру, крепления, зарядку, аккумуляторы и карту памяти под конкретную съемку.' } },
      { '@type': 'Question', name: 'Можно ли взять камеру на один день?', acceptedAnswer: { '@type': 'Answer', text: 'Да, камеру можно арендовать на один календарный день, выходные, поездку или более долгий срок.' } },
      { '@type': 'Question', name: 'Поможете выбрать камеру под задачу?', acceptedAnswer: { '@type': 'Answer', text: 'Да, расскажите формат съемки, локацию и длительность, а мы подскажем подходящую камеру и комплект аксессуаров.' } },
    ],
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

  const taskGuides = [
    {
      title: 'Снять активный отдых',
      description: 'Для спорта, воды, креплений и динамики лучше подойдет GoPro с широким углом и стабилизацией.',
      equipmentHref: '/equipment/64e19704-b0dc-4879-9b90-6adc4eddd923',
      equipmentLabel: 'GoPro 13',
      guideHref: '/blog/gopro-dlya-nachinayushchih-polnoe-rukovodstvo',
      guideLabel: 'Гайд по GoPro',
    },
    {
      title: 'Снять путешествие или влог',
      description: 'Для прогулок, разговорных видео и Reels удобно взять компактную камеру со стабилизацией.',
      equipmentHref: '/equipment/5e1bd056-e6e8-4e92-ae17-519a56f564ad',
      equipmentLabel: 'DJI Osmo Pocket 3',
      guideHref: '/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360',
      guideLabel: 'Камера в путешествие',
    },
    {
      title: 'Получить необычные ракурсы',
      description: 'Для 360-видео, съемки одному и эффектных проходок подойдет Insta360.',
      equipmentHref: '/equipment/98794938-b0c8-4a7d-b182-b6645ba8039b',
      equipmentLabel: 'Insta360 X5',
      guideHref: '/blog/top-3-kamery-dlya-svadeb-2025',
      guideLabel: 'Камеры для мероприятий',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Аренда GoPro в Москве от 400₽/день - Прокат экшн-камер и фототехники"
        description="✅ Аренда GoPro Hero 11/12 и других экшн-камер в Москве. Полный комплект креплений. Доставка 24/7. ☎️ +7 (993) 363-64-64"
        keywords="аренда gopro москва, прокат экшн камер, аренда gopro hero 12, прокат видеокамер, фототехника напрокат москва"
        url="https://vozmimenya.ru/arenda-gopro-moskva"
        structuredData={[categoryStructuredData, faqStructuredData]}
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

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Подобрать камеру под съемку</h2>
              <p className="text-gray-500 text-sm max-w-2xl">
                Выберите сценарий, а не модель: так проще понять, какая камера даст нужную картинку.
              </p>
            </div>
            <Link to="/blog" className="text-[#2563EB] text-sm font-semibold hover:underline">
              Все статьи
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {taskGuides.map((guide) => (
              <div key={guide.title} className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5">
                <h3 className="font-bold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{guide.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={guide.equipmentHref} className="px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
                    {guide.equipmentLabel}
                  </Link>
                  <Link to={guide.guideHref} className="px-3 py-2 bg-white text-gray-700 rounded-xl text-sm font-semibold border border-gray-100 hover:text-[#2563EB] transition-colors">
                    {guide.guideLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
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

      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center">Частые вопросы</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqStructuredData.mainEntity.map((faq) => (
              <div key={faq.name} className="bg-[#F8FAFC] rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-2">{faq.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
