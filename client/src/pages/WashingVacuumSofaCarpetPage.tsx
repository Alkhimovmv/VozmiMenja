import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, CheckCircle2, Clock, HelpCircle, MessageCircle, Sofa, Sparkles, SprayCan, Truck } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'
import ScenarioRentalInfo from '../components/ui/ScenarioRentalInfo'

const pageUrl = 'https://vozmimenya.ru/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva'
const puzzi8Href = '/equipment/51022efa-99b7-4c93-a5ad-0f19851f6c1a'
const puzzi10Href = '/equipment/f2260efd-d0e7-4622-91b0-c90a2cbc64ad'
const sc4Href = '/equipment/d4cc7709-1ee5-4dcb-81a2-c0dadb538dc5'
const leadMessage = 'Нужен моющий пылесос для чистки. Что чистим: диван/ковер/матрас/авто. Размер/количество: __. Пятна: __. Даты аренды: __. Район Москвы: __.'

const faqItems = [
  {
    question: 'Какой моющий пылесос взять для дивана?',
    answer: 'Для домашней химчистки дивана чаще смотрят Karcher Puzzi 8/1: он компактнее и понятнее для одной квартиры. Если объем больше, есть ковры или несколько предметов мебели, можно сравнить с Puzzi 10/1.',
  },
  {
    question: 'Можно ли моющим пылесосом чистить ковер?',
    answer: 'Да, моющие пылесосы используют для влажной чистки ковров и текстиля. Перед чисткой проверьте материал, стойкость красителя и рекомендации производителя покрытия.',
  },
  {
    question: 'Что лучше: Puzzi 8/1 или Puzzi 10/1?',
    answer: 'Puzzi 8/1 удобен для квартиры, дивана, матраса и салона авто. Puzzi 10/1 уместнее, когда уборка больше по площади или нужно пройти несколько ковров и предметов мебели.',
  },
  {
    question: 'Нужно ли покупать химию отдельно?',
    answer: 'Условия по расходникам лучше уточнить при заявке: они зависят от задачи, дат и комплекта выбранной модели.',
  },
  {
    question: 'На сколько дней брать моющий пылесос?',
    answer: 'Для одного дивана или салона авто часто хватает 1 дня. Для квартиры с коврами и несколькими предметами мебели удобнее закладывать 2 дня.',
  },
  {
    question: 'Есть ли доставка по Москве?',
    answer: 'Актуальные условия доставки зависят от адреса и времени. Посмотрите страницу доставки или напишите в Telegram, чтобы согласовать вариант.',
  },
]

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

const breadcrumbStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://vozmimenya.ru/' },
    { '@type': 'ListItem', position: 2, name: 'Пылесосы', item: 'https://vozmimenya.ru/arenda-pylesosov-moskva' },
    { '@type': 'ListItem', position: 3, name: 'Диван и ковер', item: pageUrl },
  ],
}

const scenarioCards = [
  {
    title: 'Диван, кресло, матрас',
    text: 'Точечная домашняя чистка текстиля без покупки отдельного аппарата ради одного-двух дней.',
    result: 'Посмотреть Puzzi 8/1',
    href: puzzi8Href,
    icon: Sofa,
  },
  {
    title: 'Ковер или несколько комнат',
    text: 'Когда объем больше и хочется пройти ковры, мягкую мебель и дорожки за одну аренду.',
    result: 'Сравнить с Puzzi 10/1',
    href: puzzi10Href,
    icon: SprayCan,
  },
  {
    title: 'Салон автомобиля',
    text: 'Сиденья, коврики и текстильные зоны удобнее чистить моющим пылесосом, а не бытовой щеткой.',
    result: 'Подобрать в Telegram',
    href: getTelegramUrl(),
    icon: Sparkles,
    external: true,
  },
  {
    title: 'Плитка и твердые поверхности',
    text: 'Если нужна не химчистка ткани, а пар для кухни, плитки или сантехники, посмотрите пароочиститель.',
    result: 'Открыть Karcher SC4',
    href: sc4Href,
    icon: HelpCircle,
  },
]

const comparisonRows = [
  {
    model: 'Puzzi 8/1',
    suited: 'Диван, кресло, матрас, салон авто, небольшой ковер',
    when: 'Когда нужен компактный аппарат для одной квартиры или точечной чистки',
    href: puzzi8Href,
  },
  {
    model: 'Puzzi 10/1',
    suited: 'Несколько ковров, больше мебели, уборка после гостей или переезда',
    when: 'Когда объем работ выше и хочется меньше растягивать чистку',
    href: puzzi10Href,
  },
  {
    model: 'Karcher SC4',
    suited: 'Плитка, кухня, сантехника, твердые поверхности',
    when: 'Когда задача не в извлечении грязи из ткани, а в обработке паром',
    href: sc4Href,
  },
]

const kitItems = [
  'Диван и кресла: Puzzi 8/1, мебельная насадка, средство под ткань, время на сушку',
  'Ковер и матрас: Puzzi 8/1 или 10/1, сухая уборка до чистки, срок 1–2 дня',
  'Салон автомобиля: Puzzi, узкая насадка, химия под обивку, запас на просушку',
  'Большой объем: Puzzi 10/1, запас воды и времени, спокойный возврат без спешки',
]

function handleTelegramClick(source: string) {
  trackEvent('telegram_click', { source, lead_context: leadMessage })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(leadMessage).catch(() => undefined)
  }
}

export default function WashingVacuumSofaCarpetPage() {
  const pageTitle = 'Аренда моющего пылесоса для дивана и ковра в Москве | ВозьмиМеня'
  const pageDescription = 'Возьмите моющий пылесос Karcher Puzzi для чистки дивана, ковра, матраса или салона авто в Москве. Поможем выбрать модель и срок аренды.'

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-slate-900">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="аренда моющего пылесоса для дивана москва, аренда пуцци для ковра, моющий пылесос для химчистки в аренду" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content="ВозьмиМеня" />
        <meta property="og:locale" content="ru_RU" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify([breadcrumbStructuredData, faqStructuredData])}
        </script>
      </Helmet>

      <section className="relative overflow-hidden bg-[#26352B] text-white">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,205,124,.45),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(96,165,250,.26),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.14)_1px,transparent_1px)] bg-[length:30px_30px]" />
        </div>
        <div className="container relative mx-auto px-4 py-10 md:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-emerald-50/75">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <Link to="/arenda-pylesosov-moskva" className="hover:text-white">Пылесосы</Link>
            <span>/</span>
            <span className="text-white">Диван и ковер</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#F4CD7C]">
                Сценарий: химчистка дома
              </p>
              <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Аренда моющего пылесоса для дивана и ковра в Москве
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-emerald-50/85">
                Если диван, ковер или матрас нужно освежить один раз, аренда Puzzi обычно практичнее покупки. Напишите, что чистите и на какие даты — поможем выбрать модель без лишнего запаса.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={getTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleTelegramClick('washing_vacuum_hero')}
                  className="btn bg-[#F4CD7C] text-slate-950 hover:bg-[#FFE1A3]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Подобрать Puzzi в Telegram
                </a>
                <Link to="/arenda-pylesosov-moskva" className="btn border border-white/15 bg-white/10 text-white hover:bg-white/20">
                  Все пылесосы в аренду
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.08] p-5 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-[#F7F3EA] p-5 text-slate-900">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Частый выбор</p>
                    <h2 className="mt-1 text-2xl font-extrabold">Karcher Puzzi 8/1</h2>
                  </div>
                  <span className="rounded-full bg-[#26352B] px-3 py-1 text-sm font-semibold text-white">диван / авто</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-600">
                  Хороший старт для домашней чистки дивана, матраса, кресла или салона авто. Для большего объема сравните с Puzzi 10/1.
                </p>
                <div className="grid gap-3 text-sm">
                  {['Мягкая мебель и матрасы', 'Ковры и дорожки', 'Салон автомобиля'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F7D57]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to={puzzi8Href} className="btn mt-5 w-full bg-slate-950 text-white hover:bg-slate-800">
                  Открыть Karcher Puzzi 8/1
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <h2 className="mb-3 text-3xl font-extrabold">Под какую задачу берете пылесос</h2>
            <p className="text-slate-600">
              Так проще не переплатить и не взять технику “на всякий случай”. Отталкиваемся от поверхности, объема и срока.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scenarioCards.map((card) => {
              const Icon = card.icon
              const className = 'group rounded-3xl border border-[#E6DDCA] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D3C2A4] hover:shadow-xl'
              const content = (
                <>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4CD7C]/35 text-[#8A5B00]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-extrabold">{card.title}</h3>
                  <p className="mb-5 text-sm leading-6 text-slate-600">{card.text}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1D4ED8]">
                    {card.result}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </>
              )

              return card.external ? (
                <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick('washing_vacuum_scenario_auto')} className={className}>
                  {content}
                </a>
              ) : (
                <Link key={card.title} to={card.href} className={className}>
                  {content}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <ScenarioRentalInfo
        kitItems={kitItems}
        kitDescription="Для химчистки важна не только модель Puzzi, но и насадка, расходники, запас времени на сушку и понимание материала."
        cardClassName="border-[#E6DDCA] bg-[#F7F3EA]"
        accentClassName="text-[#2F7D57]"
      />

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold">Puzzi 8/1, Puzzi 10/1 или пароочиститель</h2>
            <p className="mb-5 text-slate-600">
              Моющий пылесос нужен, когда грязь нужно извлечь из ткани и собрать влагу обратно. Для плитки и кухни чаще подходит пароочиститель, а не Puzzi.
            </p>
            <Link to="/blog/puzzi-8-1-ili-puzzi-10-1-kakoj-moyushchij-pylesos-vzyat-dlya-himchistki-divana" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Подробное сравнение Puzzi 8/1 и 10/1
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[#E6DDCA] bg-[#F7F3EA]">
            {comparisonRows.map((row) => (
              <Link key={row.model} to={row.href} className="grid gap-3 border-b border-[#E6DDCA] p-5 transition last:border-b-0 hover:bg-white md:grid-cols-[.6fr_1fr_1fr]">
                <h3 className="text-lg font-extrabold">{row.model}</h3>
                <p className="text-sm leading-6 text-slate-700"><span className="font-bold text-slate-950">Подходит:</span> {row.suited}</p>
                <p className="text-sm leading-6 text-slate-600"><span className="font-bold text-slate-950">Когда брать:</span> {row.when}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#26352B] py-14 text-white">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold text-white">Как выбрать срок аренды</h2>
            <p className="text-emerald-50/80">
              Если чистка делается впервые, лучше оставить небольшой запас на сушку и второй проход сложных мест. Напишите объем — подскажем, сколько дней закладывать.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1 день', 'Один диван, матрас, кресло или салон авто без большого ковра'],
              ['2 дня', 'Диван плюс ковер, несколько комнат или первая самостоятельная чистка'],
              ['3+ дня', 'Переезд, дача, большая квартира или уборка в несколько этапов'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <Clock className="mb-4 h-6 w-6 text-[#F4CD7C]" />
                <h3 className="mb-2 text-xl font-extrabold text-white">{title}</h3>
                <p className="text-sm leading-6 text-emerald-50/75">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="rounded-3xl border border-[#E6DDCA] bg-white p-6 md:p-8">
            <h2 className="mb-4 text-3xl font-extrabold">Что написать в заявке</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Что чистим: диван, ковер, матрас или авто', 'Размер и количество предметов', 'Какие пятна или загрязнения', 'Нужна ли химия/расходники', 'Желаемые даты аренды', 'Район Москвы для доставки или самовывоза'].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-[#F7F3EA] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2F7D57]" />
                  <span className="text-sm font-semibold leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#F4CD7C] p-6 text-slate-950 md:p-8">
            <MessageCircle className="mb-4 h-8 w-8" />
            <h2 className="mb-3 text-3xl font-extrabold">Отправить задачу в Telegram</h2>
            <p className="mb-5 text-sm leading-6">
              Заготовка сообщения: {leadMessage}
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTelegramClick('washing_vacuum_checklist')}
              className="btn w-full bg-slate-950 text-white hover:bg-slate-800"
            >
              Написать в Telegram
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-3 text-3xl font-extrabold">Полезные ссылки</h2>
              <p className="max-w-2xl text-slate-600">
                Несколько переходов, чтобы быстро сравнить технику и оформить аренду под бытовую химчистку.
              </p>
            </div>
            <Link to="/delivery" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              <Truck className="h-5 w-5" />
              Условия доставки по Москве
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['/arenda-pylesosov-moskva', 'Все пылесосы и техника для уборки'],
              [puzzi8Href, 'Karcher Puzzi 8/1 для дивана и авто'],
              [puzzi10Href, 'Karcher Puzzi 10/1 для большего объема'],
              [sc4Href, 'Karcher SC4 для плитки и кухни'],
              ['/blog/kak-pochistit-divan-i-kover-doma-kogda-nuzhen-moyushchij-pylesos', 'Как почистить диван и ковер дома'],
              ['/faq', 'Частые вопросы по аренде'],
            ].map(([href, label]) => (
              <Link key={href} to={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-[#E6DDCA] bg-[#F7F3EA] px-5 py-4 text-sm font-bold text-slate-900 transition hover:border-[#D3C2A4] hover:bg-white">
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#1D4ED8] transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-extrabold">Частые вопросы</h2>
          <div className="mx-auto grid max-w-4xl gap-4">
            {faqItems.map((faq) => (
              <article key={faq.question} className="rounded-3xl border border-[#E6DDCA] bg-white p-6">
                <h3 className="mb-2 text-lg font-extrabold">{faq.question}</h3>
                <p className="text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
