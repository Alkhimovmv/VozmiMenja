describe('lead notifications', () => {
  const telegramSend = jest.fn()
  const emailSend = jest.fn()
  let telegramService: typeof import('./telegram').telegramService
  let emailNotifyService: typeof import('./emailNotify').emailNotifyService

  beforeAll(async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token'
    process.env.TELEGRAM_CHAT_ID = '123'
    process.env.NOTIFY_EMAIL_FROM = 'from@example.com'
    process.env.NOTIFY_EMAIL_PASS = 'secret'
    process.env.NOTIFY_EMAIL_TO = 'to@example.com'

    jest.resetModules()
    jest.doMock('node-telegram-bot-api', () => ({
      Bot: jest.fn().mockImplementation(() => ({
        api: { sendMessage: telegramSend },
      })),
    }))
    jest.doMock('nodemailer', () => ({
      __esModule: true,
      default: {
        createTransport: jest.fn(() => ({ sendMail: emailSend })),
      },
    }))

    ;({ telegramService } = await import('./telegram'))
    ;({ emailNotifyService } = await import('./emailNotify'))
  })

  beforeEach(() => jest.clearAllMocks())

  it('includes escaped utm content and scenario in booking notifications', async () => {
    const data = {
      equipmentName: 'Камера',
      customerName: 'Иван',
      customerPhone: '89990000000',
      startDate: '2030-01-10',
      endDate: '2030-01-11',
      totalPrice: 1000,
      utmContent: '<account-2>',
      scenario: 'travel-camera' as const,
    }

    await telegramService.sendBookingNotification(data as any)
    await emailNotifyService.sendBookingNotification(data as any)

    expect(telegramSend.mock.calls[0][0].text).toContain('&lt;account-2&gt;')
    expect(telegramSend.mock.calls[0][0].text).toContain('travel-camera')
    expect(emailSend.mock.calls[0][0].html).toContain('&lt;account-2&gt;')
    expect(emailSend.mock.calls[0][0].html).toContain('travel-camera')
  })

  it('escapes contact text and includes optional context', async () => {
    const data = {
      name: '<Иван>',
      phone: '89990000000',
      subject: '<rental>',
      message: 'Нужен <караоке-комплект>',
      utmContent: '<community-post>',
      scenario: 'karaoke-kit' as const,
      officeName: '<Волжская>',
      preferredContact: 'telegram' as const,
      equipmentIds: ['speaker', 'microphone'],
    }

    await telegramService.sendContactMessage(data as any)
    await emailNotifyService.sendContactMessage(data as any)

    const telegramText = telegramSend.mock.calls[0][0].text
    const emailHtml = emailSend.mock.calls[0][0].html
    expect(telegramText).toContain('&lt;Иван&gt;')
    expect(telegramText).toContain('&lt;community-post&gt;')
    expect(telegramText).toContain('karaoke-kit')
    expect(emailHtml).toContain('&lt;караоке-комплект&gt;')
    expect(emailHtml).toContain('&lt;Волжская&gt;')
    expect(emailHtml).toContain('karaoke-kit')
  })
})
