import React, { useState, useMemo, useEffect } from 'react';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { rentalsApi } from '../../api/admin/rentals';
import { equipmentApi } from '../../api/admin/equipment';
import { type Rental, type Equipment } from '../../types/index';
import { format, parseISO, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getStatusColor, getStatusText } from '../../utils/dateUtils';

interface EquipmentInstance {
  id: string;
  name: string;
  number: number;
  equipmentId: number;
}

const SchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });

  const weekStart = startOfWeek(selectedDate, { locale: ru });
  const weekEnd = endOfWeek(selectedDate, { locale: ru });

  const { data: equipment = [] } = useAuthenticatedQuery<Equipment[]>(['equipment', 'rental'], equipmentApi.getForRental);

  const { data: rentals = [] } = useAuthenticatedQuery<Rental[]>(
    ['rentals', 'gantt'],
    () => rentalsApi.getGanttData()
  );

  // Временное логирование для диагностики
  useEffect(() => {
    console.log('📈 Gantt data updated, count:', rentals.length);
    if (rentals.length > 0) {
      console.log('📈 Latest gantt rental:', rentals[0]);
    }
  }, [rentals]);

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

  const weekDays = generateWeekDays();
  const timeSlots = generateTimeSlots();

  const getRentalForInstanceAndTime = (instanceId: string, date: Date, hour: number) => {
    const [equipmentId, instanceNumber] = instanceId.split('-').map(Number);

    const checkTime = new Date(date);
    checkTime.setHours(hour, 0, 0, 0);

    // Находим ВСЕ аренды данного оборудования в это время
    const activeRentals = rentals.filter(rental => {
      const startDate = parseISO(rental.start_date);
      const endDate = parseISO(rental.end_date);

      return rental.equipment_id === equipmentId &&
             startDate <= checkTime &&
             endDate > checkTime;
    });

    // Если нет активных аренд, экземпляр свободен
    if (activeRentals.length === 0) return undefined;

    // Сортируем аренды по времени создания (или ID) для стабильного распределения
    const sortedRentals = [...activeRentals].sort((a, b) => a.id - b.id);

    // Возвращаем аренду для данного экземпляра (если экземпляр занят)
    // Первая аренда занимает #1, вторая - #2, и т.д.
    return sortedRentals[instanceNumber - 1];
  };

  // Функция для проверки пересечений аренд
  const getConflictingRentals = (instanceId: string, date: Date, hour: number) => {
    const [equipmentId, instanceNumber] = instanceId.split('-').map(Number);

    const checkTime = new Date(date);
    checkTime.setHours(hour, 0, 0, 0);
    const checkTimeEnd = new Date(checkTime);
    checkTimeEnd.setHours(hour + 1, 0, 0, 0);

    const activeRentals = rentals.filter(rental => {
      const startDate = parseISO(rental.start_date);
      const endDate = parseISO(rental.end_date);

      return rental.equipment_id === equipmentId &&
             startDate < checkTimeEnd &&
             endDate > checkTime;
    });

    // Конфликт только если аренд больше, чем доступно экземпляров
    const equipment = equipmentInstances.filter(inst => inst.equipmentId === equipmentId);
    const totalInstances = equipment.length;

    // Если аренд больше чем экземпляров - это конфликт
    if (activeRentals.length > totalInstances) {
      return activeRentals;
    }

    // Иначе конфликта нет
    return [];
  };

  // Проверка пересечений для всех аренд
  const conflictingRentals = useMemo(() => {
    const conflicts: Array<{rental: Rental, conflictsWith: Rental[]}> = [];

    rentals.forEach(rental => {
      const conflictsWith = rentals.filter(otherRental => {
        if (rental.id === otherRental.id) return false;

        const startDate1 = parseISO(rental.start_date);
        const endDate1 = parseISO(rental.end_date);
        const startDate2 = parseISO(otherRental.start_date);
        const endDate2 = parseISO(otherRental.end_date);

        return rental.equipment_id === otherRental.equipment_id &&
               startDate1 < endDate2 &&
               endDate1 > startDate2;
      });

      if (conflictsWith.length > 0) {
        conflicts.push({ rental, conflictsWith });
      }
    });

    return conflicts;
  }, [rentals]);

  const goToPreviousWeek = () => {
    setSelectedDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setSelectedDate(prevDate => addDays(prevDate, 7));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
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

  // Прокрутка к текущему времени при загрузке
  useEffect(() => {
    const contentScroll = document.getElementById('content-scroll');
    if (!contentScroll) return;

    // Небольшая задержка, чтобы контент успел отрендериться
    const timer = setTimeout(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();

      // Проверяем, находится ли текущая дата в видимой неделе
      const currentDate = new Date();
      const isCurrentWeekVisible = currentDate >= weekStart && currentDate <= weekEnd;

      if (isCurrentWeekVisible) {
        // Ширина одной ячейки (день + час) = 80px (можно настроить)
        const cellWidth = 80;
        // Позиция текущего часа: день * 24 часа + текущий час
        const dayOfWeek = (currentDay + 6) % 7; // Конвертируем воскресенье=0 в понедельник=0
        const scrollPosition = (dayOfWeek * 24 + currentHour) * cellWidth;

        // Прокручиваем так, чтобы текущий час был примерно по центру
        const containerWidth = contentScroll.clientWidth;
        contentScroll.scrollLeft = scrollPosition - containerWidth / 3;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [weekStart, weekEnd]); // Перезапускаем при смене недели

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

  return (
    <div className="space-y-4 w-full h-full flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">График аренд</h1>
          <div className="text-sm lg:text-lg font-medium text-gray-700 mt-2 sm:mt-0">
            {format(weekStart, 'dd MMMM', { locale: ru })} - {format(weekEnd, 'dd MMMM yyyy', { locale: ru })}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={goToPreviousWeek}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 lg:px-4 py-3 rounded-md text-sm lg:text-base min-h-[44px] touch-manipulation"
          >
            ← Предыдущая
          </button>
          <button
            onClick={goToToday}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 lg:px-4 py-3 rounded-md text-sm lg:text-base min-h-[44px] touch-manipulation"
          >
            Сегодня
          </button>
          <button
            onClick={goToNextWeek}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 lg:px-4 py-3 rounded-md text-sm lg:text-base min-h-[44px] touch-manipulation"
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
          <div style={{ width: `${150 + equipmentInstances.length * 80}px`, height: '1px' }}></div>
        </div>

        {/* Липкий заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div
            className="overflow-x-auto overflow-y-hidden"
            id="header-scroll"
          >
            <div style={{ minWidth: `${150 + equipmentInstances.length * 80}px`, width: 'max-content' }}>
              <div className="flex">
                <div className="w-32 lg:w-48 p-2 lg:p-3 bg-gray-50 font-medium text-gray-900 border-r border-gray-200 flex items-center text-xs lg:text-sm">
                  Время / Оборудование
                </div>
                {equipmentInstances.map((instance) => (
                  <div
                    key={instance.id}
                    className="w-20 lg:w-28 p-1 lg:p-2 text-center font-medium bg-gray-50 text-gray-900 border-r border-gray-200"
                  >
                    <div className="text-xs lg:text-sm font-semibold truncate" title={instance.name}>
                      {instance.name}
                    </div>
                    <div className="text-xs text-gray-500">
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
          <div style={{ minWidth: `${150 + equipmentInstances.length * 80}px`, width: 'max-content' }}>

            {/* Строки для каждого дня */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="border-b border-gray-100">
                {/* Заголовок дня */}
                <div className="flex bg-blue-50">
                  <div className="w-32 lg:w-48 p-1 lg:p-2 font-medium text-blue-900 border-r border-gray-200">
                    <div className="text-xs lg:text-sm">
                      {format(day, 'EEEE', { locale: ru })}
                    </div>
                    <div className="text-xs text-blue-600">
                      {format(day, 'dd.MM.yyyy', { locale: ru })}
                    </div>
                  </div>
                  {equipmentInstances.map((instance) => (
                    <div
                      key={`${instance.id}-${day.toISOString()}-header`}
                      className="w-20 lg:w-28 p-1 lg:p-2 bg-blue-50 border-r border-gray-200"
                    />
                  ))}
                </div>

                {/* Часы дня */}
                {timeSlots.map((hour) => (
                  <div key={`${day.toISOString()}-${hour}`} className="flex hover:bg-gray-50">
                    <div className="w-32 lg:w-48 p-1 lg:p-2 text-xs lg:text-sm text-gray-600 border-r border-gray-200 flex items-center">
                      {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
                    </div>
                    {equipmentInstances.map((instance) => {
                      const rental = getRentalForInstanceAndTime(instance.id, day, hour);
                      const conflictingRentalsForSlot = getConflictingRentals(instance.id, day, hour);
                      const hasConflicts = conflictingRentalsForSlot.length > 1;

                      return (
                        <div
                          key={`${instance.id}-${day.toISOString()}-${hour}`}
                          className="w-20 lg:w-28 h-6 lg:h-8 border-r border-gray-200 flex items-center justify-center"
                        >
                          {rental ? (
                            <div
                              className={`w-full h-5 lg:h-6 rounded text-xs px-1 flex items-center justify-center cursor-pointer transition-all hover:shadow-md ${
                                hasConflicts
                                  ? 'bg-red-500 text-white border-2 border-red-700 animate-pulse'
                                  : getStatusColor(rental.status)
                              }`}
                              onMouseEnter={(e) => showTooltip(e, rental, conflictingRentalsForSlot)}
                              onMouseLeave={hideTooltip}
                            >
                              {hasConflicts ? (
                                <span className="flex items-center">
                                  <span className="text-yellow-300 mr-1">⚠️</span>
                                  <span className="truncate text-xs">
                                    {conflictingRentalsForSlot.map(r => r.customer_name.split(' ')[0]).join(' / ')}
                                  </span>
                                </span>
                              ) : (
                                <span className="truncate text-xs">
                                  {rental.customer_name.split(' ')[0]}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-5 lg:h-6 bg-green-100 rounded flex items-center justify-center">
                              <span className="text-xs text-green-600">✓</span>
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

      {/* Легенда и статистика */}
      <div className="bg-white px-4 py-2 rounded-lg shadow flex-shrink-0">
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center space-y-2 xl:space-y-0">
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
    </div>
  );
};

export default SchedulePage;