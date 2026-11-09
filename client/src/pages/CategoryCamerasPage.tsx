import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import { Check, Clock, Camera, Video, Zap } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl } from '../lib/contactLinks'
import faqContent from '../content/faq.json'

export default function CategoryCamerasPage() {
  const [page] = useState(1)
  const category = 'Камеры'

  const { data, isLoading, error } = useEquipment({ page, limit: 12, category })

  // Прокручиваем к каталогу только по явной ссылке на #catalog: при обычном входе H1 и вводный текст остаются на экране.
  useEffect(() => {
    if (window.location.hash !== '#catalog') return
    const timer = setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const categoryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Аренда экшн-камер GoPro, Insta360 и DJI в Москве',
    description: 'GoPro 13, Insta360 X5 и DJI Osmo Pocket 3 в аренду для спорта, путешествий и влога. Постамат 24/7 и доставка по Москве.',
    url: 'https://vozmimenya.ru/arenda-gopro-moskva',
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqContent['/arenda-gopro-moskva'].map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
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
      equipmentHref: '/equipment/gopro-13',
      equipmentLabel: 'GoPro 13',
      guideHref: '/blog/gopro-dlya-nachinayushchih-polnoe-rukovodstvo',
      guideLabel: 'Гайд по GoPro',
    },
    {
      title: 'Снять путешествие или влог',
      description: 'Для прогулок, разговорных видео и Reels удобно взять компактную камеру со стабилизацией.',
      equipmentHref: '/equipment/dji-osmo-pocket-3-creator-combo',
      equipmentLabel: 'DJI Osmo Pocket 3',
      guideHref: '/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360',
      guideLabel: 'Камера для поездки',
    },
    {
      title: 'Получить необычные ракурсы',
      description: 'Для 360-видео, съемки одному и эффектных проходок подойдет Insta360.',
      equipmentHref: '/equipment/insta360-x5',
      equipmentLabel: 'Insta360 X5',
      guideHref: '/blog/top-3-kamery-dlya-svadeb-2025',
      guideLabel: 'Камеры для мероприятий',
    },
  ]

  const cameraComparison = [
    { task: 'Активный отдых, вода, крепления', gopro: 'Лучший выбор', osmo: 'Слабее для экстрима', insta360: 'Хорошо для необычных ракурсов' },
    { task: 'Влог, прогулка, речь в кадре', gopro: 'Можно, но звук лучше продумать', osmo: 'Лучший выбор', insta360: 'Можно, если нужен 360-эффект' },
    { task: 'Съемка одному без оператора', gopro: 'Нужно крепление', osmo: 'Удобно с рук', insta360: 'Лучший выбор для эффекта “оператор рядом”' },
    { task: 'Быстрый монтаж без лишней возни', gopro: 'Проще всего', osmo: 'Проще всего для влога', insta360: 'Нужно выбрать ракурс после съемки' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Аренда экшн-камер GoPro, Insta360 и DJI в Москве | ВозьмиМеня"
        description="GoPro 13, Insta360 X5 и DJI Osmo Pocket 3 в аренду в Москве. Комплект для съёмки, постамат 24/7, доставка и бронь онлайн."
        keywords="аренда экшн камеры москва, аренда gopro москва, insta360 в аренду, dji osmo pocket 3 аренда"
        url="https://vozmimenya.ru/arenda-gopro-moskva"
        structuredData={[categoryStructuredData, faqStructuredData]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-sm mb-4 text-blue-200">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span className="mx-2">/</span>
            <span>Аренда камер</span>
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Аренда экшн-камер GoPro, Insta360 и DJI в Москве
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8">
            GoPro 13 для активной съёмки, Insta360 X5 для 360°-видео и DJI Osmo Pocket 3
            для влога. Самовывоз через постамат 24/7 или доставка по Москве.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('telegram_click', { source: 'category_cameras_hero' })} className="btn bg-white text-primary hover:bg-blue-50 shadow-sm">
              Написать в Telegram
            </a>
            <a href="#catalog" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
              Смотреть камеры
            </a>
          </div>
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

      <section className="py-12 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-blue-100 bg-white p-5 md:p-7 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
              <div>
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-2">Сравнение камер</p>
                <h2 className="text-2xl font-extrabold text-gray-900">GoPro, DJI Osmo Pocket или Insta360?</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-xl">
                Не надо угадывать по модели: выберите формат съемки, а менеджер поможет собрать крепления, звук и питание.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              {cameraComparison.map((row) => (
                <div key={row.task} className="grid grid-cols-1 border-b border-gray-100 last:border-b-0 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
                  <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-gray-900">{row.task}</div>
                  <div className="px-4 py-3 text-sm text-gray-600"><span className="font-bold text-gray-900">GoPro:</span> {row.gopro}</div>
                  <div className="px-4 py-3 text-sm text-gray-600"><span className="font-bold text-gray-900">Osmo:</span> {row.osmo}</div>
                  <div className="px-4 py-3 text-sm text-gray-600"><span className="font-bold text-gray-900">Insta360:</span> {row.insta360}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/equipment/gopro-13" className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
                GoPro 13
              </Link>
              <Link to="/equipment/dji-osmo-pocket-3-creator-combo" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                DJI Osmo Pocket 3
              </Link>
              <Link to="/equipment/insta360-x5" className="px-4 py-2 bg-[#F8FAFC] text-gray-700 rounded-xl text-sm font-semibold border border-gray-100 hover:text-[#2563EB] transition-colors">
                Insta360 X5
              </Link>
              <Link to="/arenda-tehniki-na-mesyac-moskva" className="px-4 py-2 bg-[#F8FAFC] text-gray-700 rounded-xl text-sm font-semibold border border-gray-100 hover:text-[#2563EB] transition-colors">
                Камера на месяц — дешевле за сутки
              </Link>
            </div>
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
          <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] rounded-2xl p-10 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3 text-white">Готовы снимать крутые видео?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">Напишите в Telegram — подберем камеру, крепления и срок аренды под вашу съемку.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('telegram_click', { source: 'category_cameras_bottom_cta' })} className="btn bg-white text-primary hover:bg-blue-50">
                Написать в Telegram
              </a>
              <a href={`tel:${CONTACT_PHONE}`} onClick={() => trackEvent('phone_click', { source: 'category_cameras_bottom_cta' })} className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
                {CONTACT_PHONE_LABEL}
              </a>
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
