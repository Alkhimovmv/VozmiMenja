const LOCAL_RENTAL_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/

export function normalizeLocalRentalDate(value: string): string | null {
  const match = value.trim().match(LOCAL_RENTAL_DATE)
  if (!match) return null

  const [, rawYear, rawMonth, rawDay, rawHour = '0', rawMinute = '0', rawSecond = '0', rawMs = '0'] = match
  const [year, month, day, hour, minute, second, ms] = [
    Number(rawYear),
    Number(rawMonth),
    Number(rawDay),
    Number(rawHour),
    Number(rawMinute),
    Number(rawSecond),
    Number(rawMs.padEnd(3, '0')),
  ]
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms))
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
    || date.getUTCHours() !== hour
    || date.getUTCMinutes() !== minute
    || date.getUTCSeconds() !== second
    || date.getUTCMilliseconds() !== ms
  ) return null

  return value.trim().replace(' ', 'T')
}
