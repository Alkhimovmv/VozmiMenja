import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { rentalsApi } from '../../api/admin/rentals';
import { equipmentApi } from '../../api/admin/equipment';
import { officesApi } from '../../api/admin/offices';
import type { Rental, CreateRentalDto, Equipment } from '../../types/index';
import { formatDate, getStatusText, getStatusColor } from '../../utils/dateUtils';
import RentalModal from '../../components/admin/RentalModal';
import CustomSelect from '../../components/admin/CustomSelect';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { subDays, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth, addDays, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';
import { useOffice } from '../../hooks/useOffice';

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

type DateFilter = 'week' | 'month' | 'all' | 'ends_today' | 'ends_tomorrow' | 'specific_date';

const PAGE_SIZE = 20;

const RentalsPage: React.FC = () => {
  const { currentOfficeId } = useOffice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; rentalId: number | null }>({
    isOpen: false,
    rentalId: null,
  });
  const queryClient = useQueryClient();

  const { data: rentals = [], isLoading } = useAuthenticatedQuery<Rental[]>(
    ['rentals', currentOfficeId],
    () => rentalsApi.getAll(currentOfficeId)
  );

  const { data: equipment = [] } = useAuthenticatedQuery<Equipment[]>(['equipment-rental', currentOfficeId], () => equipmentApi.getForRental(currentOfficeId));
  const { data: offices = [] } = useAuthenticatedQuery(['offices'], officesApi.getAll);

  // Фильтрация и сортировка аренд
  const filteredRentals = useMemo(() => {
    let filtered = [...rentals];

    // Фильтрация по дате
    if (dateFilter !== 'all') {
      const now = new Date();

      if (dateFilter === 'ends_today') {
        // Сегодня - начинается или заканчивается
        const today = startOfDay(now);
        filtered = filtered.filter(rental => {
          const rentalStart = new Date(rental.start_date);
          const rentalEnd = new Date(rental.end_date);
          return (isSameDay(rentalStart, today) || isSameDay(rentalEnd, today)) && rental.status !== 'completed';
        });
      } else if (dateFilter === 'ends_tomorrow') {
        // Завтра - начинается или заканчивается
        const tomorrow = addDays(startOfDay(now), 1);
        filtered = filtered.filter(rental => {
          const rentalStart = new Date(rental.start_date);
          const rentalEnd = new Date(rental.end_date);
          return (isSameDay(rentalStart, tomorrow) || isSameDay(rentalEnd, tomorrow)) && rental.status !== 'completed';
        });
      } else if (dateFilter === 'specific_date' && specificDate) {
        // Конкретная дата - аренда начинается или заканчивается в этот день
        const targetDate = new Date(specificDate);
        filtered = filtered.filter(rental => {
          const rentalStart = new Date(rental.start_date);
          const rentalEnd = new Date(rental.end_date);
          // Проверяем, начинается или заканчивается аренда в выбранную дату
          return isSameDay(rentalStart, targetDate) || isSameDay(rentalEnd, targetDate);
        });
      } else {
        let dateRange: { start: Date; end: Date };

        if (dateFilter === 'week') {
          // Последние 7 дней
          dateRange = {
            start: startOfDay(subDays(now, 6)),
            end: endOfDay(now)
          };
        } else if (dateFilter === 'month') {
          // Текущий месяц
          dateRange = {
            start: startOfMonth(now),
            end: endOfMonth(now)
          };
        } else {
          dateRange = { start: new Date(0), end: new Date() };
        }

        filtered = filtered.filter(rental => {
          const rentalStart = new Date(rental.start_date);
          const rentalEnd = new Date(rental.end_date);

          // Проверяем, пересекается ли аренда с выбранным периодом
          return isWithinInterval(rentalStart, dateRange) ||
                 isWithinInterval(rentalEnd, dateRange) ||
                 (rentalStart <= dateRange.start && rentalEnd >= dateRange.end);
        });
      }
    }

    // Фильтрация по оборудованию
    if (equipmentFilter !== 'all') {
      filtered = filtered.filter(rental => {
        // Проверяем в списке оборудования
        if (rental.equipment_list && rental.equipment_list.length > 0) {
          return rental.equipment_list.some(item => item.name === equipmentFilter);
        }
        // Проверяем старое поле equipment_name для обратной совместимости
        return rental.equipment_name === equipmentFilter;
      });
    }

    // Сортировка: завершенные последними
    filtered.sort((a, b) => {
      // Сначала сортируем по статусу (активные первыми)
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // Затем по дате начала (более новые первыми)
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    return filtered;
  }, [rentals, dateFilter, specificDate, equipmentFilter]);

  // Сбрасываем страницу при изменении фильтров
  React.useEffect(() => { setCurrentPage(1); }, [dateFilter, specificDate, equipmentFilter, currentOfficeId]);

  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / PAGE_SIZE));
  const pagedRentals = filteredRentals.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['rentals'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['lockers'], exact: false });
  };

  const createMutation = useMutation({
    mutationFn: rentalsApi.create,
    onSuccess: () => { invalidateAll(); setIsModalOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRentalDto & { status: string }> }) =>
      rentalsApi.update(id, data),
    onSuccess: () => { invalidateAll(); setIsModalOpen(false); setEditingRental(null); },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || error?.message || 'Неизвестная ошибка';
      const isBookingConflict = msg.includes('уже забронировано');
      toast.error(
        isBookingConflict ? `Нельзя сохранить аренду: ${msg}` : `Ошибка обновления: ${msg}`,
        { duration: isBookingConflict ? 8000 : 4000 }
      );
      console.error('updateMutation error:', error?.response?.status, error?.response?.data, error?.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rentalsApi.delete,
    onSuccess: () => { invalidateAll(); },
  });

  const handleCreateRental = (data: CreateRentalDto) => {
    createMutation.mutate({ ...data, office_id: currentOfficeId } as any);
  };

  const handleUpdateRental = (data: Partial<CreateRentalDto & { status: string }>) => {
    if (editingRental) {
      updateMutation.mutate({ id: editingRental.id, data });
    }
  };

  const handleStartRental = (rental: Rental) => {
    // Получаем текущую дату и время в формате ISO и берём первые 16 символов (без секунд)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    updateMutation.mutate({
      id: rental.id,
      data: {
        start_date: currentDateTime,
        status: 'active'
      },
    });
  };

  const handleCompleteRental = (rental: Rental) => {
    if (!rental.rental_price && rental.rental_price !== 0) {
      toast.error('Нельзя закрыть аренду без указания цены аренды');
      return;
    }
    updateMutation.mutate({ id: rental.id, data: { status: 'completed' } });
  };

  const handleCompleteRentalNow = (rental: Rental) => {
    if (!rental.rental_price && rental.rental_price !== 0) {
      toast.error('Нельзя закрыть аренду без указания цены аренды');
      return;
    }
    const now = new Date();
    const currentDateTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    updateMutation.mutate({ id: rental.id, data: { end_date: currentDateTime, status: 'completed' } });
  };

  const handleReturnRental = (rental: Rental) => {
    updateMutation.mutate({
      id: rental.id,
      data: {
        status: 'active'
      },
    });
  };

  const handleDeleteRental = (id: number) => {
    setDeleteConfirm({ isOpen: true, rentalId: id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.rentalId) {
      deleteMutation.mutate(deleteConfirm.rentalId);
    }
    setDeleteConfirm({ isOpen: false, rentalId: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, rentalId: null });
  };

  const handleEditRental = (rental: Rental) => {
    setEditingRental(rental);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Список аренд</h1>
            <div className="text-sm text-gray-600">
              Найдено: {filteredRentals.length} из {rentals.length}
              {filteredRentals.length > PAGE_SIZE && (
                <span className="ml-1 text-gray-400">· стр. {currentPage} из {totalPages}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium w-full sm:w-auto min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить аренду
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-gray-700">Период:</label>
            <div className="w-full sm:w-auto">
              <CustomSelect
                value={dateFilter}
                onChange={(value) => {
                  setDateFilter(value as DateFilter);
                  if (value !== 'specific_date') {
                    setSpecificDate('');
                  }
                }}
                options={[
                  { value: 'ends_today', label: 'Сегодня' },
                  { value: 'ends_tomorrow', label: 'Завтра' },
                  { value: 'week', label: 'Последние 7 дней' },
                  { value: 'month', label: 'Текущий месяц' },
                  { value: 'specific_date', label: 'Конкретная дата' },
                  { value: 'all', label: 'Все время' }
                ]}
                placeholder="Выберите период"
              />
            </div>
          </div>

          {dateFilter === 'specific_date' && (
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="text-sm font-medium text-gray-700">Дата:</label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-gray-700">Оборудование:</label>
            <div className="w-full sm:w-auto">
              <CustomSelect
                value={equipmentFilter}
                onChange={(value) => setEquipmentFilter(value)}
                options={[
                  { value: 'all', label: 'Все оборудование' },
                  ...equipment.map(eq => ({ value: eq.name, label: eq.name }))
                ]}
                placeholder="Выберите оборудование"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {pagedRentals.map((rental) => (
            <li key={rental.id} className="px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit ${getStatusColor(rental.status)}`}>
                      {getStatusText(rental.status)}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">
                      {rental.equipment_list && rental.equipment_list.length > 0 ? (
                        (() => {
                          // Группируем оборудование по названию
                          const equipmentByName = rental.equipment_list.reduce((acc, item) => {
                            if (!acc[item.name]) {
                              acc[item.name] = [];
                            }
                            acc[item.name].push(item);
                            return acc;
                          }, {} as Record<string, Array<{ id: number; name: string; instance_number: number }>>);

                          // Формируем строку с номерами для каждого типа
                          return Object.entries(equipmentByName)
                            .map(([name, items]) => {
                              // Находим оборудование в общем списке по имени
                              const equipmentInfo = equipment.find(e => e.name === name);
                              const totalQuantity = equipmentInfo?.quantity || 1;

                              // Показываем номера, если у оборудования несколько экземпляров (quantity > 1)
                              if (totalQuantity > 1) {
                                return items.map((item) => `${name} #${item.instance_number}`).join(', ');
                              } else {
                                // Если у оборудования только 1 экземпляр, показываем без номера
                                return name;
                              }
                            })
                            .join(', ');
                        })()
                      ) : (
                        rental.equipment_name
                      )}
                    </h3>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                      <span className="text-base font-semibold text-gray-900">👤 {rental.customer_name}</span>
                      <span className="text-sm text-gray-500">📞 {rental.customer_phone}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-500">
                      <span>🕐 {formatDate(rental.start_date)} - {formatDate(rental.end_date)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-500">
                      <span className="font-semibold text-base text-gray-900">💰 {rental.rental_price}₽</span>
                      {!!rental.needs_delivery && (
                        <span className="text-blue-600 font-medium">🚚 Доставка: {rental.delivery_price}₽</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {!!rental.needs_delivery && rental.delivery_address && <span>📍 {rental.delivery_address}</span>}
                      {rental.comment && <span className="block sm:inline sm:ml-4">💬 {rental.comment}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  {rental.status === 'pending' && (
                    <button
                      onClick={() => handleStartRental(rental)}
                      disabled={updateMutation.isPending}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                    >
                      {updateMutation.isPending ? <Spinner /> : null}
                      Начать аренду
                    </button>
                  )}
                  {(rental.status === 'active' || rental.status === 'overdue') && (
                    <>
                      <button
                        onClick={() => handleCompleteRentalNow(rental)}
                        disabled={updateMutation.isPending}
                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                      >
                        {updateMutation.isPending ? <Spinner /> : null}
                        Завершить сейчас
                      </button>
                      <button
                        onClick={() => handleCompleteRental(rental)}
                        disabled={updateMutation.isPending}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                      >
                        {updateMutation.isPending ? <Spinner /> : null}
                        Завершить
                      </button>
                    </>
                  )}
                  {rental.status === 'completed' && (
                    <button
                      onClick={() => handleReturnRental(rental)}
                      disabled={updateMutation.isPending}
                      className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                    >
                      {updateMutation.isPending ? <Spinner /> : null}
                      Вернуть
                    </button>
                  )}
                  <button
                    onClick={() => handleEditRental(rental)}
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDeleteRental(rental.id)}
                    disabled={deleteMutation.isPending}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending ? <Spinner /> : null}
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {filteredRentals.length === 0 && rentals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных об аренде</h3>
            <p className="text-gray-500">Создайте первую аренду для начала работы</p>
          </div>
        )}
        {filteredRentals.length === 0 && rentals.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет аренд за выбранный период</h3>
            <p className="text-gray-500">Попробуйте изменить период фильтрации</p>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredRentals.length)} из {filteredRentals.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Первая страница"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Предыдущая"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors ${
                        currentPage === p
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Следующая"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Последняя страница"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <RentalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRental(null);
        }}
        onSubmit={editingRental ?
          (data) => handleUpdateRental(data as Partial<CreateRentalDto & { status: string }>) :
          (data) => handleCreateRental(data as CreateRentalDto)
        }
        rental={editingRental}
        equipment={equipment}
        offices={offices}
        defaultOfficeId={currentOfficeId}
        isLoading={createMutation.isPending || updateMutation.isPending}
        errorMessage={
          (createMutation.error as any)?.response?.data?.error ||
          (updateMutation.error as any)?.response?.data?.error ||
          null
        }
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление аренды"
        message="Вы уверены, что хотите удалить эту аренду? Это действие нельзя будет отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

    </div>
  );
};

export default RentalsPage;
