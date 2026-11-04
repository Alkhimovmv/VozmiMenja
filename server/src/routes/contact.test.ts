import express from 'express'
import request from 'supertest'
import contactRouter, { contactMessageSchema } from './contact'
import { contactLeadModel } from '../models/ContactLead'
import { telegramService } from '../services/telegram'
import { emailNotifyService } from '../services/emailNotify'
import { vkNotifyService } from '../services/vkNotify'

jest.mock('../middleware/publicLeadGuard', () => ({
  publicLeadRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}))
jest.mock('../models/ContactLead', () => ({
  contactLeadModel: {
    findRecentDuplicate: jest.fn(),
    create: jest.fn(),
  },
}))
jest.mock('../services/telegram', () => ({
  telegramService: { sendContactMessage: jest.fn() },
}))
jest.mock('../services/emailNotify', () => ({
  emailNotifyService: { sendContactMessage: jest.fn() },
}))
jest.mock('../services/vkNotify', () => ({
  vkNotifyService: { sendContactMessage: jest.fn() },
}))

const mockFindRecentDuplicate = jest.mocked(contactLeadModel.findRecentDuplicate)
const mockCreate = jest.mocked(contactLeadModel.create)
const mockTelegramNotification = jest.mocked(telegramService.sendContactMessage)
const mockEmailNotification = jest.mocked(emailNotifyService.sendContactMessage)
const mockVkNotification = jest.mocked(vkNotifyService.sendContactMessage)

const validPayload = {
  name: 'Иван',
  phone: '+7 999 000-00-00',
  subject: 'rental',
  message: 'Хочу арендовать комплект',
  sourcePage: 'https://vozmimenya.ru/arenda-karaoke-komplekta-moskva',
  utmContent: 'community-post',
  scenario: 'karaoke-kit',
  officeId: 2,
  officeName: 'Волжская',
  deliveryMethod: 'pickup',
  preferredContact: 'telegram',
  equipmentIds: ['microphone', 'speaker'],
}

describe('contact route', () => {
  beforeEach(() => jest.clearAllMocks())

  it('validates optional attribution and contact context', () => {
    expect(contactMessageSchema.parse(validPayload)).toMatchObject({
      utmContent: 'community-post',
      scenario: 'karaoke-kit',
      officeId: 2,
      deliveryMethod: 'pickup',
      preferredContact: 'telegram',
      equipmentIds: ['microphone', 'speaker'],
    })
    expect(() => contactMessageSchema.parse({
      ...validPayload,
      preferredContact: 'email',
    })).toThrow()
  })

  it('returns a duplicate before creating or sending notifications', async () => {
    mockFindRecentDuplicate.mockResolvedValue({
      id: 42,
      status: 'pending',
      name: 'Stored private name',
      phone: '89990000000',
      subject: 'rental',
      message: 'Stored private message',
      scenario: 'karaoke-kit',
      equipmentIds: ['microphone', 'speaker'],
      createdAt: '2030-01-01',
      updatedAt: '2030-01-01',
    })
    const app = express().use(express.json()).use('/contact', contactRouter)

    const response = await request(app).post('/contact').send(validPayload).expect(200)

    expect(mockFindRecentDuplicate).toHaveBeenCalledWith(expect.objectContaining({
      phone: '89990000000',
      utmContent: 'community-post',
      scenario: 'karaoke-kit',
      equipmentIds: ['microphone', 'speaker'],
    }))
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockTelegramNotification).not.toHaveBeenCalled()
    expect(mockEmailNotification).not.toHaveBeenCalled()
    expect(mockVkNotification).not.toHaveBeenCalled()
    expect(response.body.data).toEqual({ id: 42, status: 'pending' })
  })
})
