import { useState, useEffect } from 'react'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import HowItWorks from '../components/HowItWorks'
import { Check, Star, Clock, Shield, Truck, Phone } from 'lucide-react'

export default function CategoryPylesosyPage() {
  const [page] = useState(1)
  const category = 'Пылесосы, уборка и клининг'

  const { data, isLoading, error } = useEquipment({
    page,
    limit: 12,
    category
  })

  // Автоматическая прокрутка к каталогу при загрузке страницы
  useEffect(() => {
    const timer = setTimeout(() => {
      const catalogElement = document.getElementById('catalog')
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Structured data для категории
  const categoryStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Аренда пылесосов в Москве",
    "description": "Профессиональные строительные и промышленные пылесосы в аренду. Низкие цены от 400₽/день. Доставка по Москве.",
    "url": "https://vozmimenya.ru/arenda-pylesosov-moskva",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": data?.data?.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": item.name,
          "image": `https://vozmimenya.ru${item.images[0]}`,
          "offers": {
            "@type": "Offer",
            "price": item.pricePerDay,
            "priceCurrency": "RUB"
          }
        }
      })) || []
    }
  }

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Сколько стоит аренда пылесоса в Москве?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Стоимость аренды пылесосов начинается от 400₽ в день. Цена зависит от модели и срока аренды. При аренде на 7+ дней действуют выгодные скидки до 30%."
        }
      },
      {
        "@type": "Question",
        "name": "Какие пылесосы можно взять в аренду?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Мы предлагаем строительные пылесосы для уборки после ремонта, промышленные пылесосы для крупных объектов, моющие пылесосы для химчистки, и профессиональную клининговую технику."
        }
      },
      {
        "@type": "Question",
        "name": "Как быстро можно получить пылесос?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Мы доставляем оборудование по Москве в течение 2-4 часов после оформления заказа. Работаем 24/7 без выходных. Также доступен самовывоз от нашего офиса."
        }
      },
      {
        "@type": "Question",
        "name": "Нужен ли залог при аренде?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Если у вас постоянная прописка в Москве или МО залог не требуется, в остальных случаях залог может потребоваться для дорогостоящей техники и составляет 20-50% от стоимости оборудования. Залог возвращается при возврате техники в исправном состоянии."
        }
      },
      {
        "@type": "Question",
        "name": "Что входит в комплект?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "В комплект входит пылесос, набор насадок для разных поверхностей, шланги, инструкция по эксплуатации. Дополнительные фильтры и мешки для пыли предоставляются бесплатно."
        }
      }
    ]
  }

  const advantages = [
    {
      icon: Clock,
      title: 'Доставка 2-4 часа',
      description: 'Быстрая доставка по всей Москве в удобное время'
    },
    {
      icon: Shield,
      title: 'Гарантия качества',
      description: 'Профессиональное оборудование в отличном состоянии'
    },
    {
      icon: Truck,
      title: 'Бесплатная доставка',
      description: 'При аренде от 14 дней доставка по Москве бесплатно'
    },
    {
      icon: Star,
      title: '5000+ клиентов',
      description: 'Более 8 лет на рынке, рейтинг 5.0 из 5.0'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Аренда пылесосов в Москве от 400₽/день - Строительные и промышленные"
        description="✅ Аренда строительных и промышленных пылесосов в Москве. Низкие цены от 400₽/день. Доставка 24/7. Без залога для постоянных клиентов. ☎️ +7 (993) 363-64-64"
        keywords="аренда пылесосов москва, прокат строительных пылесосов, промышленные пылесосы аренда, клининговое оборудование напрокат, строительный пылесос москва"
        url="https://vozmimenya.ru/arenda-pylesosov-moskva"
        structuredData={[categoryStructuredData, faqStructuredData]}
      />

      {/* Hero секция */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            {/* Breadcrumbs */}
            <div className="text-sm mb-4 text-blue-100">
              <a href="/" className="hover:text-white">Главная</a>
              <span className="mx-2">/</span>
              <span>Аренда пылесосов</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Аренда пылесосов в Москве
            </h1>

            <p className="text-xl md:text-2xl text-blue-50 mb-8 leading-relaxed">
              Пылесосы, пароочистители, мойщики окон и клининговое оборудование для любых задач.
              Профессиональная техника от <span className="font-bold text-white">400₽/день</span>.
              Доставка по Москве за 2-4 часа.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="tel:+79933636464"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <Phone className="w-5 h-5 mr-2" />
                +7 (993) 363-64-64
              </a>
              <a
                href="#catalog"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Смотреть каталог
              </a>
            </div>

            {/* Преимущества кратко */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">400₽</div>
                <div className="text-sm text-blue-100">от / день</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">2-4ч</div>
                <div className="text-sm text-blue-100">доставка</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-100">работаем</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">5000+</div>
                <div className="text-sm text-blue-100">клиентов</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Каталог */}
      <section id="catalog" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Оборудование для уборки в аренду
          </h2>

          <EquipmentGrid
            equipment={data?.data || []}
            loading={isLoading}
            error={error?.message || null}
          />
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Почему выбирают нас
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600">
                    {advantage.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Виды пылесосов */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Виды оборудования в аренду
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Строительные пылесосы
              </h3>
              <p className="text-gray-600 mb-4">
                Мощные пылесосы для уборки строительного мусора, пыли, бетонной крошки.
                Идеально подходят для ремонта квартир, офисов, строительных объектов.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Мощность 1200-2000 Вт</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Объем бака 20-50 литров</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">HEPA фильтры</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Моющие пылесосы
              </h3>
              <p className="text-gray-600 mb-4">
                Для влажной уборки и химчистки ковров, мебели, салонов автомобилей.
                Глубокая очистка с профессиональной химией.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Функция распыления</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Сбор воды</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Для любых поверхностей</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Пароочистители
              </h3>
              <p className="text-gray-600 mb-4">
                Профессиональная паровая очистка без химии. Идеально для дезинфекции,
                удаления жира, очистки сантехники и кафельной плитки.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Температура пара до 150°C</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Уничтожает 99.9% бактерий</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Набор насадок в комплекте</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <HowItWorks />

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Часто задаваемые вопросы
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqStructuredData.mainEntity.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {faq.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Готовы арендовать пылесос?
          </h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Позвоните нам или оставьте заявку — доставим оборудование уже сегодня!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+79933636464"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              +7 (993) 363-64-64
            </a>
            <a
              href="https://t.me/VozmiMenyaRent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Написать в Telegram
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
