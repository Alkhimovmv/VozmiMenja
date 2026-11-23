import { timingSafeEqual } from 'crypto'

// Сравнение секретов за постоянное время: обычное !== выдаёт длину совпавшего префикса по таймингу.
export function secretMatches(provided: unknown, expected: string): boolean {
  if (typeof provided !== 'string' || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// Секрет устройства постамата: отдельный POSTOMAT_SECRET_OFFICE_<id>, если задан,
// иначе общий POSTOMAT_SECRET (обратная совместимость с уже настроенными устройствами).
export function getPostomatSecret(officeId: number | null | undefined, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const officeSecret = officeId ? env[`POSTOMAT_SECRET_OFFICE_${officeId}`] : undefined
  return officeSecret || env.POSTOMAT_SECRET
}
