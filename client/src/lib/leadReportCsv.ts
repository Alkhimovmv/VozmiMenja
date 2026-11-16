import type { LeadReportResponse, LeadReportRow } from '../api/admin/bookings';

const FORMULA_PREFIX = /^(?:[=+\-@\t\r\n]| +[=+\-@])/;

const escapeCsvCell = (value: string | number): string => {
  const raw = String(value);
  const normalizedPrefix = raw.normalize('NFKC');
  const safe = typeof value === 'string' && FORMULA_PREFIX.test(normalizedPrefix) ? `'${raw}` : raw;

  return /[;"\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};

const rowToCells = (row: LeadReportRow): Array<string | number> => [
  row.source,
  row.campaign,
  row.currentLeads,
  row.currentStartedBookings,
  row.currentConfirmedRentals,
  row.currentConversion,
  row.currentRevenue,
  row.baselineLeads,
  row.baselineStartedBookings,
  row.baselineConfirmedRentals,
  row.baselineConversion,
  row.baselineRevenue,
];

export function buildLeadReportCsv(report: LeadReportResponse): string {
  const days = report.periodDays;
  const headers = [
    'Канал',
    'Предложение',
    `Лиды (текущие ${days} дней)`,
    `Брони (текущие ${days} дней)`,
    `Аренды (текущие ${days} дней)`,
    `Конверсия, % (текущие ${days} дней)`,
    `Выручка, ₽ (текущие ${days} дней)`,
    `Лиды (предыдущие ${days} дней)`,
    `Брони (предыдущие ${days} дней)`,
    `Аренды (предыдущие ${days} дней)`,
    `Конверсия, % (предыдущие ${days} дней)`,
    `Выручка, ₽ (предыдущие ${days} дней)`,
  ];
  const rows = [headers, ...report.rows.map(rowToCells)];

  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n')}\r\n`;
}

export function getLeadReportCsvFilename(generatedAt: string): string {
  const date = generatedAt.slice(0, 10);
  return `vozmimenya-leads-${/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : 'report'}.csv`;
}

export function downloadLeadReportCsv(report: LeadReportResponse): void {
  const blob = new Blob([buildLeadReportCsv(report)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = getLeadReportCsvFilename(report.generatedAt);
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
