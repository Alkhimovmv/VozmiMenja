import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, BatteryCharging, CheckCircle2, ClipboardList, MessageCircle, Mic2, Phone, RadioTower, Smartphone, Video } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl } from '../lib/contactLinks'

const pageUrl = 'https://vozmimenya.ru/arenda-mikrofona-dlya-intervyu-moskva'
const djiMicHref = '/equipment/1232f00f-dc96-46df-b1e4-2d724ede3ef8'
const camerasHref = '/arenda-gopro-moskva'
const leadMessage = 'Нужен микрофон для интервью. Формат: один/два героя, помещение/улица: __. Камера/телефон: __. Даты аренды: __. Район Москвы: __.'

const faqItems = [
  {
    question: 'Какой микрофон взять для интервью?',
    answer: 'Для интервью на телефон или камеру обычно удобен беспроводной петличный комплект вроде DJI Mic 2: его проще поставить на героя и быстро проверить звук перед записью.',
  },
  {
    question: 'Подойдет ли DJI Mic 2 для съемки на телефон?',
    answer: 'Да, комплект рассчитан на мобильные сценарии и может подключаться к телефону, камере или рекордеру. Перед арендой лучше уточнить нужный разъем и устройство.',
  },
  {
    question: 'Можно ли записывать интервью на улице?',
    answer: 'Можно, но на улице сильнее влияют ветер, расстояние и шум. Для важной записи стоит заранее проверить уровень звука и взять запас времени на тест.',
  },
  {
    question: 'Нужен ли микрофон, если камера уже пишет звук?',
    answer: 'Встроенный микрофон камеры часто ловит помещение, ветер и шум вокруг. Внешняя петличка помогает держать речь ближе и чище.',
  },
  {
    question: 'На сколько дней брать микрофон?',
    answer: 'Для одной съемки обычно хватает 1 дня. Если есть репетиция, несколько локаций или монтажные пересъемки, удобнее брать на 2 дня.',
  },
  {
    question: 'Можно ли взять микрофон вместе с камерой?',
    answer: 'Да, можно подобрать комплект под задачу: микрофон для речи и камеру для видео. Напишите формат съемки, и мы подскажем связку.',
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
    { '@type': 'ListItem', position: 3, name: 'Микрофон для интервью', item: pageUrl },
  ],
}

const scenarioCards = [
  {
    title: 'Интервью на камеру',
    text: 'Петличка помогает записать речь ближе к герою, а не собирать весь шум комнаты через камеру.',
    result: 'Открыть DJI Mic 2',
    href: djiMicHref,
    icon: Video,
  },
  {
    title: 'Reels, Shorts и блог',
    text: 'Для коротких роликов чистая речь часто важнее идеальной картинки: шумный звук быстрее мешает смотреть.',
    result: 'Собрать комплект',
    href: getTelegramUrl(),
    icon: Smartphone,
    external: true,
  },
  {
    title: 'Съемка на улице',
    text: 'Проверьте ветер, дистанцию и шум. Лучше заложить время на тестовую запись до основного дубля.',
    result: 'Написать в Telegram',
    href: getTelegramUrl(),
    icon: RadioTower,
    external: true,
  },
  {
    title: 'Камера плюс микрофон',
    text: 'Если камеры тоже нет, можно подобрать связку: Osmo Pocket, GoPro или Insta360 плюс DJI Mic 2.',
    result: 'Посмотреть камеры',
    href: camerasHref,
    icon: ClipboardList,
  },
]

const checklistItems = [
  'Сколько людей говорит в кадре',
  'Телефон, камера или ноутбук для записи',
  'Помещение или улица',
  'Нужна ли камера вместе с микрофоном',
  'Даты аренды и запасной день',
  'Район Москвы для доставки или самовывоза',
]

function handleTelegramClick(source: string) {
  trackEvent('telegram_click', { source, lead_context: leadMessage })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(leadMessage).catch(() => undefined)
  }
}

export default function InterviewMicrophoneRentalPage() {
  const pageTitle = 'Аренда микрофона для интервью в Москве | ВозьмиМеня'
  const pageDescription = 'Возьмите DJI Mic 2 для интервью, Reels, Shorts, блога или съемки на телефон в Москве. Поможем подобрать микрофон и комплект под задачу.'

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-slate-900">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="аренда микрофона для интервью москва, dji mic 2 аренда, петличный микрофон в аренду для съемки" />
        <link rel="canonical" href={pageUrl} />
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

      <section className="relative overflow-hidden bg-[#161A22] text-white">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(245,158,11,.42),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(59,130,246,.34),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[length:36px_36px]" />
        </div>
        <div className="container relative mx-auto px-4 py-10 md:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <Link to="/arenda-audiooborudovaniya-moskva" className="hover:text-white">Аудио</Link>
            <span>/</span>
            <span className="text-white">Микрофон для интервью</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#F4C56A]">
                Сценарий: чистая речь в кадре
              </p>
              <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Аренда микрофона для интервью в Москве
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-200">
                Для интервью, Reels, Shorts и блога звук решает половину результата. Возьмите DJI Mic 2 на нужные даты и запишите речь чище, чем на встроенный микрофон камеры или телефона.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={getTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleTelegramClick('interview_microphone_hero')}
                  className="btn bg-[#F4C56A] text-slate-950 hover:bg-[#FFE0A3]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Подобрать микрофон в Telegram
                </a>
                <Link to={djiMicHref} className="btn border border-white/15 bg-white/10 text-white hover:bg-white/20">
                  Открыть DJI Mic 2
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.08] p-5 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-[#F5F1E8] p-5 text-slate-900">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Основной кандидат</p>
                    <h2 className="mt-1 text-2xl font-extrabold">DJI Mic 2</h2>
                  </div>
                  <span className="rounded-full bg-[#161A22] px-3 py-1 text-sm font-semibold text-white">интервью</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-600">
                  Беспроводной комплект для интервью, влогов и съемки речи. Перед арендой уточните устройство записи и нужный способ подключения.
                </p>
                <div className="grid gap-3 text-sm">
                  {['Интервью и речь в кадре', 'Съемка на телефон или камеру', 'Влоги, обзоры и короткие ролики'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F7D57]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to={djiMicHref} className="btn mt-5 w-full bg-slate-950 text-white hover:bg-slate-800">
                  Посмотреть DJI Mic 2
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
            <h2 className="mb-3 text-3xl font-extrabold">Под какой формат берете микрофон</h2>
            <p className="text-slate-600">
              Выбор зависит от того, кто говорит, где идет съемка и на что вы пишете звук: телефон, камера или отдельный рекордер.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scenarioCards.map((card) => {
              const Icon = card.icon
              const className = 'group rounded-3xl border border-[#E6DCC8] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D2B885] hover:shadow-xl'
              const content = (
                <>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4C56A]/35 text-[#8A5B00]">
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
                <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick(`interview_microphone_${card.title}`)} className={className}>
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

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold">Что проверить до записи</h2>
            <p className="mb-5 text-slate-600">
              Самая частая ошибка — включить камеру и забыть про тест звука. Перед основным дублем сделайте короткую запись и послушайте ее в наушниках.
            </p>
            <Link to="/blog/dji-mic-2-dlya-intervyu-kak-zapisat-chistyj-zvuk-bez-studii" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Гайд по DJI Mic 2 для интервью
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {[
              'Запишите 10-15 секунд теста в той же локации.',
              'Проверьте, не трет ли петличка об одежду.',
              'На улице учитывайте ветер и шум дороги.',
              'Уточните подключение: USB-C, Lightning, камера или 3.5 мм.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-[#F5F1E8] p-4">
                <Mic2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#8A5B00]" />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#161A22] py-14 text-white">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold text-white">Как выбрать срок аренды</h2>
            <p className="text-slate-200">
              Для одного интервью часто хватает 1 дня. Если съемка важная, в другой локации или с запасным дублем — лучше заложить 2 дня.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1 день', 'Одно интервью или короткая съемка без переездов'],
              ['2 дня', 'Тест, съемка и запас на пересъемку сложных фрагментов'],
              ['Комплект', 'Если вместе нужны камера, микрофон и аксессуары'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <BatteryCharging className="mb-4 h-6 w-6 text-[#F4C56A]" />
                <h3 className="mb-2 text-xl font-extrabold text-white">{title}</h3>
                <p className="text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="rounded-3xl border border-[#E6DCC8] bg-white p-6 md:p-8">
            <h2 className="mb-4 text-3xl font-extrabold">Что написать в заявке</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {checklistItems.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-[#F5F1E8] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2F7D57]" />
                  <span className="text-sm font-semibold leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#F4C56A] p-6 text-slate-950 md:p-8">
            <MessageCircle className="mb-4 h-8 w-8" />
            <h2 className="mb-3 text-3xl font-extrabold">Отправить задачу в Telegram</h2>
            <p className="mb-5 text-sm leading-6">
              Заготовка сообщения: {leadMessage}
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTelegramClick('interview_microphone_checklist')}
              className="btn w-full bg-slate-950 text-white hover:bg-slate-800"
            >
              Написать в Telegram
            </a>
            <a
              href={`tel:${CONTACT_PHONE}`}
              onClick={() => trackEvent('phone_click', { source: 'interview_microphone_checklist' })}
              className="btn mt-3 w-full border border-slate-950/20 bg-white/35 text-slate-950 hover:bg-white/55"
            >
              <Phone className="h-4 w-4" />
              {CONTACT_PHONE_LABEL}
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
                Быстрые переходы, чтобы собрать съемочный комплект и не забыть про звук.
              </p>
            </div>
            <Link to="/arenda-audiooborudovaniya-moskva" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Все аудиооборудование
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              [djiMicHref, 'DJI Mic 2 для интервью и видео'],
              ['/arenda-audiooborudovaniya-moskva', 'Аренда аудиооборудования в Москве'],
              ['/arenda-gopro-moskva', 'Камеры для съемки в аренду'],
              ['/blog/dji-mic-2-dlya-intervyu-kak-zapisat-chistyj-zvuk-bez-studii', 'Как записать чистый звук без студии'],
              ['/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-osmo-pocket-ili-insta360', 'Какую камеру взять для съемки'],
              ['/faq', 'Частые вопросы по аренде'],
            ].map(([href, label]) => (
              <Link key={href} to={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-[#E6DCC8] bg-[#F5F1E8] px-5 py-4 text-sm font-bold text-slate-900 transition hover:border-[#D2B885] hover:bg-white">
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
              <article key={faq.question} className="rounded-3xl border border-[#E6DCC8] bg-white p-6">
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
