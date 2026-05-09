import { Link } from 'react-router-dom'
import { Phone, Mail } from 'lucide-react'
import logoFooter from '../../assets/logo-footer.png'
import maxIcon from '../../assets/max.png'
import avitoIcon from '../../assets/avito.png'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Main grid — 4 equal columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src={logoFooter} alt="ВозьмиМеня" className="h-10 w-auto" />
              <span className="text-base font-bold">ВозьмиМеня</span>
            </div>
            <div className="space-y-1.5 text-sm text-gray-400 mb-3">
              <a href="tel:+79933636464" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                +7 (993) 363-64-64
              </a>
              <a href="mailto:alkhimovmv@yandex.ru" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                alkhimovmv@yandex.ru
              </a>
            </div>
            <div className="flex gap-2">
              <a href="https://t.me/VozmiMenyaRent" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-[#2AABEE] rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://wa.me/79933636464" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-[#25D366] rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="https://max.ru/+79933636464" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden">
                <img src={maxIcon} alt="Max" className="w-5 h-5 object-contain" />
              </a>
              <a href="https://www.avito.ru/brands/bec2558749c417a5576049cbce277ace/all?page_from=from_item_card&iid=7408898363&sellerId=f68e169e975bcc285ceb9bab886e60f3" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden">
                <img src={avitoIcon} alt="Avito" className="w-5 h-5 object-contain" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Навигация</h3>
            <div className="space-y-2">
              {[
                { to: '/', label: 'Каталог' },
                { to: '/about', label: 'О нас' },
                { to: '/delivery', label: 'Условия доставки' },
                { to: '/contact', label: 'Контакты' },
                { to: '/faq', label: 'FAQ' },
              ].map((link) => (
                <Link key={link.label} to={link.to}
                  className="block text-sm text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Категории</h3>
            <div className="space-y-2">
              {[
                { to: '/?category=Камеры', label: 'Камеры' },
                { to: '/?category=Пылесосы,%20уборка%20и%20клининг', label: 'Пылесосы и клининг' },
                { to: '/?category=Аудиооборудование', label: 'Аудиооборудование' },
              ].map((link) => (
                <Link key={link.label} to={link.to}
                  className="block text-sm text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacts & Offices */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Адреса</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>м. Волжская<br /><span className="text-gray-500">Волжский бульвар, 51с15</span></p>
              <p>м. Динамо<br /><span className="text-gray-500">ул. Расковой, 1</span></p>
              <p className="pt-1 text-gray-500">Круглосуточно, 24/7</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-xs">© 2024 ВозьмиМеня. Все права защищены.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
