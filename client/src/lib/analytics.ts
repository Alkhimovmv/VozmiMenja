type AnalyticsParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: 'event', eventName: string, params?: AnalyticsParams) => void
    ym?: (counterId: number, action: 'reachGoal', target: string, params?: AnalyticsParams) => void
  }
}

const YM_COUNTER_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID || 0)

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  window.dataLayer?.push({ event: eventName, ...params })
  window.gtag?.('event', eventName, params)

  if (YM_COUNTER_ID) {
    window.ym?.(YM_COUNTER_ID, 'reachGoal', eventName, params)
  }
}
