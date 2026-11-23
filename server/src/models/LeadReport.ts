import { all } from './database'
import { DEFAULT_OFFICE_ID } from '../middleware/userFilter'

export interface LeadReportRecord {
  kind: 'booking' | 'contact'
  createdAt: string
  utmSource?: string
  utmCampaign?: string
  leadResult?: string
  leadRevenue?: number
  totalPrice?: number
  officeId?: number
}

const sqliteUtc = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ')

const officeClause = (officeIds: number[] | null, alias: string) => {
  if (officeIds === null) return { sql: '', params: [] as number[] }
  if (officeIds.length === 0) return { sql: ' AND 1 = 0', params: [] as number[] }

  return {
    sql: ` AND COALESCE(${alias}.office_id, ${DEFAULT_OFFICE_ID}) IN (${officeIds.map(() => '?').join(', ')})`,
    params: officeIds,
  }
}

export class LeadReportModel {
  async findSince(baselineStart: Date, officeIds: number[] | null): Promise<LeadReportRecord[]> {
    const bookingScope = officeClause(officeIds, 'b')
    const contactScope = officeClause(officeIds, 'c')
    const start = sqliteUtc(baselineStart)
    const rows = await all(`
      SELECT
        'booking' AS kind,
        b.created_at,
        b.utm_source,
        b.utm_campaign,
        b.lead_result,
        b.lead_revenue,
        b.total_price,
        b.office_id
      FROM bookings b
      WHERE b.created_at >= ?${bookingScope.sql}

      UNION ALL

      SELECT
        'contact' AS kind,
        c.created_at,
        c.utm_source,
        c.utm_campaign,
        c.lead_result,
        c.lead_revenue,
        NULL AS total_price,
        c.office_id
      FROM contact_leads c
      WHERE c.created_at >= ?${contactScope.sql}
    `, [start, ...bookingScope.params, start, ...contactScope.params]) as Array<Record<string, unknown>>

    return rows.map((row) => ({
      kind: row.kind as LeadReportRecord['kind'],
      createdAt: row.created_at as string,
      utmSource: (row.utm_source as string) || undefined,
      utmCampaign: (row.utm_campaign as string) || undefined,
      leadResult: (row.lead_result as string) || undefined,
      leadRevenue: row.lead_revenue == null ? undefined : Number(row.lead_revenue),
      totalPrice: row.total_price == null ? undefined : Number(row.total_price),
      officeId: row.office_id == null ? undefined : Number(row.office_id),
    }))
  }
}

export const leadReportModel = new LeadReportModel()
