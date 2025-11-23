import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import SEO from '../components/SEO'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "Как забронировать оборудование?",
    answer: "Выберите нужное оборудование в каталоге, укажите даты аренды и заполните форму бронирования. Мы свяжемся с вами для подтверждения в течение 2 часов."
  },
  {
    question: "Какие способы оплаты доступны?",
    answer: "Принимаем наличные при получении оборудования, банковские карты онлайн, безналичный расчет для юридических лиц. Также возможна оплата через электронные кошельки."
  },
  {
    question: "Нужно ли вносить залог?",
    answer: "Если у вас постоянная прописка в Москве или МО залог не требуется, в остальных случаях залог может потребоваться для дорогостоящей техники и составляет 20-50% от стоимости оборудования. Залог возвращается при возврате техники в исправном состоянии."
  },
  {
    question: "Доставляете ли вы оборудование?",
    answer: "Да, мы предоставляем услуги доставки по Москве и области. Стоимость доставки зависит от удаленности и веса оборудования. Также доступен самовывоз из нашего офиса."
  },
  {
    question: "Что делать, если оборудование сломалось?",
    answer: "Немедленно сообщите нам о поломке по телефону +7 (993) 363-64-64. Наши специалисты оперативно заменят неисправное оборудование или проведут ремонт на месте."
  },
  {
    question: "Можно ли продлить аренду?",
    answer: "Да, продление аренды возможно при наличии свободного оборудования. Свяжитесь с нами заранее для согласования продления и доплаты."
  },
  {
    question: "Предоставляете ли вы инструкции по использованию?",
    answer: "Обязательно! С каждым оборудованием предоставляются подробные инструкции на русском языке. Также наши специалисты проводят краткий инструктаж при передаче техники."
  },
  {
    question: "Какая техническая поддержка доступна?",
    answer: "Мы предоставляем круглосуточную техническую поддержку по телефону. Если возникли проблемы с оборудованием, наши эксперты помогут решить их удаленно или приедут на место."
  },
  {
    question: "Можно ли отменить бронирование?",
    answer: "Отмена возможна не позднее чем за 24 часа до начала аренды без штрафов. При отмене менее чем за 24 часа взимается штраф 50% от стоимости."
  },
  {
    question: "Работаете ли вы с юридическими лицами?",
    answer: "Да, мы активно сотрудничаем с компаниями. Предоставляем все необходимые документы, работаем по договорам, принимаем безналичную оплату с НДС."
  },
  {
    question: "Какое состояние оборудования?",
    answer: "Все оборудование проходит тщательную проверку и обслуживание перед каждой арендой. Мы гарантируем полную работоспособность и отличное техническое состояние."
  },
  {
    question: "Предоставляете ли скидки при долгосрочной аренде?",
    answer: "Да, для аренды свыше 7 дней действуют специальные тарифы со скидками до 70%. Чем дольше срок аренды, тем больше скидка."
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // FAQPage structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Часто задаваемые вопросы - FAQ | ВозьмиМеня"
        description="Ответы на популярные вопросы об аренде оборудования: оплата, доставка, залог, продление аренды и техническая поддержка."
        keywords="вопросы аренда оборудования, faq аренда, как арендовать технику, доставка оборудования"
        url="https://vozmimenya.ru/faq"
        structuredData={faqStructuredData}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Часто задаваемые вопросы</h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Ответы на популярные вопросы о нашем сервисе
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>

                  {openIndex === index && (
                    <div className="px-6 pb-4">
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Не нашли ответ на свой вопрос?
              </h2>
              <p className="text-gray-600 mb-6">
                Свяжитесь с нами, и мы с радостью поможем вам
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+74951234567"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Позвонить: +7 (993) 363-64-64
                </a>
                <a
                  href="mailto:alkhimovmv@yandex.ru"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Написать: alkhimovmv@yandex.ru
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}