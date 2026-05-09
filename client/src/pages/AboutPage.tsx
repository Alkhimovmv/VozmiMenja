export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Профессиональная аренда</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">О компании ВозьмиМеня</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Ваш надёжный партнёр в мире аренды профессионального оборудования
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Mission */}
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] inline-block"></span>
                <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide">Наша миссия</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Делаем профессиональное оборудование доступным
              </h2>
              <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                <p>Мы верим, что каждый должен иметь доступ к качественному оборудованию для воплощения своих идей в жизнь.</p>
                <p>Будь то креативный проект, бизнес-мероприятие или домашние задачи — у нас есть всё необходимое в отличном состоянии.</p>
                <p>Наша цель — предоставить качественные решения по доступным ценам, помогая клиентам реализовывать проекты без необходимости покупки дорогостоящей техники.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Почему выбирают нас?</h3>
              <ul className="space-y-4">
                {[
                  { title: 'Широкий выбор', desc: 'Профессиональное оборудование для любых задач', color: 'bg-[#2563EB]' },
                  { title: 'Выгодные цены', desc: 'Конкурентные тарифы и гибкие условия аренды', color: 'bg-[#7C3AED]' },
                  { title: 'Поддержка 24/7', desc: 'Техническая поддержка и консультации экспертов', color: 'bg-[#F97316]' },
                  { title: 'Быстрая доставка', desc: 'Оперативная обработка заявок и доставка по Москве', color: 'bg-[#22C55E]' },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-10">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest">Наше оборудование</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">Категории оборудования</h2>
              <p className="text-gray-500 text-sm">Всё необходимое для профессиональной работы</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { emoji: '📷', title: 'Камеры и фото', desc: 'Профессиональные камеры, объективы, экшн-камеры для создания качественного контента', bg: 'bg-blue-50', iconBg: 'bg-blue-500' },
                { emoji: '🧹', title: 'Клининговое оборудование', desc: 'Пылесосы, пароочистители, моющие аппараты для профессиональной уборки', bg: 'bg-violet-50', iconBg: 'bg-violet-500' },
                { emoji: '🎤', title: 'Аудиооборудование', desc: 'Микрофоны, звуковое оборудование для записи и трансляций', bg: 'bg-pink-50', iconBg: 'bg-pink-500' },
              ].map((cat) => (
                <div key={cat.title} className={`${cat.bg} rounded-2xl p-8 text-center`}>
                  <div className={`w-16 h-16 ${cat.iconBg} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4`}>
                    {cat.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Наши достижения</h2>
            <p className="text-blue-200 text-sm mb-10">Цифры, которые говорят о нашем опыте и надёжности</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { value: '5000+', label: 'Довольных клиентов', sub: 'За всё время работы' },
                { value: '50+', label: 'Единиц оборудования', sub: 'В наличии и готовы к аренде' },
                { value: '24/7', label: 'Поддержка', sub: 'Всегда на связи с вами' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="text-5xl font-extrabold mb-2">{s.value}</div>
                  <div className="text-white font-semibold mb-1">{s.label}</div>
                  <div className="text-blue-200 text-xs">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
