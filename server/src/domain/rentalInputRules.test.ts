import { RENTAL_COMMENT_MAX_LENGTH, rentalCommentSchema } from './rentalInputRules'

describe('rental input rules', () => {
  it('accepts a detailed operational comment longer than the old 1000 character limit', () => {
    expect(rentalCommentSchema.safeParse('а'.repeat(1500)).success).toBe(true)
  })

  it('still rejects unexpectedly large comments', () => {
    expect(rentalCommentSchema.safeParse('а'.repeat(RENTAL_COMMENT_MAX_LENGTH + 1)).success).toBe(false)
  })
})
