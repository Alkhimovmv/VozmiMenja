import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import legal from '../content/legal.json'

const { offer } = legal

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Договор публичной оферты ВозьмиМеня"
        description="Публичная оферта сервиса ВозьмиМеня: условия бронирования, оплаты, передачи, возврата и ответственности при аренде оборудования."
        url="https://vozmimenya.ru/offer"
      />
      <section className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Договор публичной оферты</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Условия аренды оборудования ИП Алхимова С.В.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-sm text-gray-600 leading-relaxed">

            <div className="bg-blue-50 rounded-xl p-4 text-blue-800 text-sm">
              {offer.intro}
            </div>

            {offer.sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                {'paragraphs' in section && section.paragraphs?.map((paragraph, index) => {
                  const [, label, text] = paragraph.match(/^\*\*(.+?)\*\*\s*(.*)$/) || [null, null, paragraph]
                  return (
                    <p key={paragraph} className={index > 0 ? 'mt-2' : undefined}>
                      {label && <strong>{label}</strong>}{label ? ' ' : ''}{text}
                    </p>
                  )
                })}
                {'items' in section && section.items && (
                  <ul className="list-disc pl-5 space-y-1">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>
            ))}

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Возврат и отказ от услуги</h2>
              <p>
                Порядок отказа от бронирования, возврата оборудования и возврата товара при дистанционной покупке опубликован на странице{' '}
                <Link to="/return-policy" className="text-[#2563EB] font-semibold hover:underline">«Возврат и отказ от услуги»</Link>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Реквизиты и контакты</h2>
              <div className="space-y-1">
                <p><strong>{legal.legalName.replace('Индивидуальный предприниматель', 'ИП')}</strong></p>
                {legal.requisites.filter((row) => row.label !== 'Наименование' && row.label !== 'Регистрирующий орган').map((row) => (
                  <p key={row.label}>{row.label}: {row.value}</p>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">{offer.edition}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
