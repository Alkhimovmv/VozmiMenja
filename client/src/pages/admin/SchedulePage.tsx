import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { rentalsApi } from '../../api/admin/rentals';
import { equipmentApi } from '../../api/admin/equipment';
import { type Rental, type Equipment, type CreateRentalDto } from '../../types/index';
import { useOffice } from '../../hooks/useOffice';
import { format, parseISO, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getStatusColor, getStatusText } from '../../utils/dateUtils';
import RentalModal from '../../components/admin/RentalModal';

interface EquipmentInstance {
  id: string;
  name: string;
  number: number;
  equipmentId: number;
}

const SchedulePage: React.FC = () => {
  const { currentOfficeId } = useOffice();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isInitialLoadRef = useRef(true);
  const prevWeekStartRef = useRef<Date | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(selectedDate, { locale: ru });
  const weekEnd = endOfWeek(selectedDate, { locale: ru });

  const { data: equipment = [] } = useAuthenticatedQuery<Equipment[]>(['equipment', 'rental'], equipmentApi.getForRental);

  const { data: rentals = [] } = useAuthenticatedQuery<Rental[]>(
    ['rentals', 'gantt', currentOfficeId],
    () => rentalsApi.getGanttData(undefined, undefined, currentOfficeId)
  );

  // Создаем список всех экземпляров оборудования
  const equipmentInstances = useMemo(() => {
    const instances: EquipmentInstance[] = [];
    equipment.forEach(item => {
      for (let i = 1; i <= item.quantity; i++) {
        instances.push({
          id: `${item.id}-${i}`,
          name: item.name,
          number: i,
          equipmentId: item.id
        });
      }
    });
    return instances;
  }, [equipment]);

  const generateWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const weekDays = useMemo(() => generateWeekDays(), [weekStart]);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Создаем индекс аренд для быстрого поиска
  const rentalsIndex = useMemo(() => {
    const index = new Map<string, Rental[]>();

    rentals.forEach(rental => {
      const key = `${rental.equipment_id}-${rental.instance_number}`;
      if (!index.has(key)) {
        index.set(key, []);
      }
      index.get(key)!.push(rental);
    });

    return index;
  }, [rentals]);

  const getRentalForInstanceAndTime = (instanceId: string, date: Date, hour: number) => {
    const [equipmentId, instanceNumber] = instanceId.split('-').map(Number);
    const key = `${equipmentId}-${instanceNumber}`;

    const instanceRentals = rentalsIndex.get(key);
    if (!instanceRentals) return undefined;

    const checkTime = new Date(date);
    checkTime.setHours(hour, 0, 0, 0);

    // Находим аренду конкретного экземпляра оборудования в это время
    return instanceRentals.find(rental => {
      const startDate = parseISO(rental.start_date);
      const endDate = parseISO(rental.end_date);

      return startDate <= checkTime && endDate > checkTime;
    });
  };

  // Функция для проверки пересечений аренд конкретного экземпляра
  const getConflictingRentals = (instanceId: string, date: Date, hour: number) => {
    const [equipmentId, instanceNumber] = instanceId.split('-').map(Number);
    const key = `${equipmentId}-${instanceNumber}`;

    const instanceRentals = rentalsIndex.get(key);
    if (!instanceRentals) return [];

    const checkTime = new Date(date);
    checkTime.setHours(hour, 0, 0, 0);
    const checkTimeEnd = new Date(checkTime);
    checkTimeEnd.setHours(hour + 1, 0, 0, 0);

    // Находим все аренды КОНКРЕТНОГО экземпляра в это время
    const activeRentals = instanceRentals.filter(rental => {
      const startDate = parseISO(rental.start_date);
      const endDate = parseISO(rental.end_date);

      return startDate < checkTimeEnd && endDate > checkTime;
    });

    // Конфликт только если один и тот же экземпляр арендован несколько раз одновременно
    return activeRentals.length > 1 ? activeRentals : [];
  };

  // Проверка пересечений для всех аренд (конфликт только если один экземпляр арендован дважды)
  const conflictingRentals = useMemo(() => {
    const conflicts: Array<{rental: Rental, conflictsWith: Rental[]}> = [];

    rentals.forEach(rental => {
      const conflictsWith = rentals.filter(otherRental => {
        if (rental.id === otherRental.id) return false;

        const startDate1 = parseISO(rental.start_date);
        const endDate1 = parseISO(rental.end_date);
        const startDate2 = parseISO(otherRental.start_date);
        const endDate2 = parseISO(otherRental.end_date);

        // Конфликт только если это тот же экземпляр оборудования и время пересекается
        return rental.equipment_id === otherRental.equipment_id &&
               rental.instance_number === otherRental.instance_number &&
               startDate1 < endDate2 &&
               endDate1 > startDate2;
      });

      if (conflictsWith.length > 0) {
        conflicts.push({ rental, conflictsWith });
      }
    });

    return conflicts;
  }, [rentals]);

  // Функция для скролла к текущему времени
  const scrollToCurrentTime = () => {
    const contentScroll = document.getElementById('content-scroll');
    if (!contentScroll) return;

    setTimeout(() => {
      const now = new Date();
      const currentWeekStart = startOfWeek(now, { locale: ru });
      const currentWeekEnd = endOfWeek(now, { locale: ru });

      // Проверяем, находится ли текущая дата в видимой неделе
      const isCurrentWeekVisible = now >= currentWeekStart && now <= currentWeekEnd;

      if (isCurrentWeekVisible) {
        const daysFromWeekStart = Math.floor((now.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24));
        const currentHour = now.getHours();

        const dayHeaderHeight = window.innerWidth >= 1024 ? 56 : 48;
        const hourRowHeight = window.innerWidth >= 1024 ? 32 : 24;

        const scrollPosition =
          daysFromWeekStart * (dayHeaderHeight + 24 * hourRowHeight) +
          dayHeaderHeight +
          currentHour * hourRowHeight;

        const containerHeight = contentScroll.clientHeight;
        const targetScroll = Math.max(0, scrollPosition - containerHeight / 3);

        requestAnimationFrame(() => {
          contentScroll.scrollTop = targetScroll;
        });
      } else {
        contentScroll.scrollTop = 0;
      }
    }, 100);
  };

  const goToPreviousWeek = () => {
    setSelectedDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setSelectedDate(prevDate => addDays(prevDate, 7));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    // Скроллим к текущему времени после небольшой задержки (чтобы DOM обновился)
    setTimeout(() => {
      scrollToCurrentTime();
    }, 200);
  };

  const showTooltip = (e: React.MouseEvent, rental: Rental, conflictingRentalsForSlot: Rental[]) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hasConflicts = conflictingRentalsForSlot.length > 1;

    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
          <div className="font-semibold text-sm mb-2">{rental.customer_name}</div>
          <div className="text-xs space-y-1">
            <div>📞 {rental.customer_phone}</div>
            <div>📅 {format(parseISO(rental.start_date), 'dd.MM.yyyy HH:mm', { locale: ru })} - {format(parseISO(rental.end_date), 'dd.MM.yyyy HH:mm', { locale: ru })}</div>
            <div>💰 {rental.rental_price}₽</div>
            <div>📦 {rental.equipment_name}</div>
            <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(rental.status).replace('cursor-pointer transition-all hover:shadow-md', '')}`}>
              {getStatusText(rental.status)}
            </div>
            {rental.comment && <div>💬 {rental.comment}</div>}
            {hasConflicts && (
              <div className="text-red-300 font-medium">
                ⚠️ КОНФЛИКТ! Пересекается с {conflictingRentalsForSlot.length - 1} другими арендами
              </div>
            )}
          </div>
        </div>
      )
    });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRentalDto & { status: string }> }) =>
      rentalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['rentals', 'gantt'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsModalOpen(false);
      setEditingRental(null);
    },
  });

  const handleEditRental = (rental: Rental) => {
    setEditingRental(rental);
    setIsModalOpen(true);
    hideTooltip();
  };

  const handleUpdateRental = (data: Partial<CreateRentalDto & { status: string }>) => {
    if (editingRental) {
      updateMutation.mutate({ id: editingRental.id, data });
    }
  };

  // Синхронизация скроллов
  useEffect(() => {
    const topScrollbar = document.getElementById('top-scrollbar');
    const headerScroll = document.getElementById('header-scroll');
    const contentScroll = document.getElementById('content-scroll');

    if (!topScrollbar || !headerScroll || !contentScroll) return;

    // Убираем полосы прокрутки у заголовка для визуального эффекта
    headerScroll.style.scrollbarWidth = 'none';
    (headerScroll.style as any).msOverflowStyle = 'none';
    const style = document.createElement('style');
    style.textContent = '#header-scroll::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);

    const syncScroll = (source: HTMLElement, targets: HTMLElement[]) => {
      const handleScroll = () => {
        targets.forEach(target => {
          if (target !== source) {
            target.scrollLeft = source.scrollLeft;
          }
        });
      };
      source.addEventListener('scroll', handleScroll);
      return () => source.removeEventListener('scroll', handleScroll);
    };

    const cleanupFunctions = [
      syncScroll(topScrollbar, [headerScroll, contentScroll]),
      syncScroll(headerScroll, [topScrollbar, contentScroll]),
      syncScroll(contentScroll, [topScrollbar, headerScroll])
    ];

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      document.head.removeChild(style);
    };
  }, [equipmentInstances.length]);

  // Прокрутка к текущему времени ТОЛЬКО при первом монтировании
  useEffect(() => {
    const contentScroll = document.getElementById('content-scroll');
    if (!contentScroll) return;

    const timer = setTimeout(() => {
      const now = new Date();
      const isCurrentWeekVisible = now >= weekStart && now <= weekEnd;

      if (isCurrentWeekVisible) {
        const daysFromWeekStart = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        const currentHour = now.getHours();

        const dayHeaderHeight = window.innerWidth >= 1024 ? 56 : 48;
        const hourRowHeight = window.innerWidth >= 1024 ? 32 : 24;

        const scrollPosition =
          daysFromWeekStart * (dayHeaderHeight + 24 * hourRowHeight) +
          dayHeaderHeight +
          currentHour * hourRowHeight;

        const containerHeight = contentScroll.clientHeight;
        const targetScroll = Math.max(0, scrollPosition - containerHeight / 3);

        requestAnimationFrame(() => {
          contentScroll.scrollTop = targetScroll;
          isInitialLoadRef.current = false;
        });
      } else {
        contentScroll.scrollTop = 0;
        isInitialLoadRef.current = false;
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Скролл в начало при смене недели (НО НЕ при первой загрузке)
  useEffect(() => {
    if (prevWeekStartRef.current === null) {
      prevWeekStartRef.current = weekStart;
      return;
    }

    if (prevWeekStartRef.current.getTime() !== weekStart.getTime()) {
      const contentScroll = document.getElementById('content-scroll');
      if (contentScroll) {
        contentScroll.scrollTop = 0;
      }
      prevWeekStartRef.current = weekStart;
    }
  }, [weekStart, weekEnd]);

  return (
    <div className="space-y-2 sm:space-y-4 w-full flex flex-col flex-1 overflow-hidden px-4 sm:px-6 py-4 sm:py-8">
      {/* Компактный заголовок для мобильных устройств */}
      <div className="flex flex-col space-y-2 lg:hidden">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">График аренд</h1>
          <div className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
            {format(weekStart, 'dd.MM', { locale: ru })} - {format(weekEnd, 'dd.MM.yy', { locale: ru })}
          </div>
        </div>
        <div className="flex flex-row space-x-1 sm:space-x-2">
          <button
            onClick={goToPreviousWeek}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-2 sm:py-3 rounded-md text-xs sm:text-sm min-h-[44px] touch-manipulation"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-3 py-2 sm:py-3 rounded-md text-xs sm:text-sm min-h-[44px] touch-manipulation"
          >
            Сегодня
          </button>
          <button
            onClick={goToNextWeek}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 sm:px-3 py-2 sm:py-3 rounded-md text-xs sm:text-sm min-h-[44px] touch-manipulation"
          >
            →
          </button>
        </div>
      </div>

      {/* Оригинальный заголовок для десктопных устройств */}
      <div className="hidden lg:flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">График аренд</h1>
          <p className="text-lg text-gray-600 mt-1">
            {format(weekStart, 'dd MMMM', { locale: ru })} - {format(weekEnd, 'dd MMMM yyyy', { locale: ru })}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={goToPreviousWeek}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            ← Предыдущая
          </button>
          <button
            onClick={goToToday}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Сегодня
          </button>
          <button
            onClick={goToNextWeek}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Следующая →
          </button>
        </div>
      </div>

      {/* Предупреждение о конфликтах */}
      {conflictingRentals.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Обнаружены конфликты в расписании!
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Найдено {conflictingRentals.length} аренд с пересечениями. Необходимо исправить следующие конфликты:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {conflictingRentals.slice(0, 5).map((conflict, index) => (
                    <li key={index}>
                      <strong>{conflict.rental.customer_name}</strong> - {conflict.rental.equipment_name}
                      <span className="text-red-600"> (пересекается с {conflict.conflictsWith.length} другими арендами)</span>
                    </li>
                  ))}
                  {conflictingRentals.length > 5 && (
                    <li className="text-red-600 font-medium">
                      ... и ещё {conflictingRentals.length - 5} конфликтов
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden flex-1 flex flex-col">
        {/* Верхний скролл */}
        <div
          className="overflow-x-auto overflow-y-hidden h-3 bg-gray-100"
          id="top-scrollbar"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div style={{ width: `${equipmentInstances.length * 120 + 200}px`, height: '1px' }}></div>
        </div>

        {/* Липкий заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div
            className="overflow-x-auto overflow-y-hidden"
            id="header-scroll"
          >
            <div style={{ minWidth: `${equipmentInstances.length * 120 + 200}px`, width: 'max-content' }}>
              <div className="flex">
                <div className="w-40 sm:w-48 lg:w-56 p-2 lg:p-3 bg-gray-50 font-medium text-gray-900 border-r border-gray-200 flex items-center text-xs sm:text-sm">
                  Время / Оборудование
                </div>
                {equipmentInstances.map((instance) => (
                  <div
                    key={instance.id}
                    className="w-28 sm:w-32 lg:w-36 p-1 lg:p-2 text-center font-medium bg-gray-50 text-gray-900 border-r border-gray-200"
                  >
                    <div className="text-xs sm:text-sm lg:text-base font-semibold truncate" title={instance.name}>
                      {instance.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      #{instance.number}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Содержимое таблицы */}
        <div
          className="overflow-x-auto overflow-y-auto max-w-full flex-1"
          id="content-scroll"
        >
          <div style={{ minWidth: `${equipmentInstances.length * 120 + 200}px`, width: 'max-content' }}>

            {/* Строки для каждого дня */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="border-b border-gray-100">
                {/* Заголовок дня */}
                <div className="flex bg-blue-50">
                  <div className="w-40 sm:w-48 lg:w-56 p-2 font-medium text-blue-900 border-r border-gray-200">
                    <div className="text-xs sm:text-sm lg:text-base font-semibold">
                      {format(day, 'EEEE', { locale: ru })}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600">
                      {format(day, 'dd.MM.yyyy', { locale: ru })}
                    </div>
                  </div>
                  {equipmentInstances.map((instance) => (
                    <div
                      key={`${instance.id}-${day.toISOString()}-header`}
                      className="w-28 sm:w-32 lg:w-36 p-1 lg:p-2 bg-blue-50 border-r border-gray-200"
                    />
                  ))}
                </div>

                {/* Часы дня */}
                {timeSlots.map((hour) => (
                  <div key={`${day.toISOString()}-${hour}`} className="flex hover:bg-gray-50">
                    <div className="w-40 sm:w-48 lg:w-56 p-2 text-xs sm:text-sm text-gray-600 border-r border-gray-200 flex items-center font-medium">
                      {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
                    </div>
                    {equipmentInstances.map((instance) => {
                      const rental = getRentalForInstanceAndTime(instance.id, day, hour);
                      const conflictingRentalsForSlot = getConflictingRentals(instance.id, day, hour);
                      const hasConflicts = conflictingRentalsForSlot.length > 1;

                      return (
                        <div
                          key={`${instance.id}-${day.toISOString()}-${hour}`}
                          className="w-28 sm:w-32 lg:w-36 h-8 sm:h-9 lg:h-10 border-r border-gray-200 flex items-center justify-center p-1"
                        >
                          {rental ? (
                            <div
                              className={`w-full h-full rounded text-xs sm:text-sm px-1 flex items-center justify-center cursor-pointer transition-all hover:shadow-md ${
                                hasConflicts
                                  ? 'bg-red-500 text-white border-2 border-red-700 animate-pulse'
                                  : getStatusColor(rental.status)
                              }`}
                              onClick={() => handleEditRental(rental)}
                              onMouseEnter={(e) => showTooltip(e, rental, conflictingRentalsForSlot)}
                              onMouseLeave={hideTooltip}
                              onTouchStart={(e) => showTooltip(e, rental, conflictingRentalsForSlot)}
                              onTouchEnd={hideTooltip}
                            >
                              {hasConflicts ? (
                                <span className="flex items-center">
                                  <span className="text-yellow-300 mr-1">⚠️</span>
                                  <span className="truncate text-xs sm:text-sm">
                                    {conflictingRentalsForSlot.map(r => r.customer_name.split(' ')[0]).join(' / ')}
                                  </span>
                                </span>
                              ) : (
                                <span className="truncate text-xs sm:text-sm font-medium">
                                  {rental.needs_delivery && <span className="mr-0.5">🚚</span>}
                                  {rental.customer_name.split(' ')[0]}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full bg-green-100 rounded flex items-center justify-center">
                              <span className="text-sm text-green-600 font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {equipmentInstances.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет оборудования</h3>
            <p className="text-gray-500">Добавьте оборудование для отображения графика</p>
          </div>
        )}
      </div>

      {/* Легенда и статистика (скрыта на мобильных) */}
      <div className="hidden lg:block bg-white px-4 py-2 rounded-lg shadow flex-shrink-0">
        <div className="flex flex-row justify-between items-center">
          {/* Левая часть - Легенда */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
              <span className="text-sm text-gray-700">Свободно</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-blue-300 border border-blue-400"></div>
              <span className="text-sm text-gray-700">Ожидает</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-300 border border-green-400"></div>
              <span className="text-sm text-gray-700">Активна</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-gray-300 border border-gray-400"></div>
              <span className="text-sm text-gray-700">Завершена</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-red-300 border border-red-400"></div>
              <span className="text-sm text-gray-700">Просрочена</span>
            </div>
          </div>

          {/* Правая часть - Статистика */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Активных аренд:</span>
            <span className="font-bold text-green-600">{rentals.filter(r => r.status === 'active').length}</span>
          </div>
        </div>
      </div>

      {/* Кастомный тултип */}
      {tooltip.visible && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Модальное окно редактирования аренды */}
      <RentalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRental(null);
        }}
        onSubmit={(data) => handleUpdateRental(data as Partial<CreateRentalDto & { status: string }>)}
        rental={editingRental}
        equipment={equipment}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default SchedulePage;