import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { lockersApi } from '../../api/admin/lockers';
import { equipmentApi } from '../../api/admin/equipment';
import { type Locker, type CreateLockerDto } from '../../types/admin';
import type { Equipment } from '../../types/index';
import LockerCabinet from '../../components/admin/LockerCabinet';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import apiClient from '../../api/admin/client';
import { useOffice } from '../../hooks/useOffice';

// Ключ выбранного экземпляра: "equipmentId:instanceNumber"
type InstanceKey = string;

const LockersPage: React.FC = () => {
  const { currentOfficeId, currentOffice } = useOffice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  const [formData, setFormData] = useState<CreateLockerDto>({
    locker_number: '',
    access_code: '',
    description: '',
    items: [],
    is_active: true
  });
  const [selectedInstances, setSelectedInstances] = useState<Set<InstanceKey>>(new Set());
  const [newItem, setNewItem] = useState('');
  const queryClient = useQueryClient();

  const { data: lockers = [] } = useAuthenticatedQuery<Locker[]>(
    ['lockers', currentOfficeId],
    () => lockersApi.getAll(currentOfficeId)
  );

  const { data: allEquipment = [] } = useAuthenticatedQuery<Equipment[]>(
    ['equipment-rental', currentOfficeId],
    () => equipmentApi.getForRental(currentOfficeId)
  );

  // Конвертация Set<"id:instance"> в массив для API
  const instancesToApiItems = (instances: Set<InstanceKey>) =>
    Array.from(instances).map(key => {
      const [idStr, instStr] = key.split(':');
      return { equipment_id: Number(idStr), instance_number: Number(instStr) };
    });

  const createMutation = useMutation({
    mutationFn: lockersApi.create,
    onSuccess: async (locker) => {
      await lockersApi.setEquipment(locker.id, { items: instancesToApiItems(selectedInstances) });
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateLockerDto> }) =>
      lockersApi.update(id, data),
    onSuccess: async (locker) => {
      await lockersApi.setEquipment(locker.id, { items: instancesToApiItems(selectedInstances) });
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: lockersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: lockersApi.generateCode,
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, access_code: data.code }));
    },
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/lockers/initialize', { office_id: currentOfficeId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
    },
  });

  const markCheckedMutation = useMutation({
    mutationFn: (id: number) => lockersApi.markChecked(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
    },
  });

  const openCreateModal = () => {
    setEditingLocker(null);
    setFormData({
      locker_number: '',
      access_code: '',
      description: '',
      items: [],
      is_active: true
    });
    setSelectedInstances(new Set());
    setIsModalOpen(true);
  };

  const openEditModal = (locker: Locker) => {
    setEditingLocker(locker);
    setFormData({
      locker_number: locker.locker_number,
      access_code: locker.access_code,
      description: locker.description || '',
      items: locker.items || [],
      is_active: locker.is_active
    });
    // Восстанавливаем выбранные экземпляры из ячейки
    const instances = new Set<InstanceKey>();
    (locker.equipment_items || []).forEach(e => {
      instances.add(`${e.equipment_id}:${e.instance_number}`);
    });
    setSelectedInstances(instances);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocker(null);
    setFormData({
      locker_number: '',
      access_code: '',
      description: '',
      items: [],
      is_active: true
    });
    setSelectedInstances(new Set());
    setNewItem('');
  };

  const toggleInstance = (equipmentId: number, instanceNumber: number) => {
    const key: InstanceKey = `${equipmentId}:${instanceNumber}`;
    setSelectedInstances(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = newItem.trim()
      ? { ...formData, items: [...(formData.items || []), newItem.trim()] }
      : formData;

    if (editingLocker) {
      updateMutation.mutate({ id: editingLocker.id, data: dataToSave });
    } else {
      createMutation.mutate({ ...dataToSave, office_id: currentOfficeId } as any);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; lockerId: number | null }>({ isOpen: false, lockerId: null });
  const [initConfirm, setInitConfirm] = useState(false);

  const totalLockersCount = (currentOffice?.locker_rows || []).reduce((sum: number, r: any) => sum + (r.count || 0), 0) || 13;

  const handleDelete = (id: number) => setDeleteConfirm({ isOpen: true, lockerId: id });
  const handleInitialize = () => setInitConfirm(true);

  return (
    <div className="space-y-6 overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ячейки постомата</h1>
        <div className="flex gap-2">
          {lockers.length < totalLockersCount && (
            <button
              onClick={handleInitialize}
              disabled={initializeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {initializeMutation.isPending ? 'Инициализация...' : `⚡ Инициализировать ${totalLockersCount} ячеек`}
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            + Добавить ячейку
          </button>
        </div>
      </div>

      {/* Визуализация постомата */}
      {lockers.length > 0 && (
        <LockerCabinet
          lockers={lockers}
          onLockerClick={(locker) => openEditModal(locker)}
          lockerRows={currentOffice?.locker_rows}
        />
      )}

      {/* Список ячеек */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                Код
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Оборудование
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lockers.map((locker) => {
              const isOccupied = locker.total_equipment > 0 && locker.free_equipment === 0;
              return (
                <tr key={locker.id} className={locker.needs_check ? 'bg-amber-50' : ''}>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1.5">
                      {locker.locker_number}
                      {locker.needs_check && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                          ⚠ Проверить
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-mono font-bold">
                    {locker.access_code}
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                    {locker.equipment_items && locker.equipment_items.length > 0 ? (
                      <div className="space-y-1">
                        {locker.equipment_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {item.equipment_name}{locker.equipment_items.filter(e => e.equipment_id === item.equipment_id).length > 1 ? ` #${item.instance_number}` : ''}
                            </span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              item.is_free ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.is_free ? 'св.' : item.customer_last_name ? item.customer_last_name : 'занят'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {locker.items && locker.items.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {locker.items.map((item, idx) => (
                          <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block mr-1">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    {(!locker.equipment_items || locker.equipment_items.length === 0) && (!locker.items || locker.items.length === 0) && (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span
                      className={`px-1.5 sm:px-2 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full ${
                        !locker.is_active
                          ? 'bg-gray-100 text-gray-800'
                          : isOccupied
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {!locker.is_active ? 'Неакт.' : isOccupied ? 'Занята' : 'Свободна'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0 items-end">
                      {locker.needs_check && (
                        <button
                          onClick={() => markCheckedMutation.mutate(locker.id)}
                          disabled={markCheckedMutation.isPending}
                          className="text-amber-700 hover:text-amber-900 text-xs sm:text-sm font-semibold bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors"
                        >
                          ✓ Готова
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(locker)}
                        disabled={updateMutation.isPending}
                        className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm disabled:opacity-60"
                      >
                        Изм.
                      </button>
                      <button
                        onClick={() => handleDelete(locker.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-900 text-xs sm:text-sm disabled:opacity-60 inline-flex items-center gap-1"
                      >
                        {deleteMutation.isPending ? <Spinner /> : null}
                        Удал.
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lockers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет ячеек в постомате
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingLocker ? 'Редактировать ячейку' : 'Добавить ячейку'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер ячейки *
                </label>
                <input
                  type="text"
                  required
                  value={formData.locker_number}
                  onChange={(e) => setFormData({ ...formData, locker_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Код доступа *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.access_code}
                    onChange={(e) => setFormData({ ...formData, access_code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="0000"
                    maxLength={4}
                    pattern="[0-9]{4}"
                  />
                  <button
                    type="button"
                    onClick={() => generateCodeMutation.mutate()}
                    disabled={generateCodeMutation.isPending}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {generateCodeMutation.isPending ? '...' : '🎲'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">4-значный код</p>
              </div>

              {/* Оборудование в ячейке */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оборудование в ячейке
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {allEquipment.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Нет оборудования в системе</p>
                  ) : (
                    allEquipment.flatMap((eq) => {
                      const eqId = Number((eq as any).id);
                      const qty = (eq as any).quantity as number;
                      return Array.from({ length: qty }, (_, i) => {
                        const instanceNumber = i + 1;
                        const key: InstanceKey = `${eqId}:${instanceNumber}`;
                        const checked = selectedInstances.has(key);
                        return (
                          <label key={key} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleInstance(eqId, instanceNumber)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">
                              {eq.name}{qty > 1 ? ` #${instanceNumber}` : ''}
                            </span>
                          </label>
                        );
                      });
                    })
                  )}
                </div>
                {selectedInstances.size > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Выбрано: {selectedInstances.size} единиц
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  Ячейка станет неактивной, когда всё оборудование будет в аренде
                </p>
              </div>

              {/* Дополнительные предметы вручную */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительно (вручную)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newItem.trim()) {
                          setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem.trim()] }));
                          setNewItem('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Например: Трекинговые палки"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newItem.trim()) {
                        setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem.trim()] }));
                        setNewItem('');
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    +
                  </button>
                </div>
                {formData.items && formData.items.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }))}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Ячейка активна
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                {editingLocker?.needs_check && (
                  <button
                    type="button"
                    onClick={() => { markCheckedMutation.mutate(editingLocker.id); closeModal(); }}
                    disabled={markCheckedMutation.isPending}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md disabled:opacity-50 font-semibold"
                  >
                    ✓ Проверена
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Сохранение...'
                    : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление ячейки"
        message="Вы уверены, что хотите удалить эту ячейку? Это действие нельзя будет отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        onConfirm={() => { if (deleteConfirm.lockerId) deleteMutation.mutate(deleteConfirm.lockerId); setDeleteConfirm({ isOpen: false, lockerId: null }); }}
        onCancel={() => setDeleteConfirm({ isOpen: false, lockerId: null })}
      />

      <ConfirmDialog
        isOpen={initConfirm}
        title="Инициализация ячеек"
        message={`Инициализировать ${totalLockersCount} ячеек постамата? Существующие ячейки не будут изменены.`}
        confirmText="Инициализировать"
        cancelText="Отмена"
        type="warning"
        onConfirm={() => { initializeMutation.mutate(); setInitConfirm(false); }}
        onCancel={() => setInitConfirm(false)}
      />
    </div>
  );
};

export default LockersPage;
