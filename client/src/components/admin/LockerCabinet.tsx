import React from 'react';
import { Locker } from '../../types/admin';

interface LockerCabinetProps {
  lockers: Locker[];
  onLockerClick?: (locker: Locker) => void;
}

// Структура постомата: 13 ячеек (нумерация слева направо, сверху вниз)
// Ряд 4 (сверху): 6 маленьких ячеек (1, 2, 3, 4, 5, 6)
// Ряд 3: 3 средние ячейки (7, 8, 9)
// Ряд 2: 2 большие ячейки (10, 11)
// Ряд 1 (снизу): 2 большие ячейки (12, 13)

const LOCKER_LAYOUT = [
  { row: 4, count: 6, size: 'small' as const },
  { row: 3, count: 3, size: 'medium' as const },
  { row: 2, count: 2, size: 'large' as const },
  { row: 1, count: 2, size: 'large' as const },
];

const LockerCabinet: React.FC<LockerCabinetProps> = ({ lockers, onLockerClick }) => {
  // Создаем карту ячеек по позициям
  const lockerMap = new Map<string, Locker>();
  lockers.forEach(locker => {
    const key = `${locker.row_number}-${locker.position_in_row}`;
    lockerMap.set(key, locker);
  });

  const getLockerByPosition = (row: number, position: number): Locker | undefined => {
    return lockerMap.get(`${row}-${position}`);
  };

  // Определяем статус ячейки
  const getLockerStatus = (locker?: Locker): 'empty' | 'free' | 'partial' | 'occupied' | 'inactive' => {
    if (!locker) return 'empty';
    if (!locker.is_active) return 'inactive';
    if (!locker.equipment_items || locker.equipment_items.length === 0) return 'empty';
    if (locker.free_equipment === 0) return 'occupied';
    if (locker.free_equipment < locker.total_equipment) return 'partial';
    return 'free';
  };

  const getLockerColor = (locker?: Locker): string => {
    const status = getLockerStatus(locker);
    switch (status) {
      case 'occupied': return 'bg-red-100 border-red-500 hover:bg-red-200 cursor-pointer';
      case 'partial':  return 'bg-yellow-100 border-yellow-500 hover:bg-yellow-200 cursor-pointer';
      case 'free':     return 'bg-green-100 border-green-500 hover:bg-green-200 cursor-pointer';
      case 'inactive': return 'bg-gray-400 border-gray-500';
      default:         return 'bg-gray-100 border-gray-300 hover:bg-gray-200 cursor-pointer';
    }
  };

  const getLockerDimensions = (size: 'large' | 'medium' | 'small') => {
    if (size === 'large') {
      return { width: '48%', height: '140px' };
    } else if (size === 'medium') {
      return { width: '32%', height: '120px' };
    } else {
      return { width: '15.5%', height: '200px' };
    }
  };

  return (
    <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-2xl">
      <h3 className="text-white text-center mb-3 sm:mb-4 font-bold text-base sm:text-lg">Постомат</h3>

      <div className="bg-gray-700 p-2 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
        {LOCKER_LAYOUT.map((layout, layoutIndex) => {
          const dimensions = getLockerDimensions(layout.size);

          return (
            <div key={layoutIndex} className="flex justify-between gap-2">
              {Array.from({ length: layout.count }, (_, index) => {
                const position = index + 1;
                const locker = getLockerByPosition(layout.row, position);
                const colorClass = getLockerColor(locker);
                const status = getLockerStatus(locker);

                return (
                  <div
                    key={position}
                    onClick={() => locker && onLockerClick?.(locker)}
                    style={{ width: dimensions.width, height: dimensions.height }}
                    className={`${colorClass} border-2 rounded flex flex-col items-center justify-center transition-all duration-200 relative p-1 sm:p-2 overflow-hidden`}
                  >
                    {locker ? (
                      <>
                        <div className="font-bold text-base sm:text-2xl md:text-3xl text-gray-800">
                          {locker.locker_number}
                        </div>
                        <div className="font-mono text-sm sm:text-xl md:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                          {locker.access_code}
                        </div>

                        {/* Содержимое ячейки */}
                        {(locker.equipment_items?.length > 0 || locker.items?.length > 0) && (
                          <div className={`mt-1 text-center max-w-full ${
                            layout.size === 'small' ? 'text-[8px] sm:text-[9px]' :
                            layout.size === 'medium' ? 'text-[9px] sm:text-[10px]' :
                            'text-[10px] sm:text-xs'
                          }`}>
                            {locker.equipment_items?.length > 0 && (
                              <>
                                <div className="max-w-full px-0.5">
                                  {locker.equipment_items.map(e => {
                                    const sameEquip = locker.equipment_items.filter(x => x.equipment_id === e.equipment_id);
                                    const name = sameEquip.length > 1 ? `${e.equipment_name} #${e.instance_number}` : e.equipment_name;
                                    return (
                                      <div key={e.id} className="leading-tight truncate">
                                        <span className="text-gray-700">{name}</span>
                                        {!e.is_free && e.customer_last_name && (
                                          <span className="text-red-600 font-medium"> ({e.customer_last_name})</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                <span className={`font-bold ${
                                  locker.free_equipment === 0 ? 'text-red-600' :
                                  locker.free_equipment < locker.total_equipment ? 'text-yellow-700' :
                                  'text-green-700'
                                }`}>
                                  {locker.free_equipment}/{locker.total_equipment} св.
                                </span>
                              </>
                            )}
                            {locker.items?.length > 0 && (
                              <span className="text-gray-500 truncate block max-w-full px-0.5 leading-tight">
                                {locker.items.join(', ')}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Иконка статуса */}
                        {status === 'inactive' && (
                          <div className="absolute top-1 right-1">
                            <span className="text-red-600 text-xs">●</span>
                          </div>
                        )}
                        {status === 'occupied' && (
                          <div className="absolute top-1 right-1">
                            <span className="text-red-600 text-xs font-bold">🔒</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 text-sm">Пусто</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
          <span>Всё свободно</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
          <span>Частично занята</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
          <span>Всё в аренде</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Пустая</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
          <span>Неактивна</span>
        </div>
      </div>
    </div>
  );
};

export default LockerCabinet;
