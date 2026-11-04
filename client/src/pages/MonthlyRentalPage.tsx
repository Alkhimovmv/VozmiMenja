import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, Camera, Hammer, MessageCircle, Music, RefreshCw, Sparkles, Truck } from 'lucide-react'
import SEO from '../components/SEO'
import { useEquipment } from '../hooks/useEquipment'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'
import { equipmentPath } from '../lib/equipmentUrls'
import { getLongTermDailyPrice, getOneDayPrice, getPeriodPrice } from '../utils/pricing'
import faqContent from '../content/faq.json'
import seoMeta from '../content/seoMeta.json'

const route = '/arenda-tehniki-na-mesyac-moskva'
const pageUrl = `https://vozmimenya.ru${route}`
const faq = faqContent[route]

const scenarios = [
  { icon: Hammer, title: 'Ремонт квартиры', text: 'Строительный пылесос WD5 на весь срок работ: убирать пыль после каждого этапа, а не только в конце.', href: '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva' },
  { icon: Camera, title: 'Поездка или съёмочный проект', text: 'GoPro, Insta360 или Osmo Pocket на отпуск, сезон блога или серию съёмок.', href: '/arenda-kamery-dlya-puteshestviya-vloga-moskva' },
  { icon: Sparkles, title: 'Регулярная уборка и клининг', text: 'Puzzi и пароочиститель для посуточной квартиры, офиса или серии химчисток.', href: '/arenda-pylesosov-moskva' },
  { icon: Music, title: 'Сезон мероприятий', text: 'JBL PartyBox и микрофоны на месяц праздников, выступлений или выездных событий.', href: '/arenda-audiooborudovaniya-moskva' },
]

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

export default function MonthlyRentalPage() {
  const { data, isLoading } = useEquipment({ limit: 100 })

  // Только модели, у которых длинная аренда действительно дешевле суток.
  const rows = useMemo(() => (data?.data || [])
    .map((equipment) => {
      const oneDay = getOneDayPrice(equipment.pricing, equipment.pricePerDay)
      const longTerm = getLongTermDailyPrice(equipment.pricing, equipment.pricePerDay)
      return {
        equipment,
        oneDay,
        longTerm,
        monthTotal: getPeriodPrice(equipment.pricing, 30, equipment.pricePerDay),
        bookingHref: `/booking?equipment=${encodeURIComponent(equipment.slug || equipment.id)}&utm_source=site&utm_medium=landing&utm_campaign=monthly-rental`,
      }
    })
    .filter((row) => row.longTerm !== null), [data?.data])

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://vozmimenya.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Аренда техники на месяц', item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title={seoMeta[route].title}
        description={seoMeta[route].description}
        keywords="аренда оборудования на месяц, аренда техники на месяц москва, аренда на длительный срок, прокат техники на месяц"
        url={pageUrl}
        structuredData={structuredData}
      />

      <section className="bg-gradient-to-br from-[#0F172A] to-[#1D4ED8] py-16 text-white md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-blue-200">
              Долгая аренда — дешевле за сутки
            </span>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white md:text-5xl">Аренда техники на месяц в Москве</h1>
            <p className="mb-8 max-w-2xl text-lg text-blue-100">
              Если техника нужна на ремонт, поездку, сезон съёмок или регулярную уборку, выгоднее взять её сразу на месяц:
              цена за сутки при аренде от 30 суток ниже, чем при аренде на один день. Ниже — актуальные тарифы из каталога.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#tarify" className="btn bg-white text-primary hover:bg-blue-50">Смотреть тарифы на месяц</a>
              <a
                href={getTelegramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('telegram_click', { source: 'monthly_rental_hero' })}
                className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Подобрать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="tarify" className="container mx-auto px-4 py-12">
        <div className="mb-6 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Тарифы</p>
          <h2 className="text-3xl font-extrabold text-gray-900">Сколько стоит аренда на месяц</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Цены за сутки в рублях. Наличие модели на ваши даты подтверждает менеджер после заявки.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">Модель</th>
                <th scope="col" className="px-4 py-3">1 сутки</th>
                <th scope="col" className="px-4 py-3">Долгая аренда, за сутки</th>
                <th scope="col" className="px-4 py-3">Итого за 30 суток</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Бронь</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Загружаем актуальные тарифы…</td></tr>
              )}
              {rows.map(({ equipment, oneDay, longTerm, monthTotal, bookingHref }) => (
                <tr key={equipment.id}>
                  <td className="px-4 py-3">
                    <Link to={equipmentPath(equipment)} className="font-semibold text-gray-900 hover:text-[#2563EB]">{equipment.name}</Link>
                    <div className="text-xs text-gray-500">{equipment.category}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(oneDay)}</td>
                  <td className="px-4 py-3 font-bold text-[#2563EB]">
                    {longTerm && <>от {formatPrice(longTerm.dailyPrice)} <span className="text-xs font-normal text-gray-500">от {longTerm.days} суток</span></>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(monthTotal)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={bookingHref}
                      onClick={() => trackEvent('booking_cta_click', { source: 'monthly_rental_table', equipment_id: equipment.id })}
                      className="inline-flex rounded-xl bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                    >
                      Забронировать
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-extrabold text-gray-900">Когда технику берут на месяц</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {scenarios.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.title} to={item.href} className="group rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5 hover:border-blue-200">
                  <Icon className="mb-3 h-6 w-6 text-[#2563EB]" />
                  <h3 className="font-bold text-gray-900 group-hover:text-[#2563EB]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: CalendarRange, title: 'Цена за сутки ниже', text: 'Чем дольше срок, тем ниже цена за сутки. Итог за 30 суток виден в таблице до заявки.' },
            { icon: RefreshCw, title: 'Продление', text: 'Если срока не хватило — напишите заранее: менеджер проверит даты и пересчитает стоимость.' },
            { icon: Truck, title: 'Получение', text: 'Самовывоз у м. Волжская и м. Динамо (компактная техника — из постамата 24/7), доставка по Москве или встреча в офисе.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-[#2563EB]" />
                <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-2xl font-extrabold text-gray-900">Частые вопросы</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <div key={item.question} className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5">
                <h3 className="font-bold text-gray-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.answer}</p>
              </div>
            ))}
          </div>
          <a
            href={getTelegramUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('telegram_click', { source: 'monthly_rental_faq' })}
            className="btn mt-8 inline-flex bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Рассчитать долгую аренду в Telegram
          </a>
        </div>
      </section>
    </div>
  )
}
