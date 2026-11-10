type AnalyticsParams = Record<string, string | number | boolean | null | undefined | Array<string | number>>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: 'event', eventName: string, params?: AnalyticsParams) => void
    ym?: (counterId: number, action: 'reachGoal', target: string, params?: AnalyticsParams) => void
  }
}

// Счётчик тот же, что в index.html. Без запасного значения сборка вырезала все reachGoal:
// VITE_YANDEX_METRIKA_ID не задан ни в GitHub Pages, ни в deploy-local.sh.
const DEFAULT_YM_COUNTER_ID = 105133379
const YM_COUNTER_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID || DEFAULT_YM_COUNTER_ID)
const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3002/api')

export type BookingFunnelStage =
  | 'equipment_view'
  | 'booking_view'
  | 'equipment_selected'
  | 'form_started'
  | 'booking_submitted'

const FUNNEL_SESSION_KEY = 'vozmimenya_booking_funnel_session'
const FUNNEL_SENT_KEY = 'vozmimenya_booking_funnel_sent'

const getFunnelSessionId = () => {
  const stored = window.sessionStorage.getItem(FUNNEL_SESSION_KEY)
  if (stored) return stored

  const generated = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().replaceAll('-', '_')
    : `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`
  window.sessionStorage.setItem(FUNNEL_SESSION_KEY, generated)
  return generated
}

export function trackBookingFunnelStage(
  eventName: BookingFunnelStage,
  params: { equipmentId?: string; pagePath?: string } = {},
) {
  if (typeof window === 'undefined') return

  try {
    const sent = new Set(JSON.parse(window.sessionStorage.getItem(FUNNEL_SENT_KEY) || '[]') as string[])
    if (sent.has(eventName)) return
    sent.add(eventName)
    window.sessionStorage.setItem(FUNNEL_SENT_KEY, JSON.stringify([...sent]))

    void fetch(`${API_BASE_URL}/analytics/booking-funnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getFunnelSessionId(),
        eventName,
        pagePath: params.pagePath || window.location.pathname,
        equipmentId: params.equipmentId,
      }),
      keepalive: true,
    }).catch(() => {
      // Продуктовая аналитика не должна мешать клиенту оформить бронь.
      sent.delete(eventName)
      window.sessionStorage.setItem(FUNNEL_SENT_KEY, JSON.stringify([...sent]))
    })
  } catch {
    // Недоступный sessionStorage или блокировка аналитики не ломают основной сценарий.
  }
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  window.dataLayer?.push({ event: eventName, ...params })
  window.gtag?.('event', eventName, params)

  if (YM_COUNTER_ID) {
    window.ym?.(YM_COUNTER_ID, 'reachGoal', eventName, params)
  }
}
