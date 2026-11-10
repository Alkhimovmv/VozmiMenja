import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { useEquipment } from '../hooks/useEquipment'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL } from '../lib/contactLinks'
import { trackEvent } from '../lib/analytics'
import { getOneDayPrice } from '../utils/pricing'

// Цена «от» и бронь на первом экране посадочной (тёмный hero): без них на мобильном
// пользователь видел только Telegram и каталог. Цена — по основной технике страницы.

interface HeroPriceCtaProps {
  // Модели, по которым считается «от N ₽/сутки» (минимум суточной цены).
  slugs: string[]
  // Добавляется к цене основной модели (караоке: колонка + микрофоны).
  addonSlugs?: string[]
  bookingHref: string
  source: string
}

const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(Math.round(price))

export default function HeroPriceCta({ slugs, addonSlugs = [], bookingHref, source }: HeroPriceCtaProps) {
  const { data } = useEquipment({ limit: 200 })
  const items = data?.data || []
  const minFor = (wanted: string[]) => {
    const prices = items
      .filter((item) => item.slug && wanted.includes(item.slug))
      .map((item) => getOneDayPrice(item.pricing, item.pricePerDay))
      .filter((price) => price > 0)
    return prices.length ? Math.min(...prices) : null
  }
  const base = minFor(slugs)
  const addon = addonSlugs.length ? minFor(addonSlugs) : 0
  const price = base !== null && addon !== null ? base + addon : null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {price !== null && (
        <span className="rounded-xl bg-white/10 px-4 py-3 text-base font-bold text-white ring-1 ring-white/20">
          от {formatPrice(price)} ₽/сутки
        </span>
      )}
      <Link
        to={bookingHref}
        onClick={() => trackEvent('booking_click', { source })}
        className="inline-flex min-h-11 items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100"
      >
        Забронировать
      </Link>
      <a
        href={`tel:${CONTACT_PHONE}`}
        onClick={() => trackEvent('phone_click', { source })}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white/90 hover:text-white"
      >
        <Phone className="h-4 w-4" />
        {CONTACT_PHONE_LABEL}
      </a>
    </div>
  )
}
