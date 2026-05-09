export default function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Выбираете на сайте',
      description: 'Бронируете онлайн на нужные даты — расчёт стоимости автоматический.',
    },
    {
      num: '2',
      title: 'Доставка 2–4 часа',
      description: 'Привозим по Москве в удобное время. Работаем 24/7 без выходных.',
    },
    {
      num: '3',
      title: 'Пользуетесь',
      description: 'Перед выдачей — проверка комплектации и инструктаж. Без залога для постоянных клиентов.',
    },
    {
      num: '4',
      title: 'Возвращаете',
      description: 'Без скрытых платежей. Поломка по вине производителя — наша забота.',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-2">ПРОСТО И ПРОЗРАЧНО</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Как взять оборудование за{' '}
            <span className="text-[#2563EB]">4 шага</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center text-lg font-bold mb-4">
                {step.num}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-2 w-4 text-gray-300 z-10">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
