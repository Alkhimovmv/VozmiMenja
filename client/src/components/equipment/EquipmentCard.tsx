import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Equipment } from '../../types'
import { getImageUrl } from '../../lib/utils'
import BookingForm from './BookingForm'

interface EquipmentCardProps {
  equipment: Equipment
  priority?: boolean // Для первого изображения на странице (LCP оптимизация)
}

export default function EquipmentCard({ equipment, priority = false }: EquipmentCardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Расчет минимальной цены из pricing
  const getMinPrice = () => {
    if (equipment.pricing) {
      const prices = [
        equipment.pricing.day1_10to20,
        equipment.pricing.day1,
        equipment.pricing.days2,
        equipment.pricing.days3,
        equipment.pricing.days7,
        equipment.pricing.days14,
        equipment.pricing.days30
      ].filter(p => p > 0) // Фильтруем нулевые значения
      return prices.length > 0 ? Math.min(...prices) : equipment.pricePerDay
    }
    return equipment.pricePerDay
  }

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1">
        {/* Кликабельная область - изображение и информация */}
        <Link to={`/equipment/${equipment.id}`} className="block">
          {/* Image */}
          <div className="relative bg-gray-50 rounded-t-2xl overflow-hidden aspect-[4/3]">
            <img
              src={getImageUrl(equipment.images[0])}
              alt={`Аренда ${equipment.name} в Москве - ${equipment.category}`}
              className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Category */}
            <div className="inline-block px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full mb-3">
              {equipment.category}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {equipment.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {equipment.description}
            </p>

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  от {formatPrice(getMinPrice())}
                </span>
                <span className="text-sm font-normal text-gray-500">/день</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Action button - вне Link чтобы не переходить на детали */}
        <div className="p-5 pt-0">
          <button
            className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowBookingForm(true)
            }}
          >
            Арендовать
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <BookingForm
          equipment={equipment}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </>
  )
}