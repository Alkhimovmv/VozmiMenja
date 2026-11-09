import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import business from '../content/business.json'
import seoMeta from '../content/seoMeta.json'

// Единый источник title/description/h1 для статических маршрутов: его же читает генератор статики,
// поэтому сниппет в пререндере и после загрузки JS совпадает.
const sharedSeo: Record<string, { title: string; description: string; h1?: string }> = seoMeta

const [primaryOffice] = business.offices

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  noIndex?: boolean
  structuredData?: Record<string, unknown> | Record<string, unknown>[]
}

const TITLE_MAX_LENGTH = 70
const BRAND_SUFFIX = ' | ВозьмиМеня'

// Бренд в конце title добавляем, только если он помещается в сниппет; то же правило в generate-static-route-entrypoints.js.
function fitSiteTitle(title: string) {
  const withBrand = title.includes('ВозьмиМеня') ? title : `${title}${BRAND_SUFFIX}`
  if (withBrand.length <= TITLE_MAX_LENGTH) return withBrand
  return withBrand.endsWith(BRAND_SUFFIX) ? withBrand.slice(0, -BRAND_SUFFIX.length) : withBrand
}

export default function SEO({
  title = 'ВозьмиМеня - Аренда профессионального оборудования в Москве',
  description = 'Аренда техники в Москве: колонки JBL, экшн-камеры, моющие и строительные пылесосы, пароочистители. Постамат 24/7 у м. Волжская и м. Динамо, доставка по Москве.',
  keywords = 'аренда техники Москва, прокат колонок JBL, аренда GoPro, аренда пылесоса Karcher, аренда пароочистителя, прокат техники Москва',
  image = business.image,
  url = 'https://vozmimenya.ru/',
  type = 'website',
  noIndex = false,
  structuredData
}: SEOProps) {
  const { pathname } = useLocation()
  const shared = sharedSeo[pathname.replace(/\/+$/, '') || '/']
  if (shared) {
    title = shared.title
    description = shared.description
  }
  const siteTitle = fitSiteTitle(title)

  return (
    <Helmet>
      {/* Основные meta-теги */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ВозьмиМеня" />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Дополнительные теги */}
      <meta name="author" content="ВозьмиМеня" />
      <meta name="geo.region" content="RU-MOS" />
      <meta name="geo.placename" content="Москва" />
      <meta name="geo.position" content={`${primaryOffice.latitude};${primaryOffice.longitude}`} />
      <meta name="ICBM" content={`${primaryOffice.latitude}, ${primaryOffice.longitude}`} />

      {/* Языковые альтернативы */}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ru" href={url} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
