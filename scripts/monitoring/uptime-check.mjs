// Внешняя проверка доступности vozmimenya.ru. Запускается из GitHub Actions (.github/workflows/uptime.yml),
// то есть снаружи Cloud.ru: падение сервера целиком тоже будет замечено.
// Выход 0 — всё работает, 1 — есть проблемы. Итог пишется в stdout и в $GITHUB_STEP_SUMMARY.
import fs from 'node:fs'
import tls from 'node:tls'

const SITE = process.env.MONITOR_SITE_URL || 'https://vozmimenya.ru'
const API = process.env.MONITOR_API_URL || 'https://api.vozmimenya.ru'
const TIMEOUT_MS = 15000
const ATTEMPTS = 3 // кратковременный сбой сети не считаем падением
const CERT_WARN_DAYS = 14

const checks = [
  {
    name: 'Сайт: главная',
    url: `${SITE}/`,
    validate: (res, body) => res.status === 200 && body.includes('ВозьмиМеня'),
  },
  {
    name: 'API: health',
    url: `${API}/health`,
    validate: (res, body) => res.status === 200 && JSON.parse(body).status === 'OK',
  },
  {
    name: 'API: каталог',
    url: `${API}/api/equipment?limit=1`,
    validate: (res, body) => res.status === 200 && Array.isArray(JSON.parse(body).data) && JSON.parse(body).data.length > 0,
  },
  {
    name: 'Сайт: форма брони',
    url: `${SITE}/booking`,
    validate: (res) => res.status === 200,
  },
  {
    name: 'Сайт: sitemap.xml',
    url: `${SITE}/sitemap.xml`,
    validate: (res, body) => res.status === 200 && body.includes('<urlset'),
  },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const NETWORK_ERRORS = {
  ENOTFOUND: 'домен не найден (DNS)',
  ECONNREFUSED: 'соединение отклонено — сервер не отвечает',
  ECONNRESET: 'соединение сброшено',
  ETIMEDOUT: 'сервер не ответил вовремя',
  CERT_HAS_EXPIRED: 'SSL-сертификат истёк',
}

async function runHttpCheck(check) {
  let lastError = ''
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const started = Date.now()
    try {
      const res = await fetch(check.url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'User-Agent': 'VozmiMenja-uptime-monitor' } })
      const body = await res.text()
      const ms = Date.now() - started
      if (check.validate(res, body)) return { name: check.name, ok: true, detail: `HTTP ${res.status}, ${ms} мс` }
      lastError = `HTTP ${res.status}, ответ не прошёл проверку`
    } catch (error) {
      const code = error?.cause?.code
      lastError = error?.name === 'TimeoutError' ? `таймаут ${TIMEOUT_MS / 1000} с` : (NETWORK_ERRORS[code] || code || error?.message || String(error))
    }
    if (attempt < ATTEMPTS) await sleep(5000)
  }
  return { name: check.name, ok: false, detail: lastError }
}

function certDaysLeft(host) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: TIMEOUT_MS }, () => {
      const cert = socket.getPeerCertificate()
      socket.end()
      resolve(cert?.valid_to ? Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86400000) : null)
    })
    socket.on('error', () => resolve(null))
    socket.on('timeout', () => { socket.destroy(); resolve(null) })
  })
}

async function runCertCheck(host) {
  const days = await certDaysLeft(host)
  if (days === null) return { name: `SSL: ${host}`, ok: false, detail: 'не удалось получить сертификат' }
  return { name: `SSL: ${host}`, ok: days >= CERT_WARN_DAYS, detail: `истекает через ${days} дн.` }
}

const results = [
  ...(await Promise.all(checks.map(runHttpCheck))),
  ...(await Promise.all(['vozmimenya.ru', 'api.vozmimenya.ru'].map(runCertCheck))),
]

const failed = results.filter((result) => !result.ok)
const lines = results.map((result) => `${result.ok ? '✅' : '❌'} ${result.name} — ${result.detail}`)
const report = lines.join('\n')
console.log(report)

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Мониторинг vozmimenya.ru\n\n${lines.map((line) => `- ${line}`).join('\n')}\n`)
}
// Текст для уведомления: только проблемные проверки.
if (process.env.GITHUB_OUTPUT) {
  const problems = failed.map((result) => `❌ ${result.name} — ${result.detail}`).join('\n')
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `problems<<EOF\n${problems}\nEOF\n`)
}

process.exit(failed.length ? 1 : 0)
