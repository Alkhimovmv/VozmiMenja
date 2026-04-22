import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { officesApi, type Office } from '../../api/admin/offices';
import { OfficeContext } from '../../hooks/useOffice';
import ErrorBoundary from './ErrorBoundary';
import logo from '../../assets/logo-header.png'

interface LayoutProps {
  children: React.ReactNode;
}

const OFFICE_ID_KEY = 'selectedOfficeId';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isCompactMode, setIsCompactMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 900;
    }
    return false;
  });

  const [currentOfficeId, setCurrentOfficeIdState] = useState<number>(() => {
    const saved = localStorage.getItem(OFFICE_ID_KEY);
    return saved ? parseInt(saved) : 1;
  });

  const { data: offices = [] } = useAuthenticatedQuery<Office[]>(['offices'], officesApi.getAll);

  // Если текущий офис не существует — выбираем первый
  useEffect(() => {
    if (offices.length > 0 && !offices.find(o => o.id === currentOfficeId)) {
      setCurrentOfficeIdState(offices[0].id);
    }
  }, [offices, currentOfficeId]);

  const setCurrentOfficeId = (id: number) => {
    setCurrentOfficeIdState(id);
    localStorage.setItem(OFFICE_ID_KEY, String(id));
  };

  const currentOffice = offices.find(o => o.id === currentOfficeId);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsCompactMode(width < 900);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { path: '/admin/rentals', label: 'Список аренд', icon: '📋' },
    { path: '/admin/schedule', label: 'График аренд', icon: '📊' },
    { path: '/admin/customers', label: 'Арендаторы', icon: '👥' },
    { path: '/admin/finances', label: 'Финансы', icon: '💰' },
    { path: '/admin/lockers', label: 'Ячейки постомата', icon: '🔐' },
  ];

  const bottomMenuItems = [
    { path: '/admin/equipment', label: 'Оборудование', icon: '🎥' },
    { path: '/admin/offices', label: 'Настройка офисов', icon: '🏢' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <OfficeContext.Provider value={{ offices, currentOfficeId, setCurrentOfficeId, currentOffice }}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`
          ${isCompactMode ? 'fixed z-50' : 'relative z-auto'}
          flex flex-col ${isCompactMode ? 'w-16' : 'w-64'} bg-white shadow-lg h-full
          transform transition-transform duration-300 ease-in-out
          translate-x-0
        `}>
          {/* Desktop Header */}
          <div className={`${!isCompactMode ? 'flex' : 'hidden'} items-center justify-center h-16 px-4 bg-indigo-600`}>
            <img src={logo} width={45} height={45} className="mr-5"/>
            <h1 className="text-xl font-bold text-white whitespace-nowrap">Возьми меня</h1>
          </div>

          {/* Mobile Header in Sidebar */}
          <div className={`${isCompactMode ? 'flex' : 'hidden'} items-center justify-center h-14 bg-indigo-600`}>
            <img src={logo} width={36} height={36}/>
          </div>

          <nav className={`flex-1 ${isCompactMode ? 'px-1' : 'px-4'} py-3 space-y-1 overflow-y-auto`}>
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

          <div className={`${isCompactMode ? 'p-2' : 'p-4'} border-t space-y-1`}>
            {bottomMenuItems.map(item => (
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
            <button
              onClick={() => logout()}
              className={`flex ${isCompactMode ? 'justify-center px-2' : 'items-center px-4'} w-full py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900`}
              title="Выйти"
            >
              <span className={`${isCompactMode ? 'text-xl' : 'text-lg mr-3'}`}>🚪</span>
              {!isCompactMode && <span className="text-sm">Выйти</span>}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Табы офисов — segmented control */}
          {offices.length > 1 && (
            <div className={`flex-shrink-0 bg-indigo-600 ${isCompactMode ? 'ml-16' : ''}`}>
              <div className={`flex items-center px-4 ${isCompactMode ? 'h-14' : 'h-16'}`}>
                <div className="flex w-full bg-gray-200 rounded-lg p-1 gap-1">
                  {offices.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setCurrentOfficeId(o.id)}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                        o.id === currentOfficeId
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <main className={`flex-1 overflow-hidden bg-gray-50 ${isCompactMode ? 'ml-16' : 'ml-0'} pb-safe flex flex-col`}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </OfficeContext.Provider>
  );
};

export default Layout;
