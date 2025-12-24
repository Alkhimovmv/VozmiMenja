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

  const getLockerColor = (locker?: Locker): string => {
    if (!locker) return 'bg-gray-200 border-gray-300';
    if (!locker.is_active) return 'bg-gray-400 border-gray-500';
    // Зеленый если есть предметы, светло-серый если пусто
    const hasItems = locker.items && locker.items.length > 0;
    return hasItems
      ? 'bg-green-100 border-green-500 hover:bg-green-200 cursor-pointer'
      : 'bg-gray-100 border-gray-300 hover:bg-gray-200 cursor-pointer';
  };

  const getLockerDimensions = (size: 'large' | 'medium' | 'small', rowCount: number) => {
    if (size === 'large') {
      return { width: '48%', height: '140px' }; // 2 ячейки в ряду
    } else if (size === 'medium') {
      return { width: '32%', height: '120px' }; // 3 ячейки в ряду
    } else {
      return { width: '15.5%', height: '100px' }; // 6 ячеек в ряду
    }
  };

  return (
    <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-2xl">
      <h3 className="text-white text-center mb-3 sm:mb-4 font-bold text-base sm:text-lg">Постомат</h3>

      <div className="bg-gray-700 p-2 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
        {LOCKER_LAYOUT.map((layout, layoutIndex) => {
          const dimensions = getLockerDimensions(layout.size, layout.count);

          return (
            <div key={layoutIndex} className="flex justify-between gap-2">
              {Array.from({ length: layout.count }, (_, index) => {
                const position = index + 1;
                const locker = getLockerByPosition(layout.row, position);
                const colorClass = getLockerColor(locker);

                return (
                  <div
                    key={position}
                    onClick={() => locker && onLockerClick?.(locker)}
                    style={{ width: dimensions.width, height: dimensions.height }}
                    className={`${colorClass} border-2 rounded flex flex-col items-center justify-center transition-all duration-200 relative p-2 overflow-hidden`}
                  >
                    {locker ? (
                      <>
                        <div className="font-bold text-2xl sm:text-3xl text-gray-800">
                          {locker.locker_number}
                        </div>
                        <div className="font-mono text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                          {locker.access_code}
                        </div>
                        {locker.items && locker.items.length > 0 && (
                          <div className="mt-1 text-xs sm:text-sm text-gray-600 text-center max-w-full overflow-hidden">
                            {locker.items.map((item, idx) => (
                              <div key={idx} className="truncate">{item}</div>
                            ))}
                          </div>
                        )}
                        {!locker.is_active && (
                          <div className="absolute top-1 right-1">
                            <span className="text-red-600 text-xs">●</span>
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
          <span>Занята</span>
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
