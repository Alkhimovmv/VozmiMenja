import { Truck, MapPin, Clock, Banknote, CheckCircle, AlertCircle, Phone } from 'lucide-react'

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Доставка и самовывоз</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Условия доставки</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Удобная доставка оборудования по Москве и Московской области
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Delivery options */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Варианты получения оборудования</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border-2 border-[#2563EB]/20 bg-blue-50/40 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Самовывоз</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Забрать оборудование можно в одном из наших офисов:</p>
                <div className="space-y-3 mb-4">
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">Офис 1 — м. Волжская</p>
                    <p className="text-gray-500 text-xs mt-0.5">г. Москва, Волжский бульвар, д. 51, стр. 15</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">Офис 2 — м. Динамо</p>
                    <p className="text-gray-500 text-xs mt-0.5">г. Москва, ул. Расковой, д. 1</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Круглосуточно, 24/7</span>
                </div>
                <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">Бесплатно</span>
              </div>

              <div className="rounded-2xl border-2 border-[#2563EB]/20 bg-blue-50/40 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Доставка</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Доставим оборудование по указанному адресу в удобное время</p>
                <div className="space-y-2 mb-4">
                  {[
                    'По Москве: от 300₽',
                    'По области: от 700₽',
                    'Доставка в день заказа',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery steps */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Условия доставки</h2>
            <div className="space-y-5">
              {[
                { n: '1', title: 'Заказ доставки', text: 'Доставка заказывается при оформлении бронирования или по телефону. Укажите желаемое время и адрес доставки.' },
                { n: '2', title: 'Время доставки', text: 'Стандартная доставка в течение 2-4 часов после подтверждения заказа. Возможна срочная доставка за доп. плату.' },
                { n: '3', title: 'Проверка оборудования', text: 'При получении проверьте комплектность и работоспособность в присутствии курьера.' },
                { n: '4', title: 'Возврат оборудования', text: 'Можем забрать оборудование по тому же адресу. Стоимость обратной доставки такая же.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-gray-600 text-sm">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Оплата доставки</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Наличными при получении',
                'Переводом по номеру телефона',
                'Безналичный расчёт (для юр. лиц)',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Важная информация</h3>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {[
                    'Стоимость доставки рассчитывается индивидуально в зависимости от расстояния',
                    'Для крупногабаритного оборудования может потребоваться доп. оплата',
                    'Точное время доставки согласовывается с менеджером',
                  ].map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Остались вопросы о доставке?</h3>
            <p className="text-gray-500 text-sm mb-6">Свяжитесь с нами, и мы ответим на все вопросы</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="tel:+79933636464"
                className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-2xl transition-colors">
                <Phone className="w-4 h-4" /> Заказать доставку
              </a>
              <a href="https://t.me/VozmiMenyaRent" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#2AABEE] hover:bg-[#1A9BD8] text-white font-semibold px-6 py-3 rounded-2xl transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
