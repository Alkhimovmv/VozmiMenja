import { z } from 'zod'

export const leadResults = ['unreached', 'thinking', 'booked', 'declined', 'duplicate'] as const

export type LeadResult = typeof leadResults[number]

export const leadWorkflowSchema = z.object({
  result: z.enum(leadResults),
  revenue: z.number().finite().min(0).max(10_000_000).nullable().optional(),
})
