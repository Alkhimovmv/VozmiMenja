import { database } from '../models/database'

export type LockerCommandStatus = 'pending' | 'processing' | 'done' | 'failed'

export interface LockerCommand {
  id: number
  officeId: number
  lockerId: number
  status: LockerCommandStatus
  createdAt: string
  takenAt: string | null
  finishedAt: string | null
  error: string | null
}

export interface PostomatStatus {
  officeId: number
  lastSeen: string | null
  online: boolean
  version: string | null
  uptime: number | null
  hostname: string | null
}

const STALE_COMMAND_SECONDS = 60

function mapCommand(row: any): LockerCommand {
  return {
    id: row.id,
    officeId: row.office_id,
    lockerId: row.locker_id,
    status: row.status,
    createdAt: row.created_at,
    takenAt: row.taken_at || null,
    finishedAt: row.finished_at || null,
    error: row.error || null,
  }
}

function mapPostomatStatus(row: any): PostomatStatus {
  return {
    officeId: row.office_id,
    lastSeen: row.last_seen || null,
    online: row.online === 1,
    version: row.version || null,
    uptime: row.uptime ?? null,
    hostname: row.hostname || null,
  }
}

export const lockerCommandsService = {
  async markStaleProcessingCommands(): Promise<number> {
    const result = await database.run(
      `UPDATE locker_commands
       SET status = 'failed',
           error = COALESCE(error, 'Timed out waiting for postomat confirmation'),
           finished_at = COALESCE(finished_at, CURRENT_TIMESTAMP)
       WHERE status = 'processing'
         AND taken_at IS NOT NULL
         AND datetime(taken_at) <= datetime('now', ?)`,
      [`-${STALE_COMMAND_SECONDS} seconds`]
    )

    if ((result.changes || 0) > 0) {
      console.warn(`[postomat] auto-failed stale commands: ${result.changes}`)
    }

    return result.changes || 0
  },

  async createCommand(officeId: number, lockerId: number): Promise<LockerCommand> {
    await this.markStaleProcessingCommands()

    const existingLocker = await database.get(
      'SELECT id, locker_number, office_id FROM lockers WHERE id = ?',
      [lockerId]
    )
    if (!existingLocker) {
      throw new Error('LOCKER_NOT_FOUND')
    }
    if (existingLocker.office_id !== officeId) {
      throw new Error('LOCKER_OFFICE_MISMATCH')
    }

    const lockerNumber = Number(existingLocker.locker_number)
    if (!Number.isFinite(lockerNumber) || lockerNumber < 1 || lockerNumber > 16) {
      throw new Error('LOCKER_OUT_OF_RANGE')
    }

    const result = await database.run(
      `INSERT INTO locker_commands (office_id, locker_id, status)
       VALUES (?, ?, 'pending')`,
      [officeId, lockerId]
    )

    const row = await database.get('SELECT * FROM locker_commands WHERE id = ?', [result.lastID])
    console.log(`[postomat] queued remote open: office=${officeId}, locker=${lockerId}, command=${result.lastID}`)
    return mapCommand(row)
  },

  async getCommandsHistory(officeId: number, limit = 50): Promise<LockerCommand[]> {
    await this.markStaleProcessingCommands()
    const rows = await database.all(
      `SELECT *
       FROM locker_commands
       WHERE office_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
      [officeId, limit]
    )
    return rows.map(mapCommand)
  },

  async takeNextCommand(officeId: number): Promise<LockerCommand | null> {
    await this.markStaleProcessingCommands()

    await database.run('BEGIN IMMEDIATE TRANSACTION')
    try {
      const row = await database.get(
        `SELECT id
         FROM locker_commands
         WHERE office_id = ? AND status = 'pending'
         ORDER BY created_at ASC, id ASC
         LIMIT 1`,
        [officeId]
      )

      if (!row) {
        await database.run('COMMIT')
        return null
      }

      const updateResult = await database.run(
        `UPDATE locker_commands
         SET status = 'processing',
             taken_at = CURRENT_TIMESTAMP,
             error = NULL
         WHERE id = ? AND status = 'pending'`,
        [row.id]
      )

      if (!updateResult.changes) {
        await database.run('ROLLBACK')
        return null
      }

      const command = await database.get('SELECT * FROM locker_commands WHERE id = ?', [row.id])
      await database.run('COMMIT')
      console.log(`[postomat] command taken: office=${officeId}, command=${row.id}`)
      return mapCommand(command)
    } catch (error) {
      try {
        await database.run('ROLLBACK')
      } catch {
        // ignore rollback errors
      }
      throw error
    }
  },

  async completeCommand(commandId: number, success: boolean, error: string | null): Promise<LockerCommand | null> {
    const existing = await database.get('SELECT * FROM locker_commands WHERE id = ?', [commandId])
    if (!existing) return null

    const status: LockerCommandStatus = success ? 'done' : 'failed'
    await database.run(
      `UPDATE locker_commands
       SET status = ?,
           error = ?,
           finished_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, success ? null : (error || 'Unknown postomat error'), commandId]
    )

    console.log(`[postomat] command finished: command=${commandId}, success=${success}, error=${error || ''}`)
    const updated = await database.get('SELECT * FROM locker_commands WHERE id = ?', [commandId])
    return updated ? mapCommand(updated) : null
  },

  async heartbeat(officeId: number, version: string | null, uptime: number | null, hostname: string | null): Promise<PostomatStatus> {
    await database.run(
      `INSERT INTO postomat_devices (office_id, last_seen, online, version, uptime, hostname, updated_at)
       VALUES (?, CURRENT_TIMESTAMP, 1, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(office_id) DO UPDATE SET
         last_seen = CURRENT_TIMESTAMP,
         online = 1,
         version = excluded.version,
         uptime = excluded.uptime,
         hostname = excluded.hostname,
         updated_at = CURRENT_TIMESTAMP`,
      [officeId, version, uptime, hostname]
    )

    const row = await database.get('SELECT * FROM postomat_devices WHERE office_id = ?', [officeId])
    return mapPostomatStatus(row)
  },

  async getPostomatStatus(officeId: number): Promise<PostomatStatus | null> {
    const row = await database.get(
      `SELECT
         office_id,
         last_seen,
         CASE
           WHEN last_seen IS NOT NULL AND datetime(last_seen) >= datetime('now', '-10 seconds') THEN 1
           ELSE 0
         END AS online,
         version,
         uptime,
         hostname
       FROM postomat_devices
       WHERE office_id = ?`,
      [officeId]
    )
    return row ? mapPostomatStatus(row) : null
  },
}
