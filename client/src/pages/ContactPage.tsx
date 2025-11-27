import { useState } from 'react'
import CustomSelect from '../components/ui/CustomSelect'
import { apiClient } from '../lib/api'
import avitoIcon from '../assets/avito.png'

export default function ContactPage() {
  const [subject, setSubject] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const subjectOptions = [
    { value: '', label: 'Выберите тему' },
    { value: 'rental', label: 'Аренда оборудования' },
    { value: 'support', label: 'Техническая поддержка' },
    { value: 'partnership', label: 'Сотрудничество' },
    { value: 'other', label: 'Другое' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await apiClient.sendContactMessage({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject,
        message: formData.message
      })

      setSubmitStatus('success')
      setFormData({ name: '', phone: '', email: '', message: '' })
      setSubject('')

      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <span className="text-sm font-medium text-white/90">Мы на связи</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight drop-shadow-lg">
              Свяжитесь с нами
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed max-w-3xl mx-auto font-light">
              Ответим на все вопросы и поможем подобрать оборудование
            </p>
            <p className="text-lg text-white/75 max-w-2xl mx-auto">
              Выберите удобный способ связи или заполните форму обратной связи
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    <span className="text-sm font-semibold text-blue-900">Контактная информация</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight">
                    Как с нами связаться
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="group flex items-start space-x-5 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:scale-105">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">Адрес офиса</h3>
                      <p className="text-slate-600 leading-relaxed">г. Москва, ул. Федора Полетаева, 15к3</p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-5 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-purple-200 hover:scale-105">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">Телефон</h3>
                      <a href="tel:+79933636464" className="text-slate-600 hover:text-purple-600 transition-colors text-lg font-medium">
                        +7 (993) 363-64-64
                      </a>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-5 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-pink-200 hover:scale-105">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">Email</h3>
                      <a href="mailto:alkhimovmv@yandex.ru" className="text-slate-600 hover:text-pink-600 transition-colors block">
                        alkhimovmv@yandex.ru
                      </a>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-5 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-orange-200 hover:scale-105">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">Время работы</h3>
                      <p className="text-slate-600">Круглосуточно, 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="font-bold text-slate-900 text-xl mb-6">Мы в социальных сетях</h3>
                  <div className="flex gap-4">
                    <a
                      href="tg://resolve?domain=@vozmimenya_bot&start=chat79933636464"
                      onClick={(e) => {
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                        if (!isMobile) {
                          e.preventDefault()
                          window.open('https://t.me/VozmiMenyaRent', '_blank')
                        }
                      }}
                      className="group/social relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 hover:scale-110"
                      title="Telegram"
                    >
                      <div className="absolute inset-0 bg-blue-600 rounded-xl blur opacity-0 group-hover/social:opacity-50 transition-opacity"></div>
                      <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </a>
                    <a
                      href="https://wa.me/79933636464"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/social relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 hover:scale-110"
                      title="WhatsApp"
                    >
                      <div className="absolute inset-0 bg-green-600 rounded-xl blur opacity-0 group-hover/social:opacity-50 transition-opacity"></div>
                      <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/social relative w-14 h-14 bg-white rounded-xl flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110"
                      title="Авито"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0AF]/10 to-[#09D]/10 rounded-xl opacity-0 group-hover/social:opacity-100 transition-opacity"></div>
                      <img src={avitoIcon} alt="Avito" className="w-8 h-8 relative z-10 rounded-lg" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-10"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-900">Форма обратной связи</span>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                      Напишите нам
                    </h2>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-green-800 font-medium">Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</p>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-red-800 font-medium">Ошибка при отправке сообщения. Попробуйте позже.</p>
                      </div>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Имя *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-slate-300"
                        placeholder="Ваше имя"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-slate-300"
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-slate-300"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                        Тема *
                      </label>
                      <CustomSelect
                        id="subject"
                        name="subject"
                        value={subject}
                        onChange={setSubject}
                        options={subjectOptions}
                        placeholder="Выберите тему"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                        Сообщение *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-slate-300 resize-none"
                        placeholder="Расскажите подробнее о вашем запросе..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !subject}
                      className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Отправка...
                          </>
                        ) : (
                          <>
                            Отправить сообщение
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <span className="text-sm font-semibold text-blue-900">Наше местоположение</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
                  Как нас найти
                </h2>
                <p className="text-lg text-slate-600">
                  Приезжайте к нам в офис или оформите доставку по Москве и Московской области
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20"></div>
                <div className="relative bg-slate-200 rounded-3xl h-[450px] overflow-hidden shadow-2xl border-4 border-white">
                  <iframe
                    src="https://yandex.ru/map-widget/v1/?ll=37.784785%2C55.710646&z=17&l=map&pt=37.784785%2C55.710646%2Cpm2rdm~ВозьмиМеня%20-%20улица%20Федора%20Полетаева%2C%2015к3"
                    width="100%"
                    height="100%"
                    frameBorder={0}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Яндекс карта - улица Федора Полетаева, 15к3"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
