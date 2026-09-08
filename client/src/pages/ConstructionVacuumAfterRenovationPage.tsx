import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, CheckCircle2, ClipboardList, MessageCircle, Sparkles, SprayCan, Timer, Truck, Wind } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'
import ScenarioRentalInfo from '../components/ui/ScenarioRentalInfo'

const pageUrl = 'https://vozmimenya.ru/arenda-stroitelnogo-pylesosa-posle-remonta-moskva'
const wd5Href = '/equipment/0519e3d0-e02f-4f8e-b77d-0c80fe58a9cc'
const puzzi8Href = '/equipment/51022efa-99b7-4c93-a5ad-0f19851f6c1a'
const puzzi10Href = '/equipment/f2260efd-d0e7-4622-91b0-c90a2cbc64ad'
const leadMessage = 'Нужен пылесос после ремонта. Площадь: __ м2. Пыль/мусор: __. Нужна чистка мебели/ковра: да/нет. Даты аренды: __. Район Москвы: __.'

const faqItems = [
  {
    question: 'Можно ли убрать строительную пыль обычным пылесосом?',
    answer: 'Лучше не рисковать: мелкая цементная или гипсовая пыль быстро забивает фильтры и может перегреть бытовой пылесос.',
  },
  {
    question: 'Что сначала делать после ремонта: пылесосить или мыть?',
    answer: 'Сначала сухая уборка. Если сразу намочить слой строительной пыли, она размазывается и оставляет грязную пленку.',
  },
  {
    question: 'Какой пылесос взять после ремонта?',
    answer: 'Для сухой строительной пыли и мелкой крошки основной кандидат - строительный пылесос вроде Karcher WD5. Для дивана, ковров и текстиля после ремонта лучше смотреть моющие Puzzi.',
  },
  {
    question: 'На сколько дней брать строительный пылесос?',
    answer: 'Для небольшой уборки часто достаточно 1 дня, для квартиры после ремонта удобнее 2-3 дня. Если ремонт еще продолжается, срок лучше подбирать индивидуально.',
  },
  {
    question: 'Можно ли собрать влажную грязь строительным пылесосом?',
    answer: 'Нужно смотреть конкретную модель и комплект. Не обещаем режимы сверх того, что указано в карточке выбранного оборудования.',
  },
  {
    question: 'Есть ли доставка по Москве?',
    answer: 'Условия доставки зависят от адреса и текущих возможностей сервиса. Актуальные варианты лучше смотреть на странице доставки или уточнять при заявке.',
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
    { '@type': 'ListItem', position: 3, name: 'После ремонта', item: pageUrl },
  ],
}

const scenarioCards = [
  {
    title: 'Сухая строительная пыль',
    text: 'Следы штробления, цементная или гипсовая пыль, мелкая крошка после ремонта.',
    result: 'Начните с Karcher WD5',
    href: wd5Href,
    icon: Wind,
  },
  {
    title: 'Нужно понять все варианты',
    text: 'Если ремонт разный по комнатам и задачам, сравните весь клининговый каталог.',
    result: 'Открыть категорию пылесосов',
    href: '/arenda-pylesosov-moskva',
    icon: ClipboardList,
  },
  {
    title: 'Диван, ковер или матрас',
    text: 'После сухого этапа текстиль удобнее чистить моющим пылесосом Puzzi.',
    result: 'Посмотреть Puzzi 8/1',
    href: puzzi8Href,
    icon: SprayCan,
  },
  {
    title: 'Плитка, кухня, сантехника',
    text: 'Для твердых поверхностей после основной уборки можно добавить пароочиститель.',
    result: 'Сравнить в категории',
    href: '/arenda-pylesosov-moskva',
    icon: Sparkles,
  },
]

const comparisonRows = [
  {
    type: 'Строительный пылесос',
    suited: 'Сухая строительная пыль, крошка, мусор после ремонта',
    notFor: 'Не заменяет химчистку ткани',
  },
  {
    type: 'Моющий Puzzi',
    suited: 'Диваны, ковры, матрасы, салон авто после ремонта',
    notFor: 'Не основной вариант для сухой цементной пыли',
  },
  {
    type: 'Пароочиститель SC4',
    suited: 'Плитка, кухня, сантехника, твердые поверхности',
    notFor: 'Не собирает пыль и мусор как пылесос',
  },
]

const kitItems = [
  'Строительный пылесос под сухую пыль, крошку и уборку после ремонта',
  'Подсказка по порядку уборки: сначала сухой этап, потом влажная чистка',
  'Если есть мебель или ковры — отдельно подберем Puzzi после сухой уборки',
  'Мешки, фильтры и режимы работы уточняем по конкретной модели и комплекту',
]

function handleTelegramClick(source: string) {
  trackEvent('telegram_click', { source, lead_context: leadMessage })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(leadMessage).catch(() => undefined)
  }
}

export default function ConstructionVacuumAfterRenovationPage() {
  const pageTitle = 'Аренда строительного пылесоса после ремонта в Москве | ВозьмиМеня'
  const pageDescription = 'Возьмите строительный пылесос для уборки после ремонта в Москве. Поможем подобрать модель под пыль, мусор, площадь и срок аренды.'

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-slate-900">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="аренда строительного пылесоса после ремонта москва, убрать строительную пыль после ремонта, пылесос после ремонта аренда" />
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

      <section className="relative overflow-hidden bg-[#18202A] text-white">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(135deg,rgba(255,255,255,.16)_1px,transparent_1px)] bg-[length:28px_28px]" />
          <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-[#F3B33D]/40 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 py-10 md:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <Link to="/arenda-pylesosov-moskva" className="hover:text-white">Пылесосы</Link>
            <span>/</span>
            <span className="text-white">После ремонта</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#F7D28A]">
                Сценарий: уборка после ремонта
              </p>
              <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Аренда строительного пылесоса после ремонта в Москве
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-200">
                После ремонта обычный пылесос быстро забивается цементной и гипсовой пылью. Для сухой строительной пыли лучше взять строительный пылесос, а для финальной чистки мебели и ковров - моющий Puzzi.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={getTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleTelegramClick('construction_vacuum_hero')}
                  className="btn bg-[#F3B33D] text-slate-950 hover:bg-[#FFD27A]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Написать в Telegram и подобрать пылесос
                </a>
                <Link to="/arenda-pylesosov-moskva" className="btn border border-white/15 bg-white/10 text-white hover:bg-white/20">
                  Посмотреть пылесосы в аренду
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.08] p-5 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-[#F6F7F4] p-5 text-slate-900">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Основной кандидат</p>
                    <h2 className="mt-1 text-2xl font-extrabold">Karcher WD5</h2>
                  </div>
                  <span className="rounded-full bg-[#18202A] px-3 py-1 text-sm font-semibold text-white">после ремонта</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-600">
                  Подходит как стартовый вариант для сухой строительной пыли, мелкой крошки и уборки перед влажным этапом. Комплектацию и режимы проверяйте в карточке товара.
                </p>
                <div className="grid gap-3 text-sm">
                  {['Сухой этап перед мытьем', 'Мелкая крошка и пыль', 'Подбор срока под площадь'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F7D57]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to={wd5Href} className="btn mt-5 w-full bg-slate-950 text-white hover:bg-slate-800">
                  Открыть Karcher WD5
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
            <h2 className="mb-3 text-3xl font-extrabold">Что взять после ремонта</h2>
            <p className="text-slate-600">
              Выбор зависит не от названия техники, а от того, что осталось после ремонта: сухая пыль, текстиль, плитка или смешанная уборка.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scenarioCards.map((card) => {
              const Icon = card.icon
              return (
                <Link key={card.title} to={card.href} className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3B33D]/20 text-[#9A6200]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-extrabold">{card.title}</h3>
                  <p className="mb-5 text-sm leading-6 text-slate-600">{card.text}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1D4ED8]">
                    {card.result}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <ScenarioRentalInfo
        kitItems={kitItems}
        kitDescription="После ремонта важно не только взять мощный аппарат, но и не перепутать сухую строительную пыль, текстиль и твердые поверхности."
        cardClassName="border-slate-200 bg-white"
        accentClassName="text-[#1D4ED8]"
      />

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold">Почему бытовой пылесос не подходит для строительной пыли</h2>
            <p className="mb-5 text-slate-600">
              Строительная пыль ведет себя иначе, чем обычная домашняя: она мелкая, сухая и быстро забивает фильтры.
            </p>
            <Link to="/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Как убрать строительную пыль после ремонта
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {[
              'Цементная, гипсовая и шпаклевочная пыль быстро забивает фильтры.',
              'Мелкая сухая пыль снижает поток воздуха и повышает риск перегрева.',
              'Мокрая уборка без сухого этапа размазывает грязь.',
              'Для одной уборки аренда часто выгоднее покупки и ремонта бытовой техники.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-[#F6F7F4] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2F7D57]" />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <h2 className="mb-3 text-3xl font-extrabold">Сравнение: строительный, моющий или пароочиститель</h2>
              <p className="mb-5 text-slate-600">
                Если задача смешанная, обычно начинают с сухой пыли, а потом добавляют чистку ткани или твердых поверхностей.
              </p>
              <Link to="/blog/kak-vybrat-pylesos-dlya-uborki-posle-remonta" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
                Как выбрать пылесос для уборки после ремонта
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {comparisonRows.map((row) => (
                <div key={row.type} className="grid gap-3 border-b border-slate-100 p-5 last:border-b-0 md:grid-cols-[.8fr_1fr_1fr]">
                  <h3 className="text-lg font-extrabold">{row.type}</h3>
                  <p className="text-sm leading-6 text-slate-700"><span className="font-bold text-slate-950">Подходит:</span> {row.suited}</p>
                  <p className="text-sm leading-6 text-slate-600"><span className="font-bold text-slate-950">Не основная задача:</span> {row.notFor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#18202A] py-14 text-white">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold text-white">Как выбрать срок аренды</h2>
            <p className="text-slate-200">
              Напишите площадь, тип ремонта и даты - подберем срок без лишних дней. Цена и доступность зависят от выбранной карточки и дат.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1 день', 'Одна комната или точечная уборка после сверления/шлифовки'],
              ['2-3 дня', 'Квартира после ремонта, когда нужно пройтись в несколько этапов'],
              ['7 дней', 'Если ремонт еще идет или уборка совмещена с другими задачами'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <Timer className="mb-4 h-6 w-6 text-[#F3B33D]" />
                <h3 className="mb-2 text-xl font-extrabold text-white">{title}</h3>
                <p className="text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="mb-4 text-3xl font-extrabold">Что написать в заявке</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Площадь и сколько комнат', 'Тип пыли: цемент, гипс, шпаклевка, дерево', 'Есть ли крупный мусор', 'Нужна ли чистка мебели или ковров', 'Желаемые даты аренды', 'Район Москвы для доставки или самовывоза'].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-[#F6F7F4] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2F7D57]" />
                  <span className="text-sm font-semibold leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#F3B33D] p-6 text-slate-950 md:p-8">
            <MessageCircle className="mb-4 h-8 w-8" />
            <h2 className="mb-3 text-3xl font-extrabold">Отправить задачу в Telegram</h2>
            <p className="mb-5 text-sm leading-6">
              Заготовка сообщения: {leadMessage}
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTelegramClick('construction_vacuum_checklist')}
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
                Собрали переходы, которые помогают выбрать технику, проверить условия и не потеряться между сценариями уборки.
              </p>
            </div>
            <Link to="/delivery" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              <Truck className="h-5 w-5" />
              Условия доставки по Москве
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['/arenda-pylesosov-moskva', 'Пылесосы для уборки после ремонта в аренду'],
              [wd5Href, 'Karcher WD5 для сухой и влажной уборки'],
              [puzzi8Href, 'Karcher Puzzi 8/1 для мебели и ковров'],
              [puzzi10Href, 'Karcher Puzzi 10/1 для большей уборки'],
              ['/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta', 'Как убрать строительную пыль после ремонта'],
              ['/faq', 'Частые вопросы по аренде'],
            ].map(([href, label]) => (
              <Link key={href} to={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F6F7F4] px-5 py-4 text-sm font-bold text-slate-900 transition hover:border-slate-300 hover:bg-white">
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
              <article key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6">
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
