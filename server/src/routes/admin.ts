import { Router, Request, Response } from 'express'
import { upload } from '../middleware/upload'
import { authMiddleware, superAdminMiddleware, signToken } from '../middleware/auth'
import { adminUserModel } from '../models/AdminUser'
import { schedulerService } from '../services/scheduler'
import { emailBackupService } from '../services/emailBackup'

const router = Router()

// Логин по номеру телефона + пароль
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({ error: 'Укажите номер телефона и пароль' })
    }

    const user = await adminUserModel.findByPhone(phone)
    if (!user) {
      return res.status(401).json({ error: 'Неверный номер телефона или пароль' })
    }

    const valid = await adminUserModel.verifyPassword(user, password)
    if (!valid) {
      return res.status(401).json({ error: 'Неверный номер телефона или пароль' })
    }

    const token = signToken({ userId: user.id, phone: user.phone, role: user.role })

    return res.json({
      token,
      user: adminUserModel.toPublic(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Проверка токена — возвращает текущего пользователя с ролью
router.get('/auth/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await adminUserModel.findById(req.user!.userId)
    if (!user) {
      return res.status(401).json({ valid: false })
    }
    res.json({ valid: true, user: adminUserModel.toPublic(user) })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Управление пользователями (только суперадмин)
router.get('/users', superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await adminUserModel.findAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения пользователей' })
  }
})

router.post('/users', superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { phone, password, role, name } = req.body
    if (!phone || !password) {
      return res.status(400).json({ error: 'Укажите номер телефона и пароль' })
    }
    const existing = await adminUserModel.findByPhone(phone)
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким номером уже существует' })
    }
    const user = await adminUserModel.create(phone, password, role || 'admin', name)
    res.status(201).json(adminUserModel.toPublic(user))
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Ошибка создания пользователя' })
  }
})

router.put('/users/:id', superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { password, role, name } = req.body

    // Нельзя менять роль самому себе
    if (role && id === req.user!.userId) {
      return res.status(400).json({ error: 'Нельзя изменить свою роль' })
    }

    if (password) await adminUserModel.updatePassword(id, password)
    if (role) await adminUserModel.updateRole(id, role)
    if (name !== undefined) await adminUserModel.updateName(id, name)

    const user = await adminUserModel.findById(id)
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' })

    res.json(adminUserModel.toPublic(user))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления пользователя' })
  }
})

router.delete('/users/:id', superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'Нельзя удалить себя' })
    }
    await adminUserModel.delete(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления пользователя' })
  }
})

// Тестовая отправка ежедневного уведомления
router.post('/test-daily-reminder', authMiddleware, async (req: Request, res: Response) => {
  try {
    await schedulerService.sendDailyRentalsReminder()
    res.json({ success: true, message: 'Уведомление отправлено' })
  } catch (error) {
    console.error('❌ Ошибка тестовой отправки:', error)
    res.status(500).json({ success: false, message: 'Ошибка отправки уведомления' })
  }
})

// Ручная отправка email бэкапа БД
router.post('/send-db-backup', authMiddleware, async (req: Request, res: Response) => {
  try {
    await emailBackupService.sendDatabaseBackup()
    res.json({ success: true, message: 'Бэкап отправлен на email' })
  } catch (error: any) {
    console.error('❌ Ошибка отправки бэкапа:', error)
    res.status(500).json({ success: false, message: error.message || 'Ошибка отправки' })
  }
})

// Загрузка изображений
router.post('/upload', authMiddleware, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ success: false, message: 'No files uploaded' })
    }
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`)
    res.json({ success: true, data: imageUrls })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, message: 'Failed to upload images' })
  }
})

export default router
