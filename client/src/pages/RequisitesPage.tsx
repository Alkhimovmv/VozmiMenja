export default function RequisitesPage() {
  const rows = [
    { label: 'Наименование', value: 'Индивидуальный предприниматель Алхимова Софья Вадимовна' },
    { label: 'ОГРНИП', value: '326670000005031' },
    { label: 'Регистрирующий орган', value: 'Межрайонная инспекция ФНС России по Смоленской области' },
    { label: 'ИНН', value: '672403445744' },
    { label: 'Юридический адрес', value: '216400, Россия, Смоленская обл., г. Десногорск, мкр. 4, д. 18, сек. 2, кв. 81' },
    { label: 'Режим работы', value: 'Ежедневно с 10:00 до 22:00, выдача через постамат — круглосуточно' },
    { label: 'Расчётный счёт', value: '40802810600009319726' },
    { label: 'Банк', value: 'АО «ТБанк»' },
    { label: 'БИК банка', value: '044525974' },
    { label: 'ИНН банка', value: '7710140679' },
    { label: 'Корр. счёт банка', value: '30101810145250000974' },
    { label: 'Адрес банка', value: '127287, г. Москва, ул. Хуторская 2-я, д. 38А, стр. 26' },
    { label: 'Телефон', value: '+7 (993) 363-64-64' },
    { label: 'Email', value: 'alkhimovmv@yandex.ru' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16">
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
