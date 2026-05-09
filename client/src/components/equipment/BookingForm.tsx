import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Equipment } from '../../types'
import { useCreateBooking } from '../../hooks/useEquipment'
import { X, Calendar, User, Phone, Mail, MessageSquare, ChevronRight } from 'lucide-react'
import { getImageUrl } from '../../lib/utils'

interface BookingFormProps {
  equipment: Equipment
  onClose: () => void
}

export default function BookingForm({ equipment, onClose }: BookingFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    startDate: '',
    endDate: '',
    comment: '',
  })
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [discountedPricePerDay, setDiscountedPricePerDay] = useState(0)

  const createBookingMutation = useCreateBooking()

  const calculatePrice = (start: string, end: string) => {
    if (!start || !end) return
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (endDate <= startDate) return
    const diffDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    let pricePerDay = equipment.pricePerDay
    if (equipment.pricing) {
      if (diffDays >= 30) pricePerDay = equipment.pricing.days30
      else if (diffDays >= 14) pricePerDay = equipment.pricing.days14
      else if (diffDays >= 7) pricePerDay = equipment.pricing.days7
      else if (diffDays >= 3) pricePerDay = equipment.pricing.days3
      else if (diffDays === 2) pricePerDay = equipment.pricing.days2
      else if (diffDays === 1) pricePerDay = equipment.pricing.day1
    }

    setTotalDays(diffDays)
    setTotalPrice(diffDays * pricePerDay)
    setDiscountedPricePerDay(pricePerDay)
  }

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '')
    if (phone.length === 0) return ''
    if (phone.length <= 1) return phone
    if (phone.length <= 4) return `+7 (${phone.slice(1)}`
    if (phone.length <= 7) return `+7 (${phone.slice(1, 4)}) ${phone.slice(4)}`
    if (phone.length <= 9) return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7)}`
    return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`
  }

  const capitalizeWords = (str: string) =>
    str.split(' ').map((w) => (w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join(' ')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let processedValue = value
    if (name === 'customerPhone') processedValue = formatPhoneNumber(value)
    else if (name === 'customerName') processedValue = capitalizeWords(value)

    setFormData((prev) => {
      const newData = { ...prev, [name]: processedValue }
      if (name === 'startDate' || name === 'endDate') {
        calculatePrice(name === 'startDate' ? value : newData.startDate, name === 'endDate' ? value : newData.endDate)
      }
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate) {
      toast.error('Пожалуйста, выберите даты аренды')
      return
    }
    try {
      await createBookingMutation.mutateAsync({ equipmentId: equipment.id, ...formData })
      toast.success('Бронирование успешно создано! Мы свяжемся с вами для подтверждения.')
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Произошла ошибка при создании бронирования')
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const getMinPrice = () => {
    if (!equipment.pricing) return equipment.pricePerDay
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

  const today = new Date().toISOString().split('T')[0]

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-xl max-h-[95vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col" style={{ overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Забронировать</h2>
            <p className="text-xs text-gray-400 mt-0.5">Мы перезвоним для подтверждения</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Equipment card */}
          <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
              <img src={getImageUrl(equipment.images[0])} alt={equipment.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#2563EB] font-semibold mb-0.5">{equipment.category}</p>
              <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{equipment.name}</h3>
              <p className="text-[#2563EB] font-bold text-sm mt-1">от {formatPrice(getMinPrice())}/сутки</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dates */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" /> Период аренды
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Дата начала *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={today}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Дата окончания *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || today}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Price calculation */}
            {totalDays > 0 && (
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex justify-between text-sm text-blue-700 mb-1.5">
                  <span>Срок аренды</span>
                  <span className="font-semibold">{totalDays} {totalDays === 1 ? 'день' : totalDays < 5 ? 'дня' : 'дней'}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-700 mb-2">
                  <span>Цена за сутки</span>
                  <span className="font-semibold">{formatPrice(discountedPricePerDay)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-blue-200">
                  <span>Итого</span>
                  <span className="text-[#2563EB]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}

            {/* Pricing tiers */}
            {pricingTiers.length > 0 && (
              <div className="bg-[#F8FAFC] rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Тарифы</p>
                <div className="space-y-1.5">
                  {pricingTiers.map((tier) => (
                    <div key={tier.label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{tier.label}</span>
                      <span className="font-semibold text-gray-900">{formatPrice(tier.value)}{tier.perDay ? '/сут' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#2563EB]" /> Контактные данные
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Ваше имя *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Имя Фамилия"
                      required
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Телефон *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 000-00-00"
                      required
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Email <span className="text-gray-400">(необязательно)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="mail@example.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Комментарий <span className="text-gray-400">(необязательно)</span></label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="Пожелания или вопросы..."
                      rows={3}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Оплата при получении оборудования</p>
              <p>• Возврат в указанные сроки обязателен</p>
              <p>• Мы перезвоним для подтверждения</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={createBookingMutation.isPending || !totalPrice}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Создание...
                  </>
                ) : (
                  <>
                    Забронировать
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
