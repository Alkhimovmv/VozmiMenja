import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AdminRole, adminUserModel } from '../models/AdminUser'

export interface AuthTokenPayload {
  userId: number
  phone: string
  role: AdminRole
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload
    }
  }
}

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required')
}
const JWT_SECRET: string = jwtSecret

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as AuthTokenPayload
  } catch {
    return null
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }

  // Токен живёт 30 дней, поэтому сверяемся с базой: удалённый пользователь теряет доступ
  // сразу, а смена роли действует без перевыпуска токена.
  try {
    const user = await adminUserModel.findById(payload.userId)
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    req.user = { userId: user.id, phone: user.phone, role: user.role }
  } catch (error) {
    console.error('Auth user lookup failed:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }

  next()
}

export function superAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Forbidden: superadmin only' })
    }
    next()
  })
}
