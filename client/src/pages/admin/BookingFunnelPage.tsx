import { useState } from 'react'
import { analyticsApi, type BookingFunnelReport } from '../../api/admin/analytics'
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery'
import { buildBookingFunnelRows } from '../../lib/bookingFunnel'

const periods = [7, 30, 90] as const

export default function BookingFunnelPage() {
  const [days, setDays] = useState<(typeof periods)[number]>(30)
  const { data, isLoading, isError } = useAuthenticatedQuery<BookingFunnelReport>({
    queryKey: ['analytics', 'booking-funnel', days],
    queryFn: () => analyticsApi.getBookingFunnel(days),
    retry: false,
  })

  const rows = data ? buildBookingFunnelRows(data) : []
  const bookingViews = data?.stages.bookingView || 0
  const submitted = data?.stages.bookingSubmitted || 0
  const completion = bookingViews > 0 ? Math.round((submitted / bookingViews) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Воронка брони</h1>
          <p className="mt-1 text-sm text-slate-500">Анонимные сессии сайта, без ФИО и телефонов.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1">
          {periods.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDays(period)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${days === period ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
            >
              {period} дней
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        {isLoading && <p className="text-sm text-slate-500">Загружаем данные…</p>}
        {isError && <p className="text-sm text-red-600">Не удалось загрузить воронку.</p>}
        {!isLoading && !isError && rows.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">От открытия формы до отправки</span>
              <strong className="text-2xl text-slate-900">{completion}%</strong>
            </div>
            {rows.map((row) => (
              <div key={row.key} className="grid gap-1 sm:grid-cols-[180px_1fr_90px] sm:items-center sm:gap-3">
                <span className="text-sm font-medium text-slate-700">{row.label}</span>
                <div className="h-8 overflow-hidden rounded-lg bg-slate-100">
                  <div
                    className="flex h-full min-w-0 items-center rounded-lg bg-indigo-600 px-2 text-xs font-bold text-white transition-[width]"
                    style={{ width: `${row.widthPercent}%` }}
                  >
                    {row.value > 0 ? row.value : ''}
                  </div>
                </div>
                <span className="text-right text-xs text-slate-500">
                  {row.conversionFromBooking === null ? `${row.value} сесс.` : `${row.conversionFromBooking}% от формы`}
                </span>
              </div>
            ))}
            <p className="text-xs leading-5 text-slate-500">
              Прямые переходы на форму могут не проходить через карточку оборудования. Поэтому этапы оформления сравниваются с открытиями формы, а не с карточками.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
