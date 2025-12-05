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
                  г. Москва, Волжский бульвар, д. 51, строение 15
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
