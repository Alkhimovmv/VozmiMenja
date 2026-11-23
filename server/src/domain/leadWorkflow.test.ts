import { leadResults, leadWorkflowSchema } from './leadWorkflow'

describe('lead workflow', () => {
  it.each(['unreached', 'thinking', 'booked', 'declined', 'duplicate'] as const)(
    'accepts the %s result',
    (result) => {
      expect(leadWorkflowSchema.safeParse({ result }).success).toBe(true)
    },
  )

  it('exposes the exact supported results', () => {
    expect(leadResults).toEqual(['unreached', 'thinking', 'booked', 'declined', 'duplicate'])
  })

  it.each([
    { result: 'unknown' },
    { result: 'booked', revenue: -1 },
    { result: 'booked', revenue: Number.NaN },
    { result: 'booked', revenue: 10_000_001 },
  ])('rejects invalid workflow payload %#', (payload) => {
    expect(leadWorkflowSchema.safeParse(payload).success).toBe(false)
  })

  it('accepts nullable and omitted revenue within the allowed range', () => {
    expect(leadWorkflowSchema.safeParse({ result: 'booked', revenue: null }).success).toBe(true)
    expect(leadWorkflowSchema.safeParse({ result: 'booked', revenue: 0 }).success).toBe(true)
    expect(leadWorkflowSchema.safeParse({ result: 'booked', revenue: 10_000_000 }).success).toBe(true)
  })
})
