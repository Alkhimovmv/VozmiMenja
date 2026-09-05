export const CONTACT_PHONE = '+79933636464'
export const CONTACT_PHONE_LABEL = '+7 (993) 363-64-64'
export const TELEGRAM_URL = 'https://t.me/VozmiMenyaRent'
export const AVITO_PROFILE_URL = 'https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3'
export const MAX_URL = 'https://max.ru/+79933636464'

export function getPageLeadMessage(pageTitle = document.title) {
  const pageUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`
  return `Здравствуйте! Хочу уточнить аренду. Страница: ${pageTitle} ${pageUrl}`
}

export function getLeadContext() {
  const params = new URLSearchParams(window.location.search)

  return {
    sourcePage: `${window.location.origin}${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  }
}

export function getWhatsAppUrl(message = getPageLeadMessage()) {
  return `https://wa.me/79933636464?text=${encodeURIComponent(message)}`
}

export function getTelegramUrl() {
  return TELEGRAM_URL
}
