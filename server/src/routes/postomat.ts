import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { lockerCommandsService } from '../services/lockerCommands'
import { database } from '../models/database'

const router = Router()

const heartbeatSchema = z.object({
  officeId: z.number().int().positive(),
  version: z.string().max(50).optional().nullable(),
  uptime: z.number().int().nonnegative().optional().nullable(),
  hostname: z.string().max(100).optional().nullable(),
})

const commandDoneSchema = z.object({
  success: z.boolean(),
  error: z.string().max(500).optional().nullable(),
})

function verifyPostomatSecret(req: Request, res: Response): boolean {
  const secret = process.env.POSTOMAT_SECRET
  if (!secret) {
    res.status(500).json({ error: 'POSTOMAT_SECRET не настроен' })
    return false
  }

  const provided = req.headers['x-postomat-secret']
  if (!provided || provided !== secret) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }

  return true
}

router.get('/offices/:officeId/commands/next', async (req: Request, res: Response) => {
  if (!verifyPostomatSecret(req, res)) return

  try {
    const officeId = Number(req.params.officeId)
    if (!Number.isInteger(officeId) || officeId <= 0) {
      return res.status(400).json({ error: 'Некорректный officeId' })
    }

    const office = await database.get('SELECT id FROM offices WHERE id = ?', [officeId])
    if (!office) {
      return res.status(404).json({ error: 'Офис не найден' })
    }

    const command = await lockerCommandsService.takeNextCommand(officeId)
    if (!command) return res.json(null)

    const locker = await database.get(
      'SELECT locker_number FROM lockers WHERE id = ? AND office_id = ?',
      [command.lockerId, officeId]
    )
    if (!locker) {
      await lockerCommandsService.completeCommand(command.id, false, 'Locker not found during dispatch')
      return res.status(500).json({ error: 'Ячейка команды не найдена' })
    }

    const physicalLockerNumber = Number(locker.locker_number)
    if (!Number.isInteger(physicalLockerNumber) || physicalLockerNumber <= 0) {
      await lockerCommandsService.completeCommand(command.id, false, 'Invalid locker_number during dispatch')
      return res.status(500).json({ error: 'Некорректный номер ячейки' })
    }

    return res.json({
      id: command.id,
      lockerId: physicalLockerNumber,
    })
  } catch (error) {
    console.error('Error taking next postomat command:', error)
    res.status(500).json({ error: 'Ошибка получения команды' })
  }
})

router.post('/commands/:commandId/done', async (req: Request, res: Response) => {
  if (!verifyPostomatSecret(req, res)) return

  try {
    const commandId = Number(req.params.commandId)
    if (!Number.isInteger(commandId) || commandId <= 0) {
      return res.status(400).json({ error: 'Некорректный commandId' })
    }

    const parsed = commandDoneSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map((e) => e.message).join(', ') })
    }

    const updated = await lockerCommandsService.completeCommand(commandId, parsed.data.success, parsed.data.error ?? null)
    if (!updated) {
      return res.status(404).json({ error: 'Команда не найдена' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error completing postomat command:', error)
    res.status(500).json({ error: 'Ошибка подтверждения команды' })
  }
})

router.post('/heartbeat', async (req: Request, res: Response) => {
  if (!verifyPostomatSecret(req, res)) return

  try {
    const parsed = heartbeatSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map((e) => e.message).join(', ') })
    }

    const office = await database.get('SELECT id FROM offices WHERE id = ?', [parsed.data.officeId])
    if (!office) {
      return res.status(404).json({ error: 'Офис не найден' })
    }

    const status = await lockerCommandsService.heartbeat(
      parsed.data.officeId,
      parsed.data.version ?? null,
      parsed.data.uptime ?? null,
      parsed.data.hostname ?? null
    )

    res.json({
      officeId: status.officeId,
      online: status.online,
      lastSeen: status.lastSeen,
    })
  } catch (error) {
    console.error('Error handling postomat heartbeat:', error)
    res.status(500).json({ error: 'Ошибка heartbeat' })
  }
})

export default router
