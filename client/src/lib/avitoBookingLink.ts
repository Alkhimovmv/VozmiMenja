const PUBLIC_SITE_ORIGIN = 'https://vozmimenya.ru'

export const buildAvitoBookingUrl = (
  catalogEquipmentId: string,
  origin = PUBLIC_SITE_ORIGIN,
) => {
  const url = new URL('/booking', origin)
  url.searchParams.set('equipment', catalogEquipmentId)
  url.searchParams.set('utm_source', 'avito')
  url.searchParams.set('utm_medium', 'messenger')
  url.searchParams.set('utm_campaign', 'manual-booking')
  return url.toString()
}
