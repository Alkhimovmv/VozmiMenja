import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { analyticsApi } from '../../api/admin/analytics';
import { expensesApi } from '../../api/admin/expenses';
import { type CreateExpenseDto, type Expense, type MonthlyRevenue, type FinancialSummary } from '../../types/index';
import { formatDateShort } from '../../utils/dateUtils';
import ExpenseModal from '../../components/admin/ExpenseModal';
import CustomSelect from '../../components/admin/CustomSelect';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const FinancesPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; expenseId: number | null; expenseName: string }>({
    isOpen: false,
    expenseId: null,
    expenseName: '',
  });
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [filterYear, filterMonth] = selectedMonth
    ? selectedMonth.split('-').map(Number)
    : [currentYear, currentMonth];

  const { data: monthlyRevenue = [] } = useAuthenticatedQuery<MonthlyRevenue[]>(
    ['analytics', 'monthly-revenue'],
    analyticsApi.getMonthlyRevenue,
    {
      // Принудительная перезагрузка при каждом монтировании
      staleTime: 0,
      cacheTime: 0,
    }
  );

  // Временная отладка
  React.useEffect(() => {
    console.log('📊 Monthly Revenue Data:', monthlyRevenue);
    console.log('📊 First item:', monthlyRevenue[0]);
    console.log('📊 Has net_profit?', monthlyRevenue[0]?.net_profit !== undefined);
  }, [monthlyRevenue]);

  const { data: financialSummary } = useAuthenticatedQuery<FinancialSummary>(
    ['analytics', 'financial-summary', filterYear, filterMonth],
    () => analyticsApi.getFinancialSummary(filterYear, filterMonth),
    {
      enabled: !!filterYear && !!filterMonth,
    }
  );

  const { data: expenses = [] } = useAuthenticatedQuery<Expense[]>(
    ['expenses'],
    expensesApi.getAll
  );

  const createExpenseMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsExpenseModalOpen(false);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateExpenseDto> }) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleCreateExpense = (data: CreateExpenseDto) => {
    createExpenseMutation.mutate(data);
  };

  const handleUpdateExpense = (data: Partial<CreateExpenseDto>) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    setDeleteConfirm({
      isOpen: true,
      expenseId: expense.id,
      expenseName: expense.description || 'Расход',
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.expenseId) {
      deleteExpenseMutation.mutate(deleteConfirm.expenseId);
      setDeleteConfirm({ isOpen: false, expenseId: null, expenseName: '' });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  // Генерируем опции месяцев на основе реальных данных
  const monthOptions = (() => {
    const monthsSet = new Set<string>();

    // Добавляем месяцы из доходов
    monthlyRevenue.forEach((item) => {
      const value = `${item.year}-${item.month.toString().padStart(2, '0')}`;
      monthsSet.add(value);
    });

    // Добавляем месяцы из расходов
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const value = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
      monthsSet.add(value);
    });

    // Всегда добавляем текущий месяц
    const currentMonthValue = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    monthsSet.add(currentMonthValue);

    // Конвертируем в массив и сортируем
    const sortedMonths = Array.from(monthsSet).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      // Сортируем по убыванию (сначала новые)
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });

    // Формируем опции с читаемыми названиями
    return sortedMonths
      .filter(value => {
        const [year, month] = value.split('-').map(Number);
        // Показываем только текущий и прошлые месяцы
        if (year > currentYear) return false;
        if (year === currentYear && month > currentMonth) return false;
        return true;
      })
      .map((value) => {
        const [year, month] = value.split('-').map(Number);
        const label = new Date(year, month - 1).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
        });
        return { value, label };
      });
  })();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Финансовые итоги</h1>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-auto">
            <CustomSelect
              value={selectedMonth || `${currentYear}-${currentMonth.toString().padStart(2, '0')}`}
              onChange={(value) => setSelectedMonth(value)}
              options={monthOptions}
              placeholder="Выберите месяц"
            />
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md font-medium w-full sm:w-auto min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить расход
          </button>
        </div>
      </div>

      {/* Финансовая сводка за выбранный месяц */}
      {financialSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {financialSummary.total_revenue.toLocaleString()}₽
            </div>
            <div className="text-sm text-green-600">Общий доход</div>
            <div className="text-xs text-gray-500 mt-1">
              Аренда: {financialSummary.rental_revenue.toLocaleString()}₽<br className="sm:hidden" />
              <span className="hidden sm:inline"> + </span>Доставка: {financialSummary.delivery_revenue.toLocaleString()}₽
            </div>
          </div>

          <div className="bg-red-50 p-4 sm:p-6 rounded-lg border border-red-200">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {financialSummary.total_costs.toLocaleString()}₽
            </div>
            <div className="text-sm text-red-600">Общие расходы</div>
            <div className="text-xs text-gray-500 mt-1">
              Доставка: {financialSummary.delivery_costs.toLocaleString()}₽<br className="sm:hidden" />
              <span className="hidden sm:inline"> + </span>Операционные: {financialSummary.operational_expenses.toLocaleString()}₽
            </div>
          </div>

          <div className={`p-4 sm:p-6 rounded-lg border ${
            financialSummary.net_profit >= 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className={`text-xl sm:text-2xl font-bold ${
              financialSummary.net_profit >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {financialSummary.net_profit.toLocaleString()}₽
            </div>
            <div className={`text-sm ${
              financialSummary.net_profit >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              Чистая прибыль
            </div>
          </div>

          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-gray-600">
              {financialSummary?.total_rentals || 0}
            </div>
            <div className="text-sm text-gray-600">Количество аренд</div>
          </div>
        </div>
      )}

      {/* Помесячная динамика */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Помесячная динамика</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {monthlyRevenue.slice(0, 6).map((item) => (
              <div key={`${item.year}-${item.month}`} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.month_name} {item.year}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.rental_count || 0} аренд
                  </div>
                </div>
                <div className={`text-sm font-medium ${item.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(item.net_profit || 0).toLocaleString()}₽
                </div>
              </div>
            ))}
          </div>
          {monthlyRevenue.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Нет данных о доходах
            </div>
          )}
        </div>
      </div>

      {/* Список расходов */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Последние расходы</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {expenses.slice(0, 10).map((expense) => (
            <div key={expense.id} className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {expense.description}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {formatDateShort(expense.date)}
                    {expense.category && ` • ${expense.category}`}
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end space-x-3 sm:space-x-0 sm:space-y-2">
                  <div className="text-sm font-medium text-red-600 whitespace-nowrap">
                    {expense.amount !== null ? `-${expense.amount.toLocaleString()}₽` : 'Не указана'}
                  </div>
                  <div className="flex space-x-2 sm:space-x-3">
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap min-h-[44px] px-2 py-2 touch-manipulation"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense)}
                      className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium whitespace-nowrap min-h-[44px] px-2 py-2 touch-manipulation"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {expenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет записей о расходах
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
        expense={editingExpense}
        isLoading={createExpenseMutation.isPending || updateExpenseMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удалить расход?"
        message={`Вы действительно хотите удалить расход "${deleteConfirm.expenseName}"? Это действие нельзя будет отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, expenseId: null, expenseName: '' })}
        isLoading={deleteExpenseMutation.isPending}
      />
    </div>
  );
};

export default FinancesPage;