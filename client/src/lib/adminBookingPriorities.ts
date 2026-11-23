export type BookingUrgency = 'past' | 'today' | 'tomorrow' | 'later'
export type CustomerSegment = 'new' | 'single' | 'repeat' | 'loyal'
export type CustomerSegmentFilter = 'single' | 'repeat' | 'loyal'

type PrioritizableBooking = {
  startDate: string
  status: string
  createdAt: string
}

const MOSCOW_TIME_ZONE = 'Europe/Moscow'

const formatDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: MOSCOW_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

const addDaysToDateKey = (dateKey: string, days: number) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

const normalizeCreatedAt = (createdAt: string) => (
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(createdAt)
    ? `${createdAt.replace(' ', 'T')}Z`
    : createdAt
)

export const getBookingUrgency = (startDate: string, now = new Date()): BookingUrgency => {
  const bookingDate = startDate.slice(0, 10)
  const today = formatDateKey(now)

  if (bookingDate < today) return 'past'
  if (bookingDate === today) return 'today'
  if (bookingDate === addDaysToDateKey(today, 1)) return 'tomorrow'
  return 'later'
}

const urgencyRank: Record<BookingUrgency, number> = {
  past: 0,
  today: 1,
  tomorrow: 2,
  later: 3,
}

export const sortBookingsByOperationalPriority = <T extends PrioritizableBooking>(
  bookings: readonly T[],
  now = new Date(),
): T[] => [...bookings].sort((a, b) => {
  const urgencyDifference = urgencyRank[getBookingUrgency(a.startDate, now)]
    - urgencyRank[getBookingUrgency(b.startDate, now)]
  if (urgencyDifference !== 0) return urgencyDifference

  if (a.status === 'pending' && b.status !== 'pending') return -1
  if (a.status !== 'pending' && b.status === 'pending') return 1

  return new Date(normalizeCreatedAt(b.createdAt)).getTime()
    - new Date(normalizeCreatedAt(a.createdAt)).getTime()
})

export const getCustomerSegment = (rentalCount: number): CustomerSegment => {
  if (rentalCount >= 3) return 'loyal'
  if (rentalCount >= 2) return 'repeat'
  if (rentalCount === 1) return 'single'
  return 'new'
}

export const isCustomerInSegment = (
  rentalCount: number,
  segment: CustomerSegmentFilter,
) => {
  if (segment === 'single') return rentalCount === 1
  if (segment === 'repeat') return rentalCount >= 2
  return rentalCount >= 3
}
