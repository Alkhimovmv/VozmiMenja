import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Equipment } from '../../types'
import { getImageUrl } from '../../lib/utils'
import BookingForm from './BookingForm'

interface EquipmentCardProps {
  equipment: Equipment
  priority?: boolean
}

export default function EquipmentCard({ equipment, priority = false }: EquipmentCardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [liked, setLiked] = useState(false)

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
      <div className="md:hidden group bg-white rounded-2xl border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform">
        <Link to={`/equipment/${equipment.id}`} className="flex gap-3 p-3">
          <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-50">
            <img
              src={getImageUrl(equipment.images[0])}
              alt={`Аренда ${equipment.name}`}
              className="w-full h-full object-contain"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{equipment.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{equipment.description}</p>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className="text-base font-bold text-gray-900">
                  {formatPrice(getMinPrice())}
                  <span className="text-xs font-normal text-gray-400 ml-0.5">/сут</span>
                </div>
                <div className="text-[11px] text-gray-400">от {formatPrice(getWeekPrice())}/нед</div>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); setShowBookingForm(true) }}
                className="text-xs font-semibold text-primary bg-blue-50 px-3 py-1.5 rounded-xl"
              >
                Забронировать
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Desktop: вертикальная карточка ── */}
      <div className="hidden md:block group bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <Link to={`/equipment/${equipment.id}`} className="block relative bg-gray-50 aspect-[4/3] overflow-hidden">
          <img
            src={getImageUrl(equipment.images[0])}
            alt={`Аренда ${equipment.name}`}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </Link>
        <div className="p-4">
          <Link to={`/equipment/${equipment.id}`}>
            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 hover:text-[#2563EB] transition-colors">
              {equipment.name}
            </h3>
            <p className="text-xs text-gray-500 mb-3 line-clamp-1">{equipment.description}</p>
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">
                <span className="text-xs font-normal text-gray-500 mr-0.5">от</span>
                {formatPrice(getMinPrice())}
                <span className="text-xs font-normal text-gray-500">/сут</span>
              </div>
              <div className="text-xs text-gray-400">от {formatPrice(getWeekPrice())}/нед</div>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); setShowBookingForm(true) }}
              className="btn-primary text-xs px-4 py-2"
              style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13px' }}
            >
              Забронировать
            </button>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm equipment={equipment} onClose={() => setShowBookingForm(false)} />
      )}
    </>
  )
}
