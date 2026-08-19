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
    <div className="fixed bottom-16 sm:bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-4 max-w-xl w-full flex items-start gap-4 pointer-events-auto">
        <div className="flex-1 text-xs text-gray-300 leading-relaxed">
          Мы используем cookie-файлы и метрические системы, включая Яндекс.Метрику, для корректной работы сайта,
          анализа трафика и обработки пользовательских действий, которые могут относиться к персональным данным.
          Продолжая использование сайта, вы подтверждаете согласие с{' '}
          <Link to="/privacy" className="text-blue-400 hover:underline">Политикой обработки персональных данных</Link>{' '}
          и{' '}
          <Link to="/cookies" className="text-blue-400 hover:underline">Политикой использования cookie</Link>.
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={accept}
            className="text-xs font-semibold bg-[#2563EB] hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Принять
          </button>
          <button
            onClick={accept}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
