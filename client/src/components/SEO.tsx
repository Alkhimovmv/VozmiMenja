import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  noIndex?: boolean
  structuredData?: Record<string, any>
}

export default function SEO({
  title = 'ВозьмиМеня - Аренда профессионального оборудования в Москве',
  description = 'Аренда камер, клинингового оборудования и аудиотехники в Москве. Выгодные цены, быстрая доставка, качественное оборудование. Звоните: +7 (917) 525-50-95',
  keywords = 'аренда оборудования Москва, прокат камер, аренда фототехники, клининговое оборудование аренда, аренда аудиотехники, прокат техники Москва',
  image = '/og-image.jpg',
  url = 'https://vozmimenya.ru',
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
      <meta name="geo.position" content="55.710646;37.784785" />
      <meta name="ICBM" content="55.710646, 37.784785" />

      {/* Языковые альтернативы */}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ru" href={url} />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="theme-color" content="#2563eb" />

      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
