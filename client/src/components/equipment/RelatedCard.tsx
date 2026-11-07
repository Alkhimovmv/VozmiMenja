import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Equipment } from '../../types'
import { getImageSrcSet, getImageUrl } from '../../lib/utils'
import { getOneDayPrice, getPeriodPrice } from '../../utils/pricing'
import { equipmentPath } from '../../lib/equipmentUrls'

interface RelatedCardProps {
  equipment: Equipment
}

export default function RelatedCard({ equipment }: RelatedCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const getMinPrice = () => getOneDayPrice(equipment.pricing, equipment.pricePerDay)
  const getWeekPrice = () => getPeriodPrice(equipment.pricing, 7, equipment.pricePerDay)

  return (
    <Link
      to={equipmentPath(equipment)}
      className="group bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden block"
    >
      {/* Image */}
      <div className="relative bg-white aspect-[4/3] overflow-hidden">
        <img
          src={getImageUrl(equipment.images[0])}
          srcSet={getImageSrcSet(equipment.imageVariants?.[equipment.images[0]])}
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
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
            <div className="text-xs text-muted">{formatPrice(getWeekPrice())} за 7 суток</div>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary bg-blue-50 px-3 py-1.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
            Подробнее <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
