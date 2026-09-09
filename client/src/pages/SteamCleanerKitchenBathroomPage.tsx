import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, Bath, CheckCircle2, CookingPot, Droplets, MessageCircle, Sparkles, SprayCan, Timer, WandSparkles } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'
import ScenarioRentalInfo from '../components/ui/ScenarioRentalInfo'

const pageUrl = 'https://vozmimenya.ru/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva'
const sc4Href = '/equipment/d4cc7709-1ee5-4dcb-81a2-c0dadb538dc5'
const puzzi8Href = '/equipment/51022efa-99b7-4c93-a5ad-0f19851f6c1a'
const wd5Href = '/equipment/0519e3d0-e02f-4f8e-b77d-0c80fe58a9cc'
const leadMessage = 'Нужен пароочиститель. Поверхности: кухня/плитка/ванная/швы/сантехника. Что загрязнено: __. Даты аренды: __. Район Москвы: __.'

const faqItems = [
  {
    question: 'Для чего брать пароочиститель в аренду?',
    answer: 'Пароочиститель берут для кухни, плитки, швов, сантехники и твердых поверхностей, когда нужна обработка паром и насадками, а не химчистка ткани.',
  },
  {
    question: 'Пароочиститель заменяет моющий пылесос?',
    answer: 'Нет. Пароочиститель работает с твердыми поверхностями и локальными загрязнениями, а моющий Puzzi нужен для диванов, ковров, матрасов и текстиля.',
  },
  {
    question: 'Подойдет ли Karcher SC4 для плитки и ванной?',
    answer: 'Да, такой сценарий подходит для пароочистителя: плитка, швы, ванная, сантехника и кухня. Конкретные насадки и ограничения лучше уточнить по карточке и при заявке.',
  },
  {
    question: 'Можно ли чистить паром мягкую мебель?',
    answer: 'Для мягкой мебели обычно лучше смотреть моющий пылесос Puzzi. Пар может быть не лучшим вариантом для ткани, особенно если неизвестен материал и рекомендации производителя.',
  },
  {
    question: 'На сколько дней брать пароочиститель?',
    answer: 'Для кухни или ванной часто хватает 1 дня. Для квартиры, швов в нескольких помещениях или уборки после переезда удобнее взять 2 дня.',
  },
  {
    question: 'Что написать, чтобы быстро подобрать технику?',
    answer: 'Напишите поверхности, тип загрязнения, площадь или число помещений, даты аренды и район Москвы. Так проще понять, нужен SC4, Puzzi или строительный пылесос.',
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
    { '@type': 'ListItem', position: 2, name: 'Пылесосы и уборка', item: 'https://vozmimenya.ru/arenda-pylesosov-moskva' },
    { '@type': 'ListItem', position: 3, name: 'Пароочиститель для кухни и ванной', item: pageUrl },
  ],
}

const scenarioCards = [
  {
    title: 'Кухня и жир',
    text: 'Плита, фартук, вытяжка и твердые поверхности, где важна локальная обработка паром.',
    result: 'Открыть Karcher SC4',
    href: sc4Href,
    icon: CookingPot,
  },
  {
    title: 'Плитка и швы',
    text: 'Сценарий для ванной, коридора, кухни и участков, где грязь забивается в стыки.',
    result: 'Подобрать в Telegram',
    href: getTelegramUrl(),
    icon: Sparkles,
    external: true,
  },
  {
    title: 'Сантехника и ванная',
    text: 'Когда нужно пройти твердые поверхности, смесители, зоны вокруг раковины и ванной.',
    result: 'Написать вводные',
    href: getTelegramUrl(),
    icon: Bath,
    external: true,
  },
  {
    title: 'Диван или ковер',
    text: 'Если задача в текстиле, лучше не путать с паром: смотрите моющий Puzzi.',
    result: 'Посмотреть Puzzi 8/1',
    href: puzzi8Href,
    icon: SprayCan,
  },
]

const comparisonRows = [
  {
    model: 'Karcher SC4',
    suited: 'Кухня, плитка, ванная, сантехника, швы, твердые поверхности',
    notFor: 'Не основной вариант для диванов, ковров и строительной пыли',
    href: sc4Href,
  },
  {
    model: 'Karcher Puzzi',
    suited: 'Диван, ковер, матрас, салон авто, текстиль',
    notFor: 'Не заменяет пароочиститель для плитки, кухни и швов',
    href: puzzi8Href,
  },
  {
    model: 'Karcher WD5',
    suited: 'Сухая строительная пыль, мелкая крошка, уборка после ремонта',
    notFor: 'Не предназначен как основной инструмент для обработки паром',
    href: wd5Href,
  },
]

const kitItems = [
  'Кухня и плитка: SC4, насадки под швы, проверка поверхности, срок 1 день',
  'Санузел: пароочиститель, базовые насадки, время на проходы и проветривание',
  'После ремонта: SC4 для твердых поверхностей плюс WD5 для сухой пыли',
  'Текстиль рядом: если есть диван или ковер, дополнительно смотрим Puzzi',
]

function handleTelegramClick(source: string) {
  trackEvent('telegram_click', { source, lead_context: leadMessage })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(leadMessage).catch(() => undefined)
  }
}

export default function SteamCleanerKitchenBathroomPage() {
  const pageTitle = 'Аренда пароочистителя для кухни и плитки в Москве | ВозьмиМеня'
  const pageDescription = 'Возьмите Karcher SC4 для кухни, плитки, ванной, швов и сантехники в Москве. Поможем понять, нужен пароочиститель, Puzzi или пылесос.'

  return (
    <div className="min-h-screen bg-[#EEF4EF] text-slate-900">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="аренда пароочистителя москва, karcher sc4 аренда, пароочиститель для кухни плитки ванной" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
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

      <section className="relative overflow-hidden bg-[#183028] text-white">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(167,243,208,.45),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(125,211,252,.34),transparent_26%),linear-gradient(135deg,#183028,#23372F_48%,#0F172A)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.14)_1px,transparent_1px)] bg-[length:30px_30px]" />
        </div>
        <div className="container relative mx-auto px-4 py-10 md:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-emerald-50/75">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <Link to="/arenda-pylesosov-moskva" className="hover:text-white">Пылесосы и уборка</Link>
            <span>/</span>
            <span className="text-white">Пароочиститель</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#A7F3D0]">
                Сценарий: кухня, плитка, ванная
              </p>
              <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Аренда пароочистителя для кухни, плитки и ванной в Москве
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-emerald-50/85">
                Пароочиститель нужен не вместо моющего пылесоса, а для другой задачи: пройти плитку, швы, кухню, сантехнику и твердые поверхности. Если задача смешанная — поможем выбрать SC4, Puzzi или WD5.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={getTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleTelegramClick('steam_cleaner_hero')}
                  className="btn bg-[#A7F3D0] text-slate-950 hover:bg-[#D1FAE5]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Подобрать технику в Telegram
                </a>
                <Link to={sc4Href} className="btn border border-white/15 bg-white/10 text-white hover:bg-white/20">
                  Открыть Karcher SC4
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.08] p-5 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-[#EEF4EF] p-5 text-slate-900">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Основной кандидат</p>
                    <h2 className="mt-1 text-2xl font-extrabold">Karcher SC4</h2>
                  </div>
                  <span className="rounded-full bg-[#183028] px-3 py-1 text-sm font-semibold text-white">пар / плитка</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-600">
                  Сценарий для кухни, ванной, плитки, швов и твердых поверхностей. Для текстиля выбирайте Puzzi, для строительной пыли — WD5.
                </p>
                <div className="grid gap-3 text-sm">
                  {['Кухня и твердые поверхности', 'Плитка, ванная и швы', 'Подбор техники под задачу'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F7D57]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to={sc4Href} className="btn mt-5 w-full bg-slate-950 text-white hover:bg-slate-800">
                  Посмотреть Karcher SC4
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
            <h2 className="mb-3 text-3xl font-extrabold">Где пароочиститель полезнее пылесоса</h2>
            <p className="text-slate-600">
              Главное отличие: пароочиститель не собирает мусор как пылесос и не делает химчистку дивана как Puzzi. Он помогает в сценариях твердых поверхностей.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scenarioCards.map((card) => {
              const Icon = card.icon
              const className = 'group rounded-3xl border border-[#D8E5D9] bg-white p-5 transition hover:-translate-y-1 hover:border-[#7DD3A8] hover:shadow-xl'
              const content = (
                <>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A7F3D0]/45 text-[#047857]">
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
                <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick(`steam_cleaner_${card.title}`)} className={className}>
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
        kitDescription="SC4 важно брать под поверхность: пар хорошо помогает на плитке, швах и сантехнике, но не заменяет Puzzi для текстиля."
        cardClassName="border-[#D8E5D9] bg-[#EEF4EF]"
        accentClassName="text-[#2F7D57]"
      />

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold">SC4, Puzzi или WD5</h2>
            <p className="mb-5 text-slate-600">
              Уборочная техника часто путается в названиях. Чтобы не взять “не тот аппарат”, отталкивайтесь от поверхности: плитка, ткань или сухая строительная пыль.
            </p>
            <Link to="/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Если нужно чистить диван или ковер
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[#D8E5D9] bg-[#EEF4EF]">
            {comparisonRows.map((row) => (
              <Link key={row.model} to={row.href} className="grid gap-3 border-b border-[#D8E5D9] p-5 transition last:border-b-0 hover:bg-white md:grid-cols-[.65fr_1fr_1fr]">
                <h3 className="text-lg font-extrabold">{row.model}</h3>
                <p className="text-sm leading-6 text-slate-700"><span className="font-bold text-slate-950">Подходит:</span> {row.suited}</p>
                <p className="text-sm leading-6 text-slate-600"><span className="font-bold text-slate-950">Не основная задача:</span> {row.notFor}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#183028] py-14 text-white">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold text-white">Как выбрать срок аренды</h2>
            <p className="text-emerald-50/80">
              Для одной кухни или ванной часто достаточно 1 дня. Если швов много, помещений несколько или уборка после переезда — заложите больше времени.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1 день', 'Кухня, ванная или локальная задача без большого объема'],
              ['2 дня', 'Несколько помещений, плитка и швы, уборка после переезда'],
              ['Комплект', 'Если кроме пара нужен Puzzi или строительный пылесос'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <Timer className="mb-4 h-6 w-6 text-[#A7F3D0]" />
                <h3 className="mb-2 text-xl font-extrabold text-white">{title}</h3>
                <p className="text-sm leading-6 text-emerald-50/75">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="rounded-3xl border border-[#D8E5D9] bg-white p-6 md:p-8">
            <h2 className="mb-4 text-3xl font-extrabold">Что написать в заявке</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Поверхности: кухня, плитка, ванная, швы или сантехника', 'Тип загрязнения: жир, налет, грязь в швах', 'Сколько помещений или примерная площадь', 'Нужен ли Puzzi или WD5 вместе с SC4', 'Желаемые даты аренды', 'Район Москвы для доставки или самовывоза'].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-[#EEF4EF] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2F7D57]" />
                  <span className="text-sm font-semibold leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#A7F3D0] p-6 text-slate-950 md:p-8">
            <WandSparkles className="mb-4 h-8 w-8" />
            <h2 className="mb-3 text-3xl font-extrabold">Отправить задачу в Telegram</h2>
            <p className="mb-5 text-sm leading-6">
              Заготовка сообщения: {leadMessage}
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTelegramClick('steam_cleaner_checklist')}
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
                Переходы, чтобы не путать пароочиститель, моющий пылесос и строительный пылесос.
              </p>
            </div>
            <Link to="/arenda-pylesosov-moskva" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Все оборудование для уборки
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              [sc4Href, 'Karcher SC4 для кухни, плитки и ванной'],
              [puzzi8Href, 'Karcher Puzzi 8/1 для дивана и ковра'],
              [wd5Href, 'Karcher WD5 для строительной пыли'],
              ['/arenda-pylesosov-moskva', 'Пылесосы и техника для уборки'],
              ['/arenda-stroitelnogo-pylesosa-posle-remonta-moskva', 'Уборка после ремонта'],
              ['/faq', 'Частые вопросы по аренде'],
            ].map(([href, label]) => (
              <Link key={href} to={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-[#D8E5D9] bg-[#EEF4EF] px-5 py-4 text-sm font-bold text-slate-900 transition hover:border-[#7DD3A8] hover:bg-white">
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
              <article key={faq.question} className="rounded-3xl border border-[#D8E5D9] bg-white p-6">
                <h3 className="mb-2 text-lg font-extrabold">{faq.question}</h3>
                <p className="text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#183028] py-10 text-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="h-6 w-6 text-[#A7F3D0]" />
            <span className="text-sm text-emerald-50/80">Если не уверены, что нужен именно пар — напишите задачу, подберем без гадания.</span>
          </div>
          <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick('steam_cleaner_footer')} className="btn bg-white text-slate-950 hover:bg-slate-100">
            Быстрый подбор
          </a>
        </div>
      </section>
    </div>
  )
}
