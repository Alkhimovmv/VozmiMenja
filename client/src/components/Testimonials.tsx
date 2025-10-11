import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Алексей Иванов',
      role: 'Фотограф',
      rating: 5,
      text: 'Отличный сервис! Арендовал камеру Sony A7 III для фотосессии. Оборудование в идеальном состоянии, быстрая доставка. Обязательно обращусь снова!',
      date: '2 недели назад'
    },
    {
      name: 'Мария Петрова',
      role: 'Организатор мероприятий',
      rating: 5,
      text: 'Арендовали аудиооборудование для корпоратива. Всё прошло на высшем уровне! Техника качественная, персонал помог с настройкой. Рекомендую!',
      date: '1 месяц назад'
    },
    {
      name: 'Дмитрий Соколов',
      role: 'Видеограф',
      rating: 5,
      text: 'Регулярно беру технику в аренду для съёмок. Всегда довольны качеством оборудования и сервисом. Цены адекватные, условия прозрачные.',
      date: '3 недели назад'
    },
    {
      name: 'Елена Смирнова',
      role: 'Владелец клининговой компании',
      rating: 5,
      text: 'Взяли в аренду профессиональное клининговое оборудование для крупного объекта. Всё работало отлично, помогло выполнить заказ в срок!',
      date: '2 месяца назад'
    },
    {
      name: 'Игорь Кузнецов',
      role: 'Event-менеджер',
      rating: 5,
      text: 'Сотрудничаем уже полгода. Всегда оперативно реагируют на запросы, техника в отличном состоянии. Профессионалы своего дела!',
      date: '1 неделю назад'
    },
    {
      name: 'Ольга Васильева',
      role: 'Свадебный фотограф',
      rating: 5,
      text: 'Арендовала дополнительное освещение для свадебной съёмки. Качество на высоте, удобная доставка. Спасибо за помощь!',
      date: '3 недели назад'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Отзывы наших клиентов
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы ценим доверие каждого клиента и стремимся предоставлять лучший сервис
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary-200" />

              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              <p className="text-sm text-gray-500">
                {testimonial.date}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Хотите оставить свой отзыв?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Связаться с нами
          </a>
        </div>
      </div>
    </section>
  )
}
