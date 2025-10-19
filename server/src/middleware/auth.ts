import { Request, Response, NextFunction } from 'express'

const ADMIN_PASSWORD = '20031997'

// Middleware для проверки авторизации
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    })
  }

  const token = authHeader.substring(7)

  // Простая проверка токена (в реальном приложении использовать JWT)
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  next()
}
