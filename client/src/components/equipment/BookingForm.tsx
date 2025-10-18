import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Equipment } from '../../types'
import { useCreateBooking } from '../../hooks/useEquipment'
import { X, Calendar, CreditCard } from 'lucide-react'
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
    comment: ''
  })

  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [, setDiscount] = useState(0)
  const [discountedPricePerDay, setDiscountedPricePerDay] = useState(0)

  const createBookingMutation = useCreateBooking()

  const calculatePrice = (start: string, end: string) => {
    if (!start || !end) return

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (endDate <= startDate) return

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Ценообразование из pricing
    let pricePerDay = equipment.pricePerDay

    if (equipment.pricing) {
      if (diffDays >= 30) {
        pricePerDay = equipment.pricing.days30
      } else if (diffDays >= 14) {
        pricePerDay = equipment.pricing.days14
      } else if (diffDays >= 7) {
        pricePerDay = equipment.pricing.days7
      } else if (diffDays >= 3) {
        pricePerDay = equipment.pricing.days3
      } else if (diffDays === 2) {
        pricePerDay = equipment.pricing.days2
      } else if (diffDays === 1) {
        pricePerDay = equipment.pricing.day1
      }
    }

    const price = diffDays * pricePerDay

    setTotalDays(diffDays)
    setTotalPrice(price)
    setDiscount(0)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    let processedValue = value
    if (name === 'customerPhone') {
      processedValue = formatPhoneNumber(value)
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: processedValue }

      if (name === 'startDate' || name === 'endDate') {
        calculatePrice(
          name === 'startDate' ? value : newData.startDate,
          name === 'endDate' ? value : newData.endDate
        )
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
      await createBookingMutation.mutateAsync({
        equipmentId: equipment.id,
        ...formData
      })

      toast.success('Бронирование успешно создано! Мы свяжемся с вами для подтверждения.')
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Произошла ошибка при создании бронирования'
      toast.error(errorMessage)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Бронирование оборудования</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Equipment info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
            <img
              src={getImageUrl(equipment.images[0])}
              alt={equipment.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{equipment.name}</h3>
              <p className="text-gray-600">{equipment.category}</p>
              {equipment.pricing && (
                <p className="text-lg font-bold text-primary-600">
                  от {formatPrice(Math.min(...[
                    equipment.pricing.day1_10to20,
                    equipment.pricing.day1,
                    equipment.pricing.days2,
                    equipment.pricing.days3,
                    equipment.pricing.days7,
                    equipment.pricing.days14,
                    equipment.pricing.days30
                  ].filter(p => p > 0)))}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dates - Unified Period Component */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Период аренды
              </label>
              <div className="relative border border-gray-300 rounded-lg p-3 bg-white hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1 font-medium">С</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={today}
                      required
                      className="w-full px-2 py-1.5 border-0 focus:outline-none focus:ring-0 text-sm"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1 font-medium">По</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || today}
                      required
                      className="w-full px-2 py-1.5 border-0 focus:outline-none focus:ring-0 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price calculation */}
            {totalDays > 0 && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between text-sm text-primary-700 mb-2">
                  <span>Продолжительность аренды:</span>
                  <span className="font-medium">{totalDays} {totalDays === 1 ? 'день' : totalDays < 5 ? 'дня' : 'дней'}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-primary-700 mb-2">
                  <span>Цена за сутки:</span>
                  <span className="font-medium">{formatPrice(discountedPricePerDay)}</span>
                </div>

                <div className="flex items-center justify-between text-lg font-bold text-primary-900 pt-2 border-t border-primary-200">
                  <span>Итого к оплате:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}

            {/* Customer info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Контактная информация</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Иван Иванов"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="+7 (917) 525-50-95"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (необязательно)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="ivan@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий (необязательно)
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Укажите дополнительную информацию или пожелания"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Terms and Pricing */}
            <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Условия аренды:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Оплата производится при получении оборудования</li>
                <li>• Возврат оборудования в указанные сроки обязателен</li>
                <li>• При повреждении взимается стоимость ремонта</li>
                <li>• Мы свяжемся с вами для подтверждения бронирования</li>
              </ul>
              {equipment.pricing && (
                <>
                  <h4 className="font-medium mb-2 mt-3 text-primary-700">Стоимость аренды:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• 1 день (10:00-20:00) — {formatPrice(equipment.pricing.day1_10to20)}</li>
                    <li>• 1 сутки — {formatPrice(equipment.pricing.day1)}</li>
                    <li>• 2 суток — {formatPrice(equipment.pricing.days2)}/сутки</li>
                    <li>• 3 суток — {formatPrice(equipment.pricing.days3)}/сутки</li>
                    <li>• Неделя — {formatPrice(equipment.pricing.days7)}/сутки</li>
                    <li>• 2 недели — {formatPrice(equipment.pricing.days14)}/сутки</li>
                    <li>• Месяц — {formatPrice(equipment.pricing.days30)}/сутки</li>
                  </ul>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={createBookingMutation.isPending || !totalPrice}
                className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Создание...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Забронировать</span>
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