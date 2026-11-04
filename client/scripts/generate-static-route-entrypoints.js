import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const SITE_ORIGIN = 'https://vozmimenya.ru'
const API_ORIGIN = (process.env.STATIC_SEO_API_URL || process.env.VITE_API_URL || 'https://api.vozmimenya.ru/api').replace(/\/$/, '')
const execFileAsync = promisify(execFile)
const LEGACY_EQUIPMENT_SLUGS = new Map([
  ['nabor-besprovodnyh-mikrofonov-jbl-partybox', 'jbl-partybox-wireless-microphones'],
])

const staticRoutes = [
  '/',
  '/equipment',
  '/arenda-pylesosov-moskva',
  '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva',
  '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva',
  '/arenda-mikrofona-dlya-intervyu-moskva',
  '/arenda-kolonki-dlya-vecherinki-moskva',
  '/arenda-karaoke-komplekta-moskva',
  '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva',
  '/arenda-kamery-dlya-puteshestviya-vloga-moskva',
  '/arenda-gopro-moskva',
  '/arenda-audiooborudovaniya-moskva',
  '/blog',
  '/sitemap',
  '/about',
  '/contact',
  '/delivery',
  '/booking',
  '/booking/success',
  '/kak-prohodit-arenda-tehniki',
  '/samovyvoz-24-7-postamat',
  '/arenda-tehniki-u-metro-volzhskaya-kuzminki',
  '/arenda-tehniki-u-metro-dinamo',
  '/arenda-tehniki-dlya-meropriyatiya-moskva',
  '/faq',
  '/privacy',
  '/return-policy',
  '/cookies',
  '/terms',
  '/offer',
  '/rental-agreement',
  '/requisites',
]

const staticSeo = {
  '/': {
    title: 'Аренда оборудования в Москве — камеры, аудио, клининг | ВозьмиМеня',
    description: 'Аренда техники в Москве: колонки JBL, экшн-камеры, моющие и строительные пылесосы, пароочистители. Доставка, самовывоз и бронь онлайн.',
    canonicalPath: '/',
  },
  '/equipment': {
    title: 'Каталог оборудования в аренду в Москве | ВозьмиМеня',
    description: 'Каталог техники напрокат: колонки JBL, камеры GoPro и Insta360, пылесосы Karcher Puzzi и WD, пароочистители. Подберём под задачу.',
    canonicalPath: '/',
  },
  '/arenda-pylesosov-moskva': {
    title: 'Аренда моющих и строительных пылесосов Karcher в Москве',
    description: 'Karcher Puzzi, WD5 и SC4 в аренду в Москве: химчистка мебели, уборка после ремонта и паровая очистка. Постамат 24/7 и доставка.',
  },
  '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva': {
    title: 'Аренда строительного пылесоса после ремонта в Москве',
    description: 'Возьмите строительный пылесос для уборки пыли, мусора и ремонта в Москве. Поможем выбрать модель, рассчитаем срок и доставку.',
  },
  '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva': {
    title: 'Аренда моющего пылесоса для дивана и ковра в Москве',
    description: 'Моющие пылесосы Karcher Puzzi для чистки диванов, ковров, матрасов и салона авто. Аренда в Москве с понятными тарифами.',
  },
  '/arenda-mikrofona-dlya-intervyu-moskva': {
    title: 'Аренда микрофона для интервью в Москве | DJI Mic 2',
    description: 'Аренда беспроводных микрофонов DJI Mic 2 для интервью, подкастов, влогов и съёмки видео. Подскажем комплект под задачу.',
  },
  '/arenda-kolonki-dlya-vecherinki-moskva': {
    title: 'Аренда колонки для вечеринки в Москве | JBL PartyBox',
    description: 'Колонки JBL PartyBox напрокат для квартиры, дачи, праздника и мероприятия. Поможем выбрать мощность и срок аренды.',
  },
  '/arenda-karaoke-komplekta-moskva': {
    title: 'Аренда караоке-комплекта в Москве — JBL и 2 микрофона',
    description: 'Аренда караоке-комплекта в Москве: JBL PartyBox 320 или 710 и два беспроводных микрофона. Выберите комплект и оформите одной заявкой.',
  },
  '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva': {
    title: 'Аренда пароочистителя для кухни, плитки и ванной',
    description: 'Пароочиститель Karcher напрокат для кухни, плитки, швов, ванной и финальной уборки без покупки техники.',
  },
  '/arenda-kamery-dlya-puteshestviya-vloga-moskva': {
    title: 'Аренда камеры для путешествия и влога в Москве',
    description: 'Камеры GoPro, Insta360 и DJI Osmo Pocket напрокат для поездки, блога, спорта и мероприятия. Подберём комплект.',
  },
  '/arenda-gopro-moskva': {
    title: 'Аренда экшн-камер GoPro, Insta360 и DJI в Москве | ВозьмиМеня',
    description: 'GoPro 13, Insta360 X5 и DJI Osmo Pocket 3 в аренду в Москве. Комплект для съёмки, постамат 24/7, доставка и бронь онлайн.',
  },
  '/arenda-audiooborudovaniya-moskva': {
    title: 'Аренда колонок JBL и аудиооборудования в Москве | ВозьмиМеня',
    description: 'JBL PartyBox 320 и 710, микрофоны JBL и DJI Mic 2 в аренду в Москве. Постамат 24/7, доставка, подбор комплекта и бронь онлайн.',
  },
  '/blog': {
    title: 'Блог об аренде техники и оборудования | ВозьмиМеня',
    description: 'Гайды по выбору техники в аренду: пылесосы, пароочистители, камеры, колонки и микрофоны для бытовых и рабочих задач.',
  },
  '/sitemap': {
    title: 'Карта сайта ВозьмиМеня',
    description: 'Карта сайта VozmiMenja: категории оборудования, блог, условия аренды, доставка, контакты и юридические документы.',
  },
  '/about': {
    title: 'О компании ВозьмиМеня — аренда техники в Москве',
    description: 'ВозьмиМеня — сервис аренды техники в Москве: камеры, колонки JBL, пылесосы, Puzzi и пароочистители для разовых задач.',
  },
  '/contact': {
    title: 'Контакты ВозьмиМеня — аренда оборудования в Москве',
    description: 'Связаться с ВозьмиМеня: телефон, Telegram, адреса офисов и точки самовывоза для аренды оборудования в Москве.',
  },
  '/delivery': {
    title: 'Доставка оборудования в аренду по Москве | ВозьмиМеня',
    description: 'Условия доставки и самовывоза арендованной техники по Москве: колонки, камеры, пылесосы и пароочистители.',
  },
  '/booking': {
    title: 'Оформить бронь оборудования онлайн | ВозьмиМеня',
    description: 'Самостоятельно оформите бронь техники в аренду: выберите оборудование, даты, способ получения и подтвердите условия.',
  },
  '/booking/success': {
    title: 'Заявка на бронь принята | ВозьмиМеня',
    description: 'Мы получили вашу заявку на бронь оборудования. Менеджер проверит наличие, комплект и способ получения, затем свяжется для подтверждения.',
    robots: 'noindex, nofollow',
  },
  '/kak-prohodit-arenda-tehniki': {
    title: 'Как проходит аренда техники | ВозьмиМеня',
    description: 'Пошагово: как выбрать оборудование, оформить бронь, получить технику, пользоваться ей и вернуть после аренды.',
  },
  '/samovyvoz-24-7-postamat': {
    title: 'Самовывоз 24/7 через постамат | ВозьмиМеня',
    description: 'Как забрать и вернуть оборудование через постамат 24/7: удобно для камер, микрофонов и компактной техники.',
  },
  '/arenda-tehniki-u-metro-volzhskaya-kuzminki': {
    title: 'Аренда техники у м. Волжская и в Кузьминках — постамат 24/7 | ВозьмиМеня',
    description: 'Аренда колонок JBL, GoPro, Insta360, пылесосов Karcher и пароочистителей у м. Волжская: Волжский бульвар, 51с15. Постамат 24/7, доставка по Москве.',
  },
  '/arenda-tehniki-u-metro-dinamo': {
    title: 'Аренда техники у м. Динамо — постамат 24/7 на ул. Расковой | ВозьмиМеня',
    description: 'Аренда колонок JBL, GoPro, Insta360, пылесосов Karcher и пароочистителей у м. Динамо: ул. Расковой, 1. Постамат 24/7, доставка по Москве.',
  },
  '/arenda-tehniki-dlya-meropriyatiya-moskva': {
    title: 'Аренда техники для мероприятия в Москве',
    description: 'Подбор техники для мероприятий: колонки JBL, микрофоны, камеры и комплекты для праздника, выступления или съёмки.',
  },
  '/faq': {
    title: 'Вопросы об аренде оборудования | ВозьмиМеня',
    description: 'Ответы на частые вопросы об аренде техники: сроки, оплата, доставка, возврат, самовывоз и подбор оборудования.',
  },
  '/privacy': {
    title: 'Политика конфиденциальности | ВозьмиМеня',
    description: 'Политика обработки персональных данных сервиса аренды оборудования ВозьмиМеня.',
  },
  '/return-policy': {
    title: 'Условия возврата оборудования | ВозьмиМеня',
    description: 'Правила возврата техники после аренды, ответственность сторон и порядок завершения аренды.',
  },
  '/cookies': {
    title: 'Политика cookie | ВозьмиМеня',
    description: 'Как сайт ВозьмиМеня использует cookie и аналитические технологии для работы сервиса.',
  },
  '/terms': {
    title: 'Пользовательское соглашение | ВозьмиМеня',
    description: 'Пользовательское соглашение сайта ВозьмиМеня и условия использования онлайн-сервиса аренды техники.',
  },
  '/offer': {
    title: 'Оферта на аренду оборудования | ВозьмиМеня',
    description: 'Публичная оферта ВозьмиМеня: условия оформления заявки, аренды оборудования, оплаты и возврата техники.',
  },
  '/rental-agreement': {
    title: 'Договор аренды оборудования | ВозьмиМеня',
    description: 'Текст договора аренды оборудования ВозьмиМеня, права и обязанности арендатора и арендодателя.',
  },
  '/requisites': {
    title: 'Реквизиты ВозьмиМеня',
    description: 'Реквизиты сервиса ВозьмиМеня для документов, оплаты и юридической информации.',
  },
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const clientDir = path.resolve(scriptDir, '..')
const distDir = path.resolve(clientDir, 'dist')
const distIndexPath = path.join(distDir, 'index.html')
const distSitemapPath = path.join(distDir, 'sitemap.xml')
const business = JSON.parse(await fs.readFile(path.join(clientDir, 'src/content/business.json'), 'utf8'))
const faqContent = JSON.parse(await fs.readFile(path.join(clientDir, 'src/content/faq.json'), 'utf8'))
// Общие title/description со страницами React (src/content/seoMeta.json), чтобы сниппеты не расходились.
const seoMeta = JSON.parse(await fs.readFile(path.join(clientDir, 'src/content/seoMeta.json'), 'utf8'))
for (const [route, meta] of Object.entries(seoMeta)) {
  staticSeo[route] = { ...staticSeo[route], ...meta }
}
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`
const WEBSITE_ID = `${SITE_ORIGIN}/#website`

const translit = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'j',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function equipmentSlug(name) {
  return String(name ?? '')
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => translit[char] ?? char)
    .join('')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function equipmentRoute(item) {
  return `/equipment/${equipmentSlug(item?.name || item?.id || 'equipment')}`
}

function normalizeRoute(rawPathname) {
  if (!rawPathname || rawPathname === '/') return null

  const withoutTrailingSlash = rawPathname.replace(/\/+$/, '')
  const decoded = decodeURIComponent(withoutTrailingSlash)
  const normalized = path.posix.normalize(decoded)

  if (!normalized.startsWith('/') || normalized.includes('\0') || normalized.includes('..')) {
    return null
  }

  return normalized
}

function assertInsideDist(outputPath, route) {
  const relativeOutput = path.relative(distDir, outputPath)

  if (relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) {
    throw new Error(`Refusing to write outside dist for route: ${route}`)
  }
}

function routeIndexOutputPath(route) {
  const relativeRoute = route.replace(/^\/+/, '')
  const outputPath = path.resolve(distDir, relativeRoute, 'index.html')
  assertInsideDist(outputPath, route)

  return outputPath
}

function routeHtmlOutputPath(route) {
  const relativeRoute = route.replace(/^\/+/, '')
  const outputPath = path.resolve(distDir, `${relativeRoute}.html`)
  assertInsideDist(outputPath, route)

  return outputPath
}

function getRemoteRoutes(remoteData) {
  return [
    ...[...remoteData.equipmentBySlug.keys()].map((slug) => `/equipment/${slug}`),
    ...[...remoteData.articleBySlug.keys()].map((slug) => `/blog/${slug}`),
  ]
}

function getLegacyEquipmentRoutes(remoteData) {
  const idRoutes = [...remoteData.equipmentById.keys()]
    .filter((id) => !remoteData.equipmentBySlug.has(id))
    .map((id) => `/equipment/${id}`)

  const slugRoutes = [...LEGACY_EQUIPMENT_SLUGS.entries()]
    .filter(([, id]) => remoteData.equipmentById.has(id))
    .map(([slug]) => `/equipment/${slug}`)

  return [...new Set([...idRoutes, ...slugRoutes])]
}

function findEquipmentByIdentifier(remoteData, identifier) {
  return remoteData.equipmentBySlug.get(identifier)
    || remoteData.equipmentById.get(identifier)
    || remoteData.equipmentById.get(LEGACY_EQUIPMENT_SLUGS.get(identifier))
}

async function getRoutesFromSitemap(remoteData) {
  try {
    const sitemap = await fs.readFile(distSitemapPath, 'utf8')
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

    const routes = locs
      .map((loc) => {
        try {
          const url = new URL(loc)
          if (url.origin !== SITE_ORIGIN) return null
          return normalizeRoute(url.pathname)
        } catch {
          return normalizeRoute(loc)
        }
      })
      .filter(Boolean)

    const hasRemoteEquipment = remoteData.equipmentById.size > 0
    const hasRemoteArticles = remoteData.articleBySlug.size > 0
    const stableSitemapRoutes = routes.filter((route) => {
      if (route.startsWith('/equipment/')) return !hasRemoteEquipment
      if (route.startsWith('/blog/') && route !== '/blog') return !hasRemoteArticles
      return true
    })

    return [...new Set([...staticRoutes, ...stableSitemapRoutes, ...getRemoteRoutes(remoteData)])]
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    return [...new Set([...staticRoutes, ...getRemoteRoutes(remoteData)])]
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function truncate(value, maxLength) {
  const clean = stripHtml(value)
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`
}

function absoluteUrl(raw) {
  if (!raw) return `${SITE_ORIGIN}/og-image.jpg`
  const value = String(raw)
  const withoutLocalhost = value.replace(/^https?:\/\/localhost:\d+/i, '')
  if (/^https?:\/\//i.test(withoutLocalhost)) return withoutLocalhost
  return `${SITE_ORIGIN}${withoutLocalhost.startsWith('/') ? '' : '/'}${withoutLocalhost}`
}

function routeCanonical(meta, route) {
  const canonicalPath = meta.canonicalPath ?? route
  return new URL(canonicalPath, `${SITE_ORIGIN}/`).toString()
}

async function fetchJson(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 18000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`${url} returned ${response.status}`)
    return await response.json()
  } catch (error) {
    try {
      const { stdout } = await execFileAsync('curl', ['-fsSL', '--max-time', '25', url], {
        maxBuffer: 20 * 1024 * 1024,
      })
      return JSON.parse(stdout)
    } catch {
      throw error
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function loadRemoteSeoData() {
  const equipmentById = new Map()
  const equipmentBySlug = new Map()
  const articleBySlug = new Map()

  try {
    const equipmentResponse = await fetchJson(`${API_ORIGIN}/equipment?limit=200`)
    const equipmentItems = Array.isArray(equipmentResponse) ? equipmentResponse : equipmentResponse.data
    for (const item of equipmentItems || []) {
      if (item?.id) {
        const slug = equipmentSlug(item.name || item.id)
        item.slug = slug
        equipmentById.set(String(item.id), item)
        equipmentBySlug.set(slug, item)
      }
    }
  } catch (error) {
    console.warn(`Static SEO: equipment API unavailable, using fallbacks (${error.message})`)
  }

  try {
    let articleItems = []
    try {
      articleItems = await fetchJson(`${API_ORIGIN}/articles/recent?limit=100`)
    } catch {
      articleItems = await fetchJson(`${API_ORIGIN}/articles`)
    }
    for (const article of articleItems || []) {
      if (article?.slug) articleBySlug.set(String(article.slug), article)
    }
  } catch (error) {
    console.warn(`Static SEO: articles API unavailable, using fallbacks (${error.message})`)
  }

  return { equipmentById, equipmentBySlug, articleBySlug }
}

// Основная публичная цена — за 1 сутки (как в client/src/utils/pricing.ts getOneDayPrice).
// Минимальный тариф длинной аренды нельзя выдавать за цену суток в title, сниппете и разметке.
function getOneDayPrice(item) {
  const pricing = normalizePricing(item?.pricing)
  return Number(pricing.day1) || Number(item?.pricePerDay || item?.price_per_day || 0)
}

// Самая низкая цена за сутки при длинной аренде и срок, с которого она действует.
function getLongTermDailyPrice(item) {
  const oneDay = getOneDayPrice(item)
  const candidates = pricingRows(item)
    .filter((tier) => tier.days > 1)
    .map((tier) => ({ dailyPrice: Math.round(tier.effectiveDailyPrice), days: tier.days }))
    .filter((tier) => tier.dailyPrice > 0 && tier.dailyPrice < oneDay)
  if (!candidates.length) return null
  return candidates.reduce((best, tier) => (tier.dailyPrice < best.dailyPrice ? tier : best))
}

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(price))
}

function normalizePricing(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  return typeof raw === 'object' ? raw : {}
}

const pricingTierDefinitions = [
  { key: 'weekendDay10to20', days: 1, label: 'Пт-Сб-Вс 10:00-20:00', suffix: '' },
  { key: 'weekendDay', days: 1, label: 'Пт-Сб-Вс', suffix: '/сутки' },
  { key: 'day1_10to20', days: 1, label: '1 день 10:00-20:00', suffix: '' },
  { key: 'day1', days: 1, label: '1 сутки', suffix: '/сутки' },
  { key: 'days2', days: 2, label: '2 суток', suffix: '/сутки' },
  { key: 'days3', days: 3, label: '3 суток', suffix: '/сутки' },
  { key: 'days4', days: 4, label: '4+ суток', suffix: '/сутки' },
  { key: 'days7', days: 7, label: '7 суток', suffix: '/сутки' },
  { key: 'days14', days: 14, label: '14 суток', suffix: '/сутки' },
  { key: 'days30', days: 30, label: '30 суток', suffix: '/сутки' },
]

function isPackagePrice(pricing, value, periodDays) {
  return periodDays > 1 && Number(pricing.day1) > 0 && value > Number(pricing.day1)
}

function pricingRows(item) {
  const pricing = normalizePricing(item?.pricing)
  const rows = pricingTierDefinitions
    .map((tier) => {
      const value = Number(pricing[tier.key]) || 0
      const isPackage = isPackagePrice(pricing, value, tier.days)
      return {
        ...tier,
        value,
        isPackage,
        effectiveDailyPrice: isPackage ? value / tier.days : value,
        suffix: isPackage ? ' за весь срок' : tier.suffix,
      }
    })
    .filter((tier) => tier.value > 0)

  return rows.filter((tier, index) => {
    if (tier.key === 'weekendDay10to20' || tier.key === 'weekendDay' || tier.key === 'day1_10to20') return true

    const previousComparable = rows
      .slice(0, index)
      .filter((item) => !['weekendDay10to20', 'weekendDay', 'day1_10to20'].includes(item.key))
      .at(-1)

    return !previousComparable || previousComparable.effectiveDailyPrice !== tier.effectiveDailyPrice
  })
}

function normalizeJsonLd(jsonLd) {
  if (!jsonLd) return []
  return Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : [jsonLd]
}

function cleanTitle(value) {
  return String(value || 'Страница ВозьмиМеня')
    .replace(/\s+\|\s+(?:Блог\s+)?ВозьмиМеня.*$/i, '')
    .replace(/\s+—\s+ВозьмиМеня.*$/i, '')
    .trim()
}

function routeLabel(route, meta) {
  const labels = {
    '/': 'Главная',
    '/blog': 'Блог',
    '/booking': 'Бронь онлайн',
    '/contact': 'Контакты',
    '/delivery': 'Доставка',
    '/arenda-pylesosov-moskva': 'Аренда пылесосов',
    '/arenda-gopro-moskva': 'Аренда GoPro и камер',
    '/arenda-audiooborudovaniya-moskva': 'Аренда аудиооборудования',
  }

  return labels[route] || cleanTitle(meta?.title)
}

function buildBreadcrumbJsonLd(route, meta) {
  if (route === '/') return null

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ВозьмиМеня',
      item: `${SITE_ORIGIN}/`,
    },
  ]

  if (route.startsWith('/blog/')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Блог',
      item: `${SITE_ORIGIN}/blog`,
    })
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: routeLabel(route, meta),
    item: routeCanonical(meta, route),
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

// Обновляет рейтинг офиса из публичного виджета отзывов Яндекс Карт; при ошибке остаются значения из business.json.
async function refreshYandexRatings() {
  for (const office of business.offices) {
    const yandex = office.yandexMaps
    if (!yandex?.orgId) continue
    try {
      const { stdout } = await execFileAsync('curl', ['-fsSL', '--max-time', '15', '-A', 'Mozilla/5.0', `https://yandex.ru/maps-reviews-widget/${yandex.orgId}?comments`], {
        maxBuffer: 5 * 1024 * 1024,
      })
      const rating = stdout.match(/mini-badge__stars-count">\s*([\d,.]+)/)
      const counts = stdout.match(/(\d+)\s+отзыв[а-я]*\s*•\s*(\d+)\s+оцен/)
      if (!rating || !counts) throw new Error('rating markup not found')
      yandex.ratingValue = Number(rating[1].replace(',', '.'))
      yandex.reviewCount = Number(counts[1])
      yandex.ratingCount = Number(counts[2])
    } catch (error) {
      console.warn(`Static SEO: Yandex rating for ${office.id} not refreshed, using business.json (${error.message})`)
    }
  }
}

function officeRatingJsonLd(office) {
  const yandex = office.yandexMaps
  if (!yandex?.ratingValue || !yandex?.ratingCount) return undefined
  return {
    '@type': 'AggregateRating',
    ratingValue: yandex.ratingValue,
    bestRating: 5,
    worstRating: 1,
    ratingCount: yandex.ratingCount,
    reviewCount: yandex.reviewCount,
  }
}

function officeJsonLd(office) {
  return {
    '@type': 'LocalBusiness',
    '@id': `${SITE_ORIGIN}/#${office.id}`,
    name: `${business.name} — м. ${office.metro}`,
    description: `${office.label}: выдача и возврат арендованной техники, постамат 24/7.`,
    url: `${SITE_ORIGIN}${office.slug || '/contact'}`,
    image: business.image,
    telephone: business.telephone,
    priceRange: business.priceRange,
    parentOrganization: { '@id': ORGANIZATION_ID },
    areaServed: { '@type': 'City', name: 'Москва' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: office.streetAddress,
      addressLocality: 'Москва',
      addressRegion: 'Москва',
      postalCode: office.postalCode,
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: office.latitude,
      longitude: office.longitude,
    },
    hasMap: office.yandexMaps?.url || `https://yandex.ru/maps/?pt=${office.longitude},${office.latitude}&z=17&l=map`,
    sameAs: office.yandexMaps?.url ? [office.yandexMaps.url] : undefined,
    aggregateRating: officeRatingJsonLd(office),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  }
}

function buildBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: business.name,
        alternateName: business.alternateName,
        url: SITE_ORIGIN,
        logo: business.logo,
        image: business.image,
        description: business.description,
        telephone: business.telephone,
        email: business.email,
        sameAs: business.sameAs,
        areaServed: { '@type': 'City', name: 'Москва' },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: business.telephone,
          contactType: 'customer service',
          areaServed: 'RU',
          availableLanguage: 'Russian',
        },
        department: business.offices.map((office) => ({ '@id': `${SITE_ORIGIN}/#${office.id}` })),
      },
      ...business.offices.map(officeJsonLd),
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: business.name,
        url: SITE_ORIGIN,
        inLanguage: 'ru-RU',
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  }
}

function buildItemListJsonLd(route, remoteData) {
  const predicates = {
    '/arenda-pylesosov-moskva': (item) => String(item.category || '').includes('Пылесос') || String(item.category || '').includes('клининг'),
    '/arenda-gopro-moskva': (item) => String(item.category || '').includes('Камер'),
    '/arenda-audiooborudovaniya-moskva': (item) => String(item.category || '').includes('Аудио'),
    '/arenda-karaoke-komplekta-moskva': (item) => String(item.name || '').toLowerCase().includes('jbl'),
    '/': () => true,
  }
  const predicate = predicates[route]
  if (!predicate) return null

  const products = [...remoteData.equipmentBySlug.values()].filter(predicate).slice(0, 12)
  if (!products.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: cleanTitle(staticSeo[route]?.title || 'Оборудование в аренду'),
    numberOfItems: products.length,
    itemListElement: products.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        description: truncate(item.description || `${item.name} в аренду в Москве.`, 240),
        image: Array.isArray(item.images) && item.images[0] ? absoluteUrl(item.images[0]) : undefined,
        category: item.category,
        url: `${SITE_ORIGIN}${equipmentRoute(item)}`,
        offers: getOneDayPrice(item) > 0 ? {
          '@type': 'Offer',
          url: `${SITE_ORIGIN}${equipmentRoute(item)}`,
          price: getOneDayPrice(item),
          priceCurrency: 'RUB',
          seller: { '@id': ORGANIZATION_ID },
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: getOneDayPrice(item),
            priceCurrency: 'RUB',
            unitText: 'сутки',
          },
        } : undefined,
      },
    })),
  }
}

function buildWebPageJsonLd(route, meta) {
  if (route.startsWith('/equipment/') || route.startsWith('/blog/')) return null

  return {
    '@context': 'https://schema.org',
    '@type': route === '/blog' ? 'Blog' : route.startsWith('/arenda-') ? 'CollectionPage' : 'WebPage',
    name: cleanTitle(meta.title),
    description: meta.description,
    url: routeCanonical(meta, route),
    inLanguage: 'ru-RU',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
  }
}

function enrichSeoMeta(route, meta, remoteData) {
  const jsonLd = [
    ...normalizeJsonLd(meta.jsonLd),
    buildWebPageJsonLd(route, meta),
    buildBreadcrumbJsonLd(route, meta),
    buildBusinessJsonLd(),
    buildItemListJsonLd(route, remoteData),
  ].filter(Boolean)

  return {
    ...meta,
    jsonLd: jsonLd.length ? jsonLd : undefined,
  }
}

function productFaq(item) {
  const name = item?.name || 'это оборудование'
  const category = String(item?.category || '')

  if (category.includes('Пылесос') || category.includes('клининг')) {
    return [
      {
        question: `Для каких задач подходит ${name}?`,
        answer: `${name} подходит для уборки, чистки или сушки в зависимости от модели. Если задача нестандартная, менеджер подскажет комплект перед подтверждением брони.`,
      },
      {
        question: 'Можно ли забрать оборудование самовывозом?',
        answer: 'Да, для части техники доступен самовывоз или постамат 24/7. Точный офис и способ получения подтверждает менеджер после заявки.',
      },
      {
        question: 'Что входит в комплект аренды?',
        answer: 'Комплект проверяется перед выдачей. В заявке и при подтверждении менеджер уточняет насадки, расходники и аксессуары под вашу задачу.',
      },
    ]
  }

  if (category.includes('Камер')) {
    return [
      {
        question: `Подойдет ли ${name} для поездки или съемки контента?`,
        answer: 'Да, камеры и аксессуары подбираются под формат съемки: путешествие, блог, мероприятие, спорт или короткий проект.',
      },
      {
        question: 'Можно ли взять камеру на один день?',
        answer: 'Да, можно оставить заявку на короткую аренду. Менеджер проверит доступность на выбранные даты и время.',
      },
      {
        question: 'Поможете подобрать аксессуары?',
        answer: 'Да, подскажем карту памяти, крепления, аккумуляторы и другие аксессуары под сценарий съемки.',
      },
    ]
  }

  if (category.includes('Аудио')) {
    return [
      {
        question: `Хватит ли ${name} для мероприятия?`,
        answer: 'Зависит от помещения, количества гостей и задачи: фон, речь или танцы. В заявке можно описать сценарий, и менеджер подскажет комплект.',
      },
      {
        question: 'Можно ли подключить телефон?',
        answer: 'Для большинства колонок и аудиокомплектов подключение возможно. Конкретный способ зависит от модели и подтверждается перед выдачей.',
      },
      {
        question: 'Можно ли арендовать на выходные?',
        answer: 'Да, можно выбрать даты аренды на пятницу, субботу или воскресенье. Если для позиции есть отдельный weekend-тариф, он участвует в расчете.',
      },
    ]
  }

  return [
    {
      question: `Можно ли арендовать ${name} на один день?`,
      answer: 'Да, можно оставить заявку на короткую аренду. Менеджер проверит наличие и подтвердит условия получения.',
    },
    {
      question: 'Как быстро подтверждается бронь?',
      answer: 'После отправки заявки менеджер проверяет наличие, комплект и офис или доставку, затем связывается для подтверждения.',
    },
  ]
}

function buildFaqJsonLd(items) {
  if (!items?.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

function buildProductSeo(route, item) {
  if (!item) {
    return {
      title: 'Аренда оборудования в Москве | ВозьмиМеня',
      description: 'Карточка оборудования ВозьмиМеня: описание, тарифы, условия аренды, доставка и онлайн-бронирование техники в Москве.',
      type: 'product',
    }
  }

  const price = getOneDayPrice(item)
  const longTerm = getLongTermDailyPrice(item)
  const canonicalRoute = equipmentRoute(item)
  // Совпадает с seoTitle/seoDescription в EquipmentDetailsPage.tsx.
  const title = price > 0
    ? `Аренда ${item.name} в Москве — ${formatPrice(price)} ₽/сутки | ВозьмиМеня`
    : `Аренда ${item.name} в Москве | ВозьмиМеня`
  const longTermText = longTerm ? `, от ${formatPrice(longTerm.dailyPrice)} ₽/сутки при аренде от ${longTerm.days} суток` : ''
  const description = price > 0
    ? truncate(`${item.name} в аренду в Москве: ${formatPrice(price)} ₽ за сутки${longTermText}. Самовывоз у м. Волжская и м. Динамо, доставка по Москве, бронь онлайн.`, 200)
    : truncate(`Аренда ${item.name} в Москве. ${item.description || 'Проверенное оборудование, консультация, доставка и самовывоз.'}`, 165)
  const image = Array.isArray(item.images) && item.images.length > 0 ? absoluteUrl(item.images[0]) : undefined
  const productImages = Array.isArray(item.images) && item.images.length > 0
    ? item.images.map(absoluteUrl)
    : image ? [image] : undefined
  const faq = productFaq(item)

  return {
    title,
    description,
    image,
    type: 'product',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: item.name,
        description,
        image: productImages,
        category: item.category,
        offers: {
          '@type': 'Offer',
          url: `${SITE_ORIGIN}${canonicalRoute}`,
          priceCurrency: 'RUB',
          price: price || undefined,
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability: 'https://schema.org/InStock',
          areaServed: { '@type': 'City', name: 'Москва' },
          seller: { '@id': ORGANIZATION_ID },
          priceSpecification: price ? [
            {
              '@type': 'UnitPriceSpecification',
              price,
              priceCurrency: 'RUB',
              unitCode: 'DAY',
              unitText: 'сутки',
              referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' },
            },
            ...(longTerm ? [{
              '@type': 'UnitPriceSpecification',
              price: longTerm.dailyPrice,
              priceCurrency: 'RUB',
              unitCode: 'DAY',
              unitText: 'сутки',
              eligibleQuantity: { '@type': 'QuantitativeValue', minValue: longTerm.days, unitCode: 'DAY' },
            }] : []),
          ] : undefined,
        },
      },
      buildFaqJsonLd(faq),
    ],
  }
}

function buildArticleSeo(route, article) {
  if (!article) {
    return {
      title: 'Статья об аренде техники | Блог ВозьмиМеня',
      description: 'Практический материал блога ВозьмиМеня о выборе и аренде оборудования для бытовых, рабочих и творческих задач.',
      type: 'article',
    }
  }

  const title = `${article.title} | Блог ВозьмиМеня`
  const description = truncate(article.excerpt || article.content || title, 165)
  const image = article.image_url ? absoluteUrl(article.image_url) : undefined

  return {
    title,
    description,
    image,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description,
      image,
      author: { '@type': 'Organization', name: article.author || 'ВозьмиМеня' },
      publisher: { '@id': ORGANIZATION_ID },
      mainEntityOfPage: `${SITE_ORIGIN}${route}`,
      datePublished: article.created_at,
      dateModified: article.updated_at,
    },
  }
}

function fallbackSeo(route) {
  const readable = route
    .replace(/^\/+/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return {
    title: `${readable || 'Аренда оборудования'} | ВозьмиМеня`,
    description: 'Аренда оборудования в Москве: камеры, колонки, пылесосы, пароочистители и техника под задачу. Поможем подобрать комплект.',
  }
}

function getSeoMeta(route, remoteData) {
  if (route.startsWith('/equipment/')) {
    const identifier = route.split('/').filter(Boolean)[1]
    const item = findEquipmentByIdentifier(remoteData, identifier)
    const meta = buildProductSeo(route, item)
    if (item) meta.canonicalPath = equipmentRoute(item)
    return meta
  }

  if (route.startsWith('/blog/') && route !== '/blog') {
    const slug = route.split('/').filter(Boolean)[1]
    return buildArticleSeo(route, remoteData.articleBySlug.get(slug))
  }

  return staticSeo[route] || fallbackSeo(route)
}

function cleanManagedSeoTags(html) {
  return html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\b(?=[^>]*\bname=["'](?:description|robots|keywords|twitter:card|twitter:title|twitter:description|twitter:image)["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bproperty=["'](?:og:type|og:title|og:description|og:image|og:url|og:site_name|og:locale)["'])[^>]*>\s*/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '')
}

function buildSeoTags(route, meta) {
  const canonical = routeCanonical(meta, route)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = escapeHtml(meta.image || `${SITE_ORIGIN}/og-image.jpg`)
  const type = meta.type === 'article' ? 'article' : meta.type === 'product' ? 'product' : 'website'
  const robots = escapeHtml(meta.robots || 'index, follow')
  const jsonLd = meta.jsonLd
    ? `\n    <script type="application/ld+json" data-static-seo="true">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`
    : ''

  return `    <title data-rh="true">${title}</title>
    <meta name="description" content="${description}" data-rh="true" />
    <meta name="robots" content="${robots}" data-rh="true" />
    <link rel="canonical" href="${escapeHtml(canonical)}" data-rh="true" />
    <meta property="og:type" content="${type}" data-rh="true" />
    <meta property="og:title" content="${title}" data-rh="true" />
    <meta property="og:description" content="${description}" data-rh="true" />
    <meta property="og:image" content="${image}" data-rh="true" />
    <meta property="og:url" content="${escapeHtml(canonical)}" data-rh="true" />
    <meta property="og:site_name" content="ВозьмиМеня" data-rh="true" />
    <meta property="og:locale" content="ru_RU" data-rh="true" />
    <meta name="twitter:card" content="summary_large_image" data-rh="true" />
    <meta name="twitter:title" content="${title}" data-rh="true" />
    <meta name="twitter:description" content="${description}" data-rh="true" />
    <meta name="twitter:image" content="${image}" data-rh="true" />${jsonLd}`
}

function linkList(items) {
  return `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`).join('')}</ul>`
}

function staticProductCatalog(items, heading) {
  if (!items.length) return ''

  const products = items.map((item) => {
    const productUrl = equipmentRoute(item)
    const oneDayPrice = getOneDayPrice(item)
    const description = truncate(item.description || `${item.name} в аренду в Москве.`, 220)
    const bookingUrl = `/booking?equipment=${encodeURIComponent(String(item.id || item.slug || ''))}`

    return `<li><article data-static-product="true">
      <h3><a href="${escapeHtml(productUrl)}">${escapeHtml(item.name)}</a></h3>
      <p>${escapeHtml(description)}</p>
      ${oneDayPrice > 0 ? `<p><strong>1 сутки — ${escapeHtml(formatPrice(oneDayPrice))} ₽</strong></p>` : ''}
      <p><a href="${escapeHtml(bookingUrl)}">Забронировать ${escapeHtml(item.name)}</a></p>
    </article></li>`
  }).join('')

  return `<section data-static-product-catalog="true" aria-label="${escapeHtml(heading)}"><h2>${escapeHtml(heading)}</h2><ul>${products}</ul></section>`
}

function faqSection(items) {
  if (!items?.length) return ''
  return `<h2>Частые вопросы</h2>${items.map((item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`).join('')}`
}

function businessContactsSection() {
  const offices = business.offices
    .map((office) => `<li><a href="${escapeHtml(office.slug)}">м. ${escapeHtml(office.metro)}</a> — Москва, ${escapeHtml(office.streetAddress)} (район ${escapeHtml(office.district)})</li>`)
    .join('')

  return `<section aria-label="Где получить технику"><h2>Где получить технику в Москве</h2><ul>${offices}</ul><p>Самовывоз и возврат через постамат: ${escapeHtml(business.hours)}. Доставка по Москве курьером. Телефон: <a href="tel:${escapeHtml(business.telephone)}">${escapeHtml(business.telephoneLabel)}</a>, Telegram: <a href="https://t.me/VozmiMenyaRent">@VozmiMenyaRent</a>.</p></section>`
}

function pageShell(title, description, sections = []) {
  const body = [
    `<h1>${escapeHtml(cleanTitle(title))}</h1>`,
    `<p>${escapeHtml(description)}</p>`,
    ...sections,
    businessContactsSection(),
    `<nav aria-label="Важные разделы">${linkList([
      { href: '/arenda-pylesosov-moskva', label: 'Аренда пылесосов и клининговой техники' },
      { href: '/arenda-gopro-moskva', label: 'Аренда GoPro и камер' },
      { href: '/arenda-audiooborudovaniya-moskva', label: 'Аренда колонок и аудиооборудования' },
      { href: '/booking', label: 'Оформить бронь онлайн' },
      { href: '/blog', label: 'Блог и гайды по аренде техники' },
      { href: '/contact', label: 'Контакты и самовывоз' },
    ])}</nav>`,
  ].join('\n')

  return `<main class="static-seo-content" data-static-seo="body">${body}</main>`
}

function productLinks(remoteData, predicate = () => true, limit = 8) {
  return [...remoteData.equipmentBySlug.values()]
    .filter(predicate)
    .slice(0, limit)
    .map((item) => ({ href: equipmentRoute(item), label: item.name }))
}

function productsByCategory(remoteData, predicate, limit = 8) {
  return [...remoteData.equipmentBySlug.values()]
    .filter(predicate)
    .slice(0, limit)
}

function routeProductLinks(route, remoteData, limit = 8) {
  const predicates = {
    '/arenda-pylesosov-moskva': (item) => String(item.category || '').includes('Пылесос') || String(item.category || '').includes('клининг'),
    '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva': (item) => String(item.name || '').toLowerCase().includes('wd') || String(item.category || '').includes('Пылесос'),
    '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva': (item) => String(item.name || '').toLowerCase().includes('puzzi'),
    '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva': (item) => String(item.name || '').toLowerCase().includes('sc4') || String(item.name || '').toLowerCase().includes('пар'),
    '/arenda-gopro-moskva': (item) => String(item.category || '').includes('Камер'),
    '/arenda-kamery-dlya-puteshestviya-vloga-moskva': (item) => String(item.category || '').includes('Камер'),
    '/arenda-audiooborudovaniya-moskva': (item) => String(item.category || '').includes('Аудио'),
    '/arenda-kolonki-dlya-vecherinki-moskva': (item) => String(item.name || '').toLowerCase().includes('jbl') || String(item.category || '').includes('Аудио'),
    '/arenda-karaoke-komplekta-moskva': (item) => String(item.name || '').toLowerCase().includes('jbl'),
    '/arenda-mikrofona-dlya-intervyu-moskva': (item) => String(item.name || '').toLowerCase().includes('mic') || String(item.name || '').toLowerCase().includes('микрофон'),
    '/arenda-tehniki-dlya-meropriyatiya-moskva': (item) => String(item.category || '').includes('Аудио') || String(item.category || '').includes('Камер'),
  }

  return productLinks(remoteData, predicates[route] || (() => true), limit)
}

function articleLinks(remoteData, limit = 8) {
  return [...remoteData.articleBySlug.values()]
    .filter((article) => article?.slug)
    .slice(0, limit)
    .map((article) => ({ href: `/blog/${article.slug}`, label: article.title }))
}

function markdownToPlainSections(content) {
  const clean = stripHtml(content || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_`>|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!clean) return []

  const paragraphs = clean
    .split(/(?<=\.)\s+/)
    .reduce((acc, sentence) => {
      const current = acc[acc.length - 1] || ''
      if (!current || current.length > 420) acc.push(sentence)
      else acc[acc.length - 1] = `${current} ${sentence}`
      return acc
    }, [])
    .slice(0, 6)

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
}

function buildProductBody(item, remoteData) {
  if (!item) {
    return pageShell('Аренда оборудования в Москве', 'Карточка оборудования ВозьмиМеня: описание, тарифы, условия аренды, доставка и онлайн-бронирование техники в Москве.')
  }

  const price = getOneDayPrice(item)
  const longTerm = getLongTermDailyPrice(item)
  const rows = pricingRows(item)
  const specs = item.specifications && typeof item.specifications === 'object'
    ? Object.entries(item.specifications).filter(([, value]) => value).slice(0, 8)
    : []
  const related = productLinks(remoteData, (other) => other.id !== item.id && other.category === item.category, 6)
  const faq = productFaq(item)
  const sections = [
    `<p>${escapeHtml(item.description || 'Проверенное оборудование для аренды в Москве.')}</p>`,
    price > 0 ? `<p>Цена аренды: ${escapeHtml(formatPrice(price))} ₽ за сутки${longTerm ? `, при аренде от ${longTerm.days} суток — от ${escapeHtml(formatPrice(longTerm.dailyPrice))} ₽ за сутки` : ''}. Доступны доставка, самовывоз и онлайн-бронь.</p>` : '',
    rows.length ? `<h2>Тарифы аренды</h2><ul>${rows.map((row) => `<li>${escapeHtml(row.label)} — ${escapeHtml(formatPrice(row.value))} ₽${escapeHtml(row.suffix)}</li>`).join('')}</ul>` : '',
    specs.length ? `<h2>Характеристики</h2><dl>${specs.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>` : '',
    faqSection(faq),
    related.length ? `<h2>Похожие позиции</h2>${linkList(related)}` : '',
    `<h2>Как арендовать</h2><p>Выберите даты, оставьте заявку или напишите менеджеру. Мы подтвердим наличие, офис получения, доставку и комплект перед выдачей.</p>`,
  ].filter(Boolean)

  return pageShell(`Аренда ${item.name} в Москве`, `Карточка оборудования: ${item.name}. ${item.description || 'Прокат техники с доставкой и самовывозом.'}`, sections)
}

function buildArticleBody(article, remoteData) {
  if (!article) {
    return pageShell('Статья об аренде техники', 'Практический материал блога ВозьмиМеня о выборе и аренде оборудования.')
  }

  const sections = [
    `<p>${escapeHtml(article.excerpt || '')}</p>`,
    ...markdownToPlainSections(article.content),
    `<h2>Полезные ссылки</h2>${linkList([
      { href: '/arenda-pylesosov-moskva', label: 'Пылесосы и клининг в аренду' },
      { href: '/arenda-gopro-moskva', label: 'Камеры и GoPro в аренду' },
      { href: '/arenda-audiooborudovaniya-moskva', label: 'Колонки и аудиооборудование' },
      { href: '/booking', label: 'Оформить бронь' },
    ])}`,
    articleLinks(remoteData, 5).length ? `<h2>Другие статьи</h2>${linkList(articleLinks(remoteData, 5).filter((link) => link.href !== `/blog/${article.slug}`))}` : '',
  ].filter(Boolean)

  return pageShell(article.title, article.excerpt || 'Статья блога ВозьмиМеня.', sections)
}

function buildStaticRouteBody(route, meta, remoteData) {
  if (route.startsWith('/equipment/')) {
    const identifier = route.split('/').filter(Boolean)[1]
    return buildProductBody(findEquipmentByIdentifier(remoteData, identifier), remoteData)
  }

  if (route.startsWith('/blog/') && route !== '/blog') {
    const slug = route.split('/').filter(Boolean)[1]
    return buildArticleBody(remoteData.articleBySlug.get(slug), remoteData)
  }

  const allProducts = productLinks(remoteData, () => true, 12)
  const cleaningProducts = productsByCategory(remoteData, (item) => String(item.category || '').includes('Пылесос') || String(item.category || '').includes('клининг'), 8)
  const cameraProducts = productsByCategory(remoteData, (item) => String(item.category || '').includes('Камер'), 8)
  const audioProducts = productsByCategory(remoteData, (item) => String(item.category || '').includes('Аудио'), 8)
  const articles = articleLinks(remoteData, 10)
  const routeProducts = routeProductLinks(route, remoteData, 8)
  const routeSections = {
    '/': [
      `<h2>Популярное оборудование</h2>${linkList(allProducts)}`,
      `<h2>Категории</h2>${linkList([
        { href: '/arenda-pylesosov-moskva', label: 'Пылесосы, Puzzi, WD5 и пароочистители' },
        { href: '/arenda-gopro-moskva', label: 'GoPro, Insta360 и DJI Osmo Pocket' },
        { href: '/arenda-audiooborudovaniya-moskva', label: 'JBL PartyBox и микрофоны' },
      ])}`,
      articles.length ? `<h2>Гайды по выбору</h2>${linkList(articles)}` : '',
    ],
    '/arenda-pylesosov-moskva': [
      staticProductCatalog(cleaningProducts, 'Пылесосы и клининговая техника в аренду'),
      `<p>Для строительной пыли подходит WD5, для диванов и ковров — Karcher Puzzi, для плитки и кухни — пароочиститель SC4.</p>`,
    ],
    '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva': [
      routeProducts.length ? `<h2>Техника для уборки после ремонта</h2>${linkList(routeProducts)}` : '',
      `<p>Строительный пылесос нужен для сухой пыли, мусора и финишной уборки после ремонта. Перед бронью уточняем площадь, тип загрязнения и подходящий комплект.</p>`,
    ],
    '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva': [
      routeProducts.length ? `<h2>Моющие пылесосы для текстиля</h2>${linkList(routeProducts)}` : '',
      `<p>Karcher Puzzi помогает чистить диваны, ковры, матрасы и салон авто: подает раствор и сразу вытягивает влагу с грязью.</p>`,
    ],
    '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva': [
      routeProducts.length ? `<h2>Пароочистители и клининг</h2>${linkList(routeProducts)}` : '',
      `<p>Пароочиститель подходит для плитки, швов, кухни, ванной и финальной уборки без покупки техники ради одной задачи.</p>`,
    ],
    '/arenda-gopro-moskva': [
      staticProductCatalog(cameraProducts, 'Экшн-камеры в аренду'),
      `<p>GoPro удобна для спорта и воды, Insta360 — для 360-ракурсов, DJI Osmo Pocket — для влогов и плавной съемки с рук.</p>`,
    ],
    '/arenda-kamery-dlya-puteshestviya-vloga-moskva': [
      routeProducts.length ? `<h2>Камеры для поездки и влога</h2>${linkList(routeProducts)}` : '',
      `<p>Для путешествия важны компактность, стабилизация, автономность и быстрый старт съемки. Подберем камеру и аксессуары под маршрут и формат контента.</p>`,
    ],
    '/arenda-audiooborudovaniya-moskva': [
      staticProductCatalog(audioProducts, 'Колонки и микрофоны в аренду'),
      `<p>Колонки JBL PartyBox подходят для квартиры, дачи, праздника и небольшого мероприятия. Микрофоны помогают записать речь и интервью.</p>`,
    ],
    '/arenda-kolonki-dlya-vecherinki-moskva': [
      routeProducts.length ? `<h2>Колонки для вечеринки</h2>${linkList(routeProducts)}` : '',
      `<p>Для вечеринки важны мощность, автономность, бас и удобное подключение телефона. Менеджер поможет выбрать колонку под помещение и количество гостей.</p>`,
    ],
    '/arenda-karaoke-komplekta-moskva': [
      routeProducts.length ? `<h2>Колонки и микрофоны для караоке</h2>${linkList(routeProducts)}` : '',
      `<p>Караоке-комплект состоит из JBL PartyBox 320 или 710 и двух беспроводных микрофонов JBL. Обе позиции можно добавить в одну заявку, выбрать общие даты, самовывоз или доставку.</p>`,
      `<p>${linkList([
        { href: '/booking?equipment=jbl-partybox-320,jbl-partybox-wireless-microphones', label: 'Забронировать комплект с JBL PartyBox 320' },
        { href: '/booking?equipment=jbl-partybox-710,jbl-partybox-wireless-microphones', label: 'Забронировать комплект с JBL PartyBox 710' },
        { href: '/arenda-kolonki-dlya-vecherinki-moskva', label: 'Сравнить колонки для вечеринки' },
      ])}</p>`,
    ],
    '/arenda-mikrofona-dlya-intervyu-moskva': [
      routeProducts.length ? `<h2>Микрофоны для интервью и съемки</h2>${linkList(routeProducts)}` : '',
      `<p>Беспроводной микрофон помогает записать чистую речь для интервью, подкаста, Reels, YouTube и мероприятий с ведущим.</p>`,
    ],
    '/arenda-tehniki-dlya-meropriyatiya-moskva': [
      routeProducts.length ? `<h2>Техника для мероприятия</h2>${linkList(routeProducts)}` : '',
      `<p>Для мероприятий чаще всего нужны колонки, микрофоны и камеры. Поможем собрать комплект под помещение, гостей и сценарий.</p>`,
    ],
    '/blog': [
      articles.length ? `<h2>Статьи</h2>${linkList(articles)}` : '',
    ],
    ...Object.fromEntries(business.offices.map((office) => [office.slug, [
      `<p>Офис и постамат: Москва, ${escapeHtml(office.streetAddress)}, рядом с м. ${escapeHtml(office.metro)} (район ${escapeHtml(office.district)}). Технику можно забрать и вернуть 24/7 по коду после подтверждения брони. Районы рядом: ${escapeHtml(office.nearby.join(', '))}.</p>`,
      office.yandexMaps?.ratingValue ? `<p>Рейтинг на Яндекс Картах: ${escapeHtml(String(office.yandexMaps.ratingValue).replace('.', ','))} из 5, ${escapeHtml(office.yandexMaps.reviewCount)} отзывов — <a href="${escapeHtml(office.yandexMaps.url)}">смотреть на Яндекс Картах</a>.</p>` : '',
      `<h2>Техника в аренду у м. ${escapeHtml(office.metro)}</h2>${linkList(allProducts)}`,
      `<p>Наличие конкретной модели в этой точке на ваши даты подтверждает менеджер. Второй постамат: ${linkList(business.offices.filter((other) => other.id !== office.id).map((other) => ({ href: other.slug, label: `м. ${other.metro}, ${other.streetAddress}` })))}</p>`,
    ]])),
    '/sitemap': [
      `<h2>Разделы сайта</h2>${linkList([
        ...allProducts,
        ...articles,
      ].slice(0, 30))}`,
    ],
  }

  return pageShell(meta.title, meta.description, [
    ...(routeSections[route] || []),
    faqSection(faqContent[route]),
  ])
}

function renderRouteHtml(indexHtml, route, remoteData) {
  const meta = enrichSeoMeta(route, getSeoMeta(route, remoteData), remoteData)
  const cleaned = cleanManagedSeoTags(indexHtml)
  const tags = buildSeoTags(route, meta)
  const staticBody = buildStaticRouteBody(route, meta, remoteData)
  const withStaticRoot = cleaned.replace(/<div id="root"><\/div>/i, `<div id="root">\n${staticBody}\n    </div>`)

  return withStaticRoot.replace(/\s*<\/head>/i, `\n${tags}\n  </head>`)
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function sitemapMeta(route) {
  if (route === '/') return { changefreq: 'daily', priority: '1.0' }
  if (route === '/arenda-pylesosov-moskva' || route === '/arenda-gopro-moskva' || route === '/arenda-audiooborudovaniya-moskva') {
    return { changefreq: 'weekly', priority: '0.9' }
  }
  if (route.startsWith('/arenda-')) return { changefreq: 'weekly', priority: '0.8' }
  if (route === '/blog') return { changefreq: 'weekly', priority: '0.8' }
  if (route.startsWith('/blog/')) return { changefreq: 'monthly', priority: '0.7' }
  if (route.startsWith('/equipment/')) return { changefreq: 'weekly', priority: '0.7' }
  if (['/privacy', '/return-policy', '/cookies', '/terms', '/offer', '/rental-agreement', '/requisites'].includes(route)) {
    return { changefreq: 'yearly', priority: '0.3' }
  }
  return { changefreq: 'monthly', priority: '0.7' }
}

function toDateOnly(value) {
  if (!value) return null
  const date = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
}

function latestDate(...values) {
  return values.filter(Boolean).sort().pop() || null
}

async function gitLastModified(filePaths) {
  try {
    const { stdout: shallow } = await execFileAsync('git', ['rev-parse', '--is-shallow-repository'], { cwd: clientDir })
    if (shallow.trim() === 'true') return null
    const { stdout } = await execFileAsync('git', ['log', '-1', '--format=%cs', '--', ...filePaths], { cwd: clientDir })
    return stdout.trim() || null
  } catch {
    return null
  }
}

// Маршрут -> файл страницы по lazy-импортам и <Route> в App.tsx.
async function getRouteSourceFiles() {
  const app = await fs.readFile(path.join(clientDir, 'src/App.tsx'), 'utf8')
  const components = new Map(
    [...app.matchAll(/const (\w+) = lazy\(\(\) => import\('\.\/(pages\/[^']+)'\)\)/g)]
      .map(([, name, file]) => [name, `src/${file}.tsx`]),
  )
  const routes = new Map()
  for (const [, routePath, name] of app.matchAll(/<Route path="([^"]+)" element=\{<(\w+)[^>]*\/>\}/g)) {
    if (components.has(name) && !routes.has(routePath)) routes.set(routePath, components.get(name))
  }
  return routes
}

async function routeLastmod(route, remoteData, routeSourceFiles) {
  if (route.startsWith('/equipment/')) {
    const identifier = route.split('/').filter(Boolean)[1]
    const item = findEquipmentByIdentifier(remoteData, identifier)
    return toDateOnly(item?.updatedAt || item?.updated_at || item?.createdAt || item?.created_at)
  }

  if (route.startsWith('/blog/')) {
    const article = remoteData.articleBySlug.get(route.split('/').filter(Boolean)[1])
    return toDateOnly(article?.updated_at || article?.created_at)
  }

  const sourceFile = routeSourceFiles.get(route)
  const pageDate = sourceFile ? await gitLastModified([sourceFile]) : null

  if (route === '/') {
    const equipmentDates = [...remoteData.equipmentById.values()].map((item) => toDateOnly(item.updatedAt || item.updated_at))
    return latestDate(pageDate, ...equipmentDates)
  }

  if (route === '/blog') {
    const articleDates = [...remoteData.articleBySlug.values()].map((article) => toDateOnly(article.updated_at || article.created_at))
    return latestDate(pageDate, ...articleDates)
  }

  return pageDate
}

async function writeDistSitemap(routes, remoteData) {
  const routeSourceFiles = await getRouteSourceFiles()
  const sitemapRoutes = []
  const seenLocs = new Set()

  for (const route of routes) {
    if (route === '/equipment') continue
    const meta = getSeoMeta(route, remoteData)
    if (String(meta.robots || '').toLowerCase().includes('noindex')) continue

    const loc = routeCanonical(meta, route)
    if (seenLocs.has(loc)) continue
    seenLocs.add(loc)
    sitemapRoutes.push({ route, loc, lastmod: await routeLastmod(route, remoteData, routeSourceFiles) })
  }

  const urls = sitemapRoutes.map(({ route, loc, lastmod }) => {
    const { changefreq, priority } = sitemapMeta(route)
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  })

  await fs.writeFile(
    distSitemapPath,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${urls.join('\n\n')}\n\n</urlset>\n`,
    'utf8',
  )
}

const AI_PRICES_MARKER = '<!-- generated:prices -->'

function buildPriceList(remoteData) {
  return [...remoteData.equipmentBySlug.values()]
    .map((item) => {
      const pricing = normalizePricing(item.pricing)
      const oneDay = getOneDayPrice(item)
      const longTerm = getLongTermDailyPrice(item)
      const weekendDay = Number(pricing.weekendDay) || 0
      return {
        name: item.name,
        category: item.category,
        url: `${SITE_ORIGIN}${equipmentRoute(item)}`,
        bookingUrl: `${SITE_ORIGIN}/booking?equipment=${encodeURIComponent(item.slug)}`,
        pricePerDayRub: oneDay,
        weekendPricePerDayRub: weekendDay > oneDay ? weekendDay : undefined,
        longTerm: longTerm ? { pricePerDayRub: longTerm.dailyPrice, minDays: longTerm.days } : undefined,
      }
    })
    .filter((item) => item.pricePerDayRub > 0)
}

function formatPriceListMarkdown(priceList, generatedAt) {
  const byCategory = new Map()
  for (const item of priceList) {
    if (!byCategory.has(item.category)) byCategory.set(item.category, [])
    byCategory.get(item.category).push(item)
  }

  const lines = [
    `## Current rental prices (live catalog, ${generatedAt})`,
    '',
    'Prices are per 24 hours in RUB. Availability for specific dates and office is confirmed by a manager after a booking request; cite the product page for the latest price.',
    '',
  ]
  for (const [category, items] of byCategory) {
    lines.push(`### ${category}`, '')
    for (const item of items) {
      const extras = [
        item.weekendPricePerDayRub ? `Fri–Sun ${formatPrice(item.weekendPricePerDayRub)} ₽/сутки` : '',
        item.longTerm ? `from ${formatPrice(item.longTerm.pricePerDayRub)} ₽/сутки for ${item.longTerm.minDays}+ days` : '',
      ].filter(Boolean).join('; ')
      lines.push(`- [${item.name}](${item.url}): ${formatPrice(item.pricePerDayRub)} ₽ за сутки${extras ? ` (${extras})` : ''}. Booking: ${item.bookingUrl}`)
    }
    lines.push('')
  }
  return lines.join('\n').trimEnd()
}

// Подставляет актуальный прайс из API в AI-файлы dist/ вместо маркера из public/.
// Без данных каталога маркер просто убирается: устаревшие цены хуже, чем их отсутствие.
async function writeAiPriceFiles(remoteData) {
  const priceList = buildPriceList(remoteData)
  const generatedAt = new Date().toISOString().split('T')[0]
  const markdown = priceList.length ? formatPriceListMarkdown(priceList, generatedAt) : ''

  for (const fileName of ['llms.txt', 'llms-full.txt']) {
    const filePath = path.join(distDir, fileName)
    const content = await fs.readFile(filePath, 'utf8').catch(() => null)
    if (content === null || !content.includes(AI_PRICES_MARKER)) continue
    await fs.writeFile(filePath, content.replace(AI_PRICES_MARKER, markdown).replace(/\n{3,}/g, '\n\n'), 'utf8')
  }

  const summaryPath = path.join(distDir, 'ai-summary.json')
  const summaryRaw = await fs.readFile(summaryPath, 'utf8').catch(() => null)
  if (summaryRaw && priceList.length) {
    const summary = JSON.parse(summaryRaw)
    summary.pricesGeneratedAt = generatedAt
    summary.priceList = priceList
    await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  }

  return priceList.length
}

async function main() {
  const indexHtml = await fs.readFile(distIndexPath, 'utf8')
  const remoteData = await loadRemoteSeoData()
  await refreshYandexRatings()
  const routes = await getRoutesFromSitemap(remoteData)

  await Promise.all(
    routes.map(async (route) => {
      const indexOutputPath = routeIndexOutputPath(route)
      const routeHtml = renderRouteHtml(indexHtml, route, remoteData)

      await fs.mkdir(path.dirname(indexOutputPath), { recursive: true })
      await fs.writeFile(indexOutputPath, routeHtml, 'utf8')

      if (route !== '/') {
        const htmlOutputPath = routeHtmlOutputPath(route)
        await fs.mkdir(path.dirname(htmlOutputPath), { recursive: true })
        await fs.writeFile(htmlOutputPath, routeHtml, 'utf8')
      }
    }),
  )

  await Promise.all(
    getLegacyEquipmentRoutes(remoteData).map(async (route) => {
      const routeHtml = renderRouteHtml(indexHtml, route, remoteData)
      const indexOutputPath = routeIndexOutputPath(route)
      const htmlOutputPath = routeHtmlOutputPath(route)

      await fs.mkdir(path.dirname(indexOutputPath), { recursive: true })
      await fs.writeFile(indexOutputPath, routeHtml, 'utf8')
      await fs.writeFile(htmlOutputPath, routeHtml, 'utf8')
    }),
  )

  await fs.writeFile(distIndexPath, renderRouteHtml(indexHtml, '/', remoteData), 'utf8')
  await writeDistSitemap(routes, remoteData)
  const pricedItems = await writeAiPriceFiles(remoteData)

  console.log(`AI price list generated: ${pricedItems} items`)
  console.log(`Static route entrypoints generated: ${routes.length} routes, ${routes.length * 2 - 1} files`)
  console.log(`Legacy equipment aliases generated: ${getLegacyEquipmentRoutes(remoteData).length} routes`)
  console.log(`Static SEO sitemap generated: ${routes.filter((route) => {
    if (route === '/equipment') return false
    const meta = getSeoMeta(route, remoteData)
    return !String(meta.robots || '').toLowerCase().includes('noindex')
  }).length} URLs`)
}

main().catch((error) => {
  console.error('Static route entrypoint generation failed:', error)
  process.exit(1)
})
