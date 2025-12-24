import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { lockersApi } from '../../api/admin/lockers';
import { type Locker, type CreateLockerDto } from '../../types/admin';
import LockerCabinet from '../../components/admin/LockerCabinet';
import apiClient from '../../api/admin/client';

const LockersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  const [formData, setFormData] = useState<CreateLockerDto>({
    locker_number: '',
    access_code: '',
    description: '',
    items: [],
    is_active: true
  });
  const [newItem, setNewItem] = useState('');
  const queryClient = useQueryClient();

  const { data: lockers = [] } = useAuthenticatedQuery<Locker[]>(
    ['lockers'],
    lockersApi.getAll
  );

  const createMutation = useMutation({
    mutationFn: lockersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateLockerDto> }) =>
      lockersApi.update(id, data),
    onSuccess: () => {
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
      const response = await apiClient.post('/lockers/initialize');
      return response.data;
    },
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
    setNewItem('');
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
    setNewItem('');
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
    setNewItem('');
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setFormData({ ...formData, items: [...(formData.items || []), newItem.trim()] });
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLocker) {
      updateMutation.mutate({ id: editingLocker.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту ячейку?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  const handleInitialize = () => {
    if (window.confirm('Вы уверены, что хотите инициализировать 13 ячеек постомата? Существующие ячейки не будут изменены.')) {
      initializeMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ячейки постомата</h1>
        <div className="flex gap-2">
          {lockers.length === 0 && (
            <button
              onClick={handleInitialize}
              disabled={initializeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {initializeMutation.isPending ? 'Инициализация...' : '⚡ Инициализировать 13 ячеек'}
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
        />
      )}

      {/* Список ячеек */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер ячейки
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Код доступа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Содержимое
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lockers.map((locker) => (
              <tr key={locker.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {locker.locker_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-bold">
                  {locker.access_code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {locker.items && locker.items.length > 0 ? (
                    <div className="space-y-1">
                      {locker.items.map((item, idx) => (
                        <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mr-1">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      locker.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {locker.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => openEditModal(locker)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(locker.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
                  placeholder="Например: A1"
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
                    onClick={handleGenerateCode}
                    disabled={generateCodeMutation.isPending}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {generateCodeMutation.isPending ? '...' : '🎲'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">4-значный код</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Например: Маленькая ячейка"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Содержимое ячейки
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Добавить предмет"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
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
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-bold"
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
    </div>
  );
};

export default LockersPage;
