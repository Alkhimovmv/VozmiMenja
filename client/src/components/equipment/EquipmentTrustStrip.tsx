import { Clock, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import business from '../../content/business.json'

const primaryOfficeReviews = business.offices[0].yandexMaps
const reviewsUrl = `${primaryOfficeReviews.url}reviews/`

export default function EquipmentTrustStrip({ onReviewsClick }: { onReviewsClick?: () => void }) {
  const rating = primaryOfficeReviews.ratingValue.toFixed(1).replace('.', ',')

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
      <a
        href={reviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onReviewsClick}
        className="inline-flex items-center gap-1 font-semibold transition-colors hover:text-ink hover:underline"
      >
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
        {rating} · {primaryOfficeReviews.reviewCount} отзывов
      </a>
      <Link
        to="/samovyvoz-24-7-postamat"
        className="inline-flex items-center gap-1 transition-colors hover:text-ink hover:underline"
      >
        <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        Самовывоз 24/7
      </Link>
    </div>
  )
}
