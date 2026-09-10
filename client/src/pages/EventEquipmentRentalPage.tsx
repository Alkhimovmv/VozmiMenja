import { Link } from 'react-router-dom'
import { Camera, CheckCircle, MessageCircle, Mic2, Music, PackageCheck, Sparkles, Truck, WashingMachine } from 'lucide-react'
import SEO from '../components/SEO'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'

const eventScenarios = [
  {
    icon: Music,
    title: 'День рождения и вечеринка',
    text: 'JBL PartyBox для музыки, микрофон для поздравлений и доставка к началу события.',
    href: '/arenda-kolonki-dlya-vecherinki-moskva',
  },
  {
    icon: Mic2,
    title: 'Презентация или выступление',
    text: 'Колонка и микрофон, чтобы речь было слышно в зале, офисе или на камерном мероприятии.',
    href: '/arenda-audiooborudovaniya-moskva',
  },
  {
    icon: Camera,
    title: 'Съемка мероприятия',
    text: 'GoPro, Insta360 или Osmo Pocket для видео, бэкстейджа, поездки или контента в соцсети.',
    href: '/arenda-kamery-dlya-puteshestviya-vloga-moskva',
  },
  {
    icon: WashingMachine,
    title: 'Уборка после события',
    text: 'WD5, Puzzi или пароочиститель для пола, мебели, ковров, кухни и твердых поверхностей.',
    href: '/arenda-pylesosov-moskva',
  },
]

const kitHints = [
  'Колонка + микрофон для речи, поздравлений или караоке.',
  'Камера + крепление + запасная батарея для съемки без пауз.',
  'Puzzi + подходящая насадка, если после мероприятия нужно почистить мебель или ковёр.',
  'Доставка или самовывоз 24/7, если техника нужна строго к определенному времени.',
]

const faq = [
  {
    question: 'Что лучше взять для домашней вечеринки?',
    answer: 'Обычно достаточно одной мощной PartyBox. Если будут поздравления, ведущий или караоке, лучше сразу добавить микрофон.',
  },
  {
    question: 'Можно ли взять технику на один день?',
    answer: 'Да, техника часто берется на один день или выходные. Даты и время получения лучше указать в заявке сразу.',
  },
  {
    question: 'Поможете подобрать комплект?',
    answer: 'Да. Напишите формат события, помещение, количество гостей, нужна ли речь/музыка/съемка/уборка — менеджер подскажет состав.',
  },
]

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

export default function EventEquipmentRentalPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Аренда техники для мероприятия в Москве | ВозьмиМеня"
        description="Аренда техники для мероприятия в Москве: колонки JBL, микрофоны, камеры GoPro/Insta360/Osmo и клининговая техника после события."
        keywords="аренда техники для мероприятия москва, аренда колонки для мероприятия, камера на мероприятие, пылесос после праздника"
        url="https://vozmimenya.ru/arenda-tehniki-dlya-meropriyatiya-moskva"
        structuredData={faqStructuredData}
      />

      <section className="bg-gradient-to-br from-[#111827] via-[#1D4ED8] to-[#0F172A] py-16 text-white md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-blue-200">Для праздника, съемки и уборки</span>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Аренда техники для мероприятия в Москве
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-blue-100">
              Подберите технику под событие: колонку и микрофон для звука, камеру для съемки, а после — пылесос, Puzzi или пароочиститель для уборки. Не нужно покупать оборудование ради одного дня.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={getTelegramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('telegram_click', { source: 'event_equipment_hero' })}
                className="btn bg-white text-primary hover:bg-blue-50"
              >
                Подобрать комплект
              </a>
              <Link to="/arenda-kolonki-dlya-vecherinki-moskva" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
                Колонки для вечеринки
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            ['1 день', 'для события или выходных'],
            ['Звук', 'колонка и микрофон'],
            ['Съемка', 'GoPro, Insta360, Osmo'],
            ['После', 'WD5, Puzzi, SC4'],
          ].map(([value, label]) => (
            <div key={value} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-gray-900">{value}</div>
              <div className="mt-1 text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Что нужно на событие</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Соберите комплект под формат мероприятия</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {eventScenarios.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.title} to={item.href} className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5 transition hover:border-[#2563EB]/30 hover:bg-blue-50/40">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                    <Icon className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <Sparkles className="mb-4 h-7 w-7 text-[#2563EB]" />
            <h2 className="text-2xl font-extrabold text-gray-900">Что написать для быстрого подбора</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Формат события, адрес или самовывоз, дата и время, помещение/улица, количество гостей, нужен ли микрофон, съемка или уборка после.
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('telegram_click', { source: 'event_equipment_cta' })}
              className="btn mt-5 inline-flex bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Написать в Telegram
            </a>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <PackageCheck className="h-6 w-6 text-[#2563EB]" />
              <h2 className="text-2xl font-extrabold text-gray-900">Подсказки по комплекту</h2>
            </div>
            <div className="space-y-3">
              {kitHints.map((hint) => (
                <div key={hint} className="flex gap-3 rounded-xl bg-[#F8FAFC] p-4">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm leading-relaxed text-gray-600">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Получение</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Заранее решите доставку или самовывоз</h2>
            </div>
            <Link to="/samovyvoz-24-7-postamat" className="font-bold text-[#2563EB] hover:underline">
              Самовывоз 24/7 и постамат →
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-6">
            <Truck className="mb-4 h-7 w-7 text-[#2563EB]" />
            <p className="max-w-3xl text-sm leading-relaxed text-gray-600">
              Для мероприятия время особенно важно: колонку лучше получить до приезда гостей, камеру — до начала съемки, а клининговую технику — на следующий день после события. Доставку, самовывоз или постамат лучше согласовать заранее.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {faq.map((item) => (
            <div key={item.question} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-gray-900">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
