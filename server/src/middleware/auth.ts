import { Request, Response, NextFunction } from 'express'

// Middleware для проверки авторизации
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return res.status(500).json({ success: false, message: 'Server misconfiguration' })
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    })
  }

  const token = authHeader.substring(7)

  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  next()
}
