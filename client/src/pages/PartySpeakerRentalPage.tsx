import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, CheckCircle2, Clock, Home, MapPinned, MessageCircle, Music, Speaker, Truck, Users, Volume2 } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'
import ScenarioRentalInfo from '../components/ui/ScenarioRentalInfo'

const pageUrl = 'https://vozmimenya.ru/arenda-kolonki-dlya-vecherinki-moskva'
const partyBox320Href = '/equipment/fd15952980910f1f05be88fa6853e1fd'
const partyBox710Href = '/equipment/e609e0bec87c0653a070088843f2df8c'
const leadMessage = 'Нужна колонка для вечеринки. Где будет: квартира/дача/зал/улица. Гостей: __. Формат: фон/речь/танцы. Даты аренды: __. Район Москвы: __.'

const faqItems = [
  {
    question: 'Какую колонку взять для вечеринки в квартире?',
    answer: 'Для квартиры, дня рождения дома или камерной встречи обычно стоит начать с JBL PartyBox 320: ее проще разместить и хватает для музыки, фона и небольшой компании.',
  },
  {
    question: 'Когда лучше взять JBL PartyBox 710?',
    answer: 'PartyBox 710 уместнее для дачи, зала, танцевальной вечеринки и ситуации, где нужен более плотный звук с запасом громкости.',
  },
  {
    question: 'Можно ли подключить телефон или ноутбук?',
    answer: 'Для большинства бытовых сценариев колонку подключают к телефону или ноутбуку. Перед выдачей лучше уточнить устройство и проверить удобный способ подключения.',
  },
  {
    question: 'На сколько дней арендовать колонку?',
    answer: 'Для одного мероприятия обычно хватает 1 дня или суток. Если нужно забрать заранее, проверить звук и спокойно вернуть после праздника, удобнее закладывать 2 дня.',
  },
  {
    question: 'Поможете выбрать мощность под помещение?',
    answer: 'Да. Напишите площадь, число гостей, формат музыки и где будет стоять колонка. Подскажем, хватит ли PartyBox 320 или лучше взять 710.',
  },
  {
    question: 'Есть ли доставка по Москве?',
    answer: 'Условия доставки зависят от адреса и времени. Напишите район Москвы в заявке, и мы подскажем удобный вариант.',
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
    { '@type': 'ListItem', position: 2, name: 'Аудиооборудование', item: 'https://vozmimenya.ru/arenda-audiooborudovaniya-moskva' },
    { '@type': 'ListItem', position: 3, name: 'Колонка для вечеринки', item: pageUrl },
  ],
}

const scenarioCards = [
  {
    title: 'Квартира и день рождения',
    text: 'Музыка для комнаты, кухни-гостиной или небольшой компании без лишнего запаса по громкости.',
    result: 'Смотреть PartyBox 320',
    href: partyBox320Href,
    icon: Home,
  },
  {
    title: 'Дача и гости на вечер',
    text: 'Нужен звук плотнее, чем у домашней Bluetooth-колонки, особенно если люди расходятся по зоне отдыха.',
    result: 'Сравнить 320 и 710',
    href: '/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu',
    icon: Users,
  },
  {
    title: 'Зал, танцы, громкая музыка',
    text: 'Когда колонка должна держать танцевальный формат и не работать весь вечер на пределе.',
    result: 'Смотреть PartyBox 710',
    href: partyBox710Href,
    icon: Volume2,
  },
  {
    title: 'Не уверены по мощности',
    text: 'Напишите площадь, число гостей и формат. Подскажем модель и срок, чтобы не брать лишнее.',
    result: 'Подобрать в Telegram',
    href: getTelegramUrl(),
    icon: MessageCircle,
    external: true,
  },
]

const comparisonRows = [
  {
    model: 'JBL PartyBox 320',
    suited: 'Квартира, небольшая дача, день рождения, фоновая музыка',
    when: 'Когда важны мобильность, понятный запас громкости и простой домашний сценарий',
    href: partyBox320Href,
  },
  {
    model: 'JBL PartyBox 710',
    suited: 'Большая дача, зал, танцы, громкая музыка и более плотный бас',
    when: 'Когда помещение больше, гостей много или музыка должна звучать уверенно весь вечер',
    href: partyBox710Href,
  },
]

const kitItems = [
  'Квартира: PartyBox 320, кабель питания, подключение телефона, срок 1 день',
  'Дача: PartyBox 320/710, доставка к удобному окну, проверка питания, срок на выходные',
  'Зал и танцы: PartyBox 710, запас громкости, время на тест до гостей',
  'Поздравления/караоке: колонка плюс микрофон по наличию и задаче',
]

const durationItems = [
  { title: '1 день', text: 'Если праздник вечером и удобно забрать/вернуть в тот же день' },
  { title: 'Выходные', text: 'Если хотите проверить звук заранее и спокойно вернуть после гостей' },
  { title: 'Неделя', text: 'Для дачи, серии мероприятий или длинного выезда' },
]

function handleTelegramClick(source: string) {
  trackEvent('telegram_click', { source, lead_context: leadMessage })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(leadMessage).catch(() => undefined)
  }
}

export default function PartySpeakerRentalPage() {
  const pageTitle = 'Аренда колонки для вечеринки в Москве | ВозьмиМеня'
  const pageDescription = 'Возьмите JBL PartyBox 320 или 710 для вечеринки, дня рождения, дачи или зала в Москве. Поможем подобрать колонку по гостям и площадке.'

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-slate-950">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="аренда колонки для вечеринки москва, JBL PartyBox в аренду, аренда колонки JBL, колонка на день рождения" />
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

      <section className="relative overflow-hidden bg-[#111827] text-white">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[length:44px_44px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(251,191,36,.22))]" />
          <div className="absolute right-0 top-0 h-full w-2/5 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_16px,rgba(14,165,233,.22)_16px,rgba(14,165,233,.22)_20px)]" />
        </div>
        <div className="container relative mx-auto px-4 py-10 md:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <Link to="/arenda-audiooborudovaniya-moskva" className="hover:text-white">Аудиооборудование</Link>
            <span>/</span>
            <span className="text-white">Колонка для вечеринки</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#FBBF24]">
                Сценарий: праздник, дача, зал
              </p>
              <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Аренда колонки для вечеринки в Москве
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-200">
                Возьмите JBL PartyBox под день рождения, дачу или зал. Поможем понять, хватит ли PartyBox 320 или нужен запас PartyBox 710, и сразу уточним подключение, срок и доставку.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={getTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleTelegramClick('party_speaker_hero')}
                  className="btn bg-[#FBBF24] text-slate-950 hover:bg-[#FCD34D]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Подобрать колонку в Telegram
                </a>
                <Link to="/arenda-audiooborudovaniya-moskva" className="btn border border-white/15 bg-white/10 text-white hover:bg-white/20">
                  Все аудио в аренду
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.08] p-5 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-[#F6F7F4] p-5 text-slate-950">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Быстрый выбор</p>
                    <h2 className="mt-1 text-2xl font-extrabold">JBL PartyBox</h2>
                  </div>
                  <span className="rounded-full bg-[#111827] px-3 py-1 text-sm font-semibold text-white">320 / 710</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-600">
                  Для квартиры и небольшой дачи чаще начинаем с 320. Для зала, танцев и большого праздника смотрим 710 с запасом.
                </p>
                <div className="grid gap-3 text-sm">
                  {['Музыка с телефона или ноутбука', 'Подбор под число гостей', 'Срок под мероприятие и возврат'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#15803D]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to={partyBox320Href} className="btn mt-5 w-full bg-slate-950 text-white hover:bg-slate-800">
                  Открыть JBL PartyBox 320
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
            <h2 className="mb-3 text-3xl font-extrabold">Под какой формат нужна колонка</h2>
            <p className="text-slate-600">
              Самый быстрый выбор получается не по названию модели, а по месту, числу гостей и тому, нужна музыка фоном или под танцы.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scenarioCards.map((card) => {
              const Icon = card.icon
              const className = 'group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl'
              const content = (
                <>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24]/25 text-[#92400E]">
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
                <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick('party_speaker_scenario_help')} className={className}>
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
        durationItems={durationItems}
        cardClassName="border-slate-200 bg-[#F6F7F4]"
        accentClassName="text-[#1D4ED8]"
      />

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold">PartyBox 320 или PartyBox 710</h2>
            <p className="mb-5 text-slate-600">
              Если сомневаетесь, опишите площадку и гостей. Мы не будем навязывать мощнее: цель - чтобы колонка нормально звучала именно в вашем сценарии.
            </p>
            <Link to="/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Подробное сравнение PartyBox
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[#F6F7F4]">
            {comparisonRows.map((row) => (
              <Link key={row.model} to={row.href} className="grid gap-3 border-b border-slate-200 p-5 transition last:border-b-0 hover:bg-white md:grid-cols-[.55fr_1fr_1fr]">
                <h3 className="text-lg font-extrabold">{row.model}</h3>
                <p className="text-sm leading-6 text-slate-700"><span className="font-bold text-slate-950">Подходит:</span> {row.suited}</p>
                <p className="text-sm leading-6 text-slate-600"><span className="font-bold text-slate-950">Когда брать:</span> {row.when}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111827] py-14 text-white">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold text-white">Что уточнить перед бронью</h2>
            <p className="text-slate-300">
              Пять деталей экономят переписку и помогают сразу предложить правильную колонку, срок аренды и способ получения.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [MapPinned, 'Где будет стоять колонка'],
              [Users, 'Сколько гостей ожидается'],
              [Music, 'Фон, речь или танцы'],
              [Speaker, 'Нужен ли микрофон или второй источник'],
              [Clock, 'Когда забрать и вернуть'],
              [Truck, 'Доставка или самовывоз'],
            ].map(([Icon, text]) => (
              <div key={text as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                <Icon className="h-5 w-5 flex-shrink-0 text-[#FBBF24]" />
                <span className="text-sm font-semibold text-slate-100">{text as string}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="mb-4 text-3xl font-extrabold">Готовый текст заявки</h2>
            <p className="mb-5 text-slate-600">
              Можно отправить как есть и заполнить пропуски. Так менеджер сразу поймет формат и быстрее подтвердит наличие.
            </p>
            <div className="rounded-2xl bg-[#F6F7F4] p-5 text-sm font-semibold leading-6 text-slate-800">
              {leadMessage}
            </div>
          </div>
          <div className="rounded-3xl bg-[#FBBF24] p-6 text-slate-950 md:p-8">
            <MessageCircle className="mb-4 h-8 w-8" />
            <h2 className="mb-3 text-3xl font-extrabold">Подобрать колонку в Telegram</h2>
            <p className="mb-5 text-sm leading-6">
              Напишите площадку, гостей и даты. Подскажем, какую PartyBox взять и как удобнее оформить аренду.
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTelegramClick('party_speaker_checklist')}
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
                Быстрые переходы, если хотите сравнить модели или посмотреть весь аудиокаталог.
              </p>
            </div>
            <Link to="/delivery" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              <Truck className="h-5 w-5" />
              Условия доставки по Москве
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['/arenda-audiooborudovaniya-moskva', 'Все аудиооборудование в аренду'],
              [partyBox320Href, 'JBL PartyBox 320 для квартиры и дачи'],
              [partyBox710Href, 'JBL PartyBox 710 для зала и танцев'],
              ['/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu', 'Как выбрать PartyBox для вечеринки'],
              ['/faq', 'Частые вопросы по аренде'],
              ['/contact', 'Контакты ВозьмиМеня'],
            ].map(([href, label]) => (
              <Link key={href} to={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F6F7F4] px-5 py-4 text-sm font-bold text-slate-950 transition hover:border-slate-300 hover:bg-white">
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
