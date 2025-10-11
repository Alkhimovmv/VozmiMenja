import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { telegramService } from '../services/telegram'

const router = Router()

const contactMessageSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Некорректный номер телефона'),
  email: z.string().email('Некорректный email').optional(),
  subject: z.string().min(1, 'Выберите тему'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов')
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = contactMessageSchema.parse(req.body)

    // Отправляем уведомление в Telegram
    await telegramService.sendContactMessage({
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message
    })

    res.status(200).json({
      success: true,
      message: 'Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные данные',
        errors: error.errors
      })
    }

    console.error('Error sending contact message:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке сообщения'
    })
  }
})

export default router
