import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { bookingModel } from '../models/Booking'
import { equipmentModel } from '../models/Equipment'
import { database } from '../models/database'
import { telegramService } from '../services/telegram'
import { emailNotifyService } from '../services/emailNotify'
import { vkNotifyService } from '../services/vkNotify'
import { authMiddleware } from '../middleware/auth'
import { calculateRentalTotal } from '../utils/pricing'
import { calculateBillableRentalDays, createBookingSchema, getBookingEquipmentIds, parseDateInput } from './bookingRules'
import { publicLeadRateLimiter } from '../middleware/publicLeadGuard'
import { canAccessOffice, filterByOfficeAccess } from '../middleware/userFilter'
import { normalizeLeadScenario } from '../domain/leadAttribution'

const router = Router()

const getRequestIp = (req: Request) => req.ip || req.socket.remoteAddress || ''

// Публичный ответ без персональных данных: повторная отправка с тем же телефоном
// и датами иначе раскрывала бы всю ранее сохранённую заявку (адрес, комментарий, IP).
const toPublicBooking = (booking: { id: string; status?: string; totalPrice?: number }) => ({
  id: booking.id,
  status: booking.status,
  totalPrice: booking.totalPrice,
})

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bookings = await filterByOfficeAccess(req, await bookingModel.findAll(), (booking) => booking.officeId)

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

    if (!booking || !await canAccessOffice(req, booking.officeId)) {
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

router.post('/', publicLeadRateLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = createBookingSchema.parse(req.body)
    const equipmentIds = getBookingEquipmentIds(validatedData)

    // Проверяем существование всего оборудования одним запросом.
    const equipmentItems = await equipmentModel.findByIds(equipmentIds)
    if (equipmentItems.length !== equipmentIds.length) {
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

    const requestedOfficeId = validatedData.officeId || 1
    const office = await database.get('SELECT id, name, address FROM offices WHERE id = ?', [requestedOfficeId])
    if (!office) {
      return res.status(400).json({
        success: false,
        message: 'Выбранный офис не найден'
      })
    }

    // Занятость оборудования намеренно не блокирует публичную заявку.
    // Бронь остается лидом для менеджера: свободный экземпляр и возможную
    // альтернативу система проверит при конвертации заявки в аренду.

    const duplicateBooking = await bookingModel.findRecentDuplicate({
      equipmentIds,
      customerPhone: validatedData.customerPhone,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      startTime: validatedData.startTime || '10:00',
      endTime: validatedData.endTime || '10:00',
      officeId: office.id,
    })

    if (duplicateBooking) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        data: toPublicBooking(duplicateBooking),
        message: 'Такая заявка уже получена',
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

    const totalPrice = equipmentItems.reduce((total, equipment) => total + calculateRentalTotal(
      equipment.pricing,
      diffDays,
      equipment.pricePerDay,
      {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime
      }
    ), 0)

    // Создаем бронирование
    const bookingId = uuidv4()
    const scenario = normalizeLeadScenario(
      validatedData.scenario,
      validatedData.utmCampaign,
      validatedData.sourcePage,
    )
    const booking = await bookingModel.create({
      id: bookingId,
      ...validatedData,
      equipmentId: equipmentIds[0],
      equipmentIds,
      officeId: office.id,
      officeName: office.name,
      totalPrice,
      scenario,
      legalAcceptanceIp: validatedData.legal ? getRequestIp(req) : undefined,
      legalAcceptanceUserAgent: validatedData.legal ? req.get('user-agent') || '' : undefined
    })

    console.log('✅ Бронирование создано:', bookingId)
    console.log('📤 Отправка уведомления в Telegram...')

    const notifyData = {
      equipmentName: equipmentItems.map((equipment) => equipment.name).join(', '),
      customerName: validatedData.customerName,
      customerPhone: validatedData.customerPhone,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      totalPrice,
      officeName: office.name,
      comment: validatedData.comment,
      sourcePage: validatedData.sourcePage,
      referrer: validatedData.referrer,
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
      utmContent: validatedData.utmContent,
      scenario,
    }

    // Отправляем уведомления (не прерываем процесс при ошибке)
    await Promise.allSettled([
      telegramService.sendBookingNotification(notifyData),
      emailNotifyService.sendBookingNotification(notifyData),
      vkNotifyService.sendBookingNotification(notifyData)
    ])

    res.status(201).json({
      success: true,
      data: toPublicBooking(booking),
      message: 'Бронирование успешно создано'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные данные',
        errors: error.issues
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
