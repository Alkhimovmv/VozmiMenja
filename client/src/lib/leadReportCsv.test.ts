import assert from 'node:assert/strict';
import type { LeadReportResponse } from '../api/admin/bookings';
import { buildLeadReportCsv, getLeadReportCsvFilename } from './leadReportCsv';

const report: LeadReportResponse = {
  generatedAt: '2030-01-29T12:00:00.000Z',
  periodDays: 14,
  rows: [{
    source: '=WEBSERVICE("https://example.test")',
    campaign: 'Ковры; диваны\nМосква',
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
};

const csv = buildLeadReportCsv(report);

assert.ok(csv.startsWith('\uFEFF'), 'CSV must include a UTF-8 BOM for Excel');
assert.match(csv, /Канал;Предложение;Лиды \(текущие 14 дней\)/);
assert.match(csv, /"'=WEBSERVICE\(""https:\/\/example\.test""\)"/);
assert.match(csv, /"Ковры; диваны\nМосква"/);
assert.match(csv, /;4;3;2;50;15000;2;1;1;50;5000/);
assert.equal(getLeadReportCsvFilename(report.generatedAt), 'vozmimenya-leads-2030-01-29.csv');

for (const dangerousPrefix of ['+', '-', '@', '\t', '\r', '\n', '＝', '＋', '－', '＠']) {
  const protectedCsv = buildLeadReportCsv({
    ...report,
    rows: [{ ...report.rows[0], source: `${dangerousPrefix}dangerous` }],
  });
  const safeSource = `'${dangerousPrefix}dangerous`;
  const expectedCell = /[;"\r\n]/.test(safeSource) ? `"${safeSource}"` : safeSource;
  assert.ok(
    protectedCsv.includes(`\r\n${expectedCell};`),
    `CSV must neutralize source beginning with ${JSON.stringify(dangerousPrefix)}`,
  );
}

console.log('lead report CSV tests passed');
