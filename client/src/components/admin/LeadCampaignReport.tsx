import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi, type LeadReportRow } from '../../api/admin/bookings';

const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const formatRub = (value: number) => rubFormatter.format(value);
const formatPercent = (value: number) => `${value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`;

function MetricCell({ current, baseline }: { current: string | number; baseline: string | number }) {
  return (
    <td className="whitespace-nowrap px-3 py-3 text-right align-top">
      <span className="block font-bold text-slate-900">{current}</span>
      <span className="mt-0.5 block text-xs text-slate-500">ранее {baseline}</span>
    </td>
  );
}

function ReportRow({ row }: { row: LeadReportRow }) {
  return (
    <tr className="border-t border-slate-200/80 bg-white transition-colors hover:bg-amber-50/40">
      <th scope="row" className="px-3 py-3 text-left align-top font-bold text-slate-900">
        {row.source}
      </th>
      <td className="max-w-52 break-words px-3 py-3 align-top text-slate-700">{row.campaign}</td>
      <MetricCell current={row.currentLeads} baseline={row.baselineLeads} />
      <MetricCell current={row.currentStartedBookings} baseline={row.baselineStartedBookings} />
      <MetricCell current={row.currentConfirmedRentals} baseline={row.baselineConfirmedRentals} />
      <MetricCell current={formatPercent(row.currentConversion)} baseline={formatPercent(row.baselineConversion)} />
      <MetricCell current={formatRub(row.currentRevenue)} baseline={formatRub(row.baselineRevenue)} />
    </tr>
  );
}

export default function LeadCampaignReport() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-lead-report'],
    queryFn: bookingsApi.getLeadReport,
    retry: false,
  });

  return (
    <section aria-labelledby="lead-campaign-report-title" className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
      <div className="flex flex-col gap-1 border-b border-slate-200 bg-slate-900 px-4 py-4 text-white sm:flex-row sm:items-end sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Последние 14 дней</p>
          <h2 id="lead-campaign-report-title" className="mt-1 text-lg font-bold">Отчёт по каналам и предложениям</h2>
        </div>
        <p className="text-xs text-slate-300">В каждой ячейке: сейчас · ранее за 14 дней</p>
      </div>

      {isLoading && (
        <div role="status" className="px-5 py-6 text-sm font-medium text-slate-600">
          Загружаем отчёт по кампаниям…
        </div>
      )}

      {isError && (
        <div role="alert" className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Отчёт по кампаниям временно недоступен. Заявки ниже продолжают работать.
        </div>
      )}

      {!isLoading && !isError && data?.rows.length === 0 && (
        <p className="px-5 py-6 text-sm text-slate-600">Данных по кампаниям за последние 28 дней нет</p>
      )}

      {!isLoading && !isError && data && data.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-sm">
            <caption className="sr-only">
              Сравнение лидов, бронирований, подтверждённых аренд, конверсии и выручки по UTM-каналам и кампаниям
            </caption>
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-2.5 text-left">Канал</th>
                <th scope="col" className="px-3 py-2.5 text-left">Предложение</th>
                <th scope="col" className="px-3 py-2.5 text-right">Лиды</th>
                <th scope="col" className="px-3 py-2.5 text-right">Брони</th>
                <th scope="col" className="px-3 py-2.5 text-right">Аренды</th>
                <th scope="col" className="px-3 py-2.5 text-right">Конверсия</th>
                <th scope="col" className="px-3 py-2.5 text-right">Выручка</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <ReportRow key={`${row.source}\u0000${row.campaign}`} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
