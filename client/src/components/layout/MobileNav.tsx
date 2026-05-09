import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Grid3X3, Info, Truck, Phone, HelpCircle } from 'lucide-react'

export default function MobileNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleCatalog = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }

  const tabs = [
    { to: '/', icon: Home, label: 'Главная' },
    { to: '/#catalog', icon: Grid3X3, label: 'Каталог', onClick: handleCatalog },
    { to: '/about', icon: Info, label: 'О нас' },
    { to: '/delivery', icon: Truck, label: 'Доставка' },
    { to: '/contact', icon: Phone, label: 'Контакты' },
    { to: '/faq', icon: HelpCircle, label: 'FAQ' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map(({ to, icon: Icon, label, onClick }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to.split('#')[0]) && to !== '/'
          return (
            <Link
              key={label}
              to={to}
              onClick={onClick}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0 ${
                isActive ? 'text-primary' : 'text-gray-400'
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
