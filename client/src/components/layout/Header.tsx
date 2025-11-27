import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import avitoIcon from '../../assets/avito.png'
import logoHeader from '../../assets/logo-header.png'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={logoHeader}
              alt="ВозьмиМеня"
              width="56"
              height="56"
              className="h-14 w-auto transform group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold" style={{ color: '#4A90A4' }}>
                ВозьмиМеня
              </span>
              <span className="text-xs text-gray-500 -mt-1">Аренда оборудования</span>
            </div>
          </Link>

          {/* Navigation - Современный стиль */}
          <div className="hidden md:flex items-center space-x-2">
            <nav className="flex items-center space-x-1">
              <Link
                to="/"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all hover:bg-primary-50 rounded-xl"
              >
                Каталог
              </Link>

              {/* Dropdown для категорий */}
              <div className="relative group">
                <button className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all hover:bg-primary-50 rounded-xl flex items-center space-x-1">
                  <span>Категории</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2">
                    <Link
                      to="/arenda-pylesosov-moskva"
                      className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      Пылесосы, уборка и клининг
                    </Link>
                    <Link
                      to="/arenda-gopro-moskva"
                      className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      Камеры
                    </Link>
                    <Link
                      to="/arenda-audiooborudovaniya-moskva"
                      className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      Аудиооборудование
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                to="/about"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all hover:bg-primary-50 rounded-xl"
              >
                О нас
              </Link>
              <Link
                to="/blog"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all hover:bg-primary-50 rounded-xl"
              >
                Блог
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all hover:bg-primary-50 rounded-xl"
              >
                Контакты
              </Link>
            </nav>

            {/* Social links - Современный дизайн */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              <a
                href="https://wa.me/79933636464"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-green-600 hover:text-white bg-green-50 hover:bg-green-600 rounded-xl transition-all transform hover:scale-110 shadow-sm hover:shadow-md"
                title="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="https://t.me/VozmiMenyaRent"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-all transform hover:scale-110 shadow-sm hover:shadow-md"
                title="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a
                href="https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all transform hover:scale-110 shadow-sm hover:shadow-md"
                title="Авито"
              >
                <img src={avitoIcon} alt="Avito" className="w-5 h-5 rounded-lg" />
              </a>
            </div>
          </div>

          {/* Mobile menu button - Современный стиль */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation - Современный стиль */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
              <Link
                to="/"
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                Каталог
              </Link>

              {/* Категории в мобильном меню */}
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 mb-2">Категории</div>
                <div className="space-y-1">
                  <Link
                    to="/arenda-pylesosov-moskva"
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Клининговое оборудование
                  </Link>
                  <Link
                    to="/arenda-gopro-moskva"
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Камеры
                  </Link>
                  <Link
                    to="/arenda-audiooborudovaniya-moskva"
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Аудиооборудование
                  </Link>
                </div>
              </div>

              <Link
                to="/about"
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                О нас
              </Link>
              <Link
                to="/blog"
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                Блог
              </Link>
              <Link
                to="/contact"
                className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                Контакты
              </Link>

              {/* Mobile Social links */}
              <div className="grid grid-cols-3 gap-2 pt-4 px-2">
                <a
                  href="https://wa.me/79933636464"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center space-y-1 px-3 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-xs font-medium">WhatsApp</span>
                </a>
                <a
                  href="https://t.me/VozmiMenyaRent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center space-y-1 px-3 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-xs font-medium">Telegram</span>
                </a>
                <a
                  href="https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center space-y-1 px-3 py-3 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-md"
                >
                  <img src={avitoIcon} alt="Avito" className="w-5 h-5 rounded-lg" />
                  <span className="text-xs font-medium text-gray-700">Авито</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
