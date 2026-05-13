import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Equipment } from '../../types'
import { getImageUrl } from '../../lib/utils'

interface RelatedCardProps {
  equipment: Equipment
}

export default function RelatedCard({ equipment }: RelatedCardProps) {
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
    <Link
      to={`/equipment/${equipment.id}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden block"
    >
      {/* Image */}
      <div className="relative bg-white aspect-[4/3] overflow-hidden">
        <img
          src={getImageUrl(equipment.images[0])}
          alt={equipment.name}
          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {equipment.name}
        </h3>
        <p className="text-xs text-muted mb-3 line-clamp-1">{equipment.description}</p>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-xl font-bold text-ink">
              {formatPrice(getMinPrice())}
              <span className="text-sm font-normal text-muted ml-0.5">/сут</span>
            </div>
            <div className="text-xs text-muted">от {formatPrice(getWeekPrice())}/нед</div>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary bg-blue-50 px-3 py-1.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
            Подробнее <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
