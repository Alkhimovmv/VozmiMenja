import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'
import { useCreateBooking, useEquipment } from '../hooks/useEquipment'
import type { Equipment } from '../types'
import { calculateBillableRentalDays, calculateRentalTotal } from '../utils/pricing'
import { trackEvent } from '../lib/analytics'
import { getApiErrorMessage } from '../lib/apiError'

const LEGAL_TERMS_VERSION = 'offer-2026-05-09_agreement-2026-05-09_privacy-current'

const getDateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value)

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  const normalized = digits.startsWith('8')
    ? `7${digits.slice(1)}`
    : digits.startsWith('7')
    ? digits
    : `7${digits}`

  const phone = normalized.slice(0, 11)
  const area = phone.slice(1, 4)
  const first = phone.slice(4, 7)
  const second = phone.slice(7, 9)
  const third = phone.slice(9, 11)

  if (phone.length <= 1) return '+7'
  if (phone.length <= 4) return `+7 (${area}`
  if (phone.length <= 7) return `+7 (${area}) ${first}`
  if (phone.length <= 9) return `+7 (${area}) ${first}-${second}`
  return `+7 (${area}) ${first}-${second}-${third}`
}

const getLeadContext = () => {
  const params = new URLSearchParams(window.location.search)
  return {
    sourcePage: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer,
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  }
}

const buildComment = (data: {
  startTime: string
  endTime: string
  deliveryMethod: 'pickup' | 'delivery'
  deliveryAddress: string
  preferredContact: string
  comment: string
}) => [
  'Самостоятельное оформление брони клиентом.',
  `Время аренды: ${data.startTime || '10:00'} — ${data.endTime || '10:00'}`,
  `Получение: ${data.deliveryMethod === 'delivery' ? 'доставка' : 'самовывоз'}`,
  data.deliveryMethod === 'delivery' && data.deliveryAddress.trim() ? `Адрес доставки: ${data.deliveryAddress.trim()}` : '',
  data.preferredContact ? `Предпочтительный канал связи: ${data.preferredContact}` : '',
  data.comment.trim() ? `Комментарий клиента: ${data.comment.trim()}` : '',
].filter(Boolean).join('\n')

export default function SelfServiceBookingPage() {
  const today = getDateInputValue(new Date())
  const tomorrow = getDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
  const { data: equipmentResponse, isLoading } = useEquipment({ limit: 100 })
  const createBookingMutation = useCreateBooking()

  const equipment = useMemo(() => equipmentResponse?.data || [], [equipmentResponse?.data])
  const [formData, setFormData] = useState({
    equipmentId: '',
    customerName: '',
    customerPhone: '',
    startDate: today,
    endDate: tomorrow,
    startTime: '10:00',
    endTime: '10:00',
    preferredContact: 'Telegram',
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
    comment: '',
    offerAccepted: false,
    agreementAccepted: false,
    privacyAccepted: false,
  })

  const selectedEquipment = useMemo(
    () => equipment.find((item) => item.id === formData.equipmentId),
    [equipment, formData.equipmentId],
  )

  const rentalDays = calculateBillableRentalDays(
    formData.startDate,
    formData.endDate,
    formData.startTime,
    formData.endTime,
  )
  const totalPrice = selectedEquipment && rentalDays > 0
    ? calculateRentalTotal(selectedEquipment.pricing, rentalDays, selectedEquipment.pricePerDay, {
      startDate: formData.startDate,
      startTime: formData.startTime,
    })
    : 0

  const groupedEquipment = useMemo(() => {
    return equipment.reduce<Record<string, Equipment[]>>((acc, item) => {
      acc[item.category] = acc[item.category] || []
      acc[item.category].push(item)
      return acc
    }, {})
  }, [equipment])

  const allLegalAccepted = formData.offerAccepted && formData.agreementAccepted && formData.privacyAccepted

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'customerPhone'
        ? formatPhoneNumber(value)
        : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedEquipment) {
      toast.error('Выберите оборудование')
      return
    }

    if (rentalDays === 0) {
      toast.error('Дата окончания не может быть раньше даты начала')
      return
    }

    if (formData.deliveryMethod === 'delivery' && !formData.deliveryAddress.trim()) {
      toast.error('Укажите адрес доставки или выберите самовывоз')
      return
    }

    if (!allLegalAccepted) {
      toast.error('Подтвердите ознакомление с офертой, договором и обработкой персональных данных')
      return
    }

    try {
      const leadContext = getLeadContext()
      const response = await createBookingMutation.mutateAsync({
        equipmentId: selectedEquipment.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        preferredContact: formData.preferredContact,
        deliveryMethod: formData.deliveryMethod,
        deliveryAddress: formData.deliveryMethod === 'delivery' ? formData.deliveryAddress : '',
        comment: buildComment(formData),
        legal: {
          offerAccepted: true,
          agreementAccepted: true,
          privacyAccepted: true,
          termsVersion: LEGAL_TERMS_VERSION,
        },
        ...leadContext,
      })

      trackEvent('self_service_booking_submit', {
        booking_id: response.data.id,
        equipment_id: selectedEquipment.id,
        equipment_name: selectedEquipment.name,
        delivery_method: formData.deliveryMethod,
        total_price: totalPrice,
        total_days: rentalDays,
      })

      toast.success('Бронь отправлена. Мы свяжемся для подтверждения выдачи.')
      setFormData((prev) => ({
        ...prev,
        equipmentId: '',
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        comment: '',
        offerAccepted: false,
        agreementAccepted: false,
        privacyAccepted: false,
      }))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Не удалось оформить бронь'))
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Оформить бронь оборудования онлайн — ВозьмиМеня"
        description="Самостоятельно заполните бронь на аренду оборудования: выберите технику, даты, способ получения и подтвердите ознакомление с офертой и договором."
        url="https://vozmimenya.ru/booking"
      />

      <section className="bg-gradient-to-br from-[#0F172A] via-[#1D4ED8] to-[#0F172A] py-14 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-100">Онлайн-бронь</p>
            <h1 className="text-4xl font-extrabold text-white md:text-5xl">Заполните бронь сами — менеджер только подтвердит выдачу</h1>
            <p className="mt-4 text-lg text-blue-100">
              Выберите оборудование, срок и способ получения. Данные сразу попадут в админку, а согласие с документами сохранится в заявке.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Данные брони</h2>
              <p className="mt-1 text-sm text-slate-500">Поля со звёздочкой обязательны.</p>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Оборудование *</span>
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">{isLoading ? 'Загружаем оборудование...' : 'Выберите оборудование'}</option>
                {Object.entries(groupedEquipment).map(([category, items]) => (
                  <optgroup key={category} label={category}>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {formatPrice(item.pricePerDay)}/сутки
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Дата начала *</span>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  min={today}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Дата возврата *</span>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Время получения</span>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Время возврата</span>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Имя *</span>
                <input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Иван"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Телефон *</span>
                <input
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 (999) 000-00-00"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Как удобнее связаться</span>
                <select
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option>Telegram</option>
                  <option>WhatsApp</option>
                  <option>Звонок</option>
                  <option>SMS</option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-700">Способ получения *</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="radio" name="deliveryMethod" value="pickup" checked={formData.deliveryMethod === 'pickup'} onChange={handleChange} />
                  <span className="font-semibold text-slate-800">Самовывоз / постамат</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="radio" name="deliveryMethod" value="delivery" checked={formData.deliveryMethod === 'delivery'} onChange={handleChange} />
                  <span className="font-semibold text-slate-800">Доставка</span>
                </label>
              </div>
              {formData.deliveryMethod === 'delivery' && (
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                  required
                  placeholder="Адрес, подъезд, этаж, удобное время доставки"
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              )}
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Комментарий</span>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={4}
                placeholder="Например: нужна колонка на праздник, камера для поездки, пылесос после ремонта..."
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-black text-blue-950">Юридические подтверждения *</p>
              <label className="flex gap-3 text-sm text-blue-950">
                <input type="checkbox" name="offerAccepted" checked={formData.offerAccepted} onChange={handleChange} className="mt-1" />
                <span>Я ознакомился(-ась) и принимаю <Link to="/offer" target="_blank" className="font-bold underline">публичную оферту</Link>.</span>
              </label>
              <label className="flex gap-3 text-sm text-blue-950">
                <input type="checkbox" name="agreementAccepted" checked={formData.agreementAccepted} onChange={handleChange} className="mt-1" />
                <span>Я ознакомился(-ась) с <Link to="/rental-agreement" target="_blank" className="font-bold underline">договором аренды оборудования</Link>.</span>
              </label>
              <label className="flex gap-3 text-sm text-blue-950">
                <input type="checkbox" name="privacyAccepted" checked={formData.privacyAccepted} onChange={handleChange} className="mt-1" />
                <span>Я согласен(-на) на обработку персональных данных по <Link to="/privacy" target="_blank" className="font-bold underline">политике конфиденциальности</Link>.</span>
              </label>
              <p className="text-xs text-blue-800">
                После отправки заявки мы сохраним дату и технические данные подтверждения в карточке заявки.
              </p>
            </div>

            <button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="w-full rounded-2xl bg-slate-950 px-6 py-4 text-base font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createBookingMutation.isPending ? 'Отправляем бронь...' : 'Отправить бронь'}
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Итог</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">{selectedEquipment?.name || 'Оборудование не выбрано'}</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <span>Срок</span>
                <strong className="text-slate-900">{rentalDays || 0} сут.</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Получение</span>
                <strong className="text-right text-slate-900">{formData.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}</strong>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-slate-500">Расчёт аренды</span>
                <strong className="mt-1 block text-3xl font-black text-slate-950">{totalPrice > 0 ? formatPrice(totalPrice) : '—'}</strong>
                <p className="mt-2 text-xs text-slate-500">Доставка, залог и финальная комплектация подтверждаются менеджером.</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Что будет после отправки</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Заявка появится в админке.</li>
                <li>Менеджер проверит наличие и комплект.</li>
                <li>После подтверждения бронь станет арендой.</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
