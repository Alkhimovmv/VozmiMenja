export default function Testimonials() {
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

        <div className="mx-auto rounded-xl overflow-hidden" style={{ width: 'fit-content', maxWidth: '100%' }}>
          <iframe
            src="https://yandex.ru/maps-reviews-widget/206350428739?comments"
            width="640"
            height="600"
            scrolling="no"
            style={{ border: 'none', display: 'block', maxWidth: '100%' }}
            allowFullScreen
            loading="lazy"
            title="Отзывы на Яндекс Картах"
          />
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://yandex.ru/maps/org/vozmi_menya/206350428739/reviews/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Оставить отзыв на Яндекс Картах
          </a>
        </div>
      </div>
    </section>
  )
}
