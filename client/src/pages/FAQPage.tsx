import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import SEO from '../components/SEO'
import { trackEvent } from '../lib/analytics'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl } from '../lib/contactLinks'

interface FAQItem { question: string; answer: string }

const faqData: FAQItem[] = [
  { question: 'Как забронировать оборудование?', answer: 'Выберите нужное оборудование в каталоге, укажите даты аренды и заполните форму бронирования. Если нужно быстрее подобрать комплект, напишите в Telegram — менеджер уточнит детали и подтвердит бронь.' },
  { question: 'Что выгоднее: арендовать или купить?', answer: 'Если техника нужна под одну задачу — вечеринку, поездку, уборку после ремонта, химчистку дивана или тест перед покупкой — аренда обычно выгоднее покупки. Вы платите за нужный срок и не храните дорогую технику дома.' },
  { question: 'Как не ошибиться с моделью?', answer: 'Начните со сценария. PartyBox 320 чаще берут для квартиры и дачи, PartyBox 710 — для громкой вечеринки и зала. GoPro — для спорта и креплений, Osmo Pocket — для влога, Insta360 — для 360-ракурсов. WD5 нужен для сухой строительной пыли, Puzzi — для дивана и ковра, SC4 — для плитки и кухни.' },
  { question: 'Какие документы нужны для оформления аренды?', answer: 'При получении оборудования понадобятся фото первой страницы паспорта (ФИО, фото, дата рождения) и фото страницы с пропиской. На скане можно написать «Не для использования» — это допустимо. Данные используются только для проверки личности и удаляются после окончания аренды.' },
  { question: 'Как получить оборудование?', answer: 'Есть три варианта: самовывоз через постамат 24/7 (м. Волжская или м. Динамо) — без ожидания в любое время суток; доставка курьером Яндекс Go по Москве — стоимость зависит от тарифа и времени; личная встреча в офисе в согласованное время.' },
  { question: 'Как работает доставка?', answer: 'Доставку осуществляем через курьеров Яндекс Go. Стоимость зависит от расстояния и времени суток — рассчитывается динамически. Мы передаём оборудование курьеру, он доставляет его вам. Самый быстрый и удобный вариант — постамат: бесплатно и круглосуточно.' },
  { question: 'Как работает постамат?', answer: 'После подтверждения бронирования мы кладём оборудование в ячейку постамата и отправляем вам код для открытия. Забрать и вернуть технику можно в любое время — 24/7, без звонков и ожидания. Постаматы расположены у м. Волжская (Волжский бульвар, 51с15) и м. Динамо (ул. Расковой, 1).' },
  { question: 'Нужно ли вносить залог?', answer: 'Если у вас есть постоянная регистрация в Москве или Московской области, залог не требуется. В остальных случаях залог составляет 50% от стоимости оборудования и возвращается сразу при возврате техники в исправном и чистом состоянии.' },
  { question: 'В каком состоянии нужно вернуть оборудование?', answer: 'Оборудование необходимо вернуть в исправном и чистом состоянии, в полной комплектации. За возврат загрязнённой техники взимается штраф 5 000 рублей. За просрочку возврата начисляется пеня в размере двойной суточной ставки за каждые начатые сутки — с учётом 2 часов форс-мажорной грации.' },
  { question: 'Какие способы оплаты доступны?', answer: 'Принимаем наличные при получении, банковский перевод, а также оплату картой по ссылке. Для юридических лиц доступен безналичный расчёт.' },
  { question: 'Можно ли отменить бронирование?', answer: 'Отмена без штрафа возможна не позднее чем за 24 часа до начала аренды. При отмене менее чем за 24 часа взимается штраф 50% от стоимости аренды.' },
  { question: 'Можно ли продлить аренду?', answer: 'Да, продление возможно при наличии свободного оборудования. Лучше написать заранее до истечения срока аренды: менеджер проверит следующие даты, пересчитает стоимость и согласует новый возврат.' },
  { question: 'Что написать в заявке, чтобы менеджер быстрее подтвердил бронь?', answer: 'Укажите модель, даты, сценарий и допы. Например: “PartyBox на дачу, 20 гостей, нужен микрофон”, “GoPro в поездку, нужны крепления и батарея”, “Puzzi для дивана и ковра, есть пятна”, “WD5 после ремонта, гипсовая пыль”.' },
  { question: 'Что делать, если оборудование сломалось?', answer: 'Немедленно сообщите нам о поломке в Telegram или по телефону +7 (993) 363-64-64. Мы оперативно решим вопрос с заменой или ремонтом.' },
  { question: 'Работаете ли вы с юридическими лицами?', answer: 'Да, активно сотрудничаем с компаниями. Предоставляем все необходимые документы, работаем по договорам, принимаем безналичную оплату.' },
  { question: 'Предоставляете ли скидки при долгосрочной аренде?', answer: 'Да, для аренды свыше 7 дней действуют специальные тарифы. Чем дольше срок — тем выгоднее цена. Уточняйте при оформлении.' },
]

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Часто задаваемые вопросы — FAQ | ВозьмиМеня"
        description="Ответы на популярные вопросы об аренде оборудования: оплата, доставка, залог, продление аренды и техническая поддержка."
        keywords="вопросы аренда оборудования, faq аренда, как арендовать технику"
        url="https://vozmimenya.ru/faq"
        structuredData={faqStructuredData}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Поддержка</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Часто задаваемые вопросы</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Ответы на популярные вопросы о нашем сервисе
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">{faq.question}</h3>
                  {openIndex === index
                    ? <ChevronUp className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Не нашли ответ на свой вопрос?</h2>
            <p className="text-gray-500 text-sm mb-6">Напишите в Telegram — подскажем модель, сроки, доставку и оформление</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/kak-prohodit-arenda-tehniki"
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold px-6 py-3 rounded-2xl transition-colors text-sm"
              >
                Как проходит аренда
              </a>
              <a
                href={getTelegramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('telegram_click', { source: 'faq_cta' })}
                className="bg-[#2AABEE] hover:bg-[#1A9BD8] text-white font-semibold px-6 py-3 rounded-2xl transition-colors text-sm"
              >
                Написать в Telegram
              </a>
              <a
                href={`tel:${CONTACT_PHONE}`}
                onClick={() => trackEvent('phone_click', { source: 'faq_cta' })}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl transition-colors text-sm">
                {CONTACT_PHONE_LABEL}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
