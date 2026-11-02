import { Helmet } from 'react-helmet-async'
import business from '../content/business.json'

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
  const siteTitle = title.includes('ВозьмиМеня') ? title : `${title} | ВозьмиМеня`

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
