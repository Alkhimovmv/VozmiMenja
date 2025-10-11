export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <span className="text-sm font-medium text-white/90">Профессиональная аренда оборудования</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight drop-shadow-lg">
              О компании ВозьмиМеня
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed max-w-3xl mx-auto font-light">
              Ваш надежный партнер в мире аренды профессионального оборудования
            </p>
            <p className="text-lg text-white/75 max-w-2xl mx-auto">
              Предоставляем доступ к качественной технике для реализации любых проектов
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    <span className="text-sm font-semibold text-blue-900">Наша миссия</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight">
                    Делаем профессиональное оборудование доступным
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Мы верим, что каждый должен иметь доступ к качественному оборудованию для воплощения своих идей в жизнь.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Будь то креативный проект, бизнес-мероприятие или домашние задачи — у нас есть всё необходимое оборудование в отличном состоянии.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Наша цель — предоставить качественные решения по доступным ценам, помогая клиентам реализовывать проекты без необходимости покупки дорогостоящей техники.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative group bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-10 border border-slate-100 hover:border-purple-200 transform hover:scale-105">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
                    Почему выбирают нас?
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex items-start group/item transform transition-transform hover:translate-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover/item:shadow-xl transition-shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-slate-800 font-semibold text-lg block mb-1">Широкий выбор</span>
                        <span className="text-slate-600">Профессиональное оборудование для любых задач</span>
                      </div>
                    </li>
                    <li className="flex items-start group/item transform transition-transform hover:translate-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover/item:shadow-xl transition-shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-slate-800 font-semibold text-lg block mb-1">Выгодные цены</span>
                        <span className="text-slate-600">Конкурентные тарифы и гибкие условия аренды</span>
                      </div>
                    </li>
                    <li className="flex items-start group/item transform transition-transform hover:translate-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover/item:shadow-xl transition-shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-slate-800 font-semibold text-lg block mb-1">Поддержка 24/7</span>
                        <span className="text-slate-600">Техническая поддержка и консультации экспертов</span>
                      </div>
                    </li>
                    <li className="flex items-start group/item transform transition-transform hover:translate-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover/item:shadow-xl transition-shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-slate-800 font-semibold text-lg block mb-1">Быстрая доставка</span>
                        <span className="text-slate-600">Оперативная обработка заявок и доставка по Москве</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="mb-20">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <span className="text-sm font-semibold text-blue-900">Наше оборудование</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
                  Категории оборудования
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Всё необходимое для профессиональной работы
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 text-center border border-slate-100 hover:border-blue-200 transform hover:-translate-y-3 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="relative mx-auto mb-6 w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform group-hover:scale-110 transition-transform">
                        <span className="text-4xl">📷</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Камеры и фото</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Профессиональные камеры, объективы, экшн-камеры для создания качественного контента
                    </p>
                  </div>
                </div>
                <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 text-center border border-slate-100 hover:border-purple-200 transform hover:-translate-y-3 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="relative mx-auto mb-6 w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform group-hover:scale-110 transition-transform">
                        <span className="text-4xl">🧹</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors">Клининговое оборудование</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Пылесосы, пароочистители, моющие аппараты для профессиональной уборки
                    </p>
                  </div>
                </div>
                <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 text-center border border-slate-100 hover:border-pink-200 transform hover:-translate-y-3 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="relative mx-auto mb-6 w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform group-hover:scale-110 transition-transform">
                        <span className="text-4xl">🎤</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-pink-600 transition-colors">Аудиооборудование</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Микрофоны, звуковое оборудование для записи и трансляций
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-white">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

              <div className="relative z-10 text-center">
                <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                  <span className="text-sm font-medium text-white/90">Статистика</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">Наши достижения</h2>
                <p className="text-lg text-white/80 mb-16 max-w-2xl mx-auto">Цифры, которые говорят о нашем опыте и надежности</p>

                <div className="grid md:grid-cols-3 gap-12">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform">
                        5000+
                      </div>
                      <div className="text-white/90 text-xl font-semibold mb-2">Довольных клиентов</div>
                      <div className="text-white/70 text-sm">За всё время работы</div>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-br from-white to-purple-100 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform">
                        50+
                      </div>
                      <div className="text-white/90 text-xl font-semibold mb-2">Единиц оборудования</div>
                      <div className="text-white/70 text-sm">В наличии и готовы к аренде</div>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-br from-white to-pink-100 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform">
                        24/7
                      </div>
                      <div className="text-white/90 text-xl font-semibold mb-2">Поддержка</div>
                      <div className="text-white/70 text-sm">Всегда на связи с вами</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}