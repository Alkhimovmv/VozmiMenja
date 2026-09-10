import { Link } from 'react-router-dom'
import { Clock, MapPin, MessageCircle, PackageCheck, ShieldCheck, TimerReset } from 'lucide-react'
import SEO from '../components/SEO'
import { trackEvent } from '../lib/analytics'
import { getTelegramUrl } from '../lib/contactLinks'

const steps = [
  'Напишите модель, даты и удобный офис/постамат.',
  'Менеджер подтвердит наличие, документы, залог и время получения.',
  'Перед выдачей техника готовится и проверяется по комплекту.',
  'После аренды возврат согласуется тем же способом: офис, постамат или доставка.',
]

const goodFor = [
  { title: 'Камеры перед поездкой', text: 'GoPro, Osmo Pocket или Insta360 можно забрать в удобное окно без ожидания курьера.' },
  { title: 'Колонка к празднику', text: 'PartyBox удобно получить заранее, чтобы спокойно проверить заряд и подключение.' },
  { title: 'Техника для уборки', text: 'WD5, Puzzi или SC4 можно забрать под ремонт, диван, ковер, кухню или плитку.' },
]

const faq = [
  {
    question: 'Можно ли забрать технику ночью?',
    answer: 'Самовывоз 24/7 возможен по согласованию с менеджером. Для части выдач удобен постамат, но время и точку лучше подтвердить заранее.',
  },
  {
    question: 'Нужны ли документы при самовывозе?',
    answer: 'Да, условия документов и залога подтверждаются до выдачи. Обычно менеджер заранее говорит, что потребуется именно по выбранной модели.',
  },
  {
    question: 'Можно ли вернуть технику через постамат?',
    answer: 'Да, если такой возврат подходит по конкретной аренде и комплекту. Перед возвратом лучше написать менеджеру, чтобы он подтвердил порядок действий.',
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

export default function SelfPickupPostamatPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Самовывоз техники 24/7 и постамат в Москве | ВозьмиМеня"
        description="Самовывоз техники 24/7 и получение через постамат в Москве: камеры, колонки, пылесосы и пароочистители по согласованию с менеджером."
        keywords="самовывоз техники 24/7, постамат аренда техники, забрать камеру ночью, аренда техники самовывоз москва"
        url="https://vozmimenya.ru/samovyvoz-24-7-postamat"
        structuredData={faqStructuredData}
      />

      <section className="bg-gradient-to-br from-[#0F172A] to-[#1D4ED8] py-16 text-white md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-blue-200">Получение без ожидания курьера</span>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Самовывоз 24/7 и постамат для аренды техники
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-blue-100">
              Если техника нужна к раннему выезду, празднику, съемке или уборке после работы, можно согласовать самовывоз или выдачу через постамат. Менеджер подтвердит точку, время и комплект до выдачи.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={getTelegramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('telegram_click', { source: 'selfpickup_postamat_hero' })}
                className="btn bg-white text-primary hover:bg-blue-50"
              >
                Согласовать самовывоз
              </a>
              <Link to="/delivery" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
                Все условия получения
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Clock, title: '24/7 по согласованию', text: 'Подходит для ранних поездок, поздних возвратов и аренды на выходные.' },
            { icon: MapPin, title: 'Офис или постамат', text: 'Менеджер подскажет удобный вариант под модель, комплект и срок.' },
            { icon: PackageCheck, title: 'Комплект проверяется', text: 'Перед выдачей важно сверить аккумуляторы, кабели, насадки, мешки или крепления.' },
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
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Когда удобно</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Самовывоз особенно полезен, когда время важнее доставки</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {goodFor.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <TimerReset className="h-6 w-6 text-[#2563EB]" />
              <h2 className="text-2xl font-extrabold text-gray-900">Как согласовать получение</h2>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-xl bg-[#F8FAFC] p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">{index + 1}</span>
                  <p className="text-sm leading-relaxed text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <ShieldCheck className="mb-4 h-7 w-7 text-[#2563EB]" />
            <h2 className="text-xl font-extrabold text-gray-900">Что написать менеджеру</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Укажите модель, даты, удобное время, самовывоз или постамат, а также сценарий: поездка, вечеринка, уборка, съемка или мероприятие.
            </p>
            <a
              href={getTelegramUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('telegram_click', { source: 'selfpickup_postamat_cta' })}
              className="btn mt-5 inline-flex bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Написать в Telegram
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-3">
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
