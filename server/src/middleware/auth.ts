import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AdminRole } from '../models/AdminUser'

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

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }

  req.user = payload
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
