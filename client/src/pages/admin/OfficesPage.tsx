import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { officesApi, type Office, type CreateOfficeDto, type LockerRow } from '../../api/admin/offices';
import toast from 'react-hot-toast';

const DEFAULT_LOCKER_ROWS: LockerRow[] = [
  { row: 4, count: 6, size: 'small' },
  { row: 3, count: 3, size: 'medium' },
  { row: 2, count: 2, size: 'large' },
  { row: 1, count: 2, size: 'large' },
];

const SIZE_LABELS: Record<string, string> = {
  small: 'Маленькая',
  medium: 'Средняя',
  large: 'Большая',
};

interface OfficeFormState {
  name: string;
  address: string;
  locker_rows: LockerRow[];
}

const emptyForm = (): OfficeFormState => ({
  name: '',
  address: '',
  locker_rows: DEFAULT_LOCKER_ROWS.map(r => ({ ...r })),
});

const OfficesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [form, setForm] = useState<OfficeFormState>(emptyForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: offices = [] } = useAuthenticatedQuery<Office[]>(['offices'], officesApi.getAll);

  const createMutation = useMutation({
    mutationFn: officesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      closeModal();
      toast.success('Офис создан');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Ошибка создания'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateOfficeDto> }) => officesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      closeModal();
      toast.success('Офис обновлён');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Ошибка обновления'),
  });

  const deleteMutation = useMutation({
    mutationFn: officesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      setDeleteConfirmId(null);
      toast.success('Офис удалён');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Ошибка удаления'),
  });

  const openCreate = () => {
    setEditingOffice(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const openEdit = (office: Office) => {
    setEditingOffice(office);
    setForm({
      name: office.name,
      address: office.address || '',
      locker_rows: office.locker_rows && office.locker_rows.length > 0
        ? office.locker_rows.map(r => ({ ...r }))
        : DEFAULT_LOCKER_ROWS.map(r => ({ ...r })),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Введите название офиса');
      return;
    }
    const data: CreateOfficeDto = {
      name: form.name.trim(),
      address: form.address.trim(),
      locker_rows: form.locker_rows.map(r => ({ ...r, count: Math.max(1, Number(r.count) || 1) })),
    };
    if (editingOffice) {
      updateMutation.mutate({ id: editingOffice.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Управление рядами постомата
  const addRow = () => {
    const maxRow = form.locker_rows.length > 0 ? Math.max(...form.locker_rows.map(r => r.row)) : 0;
    setForm(prev => ({
      ...prev,
      locker_rows: [...prev.locker_rows, { row: maxRow + 1, count: 3, size: 'medium' }],
    }));
  };

  const removeRow = (index: number) => {
    setForm(prev => {
      const rows = prev.locker_rows.filter((_, i) => i !== index);
      // Перенумеровываем ряды снизу вверх
      return { ...prev, locker_rows: rows.map((r, i) => ({ ...r, row: rows.length - i })) };
    });
  };

  const updateRow = (index: number, field: keyof LockerRow, value: any) => {
    setForm(prev => ({
      ...prev,
      locker_rows: prev.locker_rows.map((r, i) =>
        i === index ? { ...r, [field]: field === 'count' ? (value === '' ? '' : Math.min(10, Number(value))) : value } : r
      ),
    }));
  };

  return (
    <div className="space-y-6 overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Настройка офисов</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium min-h-[44px] touch-manipulation flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить офис
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {offices.map(office => (
          <div key={office.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{office.name}</h2>
                {office.address && <p className="text-sm text-gray-500 mt-1">{office.address}</p>}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openEdit(office)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Изменить
                </button>
                {offices.length > 1 && (
                  <button
                    onClick={() => setDeleteConfirmId(office.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>

            {/* Схема постомата */}
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Постомат</p>
              <div className="bg-gray-800 rounded p-2 space-y-1">
                {[...(office.locker_rows || [])].sort((a, b) => b.row - a.row).map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {Array.from({ length: row.count }).map((_, j) => (
                      <div
                        key={j}
                        className={`bg-gray-600 rounded text-center text-gray-300 flex items-center justify-center ${
                          row.size === 'small' ? 'h-6 text-[8px]' :
                          row.size === 'medium' ? 'h-8 text-[9px]' : 'h-10 text-[10px]'
                        }`}
                        style={{ flex: 1 }}
                      >
                        {SIZE_LABELS[row.size]?.[0]}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {office.locker_rows?.reduce((s, r) => s + (Number(r.count) || 0), 0) || 0} ячеек в {office.locker_rows?.length || 0} рядах
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Модалка создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingOffice ? 'Редактировать офис' : 'Новый офис'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Офис 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="ул. Ленина, 1"
                  />
                </div>

                {/* Настройка постомата */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Ряды постомата (сверху вниз)</label>
                    <button
                      type="button"
                      onClick={addRow}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      + Добавить ряд
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[...form.locker_rows].sort((a, b) => b.row - a.row).map((row, idx) => {
                      // Находим реальный индекс в исходном массиве
                      const realIdx = form.locker_rows.findIndex(r => r.row === row.row);
                      return (
                        <div key={row.row} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-500 w-10">Ряд {idx + 1}</span>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500">Ячеек</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={row.count}
                              onChange={e => updateRow(realIdx, 'count', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500">Размер</label>
                            <select
                              value={row.size}
                              onChange={e => updateRow(realIdx, 'size', e.target.value as LockerRow['size'])}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="small">Маленькая</option>
                              <option value="medium">Средняя</option>
                              <option value="large">Большая</option>
                            </select>
                          </div>
                          {form.locker_rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(realIdx)}
                              className="text-red-500 hover:text-red-700 text-lg leading-none"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Итого ячеек: {form.locker_rows.reduce((s, r) => s + (Number(r.count) || 0), 0)}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium disabled:opacity-50"
                  >
                    {editingOffice ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-md font-medium"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Удалить офис?</h3>
            <p className="text-gray-500 text-sm mb-4">Все аренды, расходы и ячейки постомата этого офиса останутся в базе данных.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId!)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Удалить
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficesPage;
