export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Политика использования cookie</h1>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto">
            Документ описывает, какие cookie и технические идентификаторы используются на сайте, для каких целей и как пользователь может ими управлять.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-sm text-gray-600 leading-relaxed">
            <div className="bg-slate-50 rounded-xl p-4 text-slate-700 text-sm">
              Настоящая Политика использования cookie применяется к сайту ВозьмиМеня и объясняет использование cookie-файлов,
              аналогичных технологий и метрических систем при посещении страниц сайта.
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Что такое cookie</h2>
              <p>
                Cookie-файлы — это небольшие текстовые файлы, которые сохраняются в браузере пользователя и помогают
                распознавать устройство, сохранять пользовательские настройки, а также анализировать работу сайта.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Какие cookie мы используем</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Технические cookie для корректной работы сайта и интерфейса.</li>
                <li>Функциональные cookie для сохранения пользовательских предпочтений, например согласия на использование cookie.</li>
                <li>Аналитические идентификаторы для подсчёта посещаемости, анализа поведения пользователей и улучшения сервиса.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Метрические системы</h2>
              <p className="mb-2">
                На сайте используется Яндекс.Метрика, которая может собирать обезличенные или технические данные о посещении,
                включая IP-адрес, параметры устройства, сведения о браузере, cookie, источник перехода, действия пользователя на сайте и данные сессии.
              </p>
              <p>
                Эти данные используются для анализа трафика, выявления ошибок и повышения удобства использования сайта.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Как управлять cookie</h2>
              <p>
                Пользователь может удалить cookie или ограничить их использование через настройки браузера.
                Отключение части cookie может повлиять на корректность работы отдельных функций сайта.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Контакты</h2>
              <p className="mb-2">По вопросам использования cookie и обработки персональных данных обращайтесь:</p>
              <div className="space-y-1">
                <p><strong>ИП Алхимова Софья Вадимовна</strong></p>
                <p>Email: alkhimovmv@yandex.ru</p>
                <p>Телефон: +7 (993) 363-64-64</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Последнее обновление: 19 августа 2026 года</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
