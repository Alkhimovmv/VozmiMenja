import { Link } from 'react-router-dom'
import { Camera, Clock, MapPin, MessageCircle, Music, Navigation, PackageCheck, Star, Truck, WashingMachine } from 'lucide-react'
import SEO from '../components/SEO'
import { trackEvent } from '../lib/analytics'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl } from '../lib/contactLinks'
import business from '../content/business.json'
import faqContent from '../content/faq.json'

type OfficeId = 'office-volzhskaya' | 'office-dinamo'

const pageCopy: Record<OfficeId, { title: string; h1: string; description: string; keywords: string; lead: string }> = {
  'office-volzhskaya': {
    title: 'Аренда техники у м. Волжская и в Кузьминках — постамат 24/7',
    h1: 'Аренда техники у м. Волжская и в Кузьминках',
    description: 'Аренда колонок JBL, GoPro, Insta360, пылесосов Karcher и пароочистителей у м. Волжская: Волжский бульвар, 51с15. Постамат 24/7, доставка по Москве.',
    keywords: 'аренда техники волжская, прокат техники кузьминки, аренда колонки кузьминки, аренда gopro текстильщики, аренда пылесоса люблино',
    lead: 'Офис и постамат на Волжском бульваре, 51с15 — удобно, если вы живёте или работаете в Кузьминках, Текстильщиках, Печатниках или Люблино. Забирайте технику в любое время суток по коду из сообщения.',
  },
  'office-dinamo': {
    title: 'Аренда техники у м. Динамо — постамат 24/7 на ул. Расковой',
    h1: 'Аренда техники у м. Динамо',
    description: 'Аренда колонок JBL, GoPro, Insta360, пылесосов Karcher и пароочистителей у м. Динамо: ул. Расковой, 1. Постамат 24/7, доставка по Москве.',
    keywords: 'аренда техники динамо, прокат техники беговая, аренда колонки аэропорт, аренда gopro савеловская, аренда пылесоса динамо',
    lead: 'Офис и постамат на ул. Расковой, 1 — удобно для районов Беговой, Аэропорт, Савёловский и Хорошёвский. Забирайте технику в любое время суток по коду из сообщения.',
  },
}

const categories = [
  { icon: Music, title: 'Колонки и микрофоны', text: 'JBL PartyBox 320 и 710, DJI Mic 2 — для праздника, дачи, выступления или интервью.', href: '/arenda-audiooborudovaniya-moskva' },
  { icon: Camera, title: 'Экшн-камеры', text: 'GoPro 13, Insta360 X5, DJI Osmo Pocket 3 — для поездки, спорта и влога.', href: '/arenda-gopro-moskva' },
  { icon: WashingMachine, title: 'Уборка и клининг', text: 'Karcher WD5 после ремонта, Puzzi для дивана и ковра, SC4 для кухни и плитки.', href: '/arenda-pylesosov-moskva' },
]

export default function OfficeRentalPage({ officeId }: { officeId: OfficeId }) {
  const office = business.offices.find((item) => item.id === officeId)!
  const otherOffice = business.offices.find((item) => item.id !== officeId)!
  const copy = pageCopy[officeId]
  const pageUrl = `${business.url}${office.slug}`
  const faq = faqContent[office.slug as keyof typeof faqContent]
  const rating = 'yandexMaps' in office ? office.yandexMaps : undefined
  const mapUrl = rating?.url || `https://yandex.ru/maps/?pt=${office.longitude},${office.latitude}&z=17&l=map`

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${business.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Контакты', item: `${business.url}/contact` },
        { '@type': 'ListItem', position: 3, name: `м. ${office.metro}`, item: pageUrl },
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
        title={copy.title}
        description={copy.description}
        keywords={copy.keywords}
        url={pageUrl}
        structuredData={structuredData}
      />

      <section className="bg-gradient-to-br from-[#0F172A] to-[#1D4ED8] py-16 text-white md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-blue-200">
              м. {office.metro} · район {office.district}
            </span>
            <h1 className="text-white mb-4 text-4xl font-extrabold leading-tight md:text-5xl">{copy.h1}</h1>
            <p className="mb-6 max-w-2xl text-lg text-blue-100">{copy.lead}</p>
            {rating && (
              <a
                href={rating.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('yandex_maps_click', { source: `office_${office.metro}_rating` })}
                className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
              >
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                {rating.ratingValue.toFixed(1).replace('.', ',')} на Яндекс Картах · {rating.reviewCount} отзывов
              </a>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/booking"
                onClick={() => trackEvent('booking_cta_click', { source: `office_${office.metro}_hero` })}
                className="btn bg-white text-primary hover:bg-blue-50"
              >
                Забронировать онлайн
              </Link>
              <a
                href={getTelegramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('telegram_click', { source: `office_${office.metro}_hero` })}
                className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: MapPin, title: 'Адрес', text: `Москва, ${office.streetAddress}. Рядом с м. ${office.metro}.` },
            { icon: Clock, title: 'Постамат 24/7', text: 'После подтверждения брони кладём технику в ячейку и присылаем код. Вернуть можно так же — в любое время.' },
            { icon: PackageCheck, title: 'Комплект проверен', text: 'Перед выдачей сверяем аккумуляторы, кабели, насадки и аксессуары под вашу задачу.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-5 w-5 text-[#2563EB]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Что можно взять</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Техника в аренду у м. {office.metro}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Наличие конкретной модели в этой точке на ваши даты подтверждает менеджер после заявки.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {categories.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} to={item.href} className="group rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5 hover:border-blue-200">
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
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Navigation className="h-6 w-6 text-[#2563EB]" />
              <h2 className="text-2xl font-extrabold text-gray-900">Кому удобна эта точка</h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              Районы рядом: {office.nearby.join(', ')}. Если удобнее другая сторона города, есть второй постамат —{' '}
              <Link to={otherOffice.slug} className="font-semibold text-[#2563EB] hover:underline">
                у м. {otherOffice.metro} ({otherOffice.streetAddress})
              </Link>
              .
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('yandex_maps_click', { source: `office_${office.metro}_map` })}
              className="btn mt-5 inline-flex border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Открыть на Яндекс Картах
            </a>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <Truck className="mb-4 h-7 w-7 text-[#2563EB]" />
            <h2 className="text-xl font-extrabold text-gray-900">Не хотите ехать к метро?</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Доставим курьером Яндекс Go по Москве. Условия — на странице{' '}
              <Link to="/delivery" className="font-semibold text-[#2563EB] hover:underline">доставки</Link>, как работает выдача — в разделе{' '}
              <Link to="/samovyvoz-24-7-postamat" className="font-semibold text-[#2563EB] hover:underline">самовывоз 24/7</Link>.
            </p>
            <a
              href={`tel:${CONTACT_PHONE}`}
              onClick={() => trackEvent('phone_click', { source: `office_${office.metro}_cta` })}
              className="btn mt-5 inline-flex bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {CONTACT_PHONE_LABEL}
            </a>
          </div>
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
        </div>
      </section>
    </div>
  )
}
