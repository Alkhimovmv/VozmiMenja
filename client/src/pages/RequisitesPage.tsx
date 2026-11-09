import SEO from '../components/SEO'
import legal from '../content/legal.json'

export default function RequisitesPage() {
  const rows = legal.requisites

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Реквизиты ВозьмиМеня — ИП Алхимова С.В."
        description="Реквизиты сервиса аренды ВозьмиМеня: ИП Алхимова Софья Вадимовна, ИНН, ОГРНИП, расчетный счет, контакты и режим работы."
        url="https://vozmimenya.ru/requisites"
      />
      <section className="bg-gradient-to-br from-[#1D4ED8] to-[#0F172A] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Реквизиты</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">ИП Алхимова Софья Вадимовна</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {rows.map((row, i) => (
              <div key={row.label} className={`flex gap-4 px-6 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <span className="text-gray-400 text-sm w-44 flex-shrink-0">{row.label}</span>
                <span className="text-gray-900 text-sm font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Офисы для самовывоза</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xs">1</span>
                <div>
                  <p className="font-semibold text-gray-900">м. Волжская</p>
                  <p>г. Москва, Волжский бульвар, 51с15</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xs">2</span>
                <div>
                  <p className="font-semibold text-gray-900">м. Динамо</p>
                  <p>г. Москва, ул. Расковой, 1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
