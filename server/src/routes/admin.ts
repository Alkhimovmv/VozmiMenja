import { Router, Request, Response } from 'express'
import { upload } from '../middleware/upload'
import { authMiddleware } from '../middleware/auth'

const router = Router()

const ADMIN_PASSWORD = '20031997'

// Логин для админки аренды
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body

    if (password === ADMIN_PASSWORD) {
      return res.json({
        token: ADMIN_PASSWORD // В реальном приложении генерировать JWT
      })
    }

    return res.status(401).json({
      error: 'Invalid password'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Проверка токена для админки аренды
router.get('/auth/verify', authMiddleware, async (req: Request, res: Response) => {
  // Если прошли authMiddleware - токен валиден
  res.json({ valid: true })
})

// Логин (старый endpoint для VozmiMenja админки)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body

    if (password === ADMIN_PASSWORD) {
      return res.json({
        success: true,
        data: {
          token: ADMIN_PASSWORD // В реальном приложении генерировать JWT
        }
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid password'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Удалены роуты /equipment (POST, PUT, DELETE), так как они обрабатываются через rentalEquipmentRoutes

// Загрузить изображения
router.post('/upload', authMiddleware, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    // Возвращаем относительные пути вместо полных URL
    // Frontend сам добавит нужный домен через API_SERVER_URL
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`)

    res.json({
      success: true,
      data: imageUrls
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    })
  }
})

export default router
