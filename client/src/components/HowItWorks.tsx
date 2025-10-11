import { Search, FileCheck, Truck, CheckCircle, MessageCircle, Calendar } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Выберите оборудование',
      description: 'Найдите нужную технику в каталоге и ознакомьтесь с описанием и ценами'
    },
    {
      icon: Calendar,
      title: 'Укажите даты аренды',
      description: 'Выберите период аренды и заполните форму бронирования'
    },
    {
      icon: MessageCircle,
      title: 'Подтверждение заявки',
      description: 'Мы свяжемся с вами для подтверждения заказа и уточнения деталей'
    },
    {
      icon: FileCheck,
      title: 'Оформление договора',
      description: 'Подписываем договор аренды и согласовываем условия доставки'
    },
    {
      icon: Truck,
      title: 'Доставка или самовывоз',
      description: 'Доставим оборудование по адресу или организуем самовывоз'
    },
    {
      icon: CheckCircle,
      title: 'Используйте технику',
      description: 'Работайте с оборудованием в указанный период. По окончании аренды возвращаете технику'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Как это работает
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Простой процесс аренды оборудования всего за 6 шагов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {index + 1}
                </div>
                <div className="flex flex-col items-center text-center pt-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Остались вопросы? Мы всегда на связи!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+79175255095"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Позвонить нам
            </a>
            <a
              href="https://wa.me/79175255095"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
