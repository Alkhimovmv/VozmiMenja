import { Router, Request, Response } from 'express'
import { upload } from '../middleware/upload'
import { authMiddleware } from '../middleware/auth'
import { schedulerService } from '../services/scheduler'

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

// Тестовая отправка ежедневного уведомления о предстоящих арендах
router.post('/test-daily-reminder', authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('🧪 Тестовая отправка ежедневного напоминания')
    await schedulerService.sendDailyRentalsReminder()

    res.json({
      success: true,
      message: 'Уведомление отправлено'
    })
  } catch (error) {
    console.error('❌ Ошибка тестовой отправки:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка отправки уведомления',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Загрузить изображения
router.post('/upload', authMiddleware, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    console.log('📸 Upload route called')
    console.log('   Files received:', req.files ? (req.files as any[]).length : 0)
    console.log('   User:', req.headers.authorization ? 'Authenticated' : 'Not authenticated')

    if (!req.files || !Array.isArray(req.files)) {
      console.error('❌ No files in request')
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    // Возвращаем относительные пути вместо полных URL
    // Frontend сам добавит нужный домен через API_SERVER_URL
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`)
    console.log('✅ Files uploaded successfully:', imageUrls)

    res.json({
      success: true,
      data: imageUrls
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    console.error('   Error stack:', error instanceof Error ? error.stack : 'No stack')
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
