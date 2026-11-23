import { z } from 'zod'

export const RENTAL_COMMENT_MAX_LENGTH = 5000

export const rentalCommentSchema = z.string().max(
  RENTAL_COMMENT_MAX_LENGTH,
  `Комментарий не должен превышать ${RENTAL_COMMENT_MAX_LENGTH} символов`,
)
