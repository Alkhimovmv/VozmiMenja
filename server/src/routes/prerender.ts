import { Router, Request, Response } from 'express'
import { database } from '../models/database'

const router = Router()

const BOT_AGENTS = /googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|linkedinbot|whatsapp|telegrambot|vkshare|slackbot/i

function isBot(ua: string): boolean {
  return BOT_AGENTS.test(ua)
}

function esc(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function normalizeImageUrl(raw: string): string {
  // localhost -> vozmimenya.ru
  if (raw.startsWith('http://localhost') || raw.startsWith('https://localhost')) {
    return raw.replace(/https?:\/\/localhost:\d+/, 'https://vozmimenya.ru')
  }
  // уже абсолютный
  if (raw.startsWith('http')) return raw
  // относительный /uploads/... или /images/...
  return `https://vozmimenya.ru${raw.startsWith('/') ? '' : '/'}${raw}`
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(price))
}

function safeJsonLd(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function getEquipmentFaq(category: string, name: string) {
  if (category.includes('Пылесос') || category.includes('клининг')) {
    return [
      {
        question: `Подойдет ли ${name} для уборки после ремонта?`,
        answer: 'Да, если задача связана со строительной пылью, влажной уборкой или чисткой мебели. Если сомневаетесь, напишите нам: подберем модель под площадь и тип загрязнения.',
      },
      {
        question: 'Что входит в комплект?',
        answer: 'Перед выдачей комплект проверяется. Обычно в аренду входят основные насадки, шланг и инструкция по использованию.',
      },
      {
        question: 'Можно ли взять на один день?',
        answer: 'Да, можно оформить аренду на один календарный день и выбрать одинаковые даты начала и окончания.',
      },
    ]
  }

  if (category.includes('Камер')) {
    return [
      {
        question: `Для чего лучше всего подходит ${name}?`,
        answer: 'Камера подходит для съемки видео, поездок, мероприятий и контента для соцсетей. Конкретный формат зависит от модели и условий съемки.',
      },
      {
        question: 'Нужны ли аксессуары?',
        answer: 'Для поездки или съемки на целый день обычно полезны карта памяти, крепления, запасные аккумуляторы и внешний микрофон.',
      },
      {
        question: 'Можно ли получить консультацию перед арендой?',
        answer: 'Да, расскажите задачу, локацию и формат ролика, а мы подскажем камеру и комплект.',
      },
    ]
  }

  if (category.includes('Аудио')) {
    return [
      {
        question: `Хватит ли ${name} для моего мероприятия?`,
        answer: 'Зависит от помещения, количества гостей и задачи: фон, речь или танцы. Опишите формат, и мы поможем выбрать комплект.',
      },
      {
        question: 'Можно ли подключить телефон или ноутбук?',
        answer: 'Для большинства аудиосценариев подключение возможно, но лучше заранее уточнить устройство и нужный формат подключения.',
      },
      {
        question: 'Что проверить перед мероприятием?',
        answer: 'Проверьте питание, место установки, подключение источника звука и нужен ли микрофон для речи.',
      },
    ]
  }

  return [
    {
      question: `Можно ли взять ${name} на один день?`,
      answer: 'Да, можно оформить краткосрочную аренду и вернуть оборудование после выполнения задачи.',
    },
    {
      question: 'Поможете выбрать комплект?',
      answer: 'Да, расскажите задачу и срок аренды, а мы предложим подходящий вариант.',
    },
  ]
}

function buildHtml(opts: {
  title: string
  description: string
  keywords: string
  image: string
  url: string
  price: number
  structuredData: object | object[]
}): string {
  const siteTitle = `${esc(opts.title)} | ВозьмиМеня`
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>${siteTitle}</title>
  <meta name="description" content="${esc(opts.description)}">
  <meta name="keywords" content="${esc(opts.keywords)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${esc(opts.url)}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${siteTitle}">
  <meta property="og:description" content="${esc(opts.description)}">
  <meta property="og:image" content="${esc(opts.image)}">
  <meta property="og:url" content="${esc(opts.url)}">
  <meta property="og:site_name" content="ВозьмиМеня">
  <meta property="og:locale" content="ru_RU">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${siteTitle}">
  <meta name="twitter:description" content="${esc(opts.description)}">
  <meta name="twitter:image" content="${esc(opts.image)}">
  <meta name="twitter:url" content="${esc(opts.url)}">
  <meta property="product:price:amount" content="${opts.price}">
  <meta property="product:price:currency" content="RUB">
  <script type="application/ld+json">${safeJsonLd(opts.structuredData)}</script>
</head>
<body>
  <h1>${esc(opts.title)}</h1>
  <p>${esc(opts.description)}</p>
</body>
</html>`
}

// GET /prerender/equipment/:id
router.get('/equipment/:id', async (req: Request, res: Response) => {
  const ua = req.headers['user-agent'] || ''
  if (!isBot(ua) && req.query.force !== '1') {
    return res.redirect(302, `https://vozmimenya.ru/equipment/${req.params.id}`)
  }

  try {
    const eq = await database.get('SELECT * FROM equipment WHERE id = ?', [req.params.id])
    if (!eq) return res.status(404).send('Not found')

    let images: string[] = []
    try { images = JSON.parse(eq.images || '[]') } catch {}
    const imageUrl = images.length > 0 ? normalizeImageUrl(images[0]) : 'https://vozmimenya.ru/og-image.jpg'

    // Берём pricing если есть
    let minPrice: number = eq.price_per_day || 0
    try {
      const pricing = JSON.parse(eq.pricing || '{}')
      const prices = Object.values(pricing as Record<string, number>).filter(p => p > 0)
      if (prices.length > 0) minPrice = Math.min(...prices)
    } catch {}

    const name: string = eq.name
    const url = `https://vozmimenya.ru/equipment/${eq.id}`
    const priceStr = formatPrice(minPrice)

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `Аренда ${name}`,
      description: eq.description,
      image: images.map(normalizeImageUrl),
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'RUB',
        price: minPrice,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
        areaServed: { '@type': 'City', name: 'Москва' },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: minPrice,
          priceCurrency: 'RUB',
          unitText: 'сутки',
        },
        seller: {
          '@type': 'LocalBusiness',
          name: 'ВозьмиМеня',
          telephone: '+79933636464',
          address: { '@type': 'PostalAddress', addressLocality: 'Москва', addressCountry: 'RU' },
          url: 'https://vozmimenya.ru',
        },
      },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '412' },
    }

    const faqStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: getEquipmentFaq(eq.category, name).map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(buildHtml({
      title: `Аренда ${name} в Москве | от ${priceStr} ₽/сутки | Доставка в день заказа | ВозьмиМеня`,
      description: `Аренда ${name} в Москве от ${priceStr} ₽/сутки | Доставка в день заказа | Постамат 24/7 | Звоните: +7 (993) 363-64-64`,
      keywords: `аренда ${name}, прокат ${name}, ${name} аренда Москва, взять напрокат ${name}, ${eq.category} аренда Москва`,
      image: imageUrl,
      url,
      price: minPrice,
      structuredData: [structuredData, faqStructuredData],
    }))
  } catch (error) {
    console.error('Prerender error:', error)
    res.status(500).send('Error')
  }
})

export default router
