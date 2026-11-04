import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { telegramService } from '../services/telegram'
import { emailNotifyService } from '../services/emailNotify'
import { vkNotifyService } from '../services/vkNotify'
import { contactLeadModel } from '../models/ContactLead'
import { normalizeAdminPhone } from './bookingRules'
import { publicLeadRateLimiter } from '../middleware/publicLeadGuard'
import { leadAttributionSchema, normalizeLeadScenario } from '../domain/leadAttribution'

const router = Router()

const contactEquipmentIdSchema = z.string().trim().min(1).max(120)

export const contactMessageSchema = leadAttributionSchema.extend({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string()
    .transform(normalizeAdminPhone)
    .refine((value) => /^8\d{10}$/.test(value), 'Некорректный номер телефона'),
  email: z.string().email('Некорректный email').optional(),
  subject: z.string().min(1, 'Выберите тему'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
  officeId: z.coerce.number().int().positive().optional(),
  officeName: z.string().max(160).optional(),
  deliveryMethod: z.enum(['pickup', 'delivery']).optional(),
  preferredContact: z.enum(['phone', 'telegram', 'whatsapp']).optional(),
  equipmentIds: z.array(contactEquipmentIdSchema)
    .max(20, 'Можно выбрать не более 20 позиций')
    .refine((ids) => new Set(ids).size === ids.length, 'Оборудование не должно повторяться')
    .optional(),
})

const toPublicContactLead = (lead: { id: number; status: string }) => ({
  id: lead.id,
  status: lead.status,
})

router.post('/', publicLeadRateLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = contactMessageSchema.parse(req.body)
    const leadData = {
      ...validatedData,
      scenario: normalizeLeadScenario(
        validatedData.scenario,
        validatedData.utmCampaign,
        validatedData.sourcePage,
      ),
    }
    const duplicateLead = await contactLeadModel.findRecentDuplicate(leadData)
    if (duplicateLead) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        data: toPublicContactLead(duplicateLead),
        message: 'Такое обращение уже получено',
      })
    }
    const lead = await contactLeadModel.create(leadData)

    const contactData = {
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      sourcePage: validatedData.sourcePage,
      referrer: validatedData.referrer,
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
      utmContent: validatedData.utmContent,
      scenario: leadData.scenario,
      officeId: validatedData.officeId,
      officeName: validatedData.officeName,
      deliveryMethod: validatedData.deliveryMethod,
      preferredContact: validatedData.preferredContact,
      equipmentIds: validatedData.equipmentIds,
    }

    await Promise.allSettled([
      telegramService.sendContactMessage(contactData),
      emailNotifyService.sendContactMessage(contactData),
      vkNotifyService.sendContactMessage(contactData)
    ])

    res.status(200).json({
      success: true,
      data: toPublicContactLead(lead),
      message: 'Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные данные',
        errors: error.issues
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
