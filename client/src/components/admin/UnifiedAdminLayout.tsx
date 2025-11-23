import { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

interface UnifiedAdminLayoutProps {
  children: ReactNode
}

export default function UnifiedAdminLayout({ children }: UnifiedAdminLayoutProps) {
  const navigate = useNavigate()
  const [isCompactMode, setIsCompactMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 900
    }
    return false
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
    }
  }, [navigate])

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
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar onLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 ${isCompactMode ? 'ml-16' : 'ml-0'} pb-safe`}>
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-6 sm:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
