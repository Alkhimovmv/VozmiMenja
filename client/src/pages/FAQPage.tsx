import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import SEO from '../components/SEO'

interface FAQItem { question: string; answer: string }

const faqData: FAQItem[] = [
  { question: 'Как забронировать оборудование?', answer: 'Выберите нужное оборудование в каталоге, укажите даты аренды и заполните форму бронирования. Мы свяжемся с вами для подтверждения в течение 2 часов.' },
  { question: 'Какие способы оплаты доступны?', answer: 'Принимаем наличные при получении оборудования, банковские карты онлайн, безналичный расчет для юридических лиц. Также возможна оплата через электронные кошельки.' },
  { question: 'Нужно ли вносить залог?', answer: 'Если у вас постоянная прописка в Москве или МО — залог не требуется. В остальных случаях залог может потребоваться для дорогостоящей техники и составляет 20-50% от стоимости. Залог возвращается при возврате техники в исправном состоянии.' },
  { question: 'Доставляете ли вы оборудование?', answer: 'Да, предоставляем услуги доставки по Москве и области. Стоимость зависит от удалённости и веса. Также доступен самовывоз из двух наших офисов.' },
  { question: 'Что делать, если оборудование сломалось?', answer: 'Немедленно сообщите нам о поломке по телефону +7 (993) 363-64-64. Наши специалисты оперативно заменят неисправное оборудование или проведут ремонт на месте.' },
  { question: 'Можно ли продлить аренду?', answer: 'Да, продление возможно при наличии свободного оборудования. Свяжитесь с нами заранее для согласования.' },
  { question: 'Предоставляете ли инструкции по использованию?', answer: 'Обязательно! С каждым оборудованием идут подробные инструкции на русском языке. Также проводим краткий инструктаж при передаче техники.' },
  { question: 'Какая техническая поддержка доступна?', answer: 'Круглосуточная поддержка по телефону. Если возникли проблемы — наши эксперты помогут решить их удалённо или приедут на место.' },
  { question: 'Можно ли отменить бронирование?', answer: 'Отмена возможна не позднее чем за 24 часа до начала аренды без штрафов. При отмене менее чем за 24 часа взимается штраф 50% от стоимости.' },
  { question: 'Работаете ли вы с юридическими лицами?', answer: 'Да, активно сотрудничаем с компаниями. Предоставляем все необходимые документы, работаем по договорам, принимаем безналичную оплату с НДС.' },
  { question: 'Какое состояние оборудования?', answer: 'Всё оборудование проходит тщательную проверку и обслуживание перед каждой арендой. Гарантируем полную работоспособность и отличное техническое состояние.' },
  { question: 'Предоставляете ли скидки при долгосрочной аренде?', answer: 'Да, для аренды свыше 7 дней действуют специальные тарифы со скидками до 70%. Чем дольше срок, тем больше скидка.' },
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
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
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
            <p className="text-gray-500 text-sm mb-6">Свяжитесь с нами, и мы с радостью поможем</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+79933636464"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-2xl transition-colors text-sm">
                Позвонить: +7 (993) 363-64-64
              </a>
              <a href="mailto:alkhimovmv@yandex.ru"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl transition-colors text-sm">
                Написать: alkhimovmv@yandex.ru
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
