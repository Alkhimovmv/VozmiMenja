import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardCheck, Speaker, Camera, Sparkles } from 'lucide-react'

export default function MobileNav() {
  const { pathname } = useLocation()

  const tabs = [
    { to: '/', icon: Home, label: 'Главная' },
    { to: '/arenda-audiooborudovaniya-moskva', icon: Speaker, label: 'Колонки' },
    { to: '/arenda-gopro-moskva', icon: Camera, label: 'Камеры' },
    { to: '/arenda-pylesosov-moskva', icon: Sparkles, label: 'Пылесосы' },
    { to: '/booking', icon: ClipboardCheck, label: 'Бронь' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to.split('#')[0]) && to !== '/'
          return (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0 ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-semibold truncate w-full text-center">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
