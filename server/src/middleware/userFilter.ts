import { Request } from 'express'
import { database } from '../models/database'

// Если суперадмин передаёт X-View-As-User, возвращаем userId этого пользователя.
// Иначе возвращаем userId самого пользователя, или null для суперадмина без маски.
function getEffectiveUserId(req: Request): number | null {
  if (req.user?.role === 'superadmin') {
    const viewAs = req.headers['x-view-as-user']
    if (viewAs) {
      const id = parseInt(viewAs as string)
      if (!isNaN(id)) return id
    }
    return null // суперадмин без маски — без фильтра
  }
  return req.user!.userId
}

// Возвращает список office_id которые принадлежат текущему пользователю.
// Суперадмин без маски видит все офисы (возвращает null = без фильтра).
// Суперадмин с маской видит офисы выбранного аккаунта.
export async function getUserOfficeIds(req: Request): Promise<number[] | null> {
  const userId = getEffectiveUserId(req)
  if (userId === null) return null

  const offices = await database.all(
    'SELECT id FROM offices WHERE user_id = ?',
    [userId]
  )
  return offices.map((o: any) => o.id)
}

// Возвращает список equipment_id которые принадлежат текущему пользователю.
// Суперадмин без маски видит всё (возвращает null = без фильтра).
export async function getUserEquipmentIds(req: Request): Promise<number[] | null> {
  const userId = getEffectiveUserId(req)
  if (userId === null) return null

  const items = await database.all(
    'SELECT id FROM rental_equipment WHERE user_id = ?',
    [userId]
  )
  return items.map((e: any) => e.id)
}

// SQL-фрагмент для фильтрации по списку значений
export function buildInClause(ids: number[], column: string): { sql: string; params: number[] } {
  if (ids.length === 0) return { sql: '1=0', params: [] }
  const placeholders = ids.map(() => '?').join(',')
  return { sql: `${column} IN (${placeholders})`, params: ids }
}
