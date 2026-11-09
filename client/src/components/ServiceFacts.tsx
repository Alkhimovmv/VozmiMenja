import { Link } from 'react-router-dom'
import business from '../content/business.json'
import legal from '../content/legal.json'
import { useEquipment } from '../hooks/useEquipment'
import { getLongTermDailyPrice, getOneDayPrice } from '../utils/pricing'
import type { Equipment } from '../types'

// Те же факты, что пререндер отдаёт без JS (brandDefinition, brandFactsSection, priceOverviewTable
// в scripts/generate-static-route-entrypoints.js): Google индексирует версию после JS, AI-краулеры — статику.

const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(Math.round(price))

const oneDayPrice = (item: Equipment) => getOneDayPrice(item.pricing, item.pricePerDay)

interface ServiceFactsProps {
  showPrices?: boolean
  showLegal?: boolean
}

export default function ServiceFacts({ showPrices = false, showLegal = false }: ServiceFactsProps) {
  const { data } = useEquipment({ limit: 200 })
  const items = (data?.data || []).filter((item) => oneDayPrice(item) > 0)
  const minPrice = items.length ? Math.min(...items.map(oneDayPrice)) : null
  const priceText = minPrice ? `от ${formatPrice(minPrice)} ₽ в сутки` : business.priceRange
  const metros = business.offices.map((office) => `м. ${office.metro}`).join(' и ')
  const rows = [...items].sort((a, b) =>
    String(a.category || '').localeCompare(String(b.category || ''), 'ru') || oneDayPrice(a) - oneDayPrice(b))

  return (
    <section aria-label="Коротко о сервисе" className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 md:p-8">
        <p className="text-gray-700 leading-relaxed">
          {business.name} — сервис краткосрочной аренды техники в Москве: колонки JBL PartyBox, экшн-камеры GoPro, Insta360 и DJI,
          моющие и строительные пылесосы Karcher, пароочистители и микрофоны. Аренда {priceText}, выдача и возврат через постамат 24/7
          у {metros} или доставка курьером по Москве за 2–4 часа, круглосуточно.
        </p>

        <h2 className="mt-6 mb-3 text-xl font-bold text-gray-900">Коротко о сервисе</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {minPrice && (
            <li>
              Цены: от {formatPrice(minPrice)} ₽ в сутки, при аренде от 30 суток цена за сутки ниже —{' '}
              <Link to="/arenda-tehniki-na-mesyac-moskva" className="text-[#2563EB] hover:underline">тарифы на месяц</Link>
            </li>
          )}
          <li>Более 8 лет на рынке и более 5000 клиентов</li>
          <li>
            Самовывоз: {business.offices.length} постамата 24/7 —{' '}
            {business.offices.map((office, index) => (
              <span key={office.id}>
                {index > 0 && '; '}
                <Link to={office.slug} className="text-[#2563EB] hover:underline">м. {office.metro}, {office.streetAddress}</Link>
              </span>
            ))}
          </li>
          <li>
            Доставка по Москве курьером за 2–4 часа, круглосуточно —{' '}
            <Link to="/delivery" className="text-[#2563EB] hover:underline">условия доставки</Link>
          </li>
          <li>
            Залог не нужен при постоянной регистрации в Москве или Московской области —{' '}
            <Link to="/faq" className="text-[#2563EB] hover:underline">условия аренды</Link>
          </li>
          <li>
            Поддержка 24/7: <a href={`tel:${business.telephone}`} className="text-[#2563EB] hover:underline">{business.telephoneLabel}</a>,
            Telegram <a href="https://t.me/VozmiMenyaRent" className="text-[#2563EB] hover:underline">@VozmiMenyaRent</a>
          </li>
          {business.offices.map((office) => 'yandexMaps' in office && office.yandexMaps ? (
            <li key={`rating-${office.id}`}>
              Рейтинг на Яндекс Картах (м. {office.metro}): {String(office.yandexMaps.ratingValue).replace('.', ',')} из 5,{' '}
              {office.yandexMaps.reviewCount} отзывов —{' '}
              <a href={office.yandexMaps.url} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">отзывы на Яндекс Картах</a>
            </li>
          ) : null)}
        </ul>

        {showPrices && rows.length > 0 && (
          <>
            <h2 className="mt-8 mb-3 text-xl font-bold text-gray-900">Цены на аренду техники</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Модель</th>
                    <th className="px-3 py-2 font-semibold">Категория</th>
                    <th className="px-3 py-2 font-semibold">1 сутки</th>
                    <th className="px-3 py-2 font-semibold">Долгая аренда, за сутки</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const longTerm = getLongTermDailyPrice(item.pricing, item.pricePerDay)
                    return (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-3 py-2"><Link to={`/equipment/${item.slug || item.id}`} className="text-[#2563EB] hover:underline">{item.name}</Link></td>
                        <td className="px-3 py-2 text-gray-600">{item.category}</td>
                        <td className="px-3 py-2 font-semibold whitespace-nowrap">{formatPrice(oneDayPrice(item))} ₽</td>
                        <td className="px-3 py-2 text-gray-600">{longTerm ? `от ${formatPrice(longTerm.dailyPrice)} ₽ (от ${longTerm.days} суток)` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showLegal && (
          <>
            <h2 className="mt-8 mb-3 text-xl font-bold text-gray-900">Юридическая информация</h2>
            <p className="text-sm text-gray-700">
              Сервис работает как {legal.legalName}, ИНН {legal.inn}, ОГРНИП {legal.ogrnip}. Аренда оформляется по{' '}
              <Link to="/offer" className="text-[#2563EB] hover:underline">публичной оферте</Link> и{' '}
              <Link to="/rental-agreement" className="text-[#2563EB] hover:underline">договору аренды</Link>; полные{' '}
              <Link to="/requisites" className="text-[#2563EB] hover:underline">реквизиты</Link>.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
