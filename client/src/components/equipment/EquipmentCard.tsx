import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Equipment } from '../../types'

import { getImageUrl } from '../../lib/utils'
import BookingForm from './BookingForm'
import { trackEvent } from '../../lib/analytics'

interface EquipmentCardProps {
  equipment: Equipment
  priority?: boolean
}

export default function EquipmentCard({ equipment, priority = false }: EquipmentCardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const isAvailable = equipment.availableQuantity > 0

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const getMinPrice = () => {
    if (equipment.pricing) {
      const prices = [
        equipment.pricing.day1_10to20,
        equipment.pricing.day1,
        equipment.pricing.days2,
        equipment.pricing.days3,
        equipment.pricing.days7,
        equipment.pricing.days14,
        equipment.pricing.days30,
      ].filter((p) => p > 0)
      return prices.length > 0 ? Math.min(...prices) : equipment.pricePerDay
    }
    return equipment.pricePerDay
  }

  const getWeekPrice = () => {
    if (equipment.pricing?.days7 && equipment.pricing.days7 > 0) {
      return equipment.pricing.days7 * 7
    }
    return getMinPrice() * 7
  }

  return (
    <>
      {/* ── Mobile: горизонтальная карточка ── */}
      <div className="md:hidden group bg-white rounded-2xl border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform shadow-sm">
        <div className="flex gap-3 p-3">
          <Link to={`/equipment/${equipment.id}`} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-[#F8FAFC]" style={{ backgroundColor: '#fff' }}>
            <span className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {isAvailable ? 'В наличии' : 'Под запрос'}
            </span>
            <img
              src={getImageUrl(equipment.images[0])}
              alt={`Аренда ${equipment.name}`}
              className="w-full h-full object-contain bg-white"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          </Link>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <Link to={`/equipment/${equipment.id}`}>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{equipment.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{equipment.description}</p>
              <div className="mt-2">
                <div className="text-base font-extrabold text-gray-900 leading-tight">
                  {formatPrice(getMinPrice())}
                  <span className="text-xs font-normal text-gray-400 ml-0.5">/сут</span>
                </div>
                <div className="text-[11px] text-gray-400">от {formatPrice(getWeekPrice())}/нед</div>
              </div>
            </Link>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  trackEvent('booking_open', { equipment_id: equipment.id, equipment_name: equipment.name, source: 'equipment_card_mobile' })
                  setShowBookingForm(true)
                }}
                className="text-xs font-semibold text-white bg-primary py-2 rounded-xl"
              >
                Забронировать
              </button>
              <Link to={`/equipment/${equipment.id}`} className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                Еще
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop: вертикальная карточка ── */}
      <div className="hidden md:block group bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        <Link to={`/equipment/${equipment.id}`} className="block relative bg-gradient-to-br from-white to-[#F8FAFC] aspect-[4/3] overflow-hidden">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {isAvailable ? 'В наличии' : 'Под запрос'}
            </span>
            {equipment.pricing?.days7 && equipment.pricing.days7 > 0 && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-gray-600 shadow-sm">
                выгодно от 7 дней
              </span>
            )}
          </div>
          <img
            src={getImageUrl(equipment.images[0])}
            alt={`Аренда ${equipment.name}`}
            className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </Link>
        <div className="p-4">
          <Link to={`/equipment/${equipment.id}`}>
            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 hover:text-[#2563EB] transition-colors">
              {equipment.name}
            </h3>
            <p className="text-xs text-gray-500 mb-3 line-clamp-1">{equipment.description}</p>
          </Link>
          <div className="rounded-2xl bg-[#F8FAFC] border border-gray-100 p-3 mb-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">от</div>
                <div className="text-xl font-extrabold text-gray-900 leading-tight">
                  {formatPrice(getMinPrice())}
                  <span className="text-xs font-normal text-gray-500">/сут</span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>неделя</div>
                <div className="font-bold text-gray-600">{formatPrice(getWeekPrice())}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Link to={`/equipment/${equipment.id}`} className="text-sm font-semibold text-gray-600 hover:text-[#2563EB] transition-colors">
              Подробнее
            </Link>
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  trackEvent('booking_open', { equipment_id: equipment.id, equipment_name: equipment.name, source: 'equipment_card_desktop' })
                  setShowBookingForm(true)
                }}
                className="btn-primary text-xs px-4 py-2"
                style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13px' }}
              >
                Забронировать
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm equipment={equipment} onClose={() => setShowBookingForm(false)} />
      )}
    </>
  )
}
