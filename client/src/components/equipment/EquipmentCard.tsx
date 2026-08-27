import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Equipment } from '../../types'
import { getImageUrl } from '../../lib/utils'
import { trackEvent } from '../../lib/analytics'
import { getPeriodPrice } from '../../utils/pricing'
import BookingForm from './BookingForm'

interface EquipmentCardProps {
  equipment: Equipment
  priority?: boolean
}

export default function EquipmentCard({ equipment, priority = false }: EquipmentCardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const dayPrice = equipment.pricing?.day1 || equipment.pricePerDay
  const weekPrice = getPeriodPrice(equipment.pricing, 7, equipment.pricePerDay)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const openBooking = (source: string) => {
    trackEvent('booking_open', { equipment_id: equipment.id, equipment_name: equipment.name, source })
    setShowBookingForm(true)
  }

  return (
    <>
      <article className="md:hidden overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex gap-3 p-3">
          <Link to={`/equipment/${equipment.id}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white">
            <img
              src={getImageUrl(equipment.images[0])}
              alt={`Аренда ${equipment.name}`}
              className="h-full w-full object-contain"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <Link to={`/equipment/${equipment.id}`} className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-semibold text-gray-950">{equipment.name}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-gray-500">{equipment.description}</p>
            </Link>
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span><strong className="text-sm text-gray-950">{formatPrice(dayPrice)}</strong> / сутки</span>
              <span><strong className="text-sm text-gray-950">{formatPrice(weekPrice)}</strong> / 7 суток</span>
            </div>
            <div className="mt-auto flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openBooking('equipment_card_mobile')}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Забронировать
              </button>
              <Link to={`/equipment/${equipment.id}`} className="text-xs font-medium text-gray-600 hover:text-primary">
                Подробнее
              </Link>
            </div>
          </div>
        </div>
      </article>

      <article className="group hidden overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md md:block">
        <Link to={`/equipment/${equipment.id}`} className="block aspect-[4/3] overflow-hidden border-b border-gray-100 bg-white">
          <img
            src={getImageUrl(equipment.images[0])}
            alt={`Аренда ${equipment.name}`}
            className="h-full w-full object-contain p-2"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </Link>
        <div className="p-4">
          <Link to={`/equipment/${equipment.id}`}>
            <h3 className="line-clamp-1 text-base font-semibold text-gray-950 transition-colors group-hover:text-primary">
              {equipment.name}
            </h3>
            <p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-gray-500">{equipment.description}</p>
          </Link>

          <dl className="mt-4 grid grid-cols-2 border-y border-gray-100 py-3">
            <div>
              <dt className="text-[11px] text-gray-500">1 сутки</dt>
              <dd className="mt-0.5 text-base font-semibold text-gray-950">{formatPrice(dayPrice)}</dd>
            </div>
            <div className="border-l border-gray-100 pl-4">
              <dt className="text-[11px] text-gray-500">7 суток</dt>
              <dd className="mt-0.5 text-base font-semibold text-gray-950">{formatPrice(weekPrice)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Link to={`/equipment/${equipment.id}`} className="text-sm font-medium text-gray-600 hover:text-primary">
              Подробнее
            </Link>
            <button
              type="button"
              onClick={() => openBooking('equipment_card_desktop')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Забронировать
            </button>
          </div>
        </div>
      </article>

      {showBookingForm && <BookingForm equipment={equipment} onClose={() => setShowBookingForm(false)} />}
    </>
  )
}
