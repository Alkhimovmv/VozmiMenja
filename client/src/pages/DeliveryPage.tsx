import { Truck, MapPin, Clock, Banknote, CheckCircle, AlertCircle } from 'lucide-react'

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Условия доставки
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Удобная доставка оборудования по Москве и Московской области
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Delivery Options */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Варианты получения оборудования
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Self-pickup */}
              <div className="border-2 border-primary-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-8 h-8 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Самовывоз</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Забрать оборудование можно по адресу:
                </p>
                <p className="font-semibold text-gray-900 mb-2">
                  г. Москва, ул. Федора Полетаева, д. 15к3
                </p>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">Круглосуточно, 24/7</span>
                </div>
                <div className="mt-4 bg-green-50 text-green-800 px-4 py-2 rounded-lg inline-block">
                  <span className="font-semibold">Бесплатно</span>
                </div>
              </div>

              {/* Delivery */}
              <div className="border-2 border-primary-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Truck className="w-8 h-8 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Доставка</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Доставим оборудование по указанному адресу в удобное для вас время
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">По Москве: от 300₽</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">По области: от 700₽</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Доставка в день заказа</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Terms */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Условия доставки
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Заказ доставки</h3>
                  <p className="text-gray-600">
                    Доставка заказывается при оформлении бронирования или по телефону.
                    Укажите желаемое время и адрес доставки.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Время доставки</h3>
                  <p className="text-gray-600">
                    Стандартная доставка осуществляется в течение 2-4 часов после подтверждения заказа.
                    Возможна срочная доставка за дополнительную плату.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Проверка оборудования</h3>
                  <p className="text-gray-600">
                    При получении обязательно проверьте комплектность и работоспособность оборудования
                    в присутствии курьера.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                  <span className="text-primary-600 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Возврат оборудования</h3>
                  <p className="text-gray-600">
                    Можем забрать оборудование по тому же адресу после окончания аренды.
                    Стоимость обратной доставки такая же, как при доставке.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <Banknote className="w-8 h-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Оплата доставки
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">
                  Наличными курьеру при получении
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">
                  Картой курьеру (при наличии терминала)
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">
                  Переводом по номеру телефона
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">
                  Безналичный расчет по счету (для юридических лиц)
                </p>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Важная информация</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Стоимость доставки рассчитывается индивидуально в зависимости от расстояния</li>
                  <li>• Для крупногабаритного оборудования может потребоваться дополнительная оплата</li>
                  <li>• Точное время доставки согласовывается с менеджером</li>
                  <li>• Бесплатная доставка при заказе от 10 000₽ в пределах Москвы</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-8 text-center bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Остались вопросы о доставке?
            </h3>
            <p className="text-gray-600 mb-6">
              Свяжитесь с нами, и мы ответим на все ваши вопросы
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+79933636464"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Truck className="w-5 h-5 mr-2" />
                Заказать доставку
              </a>
              <a
                href="https://wa.me/79933636464"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
