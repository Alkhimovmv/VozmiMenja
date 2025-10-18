import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { bookingModel } from '../models/Booking'
import { equipmentModel } from '../models/Equipment'
import { telegramService } from '../services/telegram'

const router = Router()

const createBookingSchema = z.object({
  equipmentId: z.string().uuid(),
  customerName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  customerPhone: z.string().min(10, 'Некорректный номер телефона'),
  customerEmail: z.string().email('Некорректный email').optional().or(z.literal('')),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата начала'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата окончания'),
  comment: z.string().optional()
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const bookings = await bookingModel.findAll()

    res.json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении бронирований'
    })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const booking = await bookingModel.findById(id)

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Бронирование не найдено'
      })
    }

    res.json({
      success: true,
      data: booking
    })
  } catch (error) {
    console.error('Error fetching booking by ID:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении бронирования'
    })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createBookingSchema.parse(req.body)

    // Проверяем существование оборудования
    const equipment = await equipmentModel.findById(validatedData.equipmentId)
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Оборудование не найдено'
      })
    }

    // Проверяем корректность дат
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Дата начала аренды не может быть в прошлом'
      })
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'Дата окончания должна быть позже даты начала'
      })
    }

    // Рассчитываем стоимость
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Определяем цену за день на основе тарифов
    let pricePerDay = equipment.pricePerDay

    if (equipment.pricing) {
      if (diffDays >= 30) {
        pricePerDay = equipment.pricing.days30
      } else if (diffDays >= 14) {
        pricePerDay = equipment.pricing.days14
      } else if (diffDays >= 7) {
        pricePerDay = equipment.pricing.days7
      } else if (diffDays >= 3) {
        pricePerDay = equipment.pricing.days3
      } else if (diffDays === 2) {
        pricePerDay = equipment.pricing.days2
      } else if (diffDays === 1) {
        pricePerDay = equipment.pricing.day1
      }
    }

    const totalPrice = diffDays * pricePerDay

    // Создаем бронирование
    const bookingId = uuidv4()
    const booking = await bookingModel.create({
      id: bookingId,
      ...validatedData,
      totalPrice
    })

    console.log('✅ Бронирование создано:', bookingId)
    console.log('📤 Отправка уведомления в Telegram...')

    // Отправляем уведомление в Telegram (не прерываем процесс при ошибке)
    try {
      await telegramService.sendBookingNotification({
        equipmentName: equipment.name,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail || '',
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        totalPrice,
        comment: validatedData.comment
      })
      console.log('✅ Уведомление в Telegram отправлено')
    } catch (telegramError) {
      console.error('❌ Ошибка отправки в Telegram (бронирование сохранено):', telegramError)
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Бронирование успешно создано'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные данные',
        errors: error.errors
      })
    }

    console.error('Error creating booking:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании бронирования'
    })
  }
})

export default router