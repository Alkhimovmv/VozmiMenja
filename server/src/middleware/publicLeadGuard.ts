import type { RequestHandler } from 'express'

type RateState = {
  count: number
  resetAt: number
}

export type RateDecision = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export class InMemoryRateGate {
  private readonly states = new Map<string, RateState>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  consume(key: string, now = Date.now()): RateDecision {
    const current = this.states.get(key)
    const state = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + this.windowMs }
      : current

    state.count += 1
    this.states.set(key, state)

    if (this.states.size > 5000) {
      for (const [storedKey, storedState] of this.states) {
        if (storedState.resetAt <= now) this.states.delete(storedKey)
      }
    }

    return {
      allowed: state.count <= this.limit,
      remaining: Math.max(0, this.limit - state.count),
      resetAt: state.resetAt,
    }
  }
}

export function createPublicLeadRateLimiter(options: {
  limit?: number
  windowMs?: number
} = {}): RequestHandler {
  const limit = options.limit ?? 10
  const windowMs = options.windowMs ?? 10 * 60 * 1000
  const gate = new InMemoryRateGate(limit, windowMs)

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    const decision = gate.consume(key)
    const retryAfterSeconds = Math.max(1, Math.ceil((decision.resetAt - Date.now()) / 1000))

    res.setHeader('RateLimit-Limit', String(limit))
    res.setHeader('RateLimit-Remaining', String(decision.remaining))
    res.setHeader('RateLimit-Reset', String(Math.ceil(decision.resetAt / 1000)))

    if (!decision.allowed) {
      res.setHeader('Retry-After', String(retryAfterSeconds))
      return res.status(429).json({
        success: false,
        message: 'Слишком много попыток. Подождите несколько минут и попробуйте снова.',
      })
    }

    next()
  }
}

export const publicLeadRateLimiter = createPublicLeadRateLimiter()
