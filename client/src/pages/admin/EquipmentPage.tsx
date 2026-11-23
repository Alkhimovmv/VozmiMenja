import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { equipmentApi } from '../../api/admin/equipment';
import { officesApi, type Office } from '../../api/admin/offices';
import { type CatalogEquipmentOption, type RentalEquipment, type CreateRentalEquipmentDto } from '../../types/admin';
import EquipmentModal, { type EquipmentInstanceOfficeChange } from '../../components/admin/EquipmentModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useOffice } from '../../hooks/useOffice';
import { getApiErrorMessage } from '../../lib/apiError';
import { analyticsApi } from '../../api/admin/analytics';
import type { EquipmentUtilization } from '../../types/admin';
import { buildAvitoBookingUrl } from '../../lib/avitoBookingLink';
import {
  getEquipmentDecision,
  type EquipmentPerformancePeriod,
  type EquipmentPerformancePeriods,
} from '../../lib/equipmentPerformance';

const performancePeriods: EquipmentPerformancePeriod[] = [30, 90, 365];

const decisionToneClasses = {
  green: 'bg-green-50 text-green-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  gray: 'bg-gray-100 text-gray-600',
};

const EquipmentPage: React.FC = () => {
  const { currentOfficeId } = useOffice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [performancePeriod, setPerformancePeriod] = useState<EquipmentPerformancePeriod>(365);
  const [editingEquipment, setEditingEquipment] = useState<RentalEquipment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; equipmentId: string | null }>({ isOpen: false, equipmentId: null });
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useAuthenticatedQuery<RentalEquipment[]>(['equipment', currentOfficeId], () => equipmentApi.getAll(currentOfficeId));
  const { data: catalogOptions = [] } = useAuthenticatedQuery<CatalogEquipmentOption[]>(
    ['equipment', 'catalog-options'],
    equipmentApi.getCatalogOptions
  );
  const { data: offices = [] } = useAuthenticatedQuery<Office[]>(['offices'], officesApi.getAll);
  const { data: equipmentPerformance, isLoading: isPerformanceLoading } = useAuthenticatedQuery<EquipmentPerformancePeriods>(
    ['analytics', 'equipment-utilization', currentOfficeId, 'periods'],
    () => analyticsApi.getEquipmentPerformancePeriods(currentOfficeId),
    { staleTime: 60_000 }
  );
  const selectedEquipmentPerformance: EquipmentUtilization[] = equipmentPerformance?.[performancePeriod] ?? [];

  const createMutation = useMutation({
    mutationFn: equipmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['equipment-rental'], exact: false });
      setIsModalOpen(false);
      setEditingEquipment(null);
      toast.success('Оборудование сохранено');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось сохранить оборудование'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      officeChanges = [],
    }: {
      id: string;
      data: Partial<CreateRentalEquipmentDto>;
      officeChanges?: EquipmentInstanceOfficeChange[];
    }) => {
      const updated = await equipmentApi.update(id, data);

      for (const change of officeChanges) {
        await equipmentApi.moveInstance(id, change.instanceNumber, change.officeId);
      }

      return { updated, movedCount: officeChanges.length };
    },
    onSuccess: ({ movedCount }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['equipment-rental'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['lockers'], exact: false });
      setIsModalOpen(false);
      setEditingEquipment(null);
      toast.success(movedCount > 0 ? 'Оборудование обновлено, экземпляры перенесены' : 'Оборудование обновлено');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось обновить оборудование'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: equipmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['equipment-rental'], exact: false });
      toast.success('Оборудование удалено');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось удалить оборудование'));
    },
  });

  const handleCreateEquipment = (data: CreateRentalEquipmentDto) => {
    createMutation.mutate({ ...data, office_id: currentOfficeId });
  };

  const handleUpdateEquipment = (data: Partial<CreateRentalEquipmentDto>, officeChanges: EquipmentInstanceOfficeChange[] = []) => {
    if (editingEquipment) {
      const { office_id, ...updateData } = data;
      void office_id;
      updateMutation.mutate({ id: String(editingEquipment.id), data: updateData, officeChanges });
    }
  };

  const handleDeleteEquipment = (id: string) => {
    setDeleteConfirm({ isOpen: true, equipmentId: id });
  };

  const handleEditEquipment = (equipment: RentalEquipment) => {
    setEditingEquipment(equipment);
    setIsModalOpen(true);
  };

  const handleCopyAvitoLink = async (catalogEquipmentId: string) => {
    const link = buildAvitoBookingUrl(catalogEquipmentId);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Ссылка для Авито скопирована');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const totalValue = equipment.reduce((sum, item) => sum + ((item.base_price ?? 0) * item.quantity), 0);
  const totalItems = equipment.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Управление оборудованием</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium w-full sm:w-auto min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить оборудование
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{equipment.length}</div>
          <div className="text-sm text-gray-600">Типов оборудования</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          <div className="text-sm text-gray-600">Единиц оборудования</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{totalValue.toLocaleString()}₽</div>
          <div className="text-sm text-gray-600">Общая стоимость</div>
        </div>
      </div>

      <section className="rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Доходность оборудования</h2>
            <p className="text-sm text-gray-500">По завершённым арендам, без общих расходов</p>
          </div>
          <div className="flex rounded-md bg-gray-100 p-1" aria-label="Период отчёта">
            {performancePeriods.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setPerformancePeriod(period)}
                className={`min-h-[36px] flex-1 rounded px-3 text-sm font-medium sm:flex-none ${
                  performancePeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {period} дней
              </button>
            ))}
          </div>
        </div>

        {isPerformanceLoading ? (
          <div className="mt-4 text-sm text-gray-500">Считаем загрузку…</div>
        ) : selectedEquipmentPerformance.length === 0 || !equipmentPerformance ? (
          <div className="mt-4 text-sm text-gray-500">Пока недостаточно данных для расчёта.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Оборудование</th>
                  <th className="px-3 py-2">Аренды</th>
                  <th className="px-3 py-2">Загрузка</th>
                  <th className="px-3 py-2">Выручка</th>
                  <th className="px-3 py-2">Окупаемость</th>
                  <th className="px-3 py-2">Решение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedEquipmentPerformance.map((item) => {
                  const decision = getEquipmentDecision(equipmentPerformance, item.id);
                  return (
                  <tr key={item.id} className="align-top">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} шт. · {item.rented_days} занято · {item.idle_days} простой
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {item.total_rentals}
                      <div className="text-xs text-gray-500">средняя {item.average_revenue.toLocaleString()}₽</div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-900">{item.utilization_percent}%</td>
                    <td className="px-3 py-3 font-semibold text-gray-900">{item.total_revenue.toLocaleString()}₽</td>
                    <td className="px-3 py-3">
                      {item.gross_return_percent === null ? (
                        <span className="text-gray-400">Укажите стоимость</span>
                      ) : (
                        <span className={item.gross_return_percent >= 100 ? 'font-semibold text-green-700' : 'font-semibold text-amber-700'}>
                          {item.gross_return_percent}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${decisionToneClasses[decision.tone]}`}>
                        {decision.label}
                      </span>
                      <div className="mt-1 max-w-52 text-xs text-gray-500">{decision.reason}</div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Список оборудования */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="grid grid-cols-1 gap-1">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                      item.quantity > 5
                        ? 'bg-green-100 text-green-800'
                        : item.quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.quantity} шт.
                    </span>
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.catalog_equipment_id
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.catalog_equipment_id ? 'Связано с сайтом' : 'Не связано с сайтом'}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {item.description}
                  </div>

                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                    <span>💰 Цена: {item.base_price !== null ? `${item.base_price}₽` : 'Не указана'}</span>
                    <span>📊 Общая стоимость: {item.base_price !== null ? `${(item.base_price * item.quantity).toLocaleString()}₽` : 'Не указана'}</span>
                    {item.catalog_equipment_id && (
                      <span>
                        Сайт: {catalogOptions.find((option) => option.id === item.catalog_equipment_id)?.name || item.catalog_equipment_id}
                      </span>
                    )}
                  </div>

                  {item.instances && item.instances.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {item.instances.map((instance) => (
                        <div key={instance.instance_number} className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                          <div className="font-medium text-gray-800">Экземпляр #{instance.instance_number}</div>
                          <div>Серийный номер: {instance.serial_number || 'Не указан'}</div>
                          {instance.comment && <div>Комментарий: {instance.comment}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  {item.catalog_equipment_id && (
                    <button
                      onClick={() => handleCopyAvitoLink(item.catalog_equipment_id!)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation"
                    >
                      Ссылка для Авито
                    </button>
                  )}
                  <button
                    onClick={() => handleEditEquipment(item)}
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                  >
                    {updateMutation.isPending ? <Spinner /> : null}
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDeleteEquipment(String(item.id))}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-3 rounded text-sm font-medium min-h-[44px] touch-manipulation inline-flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending ? <Spinner /> : null}
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {equipment.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет оборудования</h3>
            <p className="text-gray-500">Добавьте первое оборудование для начала работы</p>
          </div>
        )}
      </div>

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEquipment(null);
        }}
        onSubmit={editingEquipment ? handleUpdateEquipment : handleCreateEquipment}
        equipment={editingEquipment}
        isLoading={createMutation.isPending || updateMutation.isPending}
        defaultOfficeId={currentOfficeId}
        offices={offices}
        catalogOptions={catalogOptions}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление оборудования"
        message="Вы уверены, что хотите удалить это оборудование? Это действие нельзя будет отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        onConfirm={() => { if (deleteConfirm.equipmentId) deleteMutation.mutate(deleteConfirm.equipmentId); setDeleteConfirm({ isOpen: false, equipmentId: null }); }}
        onCancel={() => setDeleteConfirm({ isOpen: false, equipmentId: null })}
      />
    </div>
  );
};

export default EquipmentPage;
