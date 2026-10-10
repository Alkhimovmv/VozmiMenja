import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_ORIGIN = 'https://vozmimenya.ru'
const API_ORIGIN = (process.env.STATIC_SEO_API_URL || process.env.VITE_API_URL || 'https://api.vozmimenya.ru/api').replace(/\/$/, '')

const staticRoutes = [
  '/',
  '/equipment',
  '/arenda-pylesosov-moskva',
  '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva',
  '/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva',
  '/arenda-mikrofona-dlya-intervyu-moskva',
  '/arenda-kolonki-dlya-vecherinki-moskva',
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
  '/kak-prohodit-arenda-tehniki',
  '/samovyvoz-24-7-postamat',
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
    title: 'Аренда пылесосов в Москве от 400 ₽/день | ВозьмиМеня',
    description: 'Аренда строительных, моющих и хозяйственных пылесосов в Москве: Karcher WD, Puzzi и техника для уборки после ремонта, мебели и авто.',
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
  '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva': {
    title: 'Аренда пароочистителя для кухни, плитки и ванной',
    description: 'Пароочиститель Karcher напрокат для кухни, плитки, швов, ванной и финальной уборки без покупки техники.',
  },
  '/arenda-kamery-dlya-puteshestviya-vloga-moskva': {
    title: 'Аренда камеры для путешествия и влога в Москве',
    description: 'Камеры GoPro, Insta360 и DJI Osmo Pocket напрокат для поездки, блога, спорта и мероприятия. Подберём комплект.',
  },
  '/arenda-gopro-moskva': {
    title: 'Аренда GoPro и экшн-камер в Москве | ВозьмиМеня',
    description: 'Экшн-камеры GoPro, Insta360 и DJI Osmo Pocket в аренду в Москве для спорта, поездки, блога и съёмки контента.',
  },
  '/arenda-audiooborudovaniya-moskva': {
    title: 'Аренда аудиооборудования в Москве | Колонки и микрофоны',
    description: 'Аудиооборудование напрокат в Москве: колонки JBL PartyBox и беспроводные микрофоны для мероприятий, интервью и съёмок.',
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
  '/kak-prohodit-arenda-tehniki': {
    title: 'Как проходит аренда техники | ВозьмиМеня',
    description: 'Пошагово: как выбрать оборудование, оформить бронь, получить технику, пользоваться ей и вернуть после аренды.',
  },
  '/samovyvoz-24-7-postamat': {
    title: 'Самовывоз 24/7 через постамат | ВозьмиМеня',
    description: 'Как забрать и вернуть оборудование через постамат 24/7: удобно для камер, микрофонов и компактной техники.',
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
  return [...remoteData.equipmentById.keys()]
    .filter((id) => !remoteData.equipmentBySlug.has(id))
    .map((id) => `/equipment/${id}`)
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
  if (String(raw).startsWith('http')) return raw
  return `${SITE_ORIGIN}${String(raw).startsWith('/') ? '' : '/'}${raw}`
}

function routeCanonical(meta, route) {
  const canonicalPath = meta.canonicalPath ?? route
  return new URL(canonicalPath, `${SITE_ORIGIN}/`).toString()
}

async function fetchJson(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`${url} returned ${response.status}`)
    return await response.json()
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
    const articleItems = await fetchJson(`${API_ORIGIN}/articles`)
    for (const article of articleItems || []) {
      if (article?.slug) articleBySlug.set(String(article.slug), article)
    }
  } catch (error) {
    console.warn(`Static SEO: articles API unavailable, using fallbacks (${error.message})`)
  }

  return { equipmentById, equipmentBySlug, articleBySlug }
}

function getMinimumPrice(item) {
  const pricing = item?.pricing || {}
  const prices = Object.values(pricing).map(Number).filter((price) => price > 0)
  if (prices.length > 0) return Math.min(...prices)
  return Number(item?.pricePerDay || item?.price_per_day || 0)
}

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(price))
}

function buildProductSeo(route, item) {
  if (!item) {
    return {
      title: 'Аренда оборудования в Москве | ВозьмиМеня',
      description: 'Карточка оборудования ВозьмиМеня: описание, тарифы, условия аренды, доставка и онлайн-бронирование техники в Москве.',
      type: 'product',
    }
  }

  const price = getMinimumPrice(item)
  const priceText = price > 0 ? ` от ${formatPrice(price)} ₽/сутки` : ''
  const canonicalRoute = equipmentRoute(item)
  const title = `Аренда ${item.name} в Москве${priceText} | ВозьмиМеня`
  const description = truncate(`Аренда ${item.name} в Москве${priceText}. ${item.description || 'Проверенное оборудование, консультация, доставка и самовывоз.'}`, 165)
  const image = Array.isArray(item.images) && item.images.length > 0 ? absoluteUrl(item.images[0]) : undefined

  return {
    title,
    description,
    image,
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: item.name,
      description,
      image,
      offers: {
        '@type': 'Offer',
        url: `${SITE_ORIGIN}${canonicalRoute}`,
        priceCurrency: 'RUB',
        price: price || undefined,
        availability: 'https://schema.org/InStock',
        areaServed: { '@type': 'City', name: 'Москва' },
      },
    },
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
      publisher: { '@type': 'Organization', name: 'ВозьмиМеня' },
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
    const item = remoteData.equipmentBySlug.get(identifier) || remoteData.equipmentById.get(identifier)
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
  const jsonLd = meta.jsonLd
    ? `\n    <script type="application/ld+json" data-static-seo="true">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`
    : ''

  return `    <title data-rh="true">${title}</title>
    <meta name="description" content="${description}" data-rh="true" />
    <meta name="robots" content="index, follow" data-rh="true" />
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

function pageShell(title, description, sections = []) {
  const body = [
    `<h1>${escapeHtml(title)}</h1>`,
    `<p>${escapeHtml(description)}</p>`,
    ...sections,
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

  const price = getMinimumPrice(item)
  const specs = item.specifications && typeof item.specifications === 'object'
    ? Object.entries(item.specifications).filter(([, value]) => value).slice(0, 8)
    : []
  const related = productLinks(remoteData, (other) => other.id !== item.id && other.category === item.category, 6)
  const sections = [
    `<p>${escapeHtml(item.description || 'Проверенное оборудование для аренды в Москве.')}</p>`,
    price > 0 ? `<p>Минимальная цена аренды: ${escapeHtml(formatPrice(price))} ₽ за сутки. Доступны доставка, самовывоз и онлайн-бронь.</p>` : '',
    specs.length ? `<h2>Характеристики</h2><dl>${specs.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>` : '',
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
    return buildProductBody(remoteData.equipmentBySlug.get(identifier) || remoteData.equipmentById.get(identifier), remoteData)
  }

  if (route.startsWith('/blog/') && route !== '/blog') {
    const slug = route.split('/').filter(Boolean)[1]
    return buildArticleBody(remoteData.articleBySlug.get(slug), remoteData)
  }

  const allProducts = productLinks(remoteData, () => true, 12)
  const cleaning = productLinks(remoteData, (item) => String(item.category || '').includes('Пылесос') || String(item.category || '').includes('клининг'), 8)
  const cameras = productLinks(remoteData, (item) => String(item.category || '').includes('Камер'), 8)
  const audio = productLinks(remoteData, (item) => String(item.category || '').includes('Аудио'), 8)
  const articles = articleLinks(remoteData, 10)
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
      `<h2>Пылесосы и клининг</h2>${linkList(cleaning)}`,
      `<p>Для строительной пыли подходит WD5, для диванов и ковров — Karcher Puzzi, для плитки и кухни — пароочиститель SC4.</p>`,
    ],
    '/arenda-gopro-moskva': [
      `<h2>Камеры в аренду</h2>${linkList(cameras)}`,
      `<p>GoPro удобна для спорта и воды, Insta360 — для 360-ракурсов, DJI Osmo Pocket — для влогов и плавной съемки с рук.</p>`,
    ],
    '/arenda-audiooborudovaniya-moskva': [
      `<h2>Аудиооборудование</h2>${linkList(audio)}`,
      `<p>Колонки JBL PartyBox подходят для квартиры, дачи, праздника и небольшого мероприятия. Микрофоны помогают записать речь и интервью.</p>`,
    ],
    '/blog': [
      articles.length ? `<h2>Статьи</h2>${linkList(articles)}` : '',
    ],
    '/sitemap': [
      `<h2>Разделы сайта</h2>${linkList([
        ...allProducts,
        ...articles,
      ].slice(0, 30))}`,
    ],
  }

  return pageShell(meta.title, meta.description, routeSections[route] || [])
}

function renderRouteHtml(indexHtml, route, remoteData) {
  const meta = getSeoMeta(route, remoteData)
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

async function writeDistSitemap(routes) {
  const today = new Date().toISOString().split('T')[0]
  const sitemapRoutes = routes.filter((route) => route !== '/equipment')
  const urls = sitemapRoutes.map((route) => {
    const { changefreq, priority } = sitemapMeta(route)
    const loc = route === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${today}</lastmod>
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

async function main() {
  const indexHtml = await fs.readFile(distIndexPath, 'utf8')
  const remoteData = await loadRemoteSeoData()
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
  await writeDistSitemap(routes)

  console.log(`Static route entrypoints generated: ${routes.length} routes, ${routes.length * 2 - 1} files`)
  console.log(`Legacy equipment aliases generated: ${getLegacyEquipmentRoutes(remoteData).length} routes`)
  console.log(`Static SEO sitemap generated: ${routes.filter((route) => route !== '/equipment').length} URLs`)
}

main().catch((error) => {
  console.error('Static route entrypoint generation failed:', error)
  process.exit(1)
})
