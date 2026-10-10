import { Link, useLocation } from 'react-router-dom'
import SEO from '../components/SEO'
import { getTelegramUrl } from '../lib/contactLinks'

type BookingSuccessState = {
  bookingIds?: string[]
  equipmentNames?: string[]
  customerName?: string
  startDate?: string
  endDate?: string
  deliveryMethod?: 'pickup' | 'delivery'
  officeName?: string
  totalPrice?: number
  source?: 'self_service' | 'equipment_modal'
}

const formatDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

const formatPrice = (value?: number) => {
  if (!value || value <= 0) return ''
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value)
}

const shortId = (id: string) => id.length > 8 ? id.slice(0, 8) : id

export default function BookingSuccessPage() {
  const location = useLocation()
  const state = (location.state || {}) as BookingSuccessState
  const params = new URLSearchParams(location.search)
  const idsFromQuery = params.get('ids')?.split(',').filter(Boolean) || []
  const bookingIds = state.bookingIds?.length ? state.bookingIds : idsFromQuery
  const equipmentNames = state.equipmentNames?.filter(Boolean) || []
  const period = [formatDate(state.startDate), formatDate(state.endDate)].filter(Boolean).join(' — ')
  const totalPrice = formatPrice(state.totalPrice)

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Заявка на бронь принята — ВозьмиМеня"
        description="Мы получили вашу заявку на бронь оборудования. Менеджер проверит наличие, комплект и способ получения, затем свяжется для подтверждения."
        url="https://vozmimenya.ru/booking/success"
        noIndex
      />

      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-3xl text-slate-950 shadow-lg shadow-emerald-950/30">
              ✓
            </div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-emerald-200">Заявка отправлена</p>
            <h1 className="text-4xl font-black md:text-5xl">Мы получили вашу бронь</h1>
            <p className="mt-5 text-lg leading-8 text-blue-100">
              Это заявка на бронь оборудования. Менеджер проверит наличие, комплект, офис или доставку и свяжется с вами для финального подтверждения.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto grid max-w-5xl gap-6 px-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-2xl font-black text-slate-950">Что отправлено</h2>

            <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              {bookingIds.length > 0 && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Номер заявки
                  </span>
                  <strong className="mt-1 block text-slate-950">
                    {bookingIds.map(shortId).join(', ')}
                  </strong>
                </div>
              )}

              {period && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Период</span>
                  <strong className="mt-1 block text-slate-950">{period}</strong>
                </div>
              )}

              {state.officeName && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Офис</span>
                  <strong className="mt-1 block text-slate-950">{state.officeName}</strong>
                </div>
              )}

              {state.deliveryMethod && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Получение</span>
                  <strong className="mt-1 block text-slate-950">
                    {state.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз / постамат'}
                  </strong>
                </div>
              )}

              {totalPrice && (
                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Предварительный расчет</span>
                  <strong className="mt-1 block text-2xl text-slate-950">{totalPrice}</strong>
                  <p className="mt-1 text-xs text-slate-500">Итоговую сумму менеджер подтвердит с учетом комплекта, залога и доставки.</p>
                </div>
              )}
            </div>

            {equipmentNames.length > 0 && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-black text-blue-950">Оборудование</p>
                <ul className="mt-2 space-y-1 text-sm text-blue-950">
                  {equipmentNames.map((name) => (
                    <li key={name}>• {name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-black">Важно</p>
              <p className="mt-1">
                Бронь считается подтвержденной после ответа менеджера. До подтверждения мы проверяем, свободно ли оборудование на выбранное время и подходит ли офис/доставка.
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-black text-slate-950">Что дальше</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">1</span>
                <span>Заявка уже попала менеджеру в админку.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">2</span>
                <span>Мы проверим наличие, комплект, офис выдачи или доставку.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">3</span>
                <span>После подтверждения пришлем дальнейшие шаги по получению и возврату.</span>
              </li>
            </ol>

            <div className="mt-6 space-y-3">
              <a
                href={getTelegramUrl('Здравствуйте! Я отправил(а) заявку на бронь на сайте. Подскажите, пожалуйста, удалось ли подтвердить наличие?')}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
              >
                Написать в Telegram
              </a>
              <Link
                to="/"
                className="block rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Вернуться на сайт
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
