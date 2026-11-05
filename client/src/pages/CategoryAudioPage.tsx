import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import { Check, Mic, Music, Radio } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl } from '../lib/contactLinks'
import faqContent from '../content/faq.json'

export default function CategoryAudioPage() {
  const [page] = useState(1)
  const category = 'Аудиооборудование'

  const { data, isLoading, error } = useEquipment({ page, limit: 12, category })

  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const equipmentTypes = [
    {
      icon: Music,
      title: 'Колонки JBL PartyBox',
      features: ['PartyBox 320 для квартиры и дачи', 'PartyBox 710 для зала и танцев', 'Bluetooth и световые эффекты'],
    },
    {
      icon: Mic,
      title: 'Микрофоны',
      features: ['DJI Mic 2 для интервью и видео', 'Микрофоны JBL для караоке', 'Можно добавить к колонке или камере'],
    },
    {
      icon: Radio,
      title: 'Готовые комплекты',
      features: ['Колонка и два микрофона', 'Камера и DJI Mic 2', 'Одна заявка на весь комплект'],
    },
  ]

  const categoryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Аренда колонок JBL и аудиооборудования в Москве',
    description: 'JBL PartyBox 320 и 710, микрофоны JBL и DJI Mic 2 в аренду. Самовывоз и возврат через постамат 24/7, доставка по Москве.',
    url: 'https://vozmimenya.ru/arenda-audiooborudovaniya-moskva',
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqContent['/arenda-audiooborudovaniya-moskva'].map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  }

  const useCases = [
    { title: 'Интервью и подкасты', description: 'Беспроводная петличка DJI Mic 2 на двух спикеров' },
    { title: 'Вечеринка и праздник', description: 'JBL PartyBox 320 для квартиры, 710 — для зала и танцев' },
    { title: 'Съемка видео', description: 'DJI Mic 2 к телефону или камере — чистая речь в кадре' },
    { title: 'Выступление и тост', description: 'PartyBox и микрофон по наличию — для речи и поздравлений' },
  ]

  const taskGuides = [
    {
      title: 'Записать интервью или видео',
      description: 'Для чистой речи в кадре нужен внешний микрофон: особенно если вокруг шум, улица или большое помещение.',
      equipmentHref: '/equipment/dji-mic-2',
      equipmentLabel: 'DJI Mic 2',
      guideHref: '/arenda-mikrofona-dlya-intervyu-moskva',
      guideLabel: 'Микрофон для интервью',
    },
    {
      title: 'Музыка для домашней вечеринки',
      description: 'Для квартиры, небольшой дачи или камерной встречи подойдет мощная портативная колонка.',
      equipmentHref: '/equipment/jbl-partybox-320',
      equipmentLabel: 'JBL PartyBox 320',
      guideHref: '/arenda-kolonki-dlya-vecherinki-moskva',
      guideLabel: 'Колонка для вечеринки',
    },
    {
      title: 'Сделать звук для большого события',
      description: 'Для зала, танцев и громкой музыки лучше брать акустику с запасом мощности.',
      equipmentHref: '/equipment/jbl-partybox-710',
      equipmentLabel: 'JBL PartyBox 710',
      guideHref: '/arenda-kolonki-dlya-vecherinki-moskva',
      guideLabel: 'Колонка для вечеринки',
    },
  ]

  const partyBoxComparison = [
    { label: 'Квартира / небольшая дача', partybox320: 'Лучший выбор', partybox710: 'С запасом, если нужны танцы' },
    { label: '15–30 гостей', partybox320: 'Хватит для фона и обычной громкости', partybox710: 'Лучше для плотного звука' },
    { label: 'Большой зал / громкая вечеринка', partybox320: 'Может быть мало', partybox710: 'Лучший выбор' },
    { label: 'Перевозка и установка', partybox320: 'Проще и мобильнее', partybox710: 'Мощнее, но крупнее' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Аренда колонок JBL и аудиооборудования в Москве | ВозьмиМеня"
        description="JBL PartyBox 320 и 710, микрофоны JBL и DJI Mic 2 в аренду в Москве. Постамат 24/7, доставка, подбор комплекта и бронь онлайн."
        keywords="аренда колонки jbl москва, аренда jbl partybox, прокат колонок, аренда аудиооборудования, микрофоны в аренду"
        url="https://vozmimenya.ru/arenda-audiooborudovaniya-moskva"
        structuredData={[categoryStructuredData, faqStructuredData]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-sm mb-4 text-blue-200">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span className="mx-2">/</span>
            <span>Аренда аудиооборудования</span>
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Аренда колонок JBL и аудиооборудования в Москве
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8">
            JBL PartyBox 320 и 710 для вечеринок, залов и дачи. Микрофоны для караоке,
            поздравлений и съёмки можно добавить в ту же заявку.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('telegram_click', { source: 'category_audio_hero' })} className="btn bg-white text-primary hover:bg-blue-50 shadow-sm">
              Написать в Telegram
            </a>
            <a href="#catalog" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
              Смотреть аудио
            </a>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Аудиооборудование в аренду</h2>
          <EquipmentGrid equipment={data?.data || []} loading={isLoading} error={error?.message || null} />
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Подобрать звук под задачу</h2>
              <p className="text-gray-500 text-sm max-w-2xl">
                Начните с формата: запись речи, домашний праздник или событие с громкой музыкой.
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
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-2">Сравнение колонок</p>
                <h2 className="text-2xl font-extrabold text-gray-900">JBL PartyBox 320 или 710?</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-xl">
                320 чаще берут домой и на дачу, 710 — когда важны танцы, большой зал и запас громкости.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              {partyBoxComparison.map((row) => (
                <div key={row.label} className="grid grid-cols-1 border-b border-gray-100 last:border-b-0 md:grid-cols-[1.1fr_1fr_1fr]">
                  <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-gray-900">{row.label}</div>
                  <div className="px-4 py-3 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">PartyBox 320:</span> {row.partybox320}
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">PartyBox 710:</span> {row.partybox710}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/equipment/jbl-partybox-320" className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
                Смотреть PartyBox 320
              </Link>
              <Link to="/equipment/jbl-partybox-710" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                Смотреть PartyBox 710
              </Link>
              <Link to="/arenda-karaoke-komplekta-moskva" className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl text-sm font-semibold hover:bg-amber-300 transition-colors">
                Колонка + два микрофона
              </Link>
              <Link to="/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu" className="px-4 py-2 bg-[#F8FAFC] text-gray-700 rounded-xl text-sm font-semibold border border-gray-100 hover:text-[#2563EB] transition-colors">
                Читать гид по выбору
              </Link>
              <Link to="/arenda-tehniki-na-mesyac-moskva" className="px-4 py-2 bg-[#F8FAFC] text-gray-700 rounded-xl text-sm font-semibold border border-gray-100 hover:text-[#2563EB] transition-colors">
                Колонка на месяц — дешевле за сутки
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment types */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Что можно взять в аренду</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {equipmentTypes.map((type) => {
              const Icon = type.icon
              return (
                <div key={type.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{type.title}</h3>
                  <ul className="space-y-2">
                    {type.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Для каких задач</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {useCases.map((uc) => (
              <div key={uc.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-500">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] rounded-2xl p-10 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3 text-white">Нужно качественное звуковое оборудование?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">Напишите в Telegram — подберем колонку, микрофон или комплект под ваш формат.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('telegram_click', { source: 'category_audio_bottom_cta' })} className="btn bg-white text-primary hover:bg-blue-50">
                Написать в Telegram
              </a>
              <a href={`tel:${CONTACT_PHONE}`} onClick={() => trackEvent('phone_click', { source: 'category_audio_bottom_cta' })} className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
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
