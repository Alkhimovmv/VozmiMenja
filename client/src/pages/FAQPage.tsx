import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import SEO from '../components/SEO'
import { trackEvent } from '../lib/analytics'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl } from '../lib/contactLinks'
import faqContent from '../content/faq.json'

interface FAQItem { question: string; answer: string }

const faqData: FAQItem[] = faqContent['/faq']

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
