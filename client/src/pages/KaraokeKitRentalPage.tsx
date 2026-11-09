import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import seoMeta from '../content/seoMeta.json'
import { ArrowRight, CheckCircle2, Clock3, MapPin, Mic2, Music2, ShieldCheck, Speaker } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { buildAttributedBookingLinks, getLeadContext } from '../lib/leadAttribution'

const pagePath = '/arenda-karaoke-komplekta-moskva'
const pageUrl = `https://vozmimenya.ru${pagePath}`

const faqItems = [
  {
    question: 'Что входит в караоке-комплект?',
    answer: 'В заявку добавляются выбранная колонка JBL PartyBox и комплект из двух беспроводных микрофонов JBL. Комплектность и наличие на даты подтверждает менеджер.',
  },
  {
    question: 'Какую колонку выбрать: PartyBox 320 или 710?',
    answer: 'Для квартиры и небольшой компании обычно достаточно PartyBox 320. Для большого помещения, дачи, танцев и более плотного звука лучше рассмотреть PartyBox 710.',
  },
  {
    question: 'Можно ли оформить колонку и микрофоны одной заявкой?',
    answer: 'Да. Кнопки на этой странице сразу добавляют обе позиции в одну форму бронирования и одну заявку.',
  },
  {
    question: 'Можно ли забрать комплект самостоятельно?',
    answer: 'Можно выбрать самовывоз или доставку. Доступный офис, время и способ получения менеджер подтверждает после проверки брони.',
  },
]

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://vozmimenya.ru/' },
      { '@type': 'ListItem', position: 2, name: 'Аудиооборудование', item: 'https://vozmimenya.ru/arenda-audiooborudovaniya-moskva' },
      { '@type': 'ListItem', position: 3, name: 'Караоке-комплект', item: pageUrl },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
]

const kits = [
  {
    name: 'Домашнее караоке',
    speaker: 'JBL PartyBox 320',
    speakerPrice: '1 400 ₽/сутки',
    description: 'Для квартиры, дня рождения, небольшой дачи и компании, где не нужен максимальный запас громкости.',
    equipment: ['jbl-partybox-320', 'jbl-partybox-wireless-microphones'],
    equipmentHref: '/equipment/jbl-partybox-320',
  },
  {
    name: 'Караоке для зала и праздника',
    speaker: 'JBL PartyBox 710',
    speakerPrice: '2 300 ₽/сутки',
    description: 'Для большого помещения, танцев, шумной компании и более мощного звука с плотным басом.',
    equipment: ['jbl-partybox-710', 'jbl-partybox-wireless-microphones'],
    equipmentHref: '/equipment/jbl-partybox-710',
  },
]

export default function KaraokeKitRentalPage() {
  const title = seoMeta['/arenda-karaoke-komplekta-moskva'].title
  const description = seoMeta['/arenda-karaoke-komplekta-moskva'].description
  const attributedKits = buildAttributedBookingLinks(kits, 'karaoke-kit', getLeadContext())
  const primaryBookingHref = attributedKits[0].href

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-slate-950">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="аренда караоке Москва, караоке комплект в аренду, аренда JBL с микрофонами, колонка и микрофоны напрокат" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="ВозьмиМеня" />
        <meta property="og:locale" content="ru_RU" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <section className="relative overflow-hidden bg-[#111827] text-white">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[length:42px_42px]" />
          <div className="absolute -right-16 top-12 h-72 w-72 rounded-full bg-[#FBBF24]/30 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 py-12 md:py-20">
          <nav className="mb-8 flex flex-wrap gap-2 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">Главная</Link><span>/</span>
            <Link to="/arenda-audiooborudovaniya-moskva" className="hover:text-white">Аудиооборудование</Link><span>/</span>
            <span className="text-white">Караоке-комплект</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-[#FBBF24]">
                <Music2 className="h-4 w-4" /> Колонка и два микрофона
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">Аренда караоке-комплекта в Москве</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                Выберите JBL PartyBox 320 или 710, добавьте два беспроводных микрофона и отправьте одну заявку на весь комплект.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={primaryBookingHref}
                  onClick={() => trackEvent('karaoke_kit_booking_click', { kit: 'partybox_320' })}
                  className="btn bg-[#FBBF24] text-slate-950 hover:bg-[#FCD34D]"
                >
                  Выбрать комплект с JBL 320 <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/arenda-kolonki-dlya-vecherinki-moskva" className="btn border border-white/15 bg-white/10 text-white hover:bg-white/20">
                  Сравнить колонки
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[.08] p-5 backdrop-blur">
              <div className="grid gap-3 rounded-3xl bg-[#F6F7F4] p-5 text-slate-950">
                {[
                  { icon: Speaker, text: 'JBL PartyBox 320 или 710' },
                  { icon: Mic2, text: 'Два беспроводных микрофона JBL' },
                  { icon: Clock3, text: 'Одна заявка и единый срок аренды' },
                  { icon: MapPin, text: 'Самовывоз или доставка по Москве' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 font-bold">
                    <Icon className="h-5 w-5 text-[#1D4ED8]" /> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-black">Выберите мощность колонки</h2>
            <p className="mt-3 text-slate-600">Микрофоны одинаковые в обоих вариантах. Отличается колонка и её запас громкости.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {attributedKits.map((kit) => (
              <article key={kit.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#1D4ED8]">{kit.name}</p>
                <h3 className="mt-2 text-2xl font-black">{kit.speaker} + Микрофоны JBL</h3>
                <p className="mt-3 leading-7 text-slate-600">{kit.description}</p>
                <div className="mt-5 grid gap-2 text-sm">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-700" /> Колонка: {kit.speakerPrice}</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-700" /> Два микрофона: 500 ₽/сутки при сроке 1–3 суток</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-700" /> Итог пересчитывается по выбранным датам и тарифам</div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={kit.href}
                    onClick={() => trackEvent('karaoke_kit_booking_click', { kit: kit.speaker })}
                    className="btn bg-slate-950 text-white hover:bg-slate-800"
                  >
                    Забронировать комплект <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to={kit.equipmentHref} className="btn border border-slate-200 bg-white text-slate-800 hover:bg-slate-50">Карточка колонки</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-black">Как проходит бронь</h2>
            <p className="mt-3 leading-7 text-slate-600">Комплект уже будет выбран в форме. Останется указать даты, ФИО, телефон и способ получения.</p>
            <Link to="/kak-prohodit-arenda-tehniki" className="mt-5 inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Все этапы аренды <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              ['01', 'Выберите JBL 320 или 710'],
              ['02', 'Заполните одну заявку на комплект'],
              ['03', 'Менеджер подтвердит наличие и выдачу'],
            ].map(([number, text]) => (
              <li key={number} className="rounded-3xl bg-[#F6F7F4] p-5">
                <span className="text-sm font-black text-[#1D4ED8]">{number}</span>
                <p className="mt-3 font-black leading-6">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-black">Частые вопросы</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-5 sm:px-7">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-6 font-black">{item.question}</summary>
                <p className="mt-3 max-w-3xl leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111827] py-14 text-white">
        <div className="container mx-auto flex flex-col gap-6 px-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-black text-white">Готовы выбрать караоке-комплект?</h2>
            <p className="mt-2 text-slate-300">Обе позиции попадут в одну заявку. Менеджер проверит наличие на ваши даты.</p>
          </div>
          <Link to={primaryBookingHref} className="btn bg-[#FBBF24] text-slate-950 hover:bg-[#FCD34D]">
            Оформить бронь <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
