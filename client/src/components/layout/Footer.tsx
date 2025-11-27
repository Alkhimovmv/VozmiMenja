import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import avitoIcon from '../../assets/avito.png'
import logoFooter from '../../assets/logo-footer.png'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-col md:flex-row items-start md:space-x-6">
              {/* Иконка слева */}
              <div className="flex-shrink-0 md:pr-16 mb-6 md:mb-0">
                <img
                  src={logoFooter}
                  alt="ВозьмиМеня"
                  width="320"
                  height="320"
                  className="h-48 md:h-80 w-auto"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>

              {/* Контент справа */}
              <div className="flex-1 md:pr-6">
                <p className="text-gray-300 mb-4">
                  Ваш надежный партнер в аренде профессионального оборудования.
                  Предлагаем качественную технику для фото, видео и клининга по доступным ценам.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Phone className="w-4 h-4" />
                    <span>+7 (993) 363-64-64</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>alkhimovmv@yandex.ru</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>г. Москва, ул. Федора Полетаева, 15к3</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Круглосуточно, 24/7</span>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Мы в социальных сетях</h3>
                  <div className="flex space-x-3">
                <a
                  href="https://t.me/VozmiMenyaRent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-blue-500/50"
                  title="Telegram"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/79933636464"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-green-500/50"
                  title="WhatsApp"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href="https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-700/50 hover:border-[#0AF]/50"
                  title="Авито"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0AF]/20 to-[#09D]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={avitoIcon} alt="Avito" className="w-7 h-7 relative z-10 rounded-lg" />
                </a>
              </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="pl-0 md:pl-40 md:-mr-8">
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Быстрые ссылки</h3>
            <div className="space-y-3">
              <Link to="/" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Каталог
              </Link>
              <Link to="/about" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                О нас
              </Link>
              <Link to="/delivery" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Доставка
              </Link>
              <Link to="/contact" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Контакты
              </Link>
              <Link to="/faq" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                FAQ
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="pl-0 md:pl-16">
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Категории</h3>
            <div className="space-y-3">
              <Link to="/?category=Камеры" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Камеры
              </Link>
              <Link to="/?category=Пылесосы,%20уборка%20и%20клининг" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Пылесосы, уборка и клининг
              </Link>
              <Link to="/?category=Аудиооборудование" className="group flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Аудиооборудование
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 ВозьмиМеня. Все права защищены.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}