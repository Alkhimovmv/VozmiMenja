import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEquipmentById } from '../hooks/useEquipment'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BookingForm from '../components/equipment/BookingForm'
import SEO from '../components/SEO'
import { ArrowLeft, Check } from 'lucide-react'
import { getImageUrl } from '../lib/utils'

export default function EquipmentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useEquipmentById(id!)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !data?.success || !data.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-2">Ошибка загрузки</div>
        <div className="text-gray-600 mb-4">Оборудование не найдено</div>
        <Link
          to="/"
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться к каталогу</span>
        </Link>
      </div>
    )
  }

  const equipment = data.data

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

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
      ].filter(p => p > 0)
      return prices.length > 0 ? Math.min(...prices) : equipment.pricePerDay
    }
    return equipment.pricePerDay
  }

  // Structured data для товара
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": equipment.name,
    "description": equipment.description,
    "image": equipment.images.map(img => `https://vozmimenya.ru${getImageUrl(img)}`),
    "category": equipment.category,
    "brand": {
      "@type": "Brand",
      "name": "ВозьмиМеня"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://vozmimenya.ru/equipment/${equipment.id}`,
      "priceCurrency": "RUB",
      "price": getMinPrice(),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "ВозьмиМеня"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "37"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`Аренда ${equipment.name} в Москве`}
        description={`${equipment.description} - Аренда от ${formatPrice(getMinPrice())}/день. Быстрая доставка по Москве. Звоните: +7 (993) 363-64-64`}
        keywords={`аренда ${equipment.name}, прокат ${equipment.name}, ${equipment.category} Москва, аренда оборудования`}
        url={`https://vozmimenya.ru/equipment/${equipment.id}`}
        type="product"
        structuredData={productStructuredData}
      />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад к каталогу</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {/* Main image */}
            <div className="mb-4 bg-white rounded-lg overflow-hidden border border-gray-200">
              <img
                src={getImageUrl(equipment.images[selectedImage])}
                alt={equipment.name}
                className="w-full h-96 object-contain shadow-sm"
              />
            </div>

            {/* Thumbnail images */}
            {equipment.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {equipment.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-white ${
                      selectedImage === index
                        ? 'border-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${equipment.name} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="mb-2">
                <span className="text-sm text-primary-600 font-medium">
                  {equipment.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {equipment.name}
              </h1>

              <div className="flex items-baseline gap-1 mb-4 whitespace-nowrap">
                <span className="text-4xl font-bold text-gray-900">
                  от {formatPrice(getMinPrice())}
                </span>
                <span className="text-lg font-normal text-gray-500">/сутки</span>
              </div>

              {/* Pricing tiers */}
              {equipment.pricing && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Стоимость аренды:</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">1 день (10:00-20:00):</span>
                      <span className="font-semibold text-gray-900">{formatPrice(equipment.pricing.day1_10to20)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">1 сутки:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(equipment.pricing.day1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2 суток:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(equipment.pricing.days2)}/сутки</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">3 суток:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(equipment.pricing.days3)}/сутки</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Неделя:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(equipment.pricing.days7)}/сутки</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2 недели:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(equipment.pricing.days14)}/сутки</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Месяц:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(equipment.pricing.days30)}/сутки</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Описание</h2>
              <p className="text-gray-700 leading-relaxed">{equipment.description}</p>
            </div>

            {/* Specifications */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Характеристики</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">{key}</span>
                    <span className="text-gray-900 font-medium text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Что входит в аренду</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Полностью настроенное оборудование</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Техническая поддержка</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Инструкция по эксплуатации</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Гарантия работоспособности</span>
                </div>
              </div>
            </div>

            {/* Booking button */}
            <button
              onClick={() => setShowBookingForm(true)}
              className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors bg-primary-600 text-white hover:bg-primary-700"
            >
              Забронировать
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <BookingForm
          equipment={equipment}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </div>
  )
}