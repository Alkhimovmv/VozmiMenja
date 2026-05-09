import { useState } from 'react'
import CustomSelect from '../components/ui/CustomSelect'
import { apiClient } from '../lib/api'
import avitoIcon from '../assets/avito.png'
import maxIcon from '../assets/max.png'

export default function ContactPage() {
  const [subject, setSubject] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const subjectOptions = [
    { value: '', label: 'Выберите тему' },
    { value: 'rental', label: 'Аренда оборудования' },
    { value: 'support', label: 'Техническая поддержка' },
    { value: 'partnership', label: 'Сотрудничество' },
    { value: 'other', label: 'Другое' },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    try {
      await apiClient.sendContactMessage({ ...formData, subject })
      setSubmitStatus('success')
      setFormData({ name: '', phone: '', email: '', message: '' })
      setSubject('')
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            Мы на связи
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Контакты</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-2">
            Ответим на все вопросы и поможем подобрать оборудование
          </p>
          <p className="text-blue-200 text-sm">
            Выберите удобный способ связи или заполните форму обратной связи
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Left: contacts */}
            <div>
              {/* Адрес — вверху */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Адреса офисов</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="font-semibold text-gray-900 text-sm">Офис 1 — м. Волжская</p>
                    <p className="text-gray-500 text-xs mt-0.5">Волжский бульвар, 51с15</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="font-semibold text-gray-900 text-sm">Офис 2 — м. Динамо</p>
                    <p className="text-gray-500 text-xs mt-0.5">ул. Расковой, 1</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3">Как с нами связаться</h2>

              <div className="space-y-3 mb-6">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ),
                    bg: 'bg-[#7C3AED]',
                    title: 'Телефон',
                    content: <a href="tel:+79933636464" className="text-gray-700 hover:text-[#2563EB] transition-colors font-medium">+7 (993) 363-64-64</a>,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ),
                    bg: 'bg-[#F97316]',
                    title: 'Email',
                    content: <a href="mailto:alkhimovmv@yandex.ru" className="text-gray-700 hover:text-[#2563EB] transition-colors">alkhimovmv@yandex.ru</a>,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    bg: 'bg-[#22C55E]',
                    title: 'Время работы',
                    content: <span className="text-gray-700">Круглосуточно, 24/7</span>,
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5">{item.title}</h3>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Socials */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Мы в социальных сетях</h3>
                <div className="flex gap-2">
                  <a href="https://t.me/VozmiMenyaRent" target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#2AABEE] rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/79933636464" target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                  <a href="https://max.ru/+79933636464" target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:shadow-sm transition-shadow overflow-hidden">
                    <img src={maxIcon} alt="Max" className="w-7 h-7 object-contain" />
                  </a>
                  <a href="https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3"
                    target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:shadow-sm transition-shadow overflow-hidden">
                    <img src={avitoIcon} alt="Avito" className="w-7 h-7 object-contain" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full">Форма обратной связи</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Напишите нам</h2>

              {submitStatus === 'success' && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-800 text-sm font-medium">Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm font-medium">Ошибка при отправке. Попробуйте позже или позвоните нам.</p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {[
                  { id: 'name', label: 'Имя *', type: 'text', placeholder: 'Ваше имя', required: true },
                  { id: 'phone', label: 'Телефон *', type: 'tel', placeholder: '+7 (___) ___-__-__', required: true },
                  { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: false },
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      required={field.required}
                      value={formData[field.id as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all text-sm"
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1.5">Тема *</label>
                  <CustomSelect
                    id="subject" name="subject" value={subject}
                    onChange={setSubject} options={subjectOptions} placeholder="Выберите тему"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">Сообщение *</label>
                  <textarea
                    id="message" name="message" rows={4} required
                    value={formData.message} onChange={handleInputChange}
                    placeholder="Расскажите подробнее о вашем запросе..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !subject}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Отправка...
                    </>
                  ) : (
                    <>
                      Отправить сообщение
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Map */}
          <div className="mt-10">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full">Наше местоположение</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-1">Как нас найти</h2>
              <p className="text-gray-500 text-sm">Приезжайте к нам в офис или оформите доставку по Москве и МО</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[400px]">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.664186%2C55.739894&z=11&l=map&pt=37.759233%2C55.694097%2Cpm2rdm%7E%D0%92%D0%BE%D0%BB%D0%B6%D1%81%D0%BA%D0%B0%D1%8F~37.569138%2C55.785691%2Cpm2rdm%7E%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%BE"
                width="100%" height="100%"
                style={{ border: 0 }}
                allowFullScreen loading="lazy"
                title="Яндекс карта — офисы ВозьмиМеня"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
