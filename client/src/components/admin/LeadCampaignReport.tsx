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

function MetricCell({ value, headers }: { value: string | number; headers: string }) {
  return (
    <td headers={headers} className="whitespace-nowrap px-3 py-3 text-right align-top font-bold text-slate-900">
      {value}
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
      <MetricCell value={row.currentLeads} headers="current-period current-leads" />
      <MetricCell value={row.currentStartedBookings} headers="current-period current-started" />
      <MetricCell value={row.currentConfirmedRentals} headers="current-period current-confirmed" />
      <MetricCell value={formatPercent(row.currentConversion)} headers="current-period current-conversion" />
      <MetricCell value={formatRub(row.currentRevenue)} headers="current-period current-revenue" />
      <MetricCell value={row.baselineLeads} headers="baseline-period baseline-leads" />
      <MetricCell value={row.baselineStartedBookings} headers="baseline-period baseline-started" />
      <MetricCell value={row.baselineConfirmedRentals} headers="baseline-period baseline-confirmed" />
      <MetricCell value={formatPercent(row.baselineConversion)} headers="baseline-period baseline-conversion" />
      <MetricCell value={formatRub(row.baselineRevenue)} headers="baseline-period baseline-revenue" />
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
        <p className="text-xs text-slate-300">Текущие 14 дней рядом с предыдущими</p>
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
          <table className="min-w-[1320px] w-full border-collapse text-sm">
            <caption className="sr-only">
              Сравнение лидов, бронирований, подтверждённых аренд, конверсии и выручки по UTM-каналам и кампаниям
            </caption>
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr className="border-b border-slate-300">
                <th id="report-channel" scope="col" rowSpan={2} className="px-3 py-2.5 text-left">Канал</th>
                <th id="report-offer" scope="col" rowSpan={2} className="px-3 py-2.5 text-left">Предложение</th>
                <th id="current-period" scope="colgroup" colSpan={5} className="border-l border-slate-300 px-3 py-2.5 text-center text-slate-800">
                  Текущие 14 дней
                </th>
                <th id="baseline-period" scope="colgroup" colSpan={5} className="border-l border-slate-300 px-3 py-2.5 text-center text-slate-800">
                  Предыдущие 14 дней
                </th>
              </tr>
              <tr>
                <th id="current-leads" headers="current-period" scope="col" className="border-l border-slate-300 px-3 py-2.5 text-right">Лиды</th>
                <th id="current-started" headers="current-period" scope="col" className="px-3 py-2.5 text-right">Брони</th>
                <th id="current-confirmed" headers="current-period" scope="col" className="px-3 py-2.5 text-right">Аренды</th>
                <th id="current-conversion" headers="current-period" scope="col" className="px-3 py-2.5 text-right">Конверсия</th>
                <th id="current-revenue" headers="current-period" scope="col" className="px-3 py-2.5 text-right">Выручка</th>
                <th id="baseline-leads" headers="baseline-period" scope="col" className="border-l border-slate-300 px-3 py-2.5 text-right">Лиды</th>
                <th id="baseline-started" headers="baseline-period" scope="col" className="px-3 py-2.5 text-right">Брони</th>
                <th id="baseline-confirmed" headers="baseline-period" scope="col" className="px-3 py-2.5 text-right">Аренды</th>
                <th id="baseline-conversion" headers="baseline-period" scope="col" className="px-3 py-2.5 text-right">Конверсия</th>
                <th id="baseline-revenue" headers="baseline-period" scope="col" className="px-3 py-2.5 text-right">Выручка</th>
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
