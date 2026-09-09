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
import { subDays, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth, addDays, isSameDay, isBefore } from 'date-fns';
import toast from 'react-hot-toast';
import { useOffice } from '../../hooks/useOffice';
import { getApiErrorMessage } from '../../lib/apiError';

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

type DateFilter = 'week' | 'month' | 'all' | 'ends_today' | 'ends_tomorrow' | 'specific_date';
type AttentionTone = 'red' | 'amber' | 'blue' | 'emerald';
type AttentionReason = { label: string; tone: AttentionTone };
type TodayActionItem = {
  rental: Rental;
  label: string;
  tone: AttentionTone;
  reasons: AttentionReason[];
};

const PAGE_SIZE = 20;
const CLOSED_RENTAL_STATUSES = new Set(['completed', 'cancelled']);

const attentionToneClasses: Record<AttentionTone, string> = {
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
};

const formatRentalEquipmentNames = (rental: Rental, equipment: Equipment[]) => {
  if (!rental.equipment_list || rental.equipment_list.length === 0) {
    return rental.equipment_name;
  }

  const equipmentByName = rental.equipment_list.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = [];
    }
    acc[item.name].push(item);
    return acc;
  }, {} as Record<string, Array<{ id: number; name: string; instance_number: number }>>);

  return Object.entries(equipmentByName)
    .map(([name, items]) => {
      const equipmentInfo = equipment.find((item) => item.name === name);
      const totalQuantity = equipmentInfo?.quantity || 1;

      if (totalQuantity > 1) {
        return items.map((item) => `${name} #${item.instance_number}`).join(', ');
      }

      return name;
    })
    .join(', ');
};

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

  const todayOperations = useMemo(() => {
    const today = startOfDay(new Date());
    const issue = rentals.filter((rental) => isSameDay(new Date(rental.start_date), today) && rental.status === 'pending');
    const returns = rentals.filter((rental) => isSameDay(new Date(rental.end_date), today) && (rental.status === 'active' || rental.status === 'overdue'));
    const overdue = rentals.filter((rental) => {
      const endDate = startOfDay(new Date(rental.end_date));
      return isBefore(endDate, today) && rental.status !== 'completed' && rental.status !== 'cancelled';
    });
    const dataIssues = rentals
      .map((rental) => {
        const reasons: AttentionReason[] = [];
        const startDate = startOfDay(new Date(rental.start_date));
        const endDate = startOfDay(new Date(rental.end_date));
        const isClosed = CLOSED_RENTAL_STATUSES.has(rental.status);
        const isRelevantToday = isSameDay(startDate, today) || isSameDay(endDate, today) || isBefore(endDate, today);

        if (isClosed || !isRelevantToday) {
          return null;
        }

        if (!rental.rental_price && rental.rental_price !== 0) {
          reasons.push({ label: 'Нет цены аренды', tone: 'amber' });
        }

        if (rental.needs_delivery && !rental.delivery_address?.trim()) {
          reasons.push({ label: 'Нет адреса доставки', tone: 'amber' });
        }

        if (reasons.length === 0) {
          return null;
        }

        return { rental, reasons };
      })
      .filter((item): item is { rental: Rental; reasons: AttentionReason[] } => item !== null);

    return {
      issue,
      returns,
      overdue,
      dataIssues,
    };
  }, [rentals]);

  const todayOperationsTotal = todayOperations.issue.length + todayOperations.returns.length + todayOperations.overdue.length + todayOperations.dataIssues.length;
  const todayDataIssuesByRentalId = useMemo(() => new Map(todayOperations.dataIssues.map((item) => [item.rental.id, item.reasons])), [todayOperations.dataIssues]);
  const todayActionItems = useMemo<TodayActionItem[]>(() => {
    const usedRentalIds = new Set<number>();
    const items: TodayActionItem[] = [];

    const addItem = (rental: Rental, label: string, tone: AttentionTone) => {
      if (usedRentalIds.has(rental.id)) {
        return;
      }

      usedRentalIds.add(rental.id);
      items.push({
        rental,
        label,
        tone,
        reasons: todayDataIssuesByRentalId.get(rental.id) ?? [],
      });
    };

    todayOperations.overdue.forEach((rental) => addItem(rental, 'Просрочено', 'red'));
    todayOperations.returns.forEach((rental) => addItem(rental, 'Принять', 'emerald'));
    todayOperations.issue.forEach((rental) => addItem(rental, 'Выдать', 'blue'));
    todayOperations.dataIssues.forEach((item) => addItem(item.rental, 'Проверить', 'amber'));

    return items;
  }, [todayDataIssuesByRentalId, todayOperations]);

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
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Неизвестная ошибка');
      const isBookingConflict = msg.includes('уже забронировано');
      toast.error(
        isBookingConflict ? `Нельзя сохранить аренду: ${msg}` : `Ошибка обновления: ${msg}`,
        { duration: isBookingConflict ? 8000 : 4000 }
      );
      console.error('updateMutation error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rentalsApi.delete,
    onSuccess: () => { invalidateAll(); },
  });

  const handleCreateRental = (data: CreateRentalDto) => {
    createMutation.mutate({ ...data, office_id: currentOfficeId });
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

  const handleOpenNewRental = () => {
    setEditingRental(null);
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
            onClick={handleOpenNewRental}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium w-full sm:w-auto min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить аренду
          </button>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-1 text-base font-bold text-gray-900">Сегодня</h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">выдать {todayOperations.issue.length}</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">принять {todayOperations.returns.length}</span>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">просрочено {todayOperations.overdue.length}</span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">проверить {todayOperations.dataIssues.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setDateFilter('ends_today')}
              className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              Показать сегодня в списке
            </button>
          </div>

          {todayOperationsTotal === 0 ? (
            <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              На сегодня нет выдач, возвратов и просрочек.
            </div>
          ) : (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
              {todayActionItems.slice(0, 6).map(({ rental, label, tone, reasons }) => (
                <div key={`today-action-${rental.id}`} className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${attentionToneClasses[tone]}`}>
                      {label}
                    </span>
                    <span className="truncate text-sm font-bold text-gray-900">{formatRentalEquipmentNames(rental, equipment)}</span>
                    <span className="text-xs text-gray-500">{rental.customer_name}</span>
                    <span className="text-xs text-gray-500">{rental.customer_phone}</span>
                    <span className="text-xs text-gray-400">{formatDate(rental.start_date)} — {formatDate(rental.end_date)}</span>
                    {reasons.map((reason) => (
                      <span key={`${rental.id}-${reason.label}`} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${attentionToneClasses[reason.tone]}`}>
                        {reason.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {rental.status === 'pending' && (
                      <button
                        onClick={() => handleStartRental(rental)}
                        disabled={updateMutation.isPending}
                        className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        Выдать
                      </button>
                    )}
                    {(rental.status === 'active' || rental.status === 'overdue') && (
                      <button
                        onClick={() => handleCompleteRentalNow(rental)}
                        disabled={updateMutation.isPending}
                        className="rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        Принять
                      </button>
                    )}
                    <button
                      onClick={() => handleEditRental(rental)}
                      disabled={updateMutation.isPending}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Открыть
                    </button>
                  </div>
                </div>
              ))}
              {todayActionItems.length > 6 && (
                <p className="bg-white px-3 py-2 text-xs text-gray-500">Еще {todayActionItems.length - 6} в полном списке.</p>
              )}
            </div>
          )}
        </section>

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
                      {formatRentalEquipmentNames(rental, equipment)}
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
          getApiErrorMessage(createMutation.error, '') ||
          getApiErrorMessage(updateMutation.error, '') ||
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
