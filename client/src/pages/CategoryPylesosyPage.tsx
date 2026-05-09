import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEquipment } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import SEO from '../components/SEO'
import HowItWorks from '../components/HowItWorks'
import { Check, Star, Clock, Shield, Truck } from 'lucide-react'

export default function CategoryPylesosyPage() {
  const [page] = useState(1)
  const category = 'Пылесосы, уборка и клининг'

  const { data, isLoading, error } = useEquipment({ page, limit: 12, category })

  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const categoryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Аренда пылесосов в Москве',
    description: 'Профессиональные строительные и промышленные пылесосы в аренду. Низкие цены от 400₽/день. Доставка по Москве.',
    url: 'https://vozmimenya.ru/arenda-pylesosov-moskva',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: data?.data?.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: item.name,
          image: `https://vozmimenya.ru${item.images[0]}`,
          offers: { '@type': 'Offer', price: item.pricePerDay, priceCurrency: 'RUB' },
        },
      })) || [],
    },
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Сколько стоит аренда пылесоса в Москве?', acceptedAnswer: { '@type': 'Answer', text: 'Стоимость аренды пылесосов начинается от 400₽ в день. Цена зависит от модели и срока аренды. При аренде на 7+ дней действуют выгодные скидки до 30%.' } },
      { '@type': 'Question', name: 'Какие пылесосы можно взять в аренду?', acceptedAnswer: { '@type': 'Answer', text: 'Мы предлагаем строительные пылесосы для уборки после ремонта, промышленные пылесосы для крупных объектов, моющие пылесосы для химчистки, и профессиональную клининговую технику.' } },
      { '@type': 'Question', name: 'Как быстро можно получить пылесос?', acceptedAnswer: { '@type': 'Answer', text: 'Мы доставляем оборудование по Москве в течение 2-4 часов после оформления заказа. Работаем 24/7 без выходных. Также доступен самовывоз от нашего офиса.' } },
      { '@type': 'Question', name: 'Нужен ли залог при аренде?', acceptedAnswer: { '@type': 'Answer', text: 'Если у вас постоянная прописка в Москве или МО залог не требуется, в остальных случаях залог может потребоваться для дорогостоящей техники и составляет 20-50% от стоимости оборудования. Залог возвращается при возврате техники в исправном состоянии.' } },
      { '@type': 'Question', name: 'Что входит в комплект?', acceptedAnswer: { '@type': 'Answer', text: 'В комплект входит пылесос, набор насадок для разных поверхностей, шланги, инструкция по эксплуатации. Дополнительные фильтры и мешки для пыли предоставляются бесплатно.' } },
    ],
  }

  const advantages = [
    { icon: Clock, title: 'Доставка 2-4 часа', description: 'Быстрая доставка по всей Москве в удобное время' },
    { icon: Shield, title: 'Гарантия качества', description: 'Профессиональное оборудование в отличном состоянии' },
    { icon: Truck, title: 'Бесплатная доставка', description: 'При аренде от 14 дней доставка по Москве бесплатно' },
    { icon: Star, title: '5000+ клиентов', description: 'Более 8 лет на рынке, рейтинг 5.0 из 5.0' },
  ]

  const equipmentTypes = [
    {
      title: 'Строительные пылесосы',
      description: 'Мощные пылесосы для уборки строительного мусора, пыли, бетонной крошки. Идеально подходят для ремонта квартир, офисов, строительных объектов.',
      features: ['Мощность 1200-2000 Вт', 'Объем бака 20-50 литров', 'HEPA фильтры'],
    },
    {
      title: 'Моющие пылесосы',
      description: 'Для влажной уборки и химчистки ковров, мебели, салонов автомобилей. Глубокая очистка с профессиональной химией.',
      features: ['Функция распыления', 'Сбор воды', 'Для любых поверхностей'],
    },
    {
      title: 'Пароочистители',
      description: 'Профессиональная паровая очистка без химии. Идеально для дезинфекции, удаления жира, очистки сантехники и кафельной плитки.',
      features: ['Температура пара до 150°C', 'Уничтожает 99.9% бактерий', 'Набор насадок в комплекте'],
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Аренда пылесосов в Москве от 400₽/день - Строительные и промышленные"
        description="✅ Аренда строительных и промышленных пылесосов в Москве. Низкие цены от 400₽/день. Доставка 24/7. Без залога для постоянных клиентов. ☎️ +7 (993) 363-64-64"
        keywords="аренда пылесосов москва, прокат строительных пылесосов, промышленные пылесосы аренда, клининговое оборудование напрокат, строительный пылесос москва"
        url="https://vozmimenya.ru/arenda-pylesosov-moskva"
        structuredData={[categoryStructuredData, faqStructuredData]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-sm mb-4 text-blue-200">
            <Link to="/" className="hover:text-white">Главная</Link>
            <span className="mx-2">/</span>
            <span>Аренда пылесосов</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Аренда пылесосов в Москве
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8">
            Пылесосы, пароочистители, мойщики окон и клининговое оборудование для любых задач.
            Профессиональная техника от <span className="font-bold text-white">400₽/день</span>. Доставка по Москве за 2-4 часа.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a href="tel:+79933636464" className="btn bg-white text-primary hover:bg-blue-50">
              +7 (993) 363-64-64
            </a>
            <a href="#catalog" className="btn bg-white text-primary hover:bg-blue-50">
              Смотреть каталог
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg">
            {[['400₽', 'от / день'], ['2-4ч', 'доставка'], ['24/7', 'работаем'], ['5000+', 'клиентов']].map(([val, label]) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-extrabold mb-0.5">{val}</div>
                <div className="text-xs text-blue-200">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Оборудование для уборки в аренду</h2>
          <EquipmentGrid equipment={data?.data || []} loading={isLoading} error={error?.message || null} />
        </div>
      </section>

      {/* Advantages */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv) => {
              const Icon = adv.icon
              return (
                <div key={adv.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-gray-500 text-sm">{adv.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Equipment types */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Виды оборудования в аренду</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {equipmentTypes.map((type) => (
              <div key={type.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{type.description}</p>
                <ul className="space-y-2">
                  {type.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* FAQ */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center">Часто задаваемые вопросы</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqStructuredData.mainEntity.map((faq) => (
              <div key={faq.name} className="bg-[#F8FAFC] rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-2">{faq.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] rounded-2xl p-10 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">Готовы арендовать пылесос?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">Позвоните нам или оставьте заявку — доставим оборудование уже сегодня!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+79933636464" className="btn bg-white text-primary hover:bg-blue-50">
                +7 (993) 363-64-64
              </a>
              <a href="https://t.me/VozmiMenyaRent" target="_blank" rel="noopener noreferrer" className="btn bg-white text-primary hover:bg-blue-50">
                Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
