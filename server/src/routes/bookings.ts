import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { bookingModel } from '../models/Booking'
import { equipmentModel } from '../models/Equipment'
import { telegramService } from '../services/telegram'
import { emailNotifyService } from '../services/emailNotify'
import { vkNotifyService } from '../services/vkNotify'
import { authMiddleware } from '../middleware/auth'
import { calculateRentalTotal } from '../utils/pricing'
import { calculateBillableRentalDays, createBookingSchema, parseDateInput } from './bookingRules'

const router = Router()

const getRequestIp = (req: Request) => {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  return req.ip || req.socket.remoteAddress || ''
}

router.get('/', authMiddleware, async (req: Request, res: Response) => {
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

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
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
    const startDate = parseDateInput(validatedData.startDate)
    const endDate = parseDateInput(validatedData.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Дата начала аренды не может быть в прошлом'
      })
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'Дата окончания не может быть раньше даты начала'
      })
    }

    // Рассчитываем стоимость
    const diffDays = calculateBillableRentalDays(
      validatedData.startDate,
      validatedData.endDate,
      validatedData.startTime,
      validatedData.endTime
    )

    if (diffDays === 0) {
      return res.status(400).json({
        success: false,
        message: 'Дата и время окончания должны быть позже начала аренды'
      })
    }

    const totalPrice = calculateRentalTotal(equipment.pricing, diffDays, equipment.pricePerDay, {
      startDate: validatedData.startDate,
      startTime: validatedData.startTime
    })

    // Создаем бронирование
    const bookingId = uuidv4()
    const booking = await bookingModel.create({
      id: bookingId,
      ...validatedData,
      totalPrice,
      legalAcceptanceIp: validatedData.legal ? getRequestIp(req) : undefined,
      legalAcceptanceUserAgent: validatedData.legal ? req.get('user-agent') || '' : undefined
    })

    console.log('✅ Бронирование создано:', bookingId)
    console.log('📤 Отправка уведомления в Telegram...')

    const notifyData = {
      equipmentName: equipment.name,
      customerName: validatedData.customerName,
      customerPhone: validatedData.customerPhone,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      totalPrice,
      comment: validatedData.comment,
      sourcePage: validatedData.sourcePage,
      referrer: validatedData.referrer,
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign
    }

    // Отправляем уведомления (не прерываем процесс при ошибке)
    await Promise.allSettled([
      telegramService.sendBookingNotification(notifyData),
      emailNotifyService.sendBookingNotification(notifyData),
      vkNotifyService.sendBookingNotification(notifyData)
    ])

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
