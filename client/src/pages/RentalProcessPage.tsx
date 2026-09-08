import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle, ClipboardCheck, MessageCircle, PackageCheck, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import SEO from '../components/SEO'
import { trackEvent } from '../lib/analytics'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl } from '../lib/contactLinks'

const processSteps = [
  {
    icon: MessageCircle,
    title: '1. Заявка или сообщение',
    text: 'Вы выбираете технику на сайте или пишете в Telegram. Лучше сразу указать сценарий: вечеринка, поездка, ремонт, диван, плитка или салон авто.',
  },
  {
    icon: ClipboardCheck,
    title: '2. Подтверждаем модель и комплект',
    text: 'Менеджер проверяет наличие, срок, доставку, залог и допы: микрофон, крепления, батареи, карту памяти, мешок, фильтр, насадку или химию.',
  },
  {
    icon: ShieldCheck,
    title: '3. Документы и условия',
    text: 'До выдачи подтверждаем, что потребуется по документам и залогу. Обычно нужен паспорт, а условия залога зависят от модели, срока и истории клиента.',
  },
  {
    icon: Truck,
    title: '4. Получение техники',
    text: 'Можно согласовать доставку по Москве, самовывоз или постамат. При получении важно проверить комплектность и базовую работоспособность.',
  },
  {
    icon: RefreshCw,
    title: '5. Продление или возврат',
    text: 'Если понимаете, что не успеваете, напишите заранее: продление возможно, если техника свободна на следующие даты.',
  },
]

const rentInsteadBuy = [
  {
    title: 'Не покупаете дорогую технику ради одной задачи',
    text: 'PartyBox для праздника, GoPro для поездки, Puzzi для дивана или WD5 после ремонта нужны не каждый день.',
  },
  {
    title: 'Можно взять комплект под задачу',
    text: 'Камера без батареи, колонка без микрофона или пылесос без нужной насадки часто создают лишнюю суету. В аренде комплект можно обсудить сразу.',
  },
  {
    title: 'Легче протестировать перед покупкой',
    text: 'Если сомневаетесь между GoPro, Osmo Pocket и Insta360 — аренда на день-два честнее любого обзора.',
  },
  {
    title: 'Менеджер помогает не ошибиться',
    text: 'Puzzi не собирает строительную пыль, WD5 не чистит диван, SC4 не заменяет моющий пылесос. Лучше уточнить сценарий до выдачи.',
  },
]

const categoryLinks = [
  { href: '/arenda-kolonki-dlya-vecherinki-moskva', title: 'Колонка для вечеринки', text: 'PartyBox 320/710, микрофон, доставка к празднику.' },
  { href: '/arenda-kamery-dlya-puteshestviya-vloga-moskva', title: 'Камера для поездки и влога', text: 'GoPro, Osmo Pocket, Insta360, крепления и звук.' },
  { href: '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva', title: 'Пылесос после ремонта', text: 'WD5 для сухой строительной пыли и мусора.' },
  { href: '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva', title: 'Puzzi для дивана и ковра', text: 'Моющий пылесос, насадки и подсказка по химии.' },
  { href: '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva', title: 'Пароочиститель для кухни', text: 'SC4 для плитки, швов, санузла и твердых поверхностей.' },
]

const faq = [
  {
    question: 'Когда аренда выгоднее покупки?',
    answer: 'Когда техника нужна на один день, выходные, поездку, уборку после ремонта или тест перед покупкой. Особенно это заметно на колонках, камерах и Karcher.',
  },
  {
    question: 'Можно ли продлить аренду?',
    answer: 'Да, если оборудование свободно на следующие даты. Лучше написать заранее до окончания срока, чтобы менеджер успел подтвердить продление.',
  },
  {
    question: 'Как понять, нужен ли залог?',
    answer: 'Условия зависят от модели, срока, способа получения и истории клиента. Мы подтверждаем залог до выдачи, чтобы не было сюрпризов на месте.',
  },
  {
    question: 'Что написать менеджеру, чтобы быстрее подтвердить бронь?',
    answer: 'Укажите модель, даты, задачу, адрес/самовывоз и допы: микрофон, крепления, батареи, карту памяти, насадки, мешки, фильтры или химию.',
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

export default function RentalProcessPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Как проходит аренда техники в Москве | ВозьмиМеня"
        description="Как арендовать технику вместо покупки: заявка, подбор комплекта, залог, доставка, получение, продление и возврат оборудования."
        keywords="как арендовать технику, аренда техники вместо покупки, условия аренды оборудования, продлить аренду техники"
        url="https://vozmimenya.ru/kak-prohodit-arenda-tehniki"
        structuredData={faqStructuredData}
      />

      <section className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Аренда без лишней суеты</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Как проходит аренда техники
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mb-8">
              Аренда удобна, когда техника нужна для конкретной задачи: праздник, поездка, ремонт, химчистка дивана или уборка кухни. Вы не покупаете аппарат ради одного случая — берете нужную модель и комплект на нужный срок.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={getTelegramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('telegram_click', { source: 'rental_process_hero' })}
                className="btn bg-white text-primary hover:bg-blue-50 shadow-sm"
              >
                Подобрать технику в Telegram
              </a>
              <Link to="/" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
                Смотреть каталог
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-5 md:grid-cols-4">
            {[
              ['1 день', 'можно взять на короткую задачу'],
              ['2–4 часа', 'ориентир быстрой доставки после подтверждения'],
              ['24/7', 'самовывоз/постамат по согласованию'],
              ['Продление', 'если техника свободна на следующие даты'],
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="text-3xl font-extrabold text-gray-900">{value}</div>
                <div className="mt-1 text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Почему не покупать</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Когда аренда выигрывает у покупки</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {rentInsteadBuy.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5">
                <CheckCircle className="mb-4 h-6 w-6 text-emerald-500" />
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Процесс</p>
            <h2 className="text-3xl font-extrabold text-gray-900">От заявки до возврата</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-5">
            {processSteps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div>
                <CalendarClock className="mb-4 h-9 w-9 text-amber-600" />
                <h2 className="text-2xl font-extrabold text-gray-900">Если не успеваете — аренду можно продлить</h2>
              </div>
              <div className="text-sm leading-relaxed text-amber-900">
                Напишите менеджеру до окончания срока аренды. Мы проверим, свободна ли техника дальше, пересчитаем стоимость и согласуем новый срок. Это лучше, чем возвращать аппарат в спешке или получать просрочку.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Популярные задачи</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Выберите сценарий, а не просто модель</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categoryLinks.map((item) => (
              <Link key={item.href} to={item.href} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#2563EB]/30 hover:shadow-md">
                <PackageCheck className="mb-4 h-6 w-6 text-[#2563EB]" />
                <h3 className="font-bold text-gray-900 group-hover:text-[#2563EB]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">Частые вопросы</h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <div key={item.question} className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5">
                <h3 className="font-bold text-gray-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] p-8 text-center text-white md:p-10">
            <h2 className="mb-3 text-2xl font-extrabold">Не уверены, что выбрать?</h2>
            <p className="mx-auto mb-6 max-w-xl text-sm text-blue-100">
              Напишите задачу: что делаете, на какие даты, нужен ли комплект и доставка. Подберем вариант без покупки лишней техники.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a href={getTelegramUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('telegram_click', { source: 'rental_process_bottom_cta' })} className="btn bg-white text-primary hover:bg-blue-50">
                Написать в Telegram
              </a>
              <a href={`tel:${CONTACT_PHONE}`} onClick={() => trackEvent('phone_click', { source: 'rental_process_bottom_cta' })} className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">
                {CONTACT_PHONE_LABEL}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
