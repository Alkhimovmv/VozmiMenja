import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, BatteryCharging, CheckCircle2, Compass, Film, MapPinned, MessageCircle, Mountain, Smartphone } from 'lucide-react'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'
import ScenarioRentalInfo from '../components/ui/ScenarioRentalInfo'

const pageUrl = 'https://vozmimenya.ru/arenda-kamery-dlya-puteshestviya-vloga-moskva'
const goproHref = '/equipment/64e19704-b0dc-4879-9b90-6adc4eddd923'
const osmoHref = '/equipment/5e1bd056-e6e8-4e92-ae17-519a56f564ad'
const insta360Href = '/equipment/98794938-b0c8-4a7d-b182-b6645ba8039b'
const leadMessage = 'Нужна камера для поездки/влога. Что снимаем: путешествие/спорт/Reels/360. Срок: __ дней. Нужны крепления/аккумуляторы: __. Район Москвы: __.'

const faqItems = [
  {
    question: 'Какую камеру взять в путешествие?',
    answer: 'Для активной поездки, воды и креплений чаще смотрят GoPro. Для прогулок, разговорных видео и влога удобен DJI Osmo Pocket. Для необычных ракурсов и съемки одному — Insta360.',
  },
  {
    question: 'Что взять для Reels и Shorts?',
    answer: 'Если нужны прогулочные видео, лицо в кадре и быстрый монтаж, начните с Osmo Pocket. Если планируется спорт, вода или крепления — смотрите GoPro. Для вау-ракурсов — Insta360.',
  },
  {
    question: 'Можно ли взять камеру на выходные?',
    answer: 'Да, камеру можно взять на один день, выходные или поездку. Если есть дорога, сборы и возврат после поездки, удобнее закладывать запас по сроку.',
  },
  {
    question: 'Нужны ли дополнительные аккумуляторы?',
    answer: 'Для поездки или съемочного дня лучше заранее уточнить длительность съемки. Часто удобнее взять запас питания и не зависеть от розетки.',
  },
  {
    question: 'Можно ли взять крепления вместе с камерой?',
    answer: 'Комплект зависит от задачи и модели. Напишите, где будете крепить камеру: рюкзак, шлем, авто, велосипед, рука или штатив — подскажем варианты.',
  },
  {
    question: 'GoPro или Insta360 — что выбрать?',
    answer: 'GoPro проще, когда точно понятен кадр и нужна экшн-съемка. Insta360 полезна, когда вы снимаете один, хотите выбрать ракурс потом или получить 360-эффекты.',
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
    { '@type': 'ListItem', position: 2, name: 'Камеры', item: 'https://vozmimenya.ru/arenda-gopro-moskva' },
    { '@type': 'ListItem', position: 3, name: 'Камера для путешествия и влога', item: pageUrl },
  ],
}

const scenarioCards = [
  {
    title: 'Активная поездка и спорт',
    text: 'Горы, вода, велосипед, сноуборд, дорога и крепления — сценарий, где GoPro обычно понятнее всего.',
    result: 'Открыть GoPro 13',
    href: goproHref,
    icon: Mountain,
  },
  {
    title: 'Влог, прогулка, Reels',
    text: 'Когда вы говорите в кадре, снимаете город, обзор или короткие вертикальные видео, удобен компактный стабилизированный формат.',
    result: 'Открыть Osmo Pocket 3',
    href: osmoHref,
    icon: Smartphone,
  },
  {
    title: '360 и необычные ракурсы',
    text: 'Если снимаете один и хотите потом выбрать ракурс на монтаже, Insta360 дает больше свободы с кадром.',
    result: 'Открыть Insta360 X5',
    href: insta360Href,
    icon: Compass,
  },
  {
    title: 'Не уверены в комплекте',
    text: 'Напишите маршрут, срок и что хотите снять — подскажем камеру, крепления и запас питания.',
    result: 'Подобрать в Telegram',
    href: getTelegramUrl(),
    icon: MessageCircle,
    external: true,
  },
]

const comparisonRows = [
  {
    model: 'GoPro 13',
    suited: 'Спорт, вода, крепления, активная поездка, динамика',
    notFor: 'Не всегда лучший выбор для спокойного разговорного влога',
    href: goproHref,
  },
  {
    model: 'DJI Osmo Pocket 3',
    suited: 'Влог, прогулки, Reels, Shorts, обзоры, лицо в кадре',
    notFor: 'Не основной вариант для жесткого экшна и креплений на шлем',
    href: osmoHref,
  },
  {
    model: 'Insta360 X5',
    suited: '360-видео, съемка одному, необычные проходки, выбор ракурса после съемки',
    notFor: 'Может быть избыточна, если нужен простой прямой кадр',
    href: insta360Href,
  },
]

const durationItems = [
  { title: '1 день', text: 'Тест, прогулка, Reels или короткая съемка в Москве' },
  { title: 'Выходные', text: 'Поездка на 2-3 дня, спорт, обзор или съемочный уикенд' },
  { title: 'Неделя', text: 'Отпуск, маршрут с запасом дней и спокойный возврат после дороги' },
]

function handleTelegramClick(source: string) {
  trackEvent('telegram_click', { source, lead_context: leadMessage })

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(leadMessage).catch(() => undefined)
  }
}

export default function TravelVlogCameraRentalPage() {
  const pageTitle = 'Аренда камеры для путешествия и влога в Москве | ВозьмиМеня'
  const pageDescription = 'Возьмите GoPro, Insta360 или DJI Osmo Pocket для поездки, Reels, Shorts, спорта и влога в Москве. Подберем камеру и комплект.'

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-slate-900">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="аренда камеры для путешествия москва, камера для влога в аренду, gopro insta360 osmo pocket аренда" />
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

      <section className="relative overflow-hidden bg-[#102033] text-white">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,.45),transparent_28%),radial-gradient(circle_at_86%_0%,rgba(251,146,60,.34),transparent_28%),linear-gradient(135deg,#102033,#172554_48%,#111827)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-[length:34px_34px]" />
        </div>
        <div className="container relative mx-auto px-4 py-10 md:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-sky-100/75">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <Link to="/arenda-gopro-moskva" className="hover:text-white">Камеры</Link>
            <span>/</span>
            <span className="text-white">Путешествие и влог</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#7DD3FC]">
                Сценарий: поездка, Reels, Shorts, блог
              </p>
              <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Аренда камеры для путешествия и влога в Москве
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-sky-50/85">
                Не покупайте камеру ради одной поездки или съемочного уикенда. Возьмите GoPro, Insta360 или DJI Osmo Pocket на нужный срок и подберите комплект под маршрут, крепления и формат видео.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={getTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleTelegramClick('travel_vlog_camera_hero')}
                  className="btn bg-[#7DD3FC] text-slate-950 hover:bg-[#BAE6FD]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Подобрать камеру в Telegram
                </a>
                <Link to="/arenda-gopro-moskva" className="btn border border-white/15 bg-white/10 text-white hover:bg-white/20">
                  Все камеры в аренду
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.08] p-5 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-[#F4F0E8] p-5 text-slate-900">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Быстрый выбор</p>
                    <h2 className="mt-1 text-2xl font-extrabold">GoPro / Osmo / Insta360</h2>
                  </div>
                  <span className="rounded-full bg-[#102033] px-3 py-1 text-sm font-semibold text-white">поездка</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-slate-600">
                  Выбор зависит от того, как вы снимаете: экшн, разговорный влог или 360-ракурсы. Если вводные разные, проще подобрать комплект в Telegram.
                </p>
                <div className="grid gap-3 text-sm">
                  {['Камера под маршрут', 'Крепления и запас питания', 'Срок на поездку или выходные'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F7D57]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick('travel_vlog_camera_card')} className="btn mt-5 w-full bg-slate-950 text-white hover:bg-slate-800">
                  Написать задачу
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <h2 className="mb-3 text-3xl font-extrabold">Под какой формат нужна камера</h2>
            <p className="text-slate-600">
              Модель выбираем не по хайпу, а по задаче: где камера будет стоять, кто снимает и какой кадр нужен на выходе.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scenarioCards.map((card) => {
              const Icon = card.icon
              const className = 'group rounded-3xl border border-[#D8DEE8] bg-white p-5 transition hover:-translate-y-1 hover:border-[#38BDF8] hover:shadow-xl'
              const content = (
                <>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7DD3FC]/35 text-[#0369A1]">
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
                <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick(`travel_vlog_camera_${card.title}`)} className={className}>
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
        durationItems={durationItems}
        durationDescription="Для камер срок лучше считать не только по дню съемки, но и по дороге, зарядке, переносу файлов и спокойному возврату."
        cardClassName="border-[#D8DEE8] bg-[#F4F0E8]"
        accentClassName="text-[#2F7D57]"
      />

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold">GoPro, Osmo Pocket или Insta360</h2>
            <p className="mb-5 text-slate-600">
              Три камеры закрывают разные сценарии. GoPro — когда камера переживает движение. Osmo Pocket — когда важен спокойный кадр с человеком. Insta360 — когда хочется свободы ракурса.
            </p>
            <Link to="/blog/gopro-ili-insta360-chto-vzyat-dlya-poezdki-sporta-i-bloga" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Сравнение GoPro и Insta360
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[#D8DEE8] bg-[#F4F0E8]">
            {comparisonRows.map((row) => (
              <Link key={row.model} to={row.href} className="grid gap-3 border-b border-[#D8DEE8] p-5 transition last:border-b-0 hover:bg-white md:grid-cols-[.65fr_1fr_1fr]">
                <h3 className="text-lg font-extrabold">{row.model}</h3>
                <p className="text-sm leading-6 text-slate-700"><span className="font-bold text-slate-950">Подходит:</span> {row.suited}</p>
                <p className="text-sm leading-6 text-slate-600"><span className="font-bold text-slate-950">Не основная задача:</span> {row.notFor}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102033] py-14 text-white">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold text-white">Что входит в хороший съемочный комплект</h2>
            <p className="text-sky-50/80">
              Для поездки важна не только камера. Часто решают крепления, запас питания, память и понятный план съемки.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Крепления', 'Шлем, рюкзак, рука, авто, велосипед или штатив'],
              ['Питание', 'Запасной аккумулятор или пауэрбанк под длинный день'],
              ['Срок', 'Дорога, съемка и спокойный возврат после поездки'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <BatteryCharging className="mb-4 h-6 w-6 text-[#7DD3FC]" />
                <h3 className="mb-2 text-xl font-extrabold text-white">{title}</h3>
                <p className="text-sm leading-6 text-sky-50/75">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="rounded-3xl border border-[#D8DEE8] bg-white p-6 md:p-8">
            <h2 className="mb-4 text-3xl font-extrabold">Что написать в заявке</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Что снимаете: поездка, спорт, Reels, обзор или 360', 'На сколько дней нужна камера', 'Нужны ли крепления и запас питания', 'Телефон/ноутбук для переноса файлов', 'Нужен ли микрофон для речи', 'Район Москвы для доставки или самовывоза'].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-[#F4F0E8] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2F7D57]" />
                  <span className="text-sm font-semibold leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#7DD3FC] p-6 text-slate-950 md:p-8">
            <MapPinned className="mb-4 h-8 w-8" />
            <h2 className="mb-3 text-3xl font-extrabold">Отправить задачу в Telegram</h2>
            <p className="mb-5 text-sm leading-6">
              Заготовка сообщения: {leadMessage}
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTelegramClick('travel_vlog_camera_checklist')}
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
                Быстрые переходы, чтобы выбрать камеру, сравнить модели и собрать комплект под поездку.
              </p>
            </div>
            <Link to="/arenda-gopro-moskva" className="inline-flex items-center gap-2 font-bold text-[#1D4ED8] hover:underline">
              Все камеры в аренду
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              [goproHref, 'GoPro 13 для спорта и поездки'],
              [osmoHref, 'DJI Osmo Pocket 3 для влога'],
              [insta360Href, 'Insta360 X5 для 360-ракурсов'],
              ['/arenda-gopro-moskva', 'GoPro и экшн-камеры в аренду'],
              ['/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360', 'Какую камеру взять в путешествие'],
              ['/arenda-mikrofona-dlya-intervyu-moskva', 'Микрофон для речи в кадре'],
            ].map(([href, label]) => (
              <Link key={href} to={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-[#D8DEE8] bg-[#F4F0E8] px-5 py-4 text-sm font-bold text-slate-900 transition hover:border-[#38BDF8] hover:bg-white">
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
              <article key={faq.question} className="rounded-3xl border border-[#D8DEE8] bg-white p-6">
                <h3 className="mb-2 text-lg font-extrabold">{faq.question}</h3>
                <p className="text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102033] py-10 text-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Film className="h-6 w-6 text-[#7DD3FC]" />
            <span className="text-sm text-sky-50/80">Опишите съемку — и мы поможем выбрать камеру вместо гадания по характеристикам.</span>
          </div>
          <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => handleTelegramClick('travel_vlog_camera_footer')} className="btn bg-white text-slate-950 hover:bg-slate-100">
            Быстрый подбор
          </a>
        </div>
      </section>
    </div>
  )
}
