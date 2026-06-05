import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { customersApi } from '../../api/admin/customers';
import { formatDate } from '../../utils/dateUtils';
import type { Customer, CustomerTag, Rental } from '../../types/admin';
import { useOffice } from '../../hooks/useOffice';

const TAG_CONFIG: Record<NonNullable<CustomerTag>, { label: string; color: string; icon: string }> = {
  regular: { label: 'Постоянный', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '👤' },
  problem: { label: 'Проблемный', color: 'bg-red-100 text-red-800 border-red-200',    icon: '⚠️' },
};

function TagBadge({ tag }: { tag: CustomerTag }) {
  if (!tag) return null;
  const cfg = TAG_CONFIG[tag];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function AutoTag({ count }: { count: number }) {
  if (count >= 3) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">👤 Постоянный</span>;
  return null;
}

function rentalCountLabel(n: number) {
  if (n === 1) return '1 аренда';
  if (n >= 2 && n <= 4) return `${n} аренды`;
  return `${n} аренд`;
}

// Карточка отдельного клиента
const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(customer.note || '');
  const [selectedTag, setSelectedTag] = useState<CustomerTag>(customer.tag);
  const queryClient = useQueryClient();

  const { data: rentals = [], isLoading: rentalsLoading } = useQuery<Rental[]>({
    queryKey: ['customer-rentals', customer.customer_phone],
    queryFn: () => customersApi.getCustomerRentals(customer.customer_phone),
    enabled: expanded,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: () => customersApi.saveNote(customer.customer_phone, selectedTag, noteText || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingNote(false);
    },
  });

  const handleExpand = () => setExpanded(v => !v);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteText(customer.note || '');
    setSelectedTag(customer.tag);
    setEditingNote(true);
    setExpanded(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const handleCancel = () => {
    setNoteText(customer.note || '');
    setSelectedTag(customer.tag);
    setEditingNote(false);
  };

  const hasNote = customer.tag || customer.note;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow">
      {/* Заголовок карточки */}
      <div
        className="flex items-start gap-3 px-3 py-3 sm:px-4 cursor-pointer select-none"
        onClick={handleExpand}
      >
        <div className="flex-1 min-w-0">
          {/* Имя + тег */}
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm font-medium text-gray-900">{customer.customer_name}</h3>
            {customer.tag ? (
              <TagBadge tag={customer.tag} />
            ) : (
              <AutoTag count={customer.rental_count} />
            )}
          </div>
          {/* Телефон и кол-во аренд — на мобиле в столбик */}
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-0.5 text-xs text-gray-500">
            <span>📞 {customer.customer_phone}</span>
            <span>📋 {rentalCountLabel(customer.rental_count)}</span>
          </div>
          {customer.note && (
            <p className="mt-1 text-xs text-gray-400 line-clamp-1">💬 {customer.note}</p>
          )}
        </div>
        {/* Кнопка заметки + стрелка */}
        <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
          <button
            onClick={handleEditStart}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1.5 rounded hover:bg-indigo-50 transition-colors min-h-[36px] touch-manipulation"
          >
            {hasNote ? 'Изменить' : '+ Заметка'}
          </button>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Раскрытая панель */}
      {expanded && (
        <div className="border-t border-gray-100 px-3 sm:px-4 py-3 bg-gray-50 space-y-3">

          {/* Редактор заметки */}
          {editingNote ? (
            <form onSubmit={handleSave} className="bg-white border border-indigo-100 rounded-lg p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Метка</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(TAG_CONFIG) as [NonNullable<CustomerTag>, typeof TAG_CONFIG[keyof typeof TAG_CONFIG]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === key ? null : key)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium border transition-all touch-manipulation ${
                        selectedTag === key
                          ? cfg.color + ' ring-2 ring-offset-1 ring-indigo-400'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Заметка</label>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Любые заметки о клиенте..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 touch-manipulation"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 touch-manipulation"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : hasNote ? (
            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Заметка</span>
                <button onClick={handleEditStart} className="text-xs text-indigo-500 hover:text-indigo-700 py-1 touch-manipulation">редактировать</button>
              </div>
              {customer.tag && <div><TagBadge tag={customer.tag} /></div>}
              {customer.note && <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.note}</p>}
            </div>
          ) : null}

          {/* История аренд */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">История аренд</h4>
            {rentalsLoading ? (
              <div className="text-xs text-gray-400 py-2">Загрузка...</div>
            ) : rentals.length === 0 ? (
              <div className="text-xs text-gray-400 py-2">Нет аренд</div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {rentals.map(rental => (
                  <div key={rental.id} className="bg-white border border-gray-100 rounded-md px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                        rental.status === 'active' ? 'bg-green-500' :
                        rental.status === 'overdue' ? 'bg-red-500' :
                        rental.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-300'
                      }`} />
                      <span className="flex-1 text-gray-700 min-w-0">
                        {rental.equipment_list?.map(e => e.name).join(', ') || rental.equipment_name || '—'}
                      </span>
                      {rental.rental_price != null && (
                        <span className="text-gray-600 font-medium flex-shrink-0">{rental.rental_price} ₽</span>
                      )}
                    </div>
                    <div className="mt-1 pl-4 text-gray-400">
                      {formatDate(rental.start_date)} — {formatDate(rental.end_date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type TagFilter = 'all' | 'regular' | 'problem';

const CustomersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<TagFilter>('all');
  const { currentOfficeId } = useOffice();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debounce поиска 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const params = useMemo(() => ({
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(tagFilter !== 'all' ? { tag: tagFilter as string } : {}),
  }), [debouncedSearch, tagFilter]);

  const hasFilter = !!debouncedSearch.trim() || tagFilter !== 'all';

  // Запрос с фильтрами
  const { data: customers = [], isLoading } = useAuthenticatedQuery<Customer[]>(
    ['customers', debouncedSearch, tagFilter],
    () => customersApi.getAll(params),
    { placeholderData: undefined }
  );

  // Счётчики для кнопок — всегда без фильтра
  const { data: allCustomers = [] } = useAuthenticatedQuery<Customer[]>(
    ['customers-all'],
    () => customersApi.getAll(),
    { staleTime: 30_000 }
  );

  const counts = useMemo(() => ({
    all: allCustomers.length,
    regular: allCustomers.filter(c => c.tag === 'regular' || (!c.tag && c.rental_count >= 3)).length,
    problem: allCustomers.filter(c => c.tag === 'problem').length,
  }), [allCustomers]);

  const handleFilterClick = (key: TagFilter) => {
    setTagFilter(prev => prev === key ? 'all' : key);
    scrollRef.current?.scrollTo(0, 0);
  };

  return (
    <div ref={scrollRef} className="space-y-4 overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Арендаторы</h1>

        {/* Поиск */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); scrollRef.current?.scrollTo(0, 0); }}
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Поиск по имени или телефону..."
          />
        </div>

        {/* Фильтр по тегам */}
        <div className="flex flex-wrap gap-2">
          {([
            ['all',     'Все',           counts.all,     'bg-gray-100 text-gray-700 border-gray-200'],
            ['regular', '👤 Постоянные', counts.regular, 'bg-blue-100 text-blue-800 border-blue-200'],
            ['problem', '⚠️ Проблемные', counts.problem, 'bg-red-100 text-red-800 border-red-200'],
          ] as [TagFilter, string, number, string][]).map(([key, label, count, cls]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleFilterClick(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                tagFilter === key
                  ? cls + ' ring-2 ring-offset-1 ring-indigo-400'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {label}
              <span className="font-semibold">{count}</span>
            </button>
          ))}
          <span className="self-center text-xs text-gray-400 ml-auto">
            {hasFilter ? `Найдено: ${customers.length} из ${counts.all}` : `Всего: ${counts.all}`}
          </span>
        </div>
      </div>

      {/* Список */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : customers.length === 0 && !hasFilter ? (
          <div className="text-center py-16">
            <div className="text-gray-300 text-5xl mb-3">👥</div>
            <h3 className="text-base font-medium text-gray-700 mb-1">Нет арендаторов</h3>
            <p className="text-sm text-gray-400">Арендаторы появятся после создания первых аренд</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-300 text-5xl mb-3">🔍</div>
            <h3 className="text-base font-medium text-gray-700 mb-1">Ничего не найдено</h3>
            <p className="text-sm text-gray-400">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          customers.map(customer => (
            <CustomerCard key={customer.customer_phone} customer={customer} />
          ))
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
