import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEquipment, useEquipmentById } from '../hooks/useEquipment'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BookingForm from '../components/equipment/BookingForm'
import RelatedCard from '../components/equipment/RelatedCard'
import SEO from '../components/SEO'
import { ArrowLeft, Check, ChevronRight, Shield, Clock } from 'lucide-react'
import { getImageUrl } from '../lib/utils'

export default function EquipmentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useEquipmentById(id!)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const equipment = data?.data
  const { data: relatedData } = useEquipment(
    equipment ? { limit: 3, category: equipment.category } : undefined
  )
  const related = (relatedData?.data || []).filter((e) => e.id !== equipment?.id).slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !data?.success || !equipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-lg">Ошибка загрузки</div>
        <div className="text-gray-500">Оборудование не найдено</div>
        <Link to="/" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Вернуться к каталогу
        </Link>
      </div>
    )
  }

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

  const pricingTiers = equipment.pricing
    ? [
        { label: '1 день (10:00–20:00)', value: equipment.pricing.day1_10to20 },
        { label: '1 сутки', value: equipment.pricing.day1 },
        { label: '2 суток', value: equipment.pricing.days2, perDay: true },
        { label: '3 суток', value: equipment.pricing.days3, perDay: true },
        { label: 'Неделя', value: equipment.pricing.days7, perDay: true },
        { label: '2 недели', value: equipment.pricing.days14, perDay: true },
        { label: 'Месяц', value: equipment.pricing.days30, perDay: true },
      ].filter((t) => t.value > 0)
    : []

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: equipment.name,
    description: equipment.description,
    image: equipment.images.map((img) => `https://vozmimenya.ru${getImageUrl(img)}`),
    category: equipment.category,
    brand: { '@type': 'Brand', name: 'ВозьмиМеня' },
    offers: {
      '@type': 'Offer',
      url: `https://vozmimenya.ru/equipment/${equipment.id}`,
      priceCurrency: 'RUB',
      price: getMinPrice(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'ВозьмиМеня' },
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '37' },
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title={`Аренда ${equipment.name} в Москве`}
        description={`${equipment.description} - Аренда от ${formatPrice(getMinPrice())}/день. Быстрая доставка по Москве. Звоните: +7 (993) 363-64-64`}
        keywords={`аренда ${equipment.name}, прокат ${equipment.name}, ${equipment.category} Москва`}
        url={`https://vozmimenya.ru/equipment/${equipment.id}`}
        type="product"
        structuredData={productStructuredData}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-line">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Link to="/" className="hover:text-ink transition-colors">Главная</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/?category=${encodeURIComponent(equipment.category)}`} className="hover:text-ink transition-colors">
              {equipment.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink truncate">{equipment.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Left: Images ── */}
          <div>
            <div className="bg-white rounded-2xl border border-line overflow-hidden mb-3 aspect-[4/3]">
              <img
                src={getImageUrl(equipment.images[selectedImage])}
                alt={equipment.name}
                className="w-full h-full object-contain"
              />
            </div>
            {equipment.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {equipment.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 bg-white transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-line hover:border-muted'
                    }`}
                  >
                    <img src={getImageUrl(image)} alt={`${equipment.name} ${index + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div>
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-2">{equipment.name}</h1>

            {/* Status badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                В наличии
              </span>
            </div>

            {/* Pricing card */}
            <div className="bg-white rounded-2xl border border-line p-5 mb-4">
              {/* Main price */}
              <div className="flex items-start justify-between mb-1">
                <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Цена за сутки</p>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-muted">ОТ</p>
                  <p className="text-primary font-bold text-sm">{formatPrice(getMinPrice())}/сут</p>
                  <p className="text-[10px] text-muted">при аренде на месяц</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-ink mb-5">{formatPrice(equipment.pricePerDay)}</p>

              {/* Pricing tiers */}
              {pricingTiers.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-ink uppercase tracking-widest">Тарифы</p>
                    <p className="text-xs text-muted">чем дольше — тем дешевле</p>
                  </div>
                  <div className="space-y-2">
                    {pricingTiers.map((tier) => (
                      <div key={tier.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted">{tier.label}</span>
                        <span className="font-bold text-ink">
                          {formatPrice(tier.value)}{tier.perDay ? '/сут' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Book button */}
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full mt-5 py-4 px-6 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
              >
                Забронировать
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Гарантия чистоты
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Перезвоним за 15 мин
                </span>
              </div>
            </div>

            {/* Phone CTA */}
            <div className="bg-ink rounded-2xl p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Или позвоните</p>
              <div className="flex items-center justify-between">
                <a href="tel:+79933636464" className="text-white text-xl font-bold hover:opacity-90 transition-opacity">
                  +7 (993) 363-64-64
                </a>
                <a
                  href="https://t.me/VozmiMenyaRent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#2AABEE] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Description + Specs below ── */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">Описание</h2>
            <p className="text-muted leading-relaxed">{equipment.description}</p>

            {/* What's included */}
            <div className="mt-6">
              <h3 className="text-base font-bold text-ink mb-3">Что входит в аренду</h3>
              <div className="space-y-2">
                {[
                  'Полностью настроенное оборудование',
                  'Техническая поддержка',
                  'Инструкция по эксплуатации',
                  'Гарантия работоспособности',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications */}
          {Object.keys(equipment.specifications).length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-ink mb-4">Характеристики</h2>
              <div className="space-y-1">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2.5 border-b border-line last:border-0 text-sm">
                    <span className="text-muted">{key}</span>
                    <span className="text-ink font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Related ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-ink mb-6">Похожие модели</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <RelatedCard key={item.id} equipment={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showBookingForm && (
        <BookingForm equipment={equipment} onClose={() => setShowBookingForm(false)} />
      )}
    </div>
  )
}
