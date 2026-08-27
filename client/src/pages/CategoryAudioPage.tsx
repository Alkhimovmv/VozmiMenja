import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import { Check, Mic, Music, Radio } from 'lucide-react'

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
      icon: Mic,
      title: 'Микрофоны',
      features: ['Студийные конденсаторные', 'Динамические для живых выступлений', 'Беспроводные петличные', 'Shotgun для видео'],
    },
    {
      icon: Music,
      title: 'Колонки и акустика',
      features: ['Портативные Bluetooth колонки', 'Профессиональная PA-акустика', 'Студийные мониторы', 'Сабвуферы'],
    },
    {
      icon: Radio,
      title: 'Звуковое оборудование',
      features: ['Аудиоинтерфейсы', 'Микшерные пульты', 'Рекордеры и диктофоны', 'Наушники профессиональные'],
    },
  ]

  const categoryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Аренда аудиооборудования в Москве',
    description: 'Микрофоны, колонки и акустика в аренду для видео, подкастов, вечеринок и мероприятий.',
    url: 'https://vozmimenya.ru/arenda-audiooborudovaniya-moskva',
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Какое аудиооборудование взять для интервью или видео?', acceptedAnswer: { '@type': 'Answer', text: 'Для речи в кадре обычно нужен внешний микрофон. Для мобильной съемки удобно взять беспроводной комплект вроде DJI Mic 2.' } },
      { '@type': 'Question', name: 'Какую колонку выбрать для вечеринки?', acceptedAnswer: { '@type': 'Answer', text: 'Для квартиры, небольшой дачи или камерной встречи чаще достаточно JBL PartyBox 320. Для большого помещения, танцев и громкой музыки лучше брать PartyBox 710.' } },
      { '@type': 'Question', name: 'Можно ли подключить телефон к колонке?', acceptedAnswer: { '@type': 'Answer', text: 'Да, для большинства сценариев можно подключить телефон или ноутбук, но перед мероприятием лучше заранее проверить нужный формат подключения.' } },
      { '@type': 'Question', name: 'Поможете рассчитать мощность под помещение?', acceptedAnswer: { '@type': 'Answer', text: 'Да, напишите примерную площадь, число гостей и формат мероприятия, а мы подскажем подходящий комплект.' } },
    ],
  }

  const useCases = [
    { title: 'Подкасты и стримы', description: 'Студийные микрофоны для чистого звука' },
    { title: 'Мероприятия', description: 'PA-системы для конференций и презентаций' },
    { title: 'Съемки видео', description: 'Петличные и shotgun микрофоны' },
    { title: 'Музыкальные выступления', description: 'Вокальные микрофоны и акустика' },
  ]

  const taskGuides = [
    {
      title: 'Записать интервью или видео',
      description: 'Для чистой речи в кадре нужен внешний микрофон: особенно если вокруг шум, улица или большое помещение.',
      equipmentHref: '/equipment/1232f00f-dc96-46df-b1e4-2d724ede3ef8',
      equipmentLabel: 'DJI Mic 2',
      guideHref: '/blog/kachestvennyj-zvuk-dlya-video-dji-mic-2',
      guideLabel: 'Гайд по звуку',
    },
    {
      title: 'Озвучить домашний праздник',
      description: 'Для квартиры, небольшой дачи или камерной встречи подойдет мощная портативная колонка.',
      equipmentHref: '/equipment/fd15952980910f1f05be88fa6853e1fd',
      equipmentLabel: 'JBL PartyBox 320',
      guideHref: '/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu',
      guideLabel: 'Как выбрать колонку',
    },
    {
      title: 'Сделать звук для большого события',
      description: 'Для зала, танцев и громкой музыки лучше брать акустику с запасом мощности.',
      equipmentHref: '/equipment/e609e0bec87c0653a070088843f2df8c',
      equipmentLabel: 'JBL PartyBox 710',
      guideHref: '/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu',
      guideLabel: 'Сравнение PartyBox',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Аренда аудиооборудования в Москве - Микрофоны, колонки, акустика"
        description="✅ Аренда профессионального аудиооборудования в Москве. Микрофоны, колонки, акустические системы. Доставка 24/7. ☎️ +7 (993) 363-64-64"
        keywords="аренда аудиооборудования москва, прокат микрофонов, аренда колонок, звуковое оборудование напрокат, акустика в аренду"
        url="https://vozmimenya.ru/arenda-audiooborudovaniya-moskva"
        structuredData={[categoryStructuredData, faqStructuredData]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-sm mb-4 text-blue-200">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span className="mx-2">/</span>
            <span>Аренда аудиооборудования</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Аренда аудиооборудования в Москве
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8">
            Профессиональные микрофоны, колонки и акустика для любых мероприятий.
            Студийное качество звука от <span className="font-bold text-white">450₽/день</span>.
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
          <div className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] rounded-2xl p-10 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">Нужно качественное звуковое оборудование?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">Звоните прямо сейчас — подберем оптимальное решение для ваших задач!</p>
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
