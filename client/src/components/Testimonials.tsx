import avitoIcon from '../assets/avito.png'

const AVITO_URL = 'https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3'

function StarIcon() {
  return (
    <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

const CARD_HEIGHT = 580

export default function Testimonials() {
  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Отзывы клиентов
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Более 5 000 аренд — и каждый клиент может оставить отзыв
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">

          {/* Yandex widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: CARD_HEIGHT }}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#FC3F1D"/>
                <path d="M13.32 7.219h-.88c-1.43 0-2.185.688-2.185 1.808 0 1.27.539 1.909 1.649 2.659l.918.61-2.647 3.985H8.51l2.428-3.658c-1.399-.998-2.188-1.967-2.188-3.516 0-1.967 1.369-3.237 3.646-3.237h2.737v10.41H13.32V7.219z" fill="white"/>
              </svg>
              <span className="font-semibold text-gray-800 text-sm">Яндекс Карты</span>
            </div>
            <iframe
              src="https://yandex.ru/maps-reviews-widget/206350428739?comments"
              width="100%"
              style={{ border: 'none', display: 'block', flex: 1 }}
              allowFullScreen
              loading="lazy"
              title="Отзывы на Яндекс Картах"
            />
          </div>

          {/* Avito block */}
          <div className="flex flex-col gap-4" style={{ height: CARD_HEIGHT }}>

            {/* Big Avito banner */}
            <a
              href={AVITO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl p-6 transition-all hover:scale-[1.01] active:scale-[0.99] flex-1"
              style={{ background: 'linear-gradient(135deg, #00AAFF 0%, #0080CC 100%)' }}
            >
              <div className="flex items-center justify-between">
                <img src={avitoIcon} alt="Avito" className="w-12 h-12 object-contain bg-white rounded-xl p-1.5" />
                <span className="text-white/70 text-sm font-medium">Авито</span>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                  <span className="text-white font-bold ml-1">5.0</span>
                </div>
                <div className="text-white text-4xl font-extrabold mb-1">400+</div>
                <div className="text-white/80 text-sm mb-5">отзывов от реальных клиентов</div>
                <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors text-white font-semibold text-sm px-4 py-2.5 rounded-xl">
                  Смотреть все отзывы
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl font-extrabold text-gray-900 mb-1">5 000+</div>
                <div className="text-gray-500 text-sm">аренд выполнено</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl font-extrabold text-gray-900 mb-1">8+</div>
                <div className="text-gray-500 text-sm">лет на рынке аренды</div>
              </div>
            </div>

            {/* CTA */}
            <a
              href={AVITO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-[#00AAFF] hover:shadow-md transition-all group flex-shrink-0"
            >
              <img src={avitoIcon} alt="Avito" className="w-10 h-10 object-contain flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">Оставить отзыв на Авито</div>
                <div className="text-gray-400 text-xs truncate">После аренды — поделитесь впечатлениями</div>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00AAFF] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

          </div>
        </div>
      </div>
    </section>
  )
}
