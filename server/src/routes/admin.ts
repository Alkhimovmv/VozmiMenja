import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { equipmentModel } from '../models/Equipment'
import { upload } from '../middleware/upload'

const router = Router()

const ADMIN_PASSWORD = '20031997'

// Middleware для проверки авторизации
function authMiddleware(req: Request, res: Response, next: Function) {
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

// Логин
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

// Создать оборудование
router.post('/equipment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      id: uuidv4()
    }

    const equipment = await equipmentModel.create(data)

    res.status(201).json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error('Create equipment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment'
    })
  }
})

// Обновить оборудование
router.put('/equipment/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log('Update equipment request body:', JSON.stringify(req.body, null, 2))
    const equipment = await equipmentModel.update(id, req.body)

    res.json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error('Update equipment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment'
    })
  }
})

// Удалить оборудование
router.delete('/equipment/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await equipmentModel.delete(id)

    res.json({
      success: true,
      data: null
    })
  } catch (error) {
    console.error('Delete equipment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment'
    })
  }
})

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

    console.log('✅ Загружено изображений:', imageUrls.length)
    console.log('📁 Пути:', imageUrls)

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
