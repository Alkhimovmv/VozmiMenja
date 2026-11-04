import assert from 'node:assert/strict';
import axios from 'axios';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: () => null,
    removeItem: () => undefined,
    setItem: () => undefined,
  },
});

axios.defaults.adapter = async (config) => ({
  config,
  data: {},
  headers: {},
  status: 200,
  statusText: 'OK',
});

const { default: LeadCampaignReport } = await import('./LeadCampaignReport');

const renderReport = (data: unknown) => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['admin-lead-report'], data);
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <LeadCampaignReport />
    </QueryClientProvider>,
  );
};

const emptyHtml = renderReport({
  generatedAt: '2030-01-29T12:00:00.000Z',
  periodDays: 14,
  rows: [],
});
assert.match(emptyHtml, /Данных по кампаниям за последние 28 дней нет/);

const reportHtml = renderReport({
  generatedAt: '2030-01-29T12:00:00.000Z',
  periodDays: 14,
  rows: [{
    source: 'yandex',
    campaign: 'winter',
    currentLeads: 4,
    currentStartedBookings: 3,
    currentConfirmedRentals: 2,
    currentRevenue: 15_000,
    currentConversion: 50,
    baselineLeads: 2,
    baselineStartedBookings: 1,
    baselineConfirmedRentals: 1,
    baselineRevenue: 5_000,
    baselineConversion: 50,
  }],
});
assert.match(reportHtml, /Отчёт по каналам и предложениям/);
assert.match(reportHtml, /<table/);
assert.match(reportHtml, /yandex/);
assert.match(reportHtml, /winter/);
assert.match(reportHtml, /15[\s\S]*₽/);
assert.match(reportHtml, /50[\s\S]*%/);
assert.match(reportHtml, /scope="colgroup"[^>]*col[Ss]pan="5"[^>]*>Текущие 14 дней</);
assert.match(reportHtml, /scope="colgroup"[^>]*col[Ss]pan="5"[^>]*>Предыдущие 14 дней</);

const expectedColumnOrder = [
  'current-leads',
  'current-started',
  'current-confirmed',
  'current-conversion',
  'current-revenue',
  'baseline-leads',
  'baseline-started',
  'baseline-confirmed',
  'baseline-conversion',
  'baseline-revenue',
];
let previousColumnIndex = -1;
let previousCellIndex = -1;
for (const columnId of expectedColumnOrder) {
  const columnIndex = reportHtml.indexOf(`id="${columnId}"`);
  const period = columnId.startsWith('current-') ? 'current' : 'baseline';
  const cellIndex = reportHtml.indexOf(`headers="${period}-period ${columnId}"`);
  assert.ok(columnIndex > previousColumnIndex, `${columnId} must be a separate column in report order`);
  assert.ok(cellIndex > previousCellIndex, `${columnId} data cell must follow the column order`);
  previousColumnIndex = columnIndex;
  previousCellIndex = cellIndex;
}

const failedClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
await failedClient.prefetchQuery({
  queryKey: ['admin-lead-report'],
  queryFn: async () => { throw new Error('offline'); },
});
failedClient.setQueryDefaults(['admin-lead-report'], { enabled: false, retry: false });
const failedHtml = renderToStaticMarkup(
  <QueryClientProvider client={failedClient}>
    <LeadCampaignReport />
  </QueryClientProvider>,
);
assert.match(failedHtml, /Отчёт по кампаниям временно недоступен/);

console.log('lead campaign report component tests passed');
