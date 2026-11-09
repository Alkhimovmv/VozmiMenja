import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('cookie_consent')) {
      setVisible(false)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    window.dispatchEvent(new Event('cookie-consent-accepted'))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-0 right-0 z-[60] flex justify-center px-2 sm:px-4 pointer-events-none">
      <div className="bg-gray-900 text-white rounded-xl sm:rounded-2xl shadow-xl px-3 py-2.5 sm:p-4 max-w-xl w-full flex items-center sm:items-start gap-3 sm:gap-4 pointer-events-auto">
        <div className="flex-1 text-[11px] sm:text-xs text-gray-300 leading-snug sm:leading-relaxed">
          Мы используем cookie и Яндекс.Метрику для работы сайта и аналитики.
          Продолжая пользоваться сайтом, вы соглашаетесь с{' '}
          <Link to="/privacy" className="text-blue-400 hover:underline">Политикой обработки персональных данных</Link>{' '}
          и{' '}
          <Link to="/cookies" className="text-blue-400 hover:underline">Политикой использования cookie</Link>.
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={accept}
            className="text-xs font-semibold bg-[#2563EB] hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl transition-colors"
          >
            Принять
          </button>
          <button
            onClick={accept}
            className="hidden sm:flex w-7 h-7 items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
