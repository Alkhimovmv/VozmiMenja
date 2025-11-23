import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo-header.png'

interface AdminSidebarProps {
  onLogout?: () => void
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCompactMode, setIsCompactMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 900
    }
    return false
  })

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const shouldBeCompact = width < 900
      setIsCompactMode(shouldBeCompact)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('adminToken')
      navigate('/admin/login')
    }
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Оборудование', icon: '🎥' },
    { path: '/admin/articles', label: 'Блог', icon: '📝' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className={`
      ${isCompactMode ? 'fixed z-50' : 'relative z-auto'}
      flex flex-col ${isCompactMode ? 'w-16' : 'w-64'} bg-white shadow-lg h-full
      transform transition-transform duration-300 ease-in-out
      translate-x-0
    `}>
      {/* Desktop Header */}
      <div className={`${!isCompactMode ? 'flex' : 'hidden'} items-center justify-center h-16 px-4 bg-indigo-600`}>
        <img src={logo} width={45} height={45} className="mr-5" alt="Logo"/>
        <h1 className="text-xl font-bold text-white whitespace-nowrap">Возьми меня</h1>
      </div>

      {/* Mobile Header in Sidebar */}
      <div className={`${isCompactMode ? 'flex' : 'hidden'} items-center justify-center h-14 bg-indigo-600`}>
        <img src={logo} width={36} height={36} alt="Logo"/>
      </div>

      <nav className={`flex-1 ${isCompactMode ? 'px-1' : 'px-4'} py-3 space-y-2`}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex ${isCompactMode ? 'justify-center px-2' : 'items-center px-4'} py-3 text-sm font-medium rounded-md transition-colors ${
              isActive(item.path)
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title={item.label}
          >
            <span className={`${isCompactMode ? 'text-xl' : 'text-lg mr-3'}`}>{item.icon}</span>
            {!isCompactMode && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className={`${isCompactMode ? 'p-2' : 'p-4'} border-t`}>
        <button
          onClick={handleLogout}
          className={`flex ${isCompactMode ? 'justify-center px-2' : 'items-center px-4'} w-full py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900`}
          title="Выйти"
        >
          <span className={`${isCompactMode ? 'text-xl' : 'text-lg mr-3'}`}>🚪</span>
          {!isCompactMode && <span className="text-sm">Выйти</span>}
        </button>
      </div>
    </div>
  )
}
