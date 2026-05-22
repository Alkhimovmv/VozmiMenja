import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { officesApi, type Office } from '../../api/admin/offices';
import { OfficeContext } from '../../hooks/useOffice';
import ErrorBoundary from './ErrorBoundary';
import logo from '../../assets/logo-header.png'
import apiClient from '../../api/admin/client';
import type { AdminUser } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface LayoutProps {
  children: React.ReactNode;
}

const OFFICE_ID_KEY = 'selectedOfficeId';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout, isSuperAdmin, viewAsUserId, setViewAsUserId, hasSelectedAccount } = useAuth();
  const queryClient = useQueryClient();
  const [isCompactMode, setIsCompactMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 900;
    }
    return false;
  });
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentOfficeId, setCurrentOfficeIdState] = useState<number>(() => {
    const saved = localStorage.getItem(OFFICE_ID_KEY);
    return saved ? parseInt(saved) : 1;
  });

  const { data: offices = [] } = useAuthenticatedQuery<Office[]>(
    ['offices'],
    officesApi.getAll,
    { enabled: hasSelectedAccount }
  );

  // Список пользователей для суперадмина
  const { data: adminUsers = [] } = useAuthenticatedQuery<AdminUser[]>(
    ['admin-users'],
    async () => {
      const res = await apiClient.get('/users');
      return res.data;
    },
    { enabled: isSuperAdmin }
  );

  const selectedAdminUser = adminUsers.find(u => u.id === viewAsUserId);

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

  // Закрытие дропдауна при клике снаружи
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAccount = (userId: number | null) => {
    setViewAsUserId(userId);
    setAccountDropdownOpen(false);
    // Инвалидируем все данные чтобы перезагрузить под новым аккаунтом
    queryClient.invalidateQueries();
  };

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
    ...(isSuperAdmin ? [{ path: '/admin/users', label: 'Аккаунты', icon: '👤' }] : []),
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
          {/* Хедер для суперадмина — выбор аккаунта */}
          {isSuperAdmin && (
            <div className={`flex-shrink-0 bg-indigo-700 ${isCompactMode ? 'ml-16' : ''}`}>
              <div className={`flex items-center px-4 gap-3 ${isCompactMode ? 'h-14' : 'h-14'}`}>
                <span className="text-indigo-200 text-xs font-medium whitespace-nowrap">Просмотр аккаунта:</span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAccountDropdownOpen(v => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewAsUserId
                        ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                        : 'bg-indigo-500 text-white border border-indigo-300 hover:bg-indigo-400'
                    }`}
                  >
                    <span>
                      {viewAsUserId
                        ? (selectedAdminUser?.name || `+${selectedAdminUser?.phone}` || 'Аккаунт')
                        : 'Выберите аккаунт'
                      }
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                      {adminUsers.filter(u => u.role !== 'superadmin').map(u => (
                        <button
                          key={u.id}
                          onClick={() => handleSelectAccount(u.id)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-3 ${
                            u.id === viewAsUserId ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-base">👤</span>
                          <span>
                            <div className="font-medium">{u.name || `+${u.phone}`}</div>
                            {u.name && <div className="text-xs text-gray-400">+{u.phone}</div>}
                          </span>
                          {u.id === viewAsUserId && (
                            <span className="ml-auto text-indigo-600">✓</span>
                          )}
                        </button>
                      ))}
                      {viewAsUserId !== null && (
                        <>
                          <div className="border-t border-gray-100" />
                          <button
                            onClick={() => handleSelectAccount(null)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            Сбросить выбор
                          </button>
                        </>
                      )}
                      {adminUsers.filter(u => u.role !== 'superadmin').length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400">Нет аккаунтов</div>
                      )}
                    </div>
                  )}
                </div>

                {viewAsUserId && (
                  <span className="text-xs text-indigo-200 ml-1">
                    (режим просмотра)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Табы офисов — segmented control */}
          {hasSelectedAccount && offices.length > 1 && (
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
              {isSuperAdmin && !hasSelectedAccount && location.pathname !== '/admin/users' ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="text-5xl mb-4">👆</div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">Выберите аккаунт для просмотра</h2>
                  <p className="text-gray-400 text-sm max-w-sm">
                    Используйте выпадающий список выше, чтобы выбрать аккаунт администратора и просмотреть его данные.
                  </p>
                </div>
              ) : (
                children
              )}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </OfficeContext.Provider>
  );
};

export default Layout;
