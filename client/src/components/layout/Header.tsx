import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Phone } from 'lucide-react'
import logoHeader from '../../assets/logo-header.png'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCatalogClick = (e: React.MouseEvent, closeMenu?: () => void) => {
    e.preventDefault()
    closeMenu?.()
    if (location.pathname === '/') {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }

  const navLinks = [
    { to: '/about', label: 'О нас' },
    { to: '/delivery', label: 'Условия доставки' },
    { to: '/contact', label: 'Свяжитесь с нами' },
    { to: '/faq', label: 'FAQ' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={logoHeader} alt="ВозьмиМеня" className="h-10 w-auto" />
            <span className="text-xl font-bold text-gray-900">ВозьмиМеня</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="/#catalog"
              onClick={(e) => handleCatalogClick(e)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Каталог
            </a>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+79933636464"
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '14px', borderRadius: '12px' }}
            >
              <Phone className="w-4 h-4" />
              +7 (993) 363-64-64
            </a>
          </div>

        </div>
      </div>
    </header>
  )
}
