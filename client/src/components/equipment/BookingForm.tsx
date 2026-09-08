import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { Equipment } from '../../types'
import { useCreateBooking } from '../../hooks/useEquipment'
import { X, Calendar, User, Phone, MessageSquare, ChevronRight } from 'lucide-react'
import { getImageUrl } from '../../lib/utils'
import { trackEvent } from '../../lib/analytics'
import { getApiErrorMessage } from '../../lib/apiError'
import { calculateRentalTotal, getEffectiveDailyPrice, getMinimumDailyPrice, getPricingRows } from '../../utils/pricing'

interface BookingFormProps {
  equipment: Equipment
  onClose: () => void
}

function getCommentPlaceholder(equipment: Equipment) {
  const category = equipment.category.toLowerCase()
  const name = equipment.name.toLowerCase()

  if (category.includes('пылесос') || category.includes('клининг')) {
    if (name.includes('puzzi')) {
      return 'Например: диван 2 места + ковер, есть пятна, нужна подсказка по химии'
    }

    if (name.includes('sc') || name.includes('паро')) {
      return 'Например: кухня и плитка в ванной, нужно почистить швы, без деликатных поверхностей'
    }

    return 'Например: уборка после ремонта, 45 м², гипсовая пыль, нужен мешок/фильтр'
  }

  if (category.includes('камер')) {
    return 'Например: поездка на 3 дня, нужна камера для влога, крепление и запасная батарея'
  }

  if (category.includes('аудио')) {
    return 'Например: дача, 20 гостей, музыка для танцев, подключение с телефона'
  }

  return 'Коротко опишите задачу: где, на сколько дней и какой комплект нужен'
}

function getScenarioPresets(equipment: Equipment) {
  const category = equipment.category.toLowerCase()
  const name = equipment.name.toLowerCase()

  if (category.includes('пылесос') || category.includes('клининг')) {
    if (name.includes('puzzi')) {
      return [
        {
          label: 'Диван/ковер',
          comment: 'Сценарий: химчистка дивана/ковра. Нужна подсказка по химии и насадке.',
          kit: 'Проверить: моющее средство, насадка под мебель/ковер, запас времени на сушку.',
        },
        {
          label: 'Салон авто',
          comment: 'Сценарий: химчистка салона авто. Нужно уточнить количество сидений и пятна.',
          kit: 'Проверить: насадка для салона, химия, где будет сушка после чистки.',
        },
        {
          label: 'Большая уборка',
          comment: 'Сценарий: несколько зон чистки. Нужно понять, хватит ли этой модели или лучше Puzzi 10/1.',
          kit: 'Проверить: площадь, число зон, срок 1–2 дня, химия и доставка.',
        },
      ]
    }

    if (name.includes('wd5')) {
      return [
        {
          label: 'После ремонта',
          comment: 'Сценарий: уборка после ремонта. Нужно уточнить площадь и тип пыли.',
          kit: 'Проверить: мешок/фильтр под гипс/бетон, насадка, нужна ли доставка на объект.',
        },
        {
          label: 'Пыль от сверления',
          comment: 'Сценарий: сухая строительная пыль после работ. Нужен комплект под мелкую пыль.',
          kit: 'Проверить: фильтр, мешок, не нужна ли потом влажная/текстильная чистка.',
        },
        {
          label: 'Смешанная уборка',
          comment: 'Сценарий: сухой мусор + финальная уборка. Нужно понять, нужен ли еще Puzzi или SC4.',
          kit: 'Проверить: WD5 для сухого этапа, Puzzi для текстиля, SC4 для плитки/кухни.',
        },
      ]
    }

    return [
      {
        label: 'Кухня/плитка',
        comment: 'Сценарий: пароочистка кухни, плитки или швов. Нужно уточнить поверхности.',
        kit: 'Проверить: насадки, деликатные материалы, объем работ и срок.',
      },
      {
        label: 'Санузел',
        comment: 'Сценарий: пароочистка санузла и сантехники. Нужно понять степень загрязнения.',
        kit: 'Проверить: насадки для швов/сантехники и безопасность поверхностей.',
      },
      {
        label: 'Вся квартира',
        comment: 'Сценарий: уборка нескольких помещений. Нужно уточнить, не нужен ли WD5 или Puzzi дополнительно.',
        kit: 'Проверить: площадь, поверхности, смешанная задача, доставка.',
      },
    ]
  }

  if (category.includes('камер')) {
    if (name.includes('gopro')) {
      return [
        {
          label: 'Спорт/актив',
          comment: 'Сценарий: активная съемка на GoPro. Нужны крепления под спорт/поездку.',
          kit: 'Проверить: крепление, запасная батарея, карта памяти, нужен ли микрофон.',
        },
        {
          label: 'Поездка',
          comment: 'Сценарий: поездка/путешествие. Нужна камера на несколько дней и запас питания.',
          kit: 'Проверить: аккумуляторы, карта памяти, зарядка, крепление или мини-штатив.',
        },
        {
          label: 'Контент/Reels',
          comment: 'Сценарий: короткие ролики/Reels. Нужно понять, важна ли речь в кадре.',
          kit: 'Проверить: микрофон, крепление, ориентация съемки, батареи.',
        },
      ]
    }

    if (name.includes('insta360')) {
      return [
        {
          label: '360-ракурсы',
          comment: 'Сценарий: 360-видео и необычные ракурсы. Нужна подсказка по креплению.',
          kit: 'Проверить: селфи-палка/крепление, батарея, карта памяти.',
        },
        {
          label: 'Съемка одному',
          comment: 'Сценарий: съемка себя в поездке/прогулке. Нужен удобный комплект без оператора.',
          kit: 'Проверить: держатель, питание, нужен ли микрофон.',
        },
        {
          label: 'Мероприятие',
          comment: 'Сценарий: мероприятие с эффектными проходками. Нужно уточнить длительность съемки.',
          kit: 'Проверить: батареи, карта памяти, крепление и формат монтажа.',
        },
      ]
    }

    return [
      {
        label: 'Влог',
        comment: 'Сценарий: влог/разговорные видео. Нужен стабильный кадр и хороший звук.',
        kit: 'Проверить: микрофон, мини-штатив, карта памяти, запас питания.',
      },
      {
        label: 'Прогулка/город',
        comment: 'Сценарий: прогулочная съемка. Нужна компактная камера и плавная картинка.',
        kit: 'Проверить: батарея, карта памяти, нужен ли звук на улице.',
      },
      {
        label: 'Обзор/мероприятие',
        comment: 'Сценарий: обзор или мероприятие. Нужно уточнить свет, звук и длительность.',
        kit: 'Проверить: микрофон, штатив/держатель, запас питания.',
      },
    ]
  }

  if (category.includes('аудио')) {
    if (name.includes('partybox') || name.includes('jbl')) {
      return [
        {
          label: 'Квартира',
          comment: 'Сценарий: домашняя вечеринка в квартире. Нужно уточнить гостей, площадь и громкость.',
          kit: 'Проверить: розетка, источник звука, нужен ли микрофон/караоке.',
        },
        {
          label: 'Дача',
          comment: 'Сценарий: праздник на даче. Нужна колонка на выходные и запас по громкости.',
          kit: 'Проверить: питание, доставка, микрофон, время возврата.',
        },
        {
          label: 'Зал/танцы',
          comment: 'Сценарий: большой зал или танцы. Нужно понять, хватит ли модели или нужен PartyBox 710.',
          kit: 'Проверить: площадь, гости, громкость, микрофон и подключение.',
        },
      ]
    }

    return [
      {
        label: 'Интервью',
        comment: 'Сценарий: запись интервью. Нужен чистый звук речи.',
        kit: 'Проверить: к чему подключаем, шумная ли локация, запас батарей.',
      },
      {
        label: 'Видео/блог',
        comment: 'Сценарий: видео или блог. Нужно уточнить камеру/телефон и условия съемки.',
        kit: 'Проверить: совместимость, ветер/улица, крепление микрофона.',
      },
      {
        label: 'Мероприятие',
        comment: 'Сценарий: речь на мероприятии. Нужно понять формат подключения и площадку.',
        kit: 'Проверить: колонка/микшер, кабели, заряд, резерв.',
      },
    ]
  }

  return [
    {
      label: 'Разовая задача',
      comment: 'Сценарий: разовая аренда под конкретную задачу.',
      kit: 'Проверить: срок, доставка, комплект и условия залога.',
    },
    {
      label: 'Тест перед покупкой',
      comment: 'Сценарий: тест перед покупкой. Нужно понять, что именно хочется проверить.',
      kit: 'Проверить: срок теста, критерии выбора, комплект.',
    },
  ]
}

export default function BookingForm({ equipment, onClose }: BookingFormProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (window.innerWidth < 768) {
      const nav = document.querySelector('nav.fixed.bottom-0') as HTMLElement | null
      if (nav) {
        document.documentElement.style.setProperty('--mobile-nav-height', nav.offsetHeight + 'px')
      }
    } else {
      document.documentElement.style.removeProperty('--mobile-nav-height')
    }
    return () => { document.body.style.overflow = '' }
  }, [])

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    comment: '',
  })
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [discountedPricePerDay, setDiscountedPricePerDay] = useState(0)
  const [consent, setConsent] = useState(false)

  const createBookingMutation = useCreateBooking()

  const parseDateInput = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const getDateInputValue = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const calculateRentalDays = (start: string, end: string) => {
    const startDate = parseDateInput(start)
    const endDate = parseDateInput(end)

    if (endDate < startDate) return 0

    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }

  const calculatePrice = (start: string, end: string) => {
    if (!start || !end) {
      setTotalDays(0)
      setTotalPrice(0)
      setDiscountedPricePerDay(0)
      return
    }

    const diffDays = calculateRentalDays(start, end)
    if (diffDays === 0) {
      setTotalDays(0)
      setTotalPrice(0)
      setDiscountedPricePerDay(0)
      return
    }

    const pricePerDay = getEffectiveDailyPrice(equipment.pricing, diffDays, equipment.pricePerDay)

    setTotalDays(diffDays)
    setTotalPrice(calculateRentalTotal(equipment.pricing, diffDays, equipment.pricePerDay))
    setDiscountedPricePerDay(Math.round(pricePerDay))
  }

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

  const capitalizeWords = (str: string) =>
    str.split(' ').map((w) => (w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join(' ')

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
    if (calculateRentalDays(formData.startDate, formData.endDate) === 0) {
      toast.error('Дата окончания не может быть раньше даты начала')
      return
    }
    try {
      const leadContext = getLeadContext()
      await createBookingMutation.mutateAsync({ equipmentId: equipment.id, ...formData, ...leadContext })
      trackEvent('booking_submit', {
        equipment_id: equipment.id,
        equipment_name: equipment.name,
        total_price: totalPrice,
        total_days: totalDays,
        source_page: leadContext.sourcePage,
        utm_source: leadContext.utmSource,
        utm_medium: leadContext.utmMedium,
        utm_campaign: leadContext.utmCampaign,
      })
      toast.success('Бронирование успешно создано! Мы свяжемся с вами для подтверждения.')
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Произошла ошибка при создании бронирования'))
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const getMinPrice = () => getMinimumDailyPrice(equipment.pricing, equipment.pricePerDay)

  const today = getDateInputValue(new Date())

  const addDays = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return getDateInputValue(date)
  }

  const setRentalPreset = (days: number, sameDay = false) => {
    const startDate = today
    const endDate = sameDay ? today : addDays(days)
    setFormData((prev) => ({ ...prev, startDate, endDate }))
    calculatePrice(startDate, endDate)
  }

  const rentalPresets = [
    { label: 'Сегодня', days: 1, sameDay: true },
    { label: '1 сутки', days: 1 },
    { label: '2 суток', days: 2 },
    { label: 'Неделя', days: 7 },
  ]

  const pricingTiers = getPricingRows(equipment.pricing)
  const commentPlaceholder = getCommentPlaceholder(equipment)
  const scenarioPresets = getScenarioPresets(equipment)

  const applyScenarioPreset = (preset: { comment: string; kit: string }) => {
    const block = `${preset.comment}\nПодсказка менеджеру: ${preset.kit}`
    setFormData((prev) => ({
      ...prev,
      comment: prev.comment.trim() ? `${block}\n\n${prev.comment}` : block,
    }))
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — mobile: fixed inset-0, desktop: centered sheet */}
      <div className="
        fixed inset-0 flex flex-col bg-white shadow-2xl
        md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
        md:w-full md:max-w-xl md:max-h-[90vh] md:rounded-2xl
      ">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between md:rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Забронировать</h2>
            <p className="text-xs text-gray-400 mt-0.5">Мы перезвоним для подтверждения</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Скроллящееся тело */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-6 space-y-5 booking-modal-scroll">
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

          <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Dates */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" /> Период аренды
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="block text-xs text-gray-500 mb-1.5">Дата начала *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={today}
                    required
                    placeholder="дд.мм.гггг"
                    className="block w-full min-w-0 max-w-full pl-3 pr-1.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors [&:not(:valid)]:text-gray-400"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs text-gray-500 mb-1.5">Дата возврата *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || today}
                    required
                    placeholder="дд.мм.гггг"
                    className="block w-full min-w-0 max-w-full pl-3 pr-1.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors [&:not(:valid)]:text-gray-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Если берете 6-го и возвращаете 7-го, это считается как 1 сутки. Для аренды в тот же день выберите одну дату.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rentalPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setRentalPreset(preset.days, preset.sameDay)}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
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
                      <span className="font-semibold text-gray-900">{formatPrice(tier.value)}{tier.suffix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scenario presets */}
            {scenarioPresets.length > 0 && (
              <div className="bg-[#F8FAFC] rounded-2xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Для чего берете?</p>
                <p className="text-xs text-gray-400 mb-3">
                  Выберите сценарий — мы добавим подсказку менеджеру в заявку.
                </p>
                <div className="flex flex-wrap gap-2">
                  {scenarioPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyScenarioPreset(preset)}
                      className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
                    >
                      {preset.label}
                    </button>
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
                  <label className="block text-xs text-gray-500 mb-1.5">Комментарий <span className="text-gray-400">(необязательно)</span></label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder={commentPlaceholder}
                      rows={3}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors resize-none"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Чем точнее задача, тем быстрее менеджер подтвердит наличие, комплект и срок.
                  </p>
                </div>
              </div>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]/30 flex-shrink-0 cursor-pointer"
              />
              <span className="text-xs text-gray-400 leading-relaxed">
                Я согласен(а) на обработку персональных данных в соответствии с{' '}
                <a href="/privacy" target="_blank" className="text-[#2563EB] hover:underline">Политикой обработки персональных данных</a>{' '}
                согласно ФЗ-152. Данные используются только для оформления аренды и удаляются после её окончания.
              </span>
            </label>

            {/* Conditions */}
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold mb-1.5">Что потребуется при получении:</p>
              <p>• Фото первой страницы паспорта и страницы с пропиской</p>
              <p>• Оплата при получении оборудования</p>
              <p>• Мы перезвоним для подтверждения</p>
              <a href="/delivery" target="_blank" className="inline-block mt-1.5 text-[#2563EB] hover:underline font-medium">
                Подробнее об условиях аренды →
              </a>
            </div>

          </form>
        </div>

        {/* Footer — всегда виден, на мобильном отступ под нижнее меню */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 pt-4 pb-4 md:pb-4 md:rounded-b-2xl flex gap-3 bg-white" style={{paddingBottom: 'calc(16px + var(--mobile-nav-height, 0px))'}}>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Отмена
          </button>
          <button
            type="submit"
            form="booking-form"
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
      </div>
    </div>
  )
}
