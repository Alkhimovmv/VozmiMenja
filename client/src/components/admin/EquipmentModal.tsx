import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Office } from '../../api/admin/offices';
import { type RentalEquipment, type CreateRentalEquipmentDto, type RentalEquipmentInstance } from '../../types/admin';

export interface EquipmentInstanceOfficeChange {
  instanceNumber: number;
  officeId: number;
}

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRentalEquipmentDto, officeChanges?: EquipmentInstanceOfficeChange[]) => void;
  equipment?: RentalEquipment | null;
  isLoading?: boolean;
  defaultOfficeId?: number;
  offices?: Office[];
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipment,
  isLoading = false,
  defaultOfficeId = 1,
  offices = [],
}) => {
  const buildInstances = (quantity: number, currentInstances?: RentalEquipmentInstance[]): RentalEquipmentInstance[] => {
    return Array.from({ length: quantity }, (_, index) => {
      const instanceNumber = index + 1;
      const existing = currentInstances?.find((instance) => instance.instance_number === instanceNumber);
      return {
        instance_number: instanceNumber,
        serial_number: existing?.serial_number || null,
        comment: existing?.comment || null,
      };
    });
  };

  const [formData, setFormData] = useState<CreateRentalEquipmentDto>({
    name: '',
    quantity: 1,
    description: '',
    base_price: null,
    office_id: defaultOfficeId,
    instances: buildInstances(1),
  });
  const [quantityInput, setQuantityInput] = useState('1');
  const [instanceOfficeIds, setInstanceOfficeIds] = useState<Record<number, number>>({});

  const [validationErrors, setValidationErrors] = useState<{
    name?: string | null;
  }>({});

  useEffect(() => {
    if (isOpen) {
      if (equipment) {
        setFormData({
          name: equipment.name,
          quantity: equipment.quantity,
          description: equipment.description || '',
          base_price: equipment.base_price,
          office_id: equipment.office_id || defaultOfficeId,
          instances: buildInstances(equipment.quantity, equipment.instances),
        });
        setQuantityInput(String(equipment.quantity));
        setInstanceOfficeIds(
          Object.fromEntries(
            buildInstances(equipment.quantity, equipment.instances).map((instance) => [
              instance.instance_number,
              equipment.office_id || defaultOfficeId,
            ])
          )
        );
      } else {
        setFormData({
          name: '',
          quantity: 1,
          description: '',
          base_price: null,
          office_id: defaultOfficeId,
          instances: buildInstances(1),
        });
        setQuantityInput('1');
        setInstanceOfficeIds({ 1: defaultOfficeId });
      }
      // Очищаем ошибки валидации при открытии
      setValidationErrors({});
    }
  }, [equipment, isOpen, defaultOfficeId]);

  const isFormValid = () => {
    // Проверяем обязательное поле - название
    const hasName = formData.name.trim() !== '';
    return hasName;
  };

  const validateAllFields = () => {
    const errors: typeof validationErrors = {};

    // Валидация названия
    if (!formData.name.trim()) {
      errors.name = 'Необходимо указать название оборудования';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAllFields()) {
      return;
    }

    const sourceOfficeId = equipment?.office_id || defaultOfficeId;
    const officeChanges = equipment
      ? (formData.instances || [])
          .map((instance) => ({
            instanceNumber: instance.instance_number,
            officeId: instanceOfficeIds[instance.instance_number] || sourceOfficeId,
          }))
          .filter((change) => change.officeId !== sourceOfficeId)
          .sort((a, b) => b.instanceNumber - a.instanceNumber)
      : [];

    onSubmit(formData, officeChanges);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center z-50 sm:items-start sm:p-4 sm:pb-8 overflow-y-auto">
      <div className="relative mx-auto border shadow-lg bg-white w-full h-full sm:w-11/12 sm:max-w-md sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:rounded-md overflow-y-auto flex flex-col" style={{paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)'}}>
        <div className="flex-1 flex flex-col p-4 sm:p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {equipment ? 'Редактировать оборудование' : 'Добавить новое оборудование'}
          </h3>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 space-y-0">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Название оборудования
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  // Очищаем ошибку при вводе
                  if (e.target.value.trim()) {
                    setValidationErrors(prev => ({ ...prev, name: null }));
                  }
                }}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                placeholder="Например: GoPro 13"
              />
              {validationErrors.name && (
                <div className="text-red-600 text-sm mt-1">
                  {validationErrors.name}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Количество
              </label>
              <input
                type="number"
                value={quantityInput}
                onChange={(e) => {
                  setQuantityInput(e.target.value);
                  const n = parseInt(e.target.value);
                  if (!isNaN(n) && n >= 1) {
                    setFormData((prev) => ({
                      ...prev,
                      quantity: n,
                      instances: buildInstances(n, prev.instances),
                    }));
                    setInstanceOfficeIds((prev) => {
                      const next: Record<number, number> = {};
                      for (let instanceNumber = 1; instanceNumber <= n; instanceNumber++) {
                        next[instanceNumber] = prev[instanceNumber] || equipment?.office_id || defaultOfficeId;
                      }
                      return next;
                    });
                  }
                }}
                onBlur={() => {
                  const n = parseInt(quantityInput);
                  const valid = !isNaN(n) && n >= 1 ? n : 1;
                  setFormData((prev) => ({
                    ...prev,
                    quantity: valid,
                    instances: buildInstances(valid, prev.instances),
                  }));
                  setQuantityInput(String(valid));
                  setInstanceOfficeIds((prev) => {
                    const next: Record<number, number> = {};
                    for (let instanceNumber = 1; instanceNumber <= valid; instanceNumber++) {
                      next[instanceNumber] = prev[instanceNumber] || equipment?.office_id || defaultOfficeId;
                    }
                    return next;
                  });
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                min="1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Серийные номера и комментарии
              </label>
              <div className="space-y-3 max-h-72 overflow-y-auto rounded-md border border-gray-200 p-3">
                {(formData.instances || []).map((instance, index) => (
                  <div key={instance.instance_number} className="rounded-md border border-gray-200 p-3">
                    <div className="mb-2 text-sm font-medium text-gray-900">
                      Экземпляр #{instance.instance_number}
                    </div>
                    {equipment && offices.length > 0 && (
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Офис экземпляра
                        </label>
                        <select
                          value={instanceOfficeIds[instance.instance_number] || equipment.office_id || defaultOfficeId}
                          onChange={(e) => {
                            const officeId = Number(e.target.value);
                            setInstanceOfficeIds((prev) => ({
                              ...prev,
                              [instance.instance_number]: officeId,
                            }));
                          }}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {offices.map((office) => (
                            <option key={office.id} value={office.id}>
                              {office.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Серийный номер
                      </label>
                      <input
                        type="text"
                        value={instance.serial_number || ''}
                        onChange={(e) => {
                          const serialNumber = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            instances: (prev.instances || []).map((item, itemIndex) =>
                              itemIndex === index ? { ...item, serial_number: serialNumber || null } : item
                            ),
                          }));
                        }}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Например: SN-001245"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Комментарий
                      </label>
                      <textarea
                        value={instance.comment || ''}
                        onChange={(e) => {
                          const comment = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            instances: (prev.instances || []).map((item, itemIndex) =>
                              itemIndex === index ? { ...item, comment: comment || null } : item
                            ),
                          }));
                        }}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows={2}
                        placeholder="Например: потертости на корпусе, комплект без крепления"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Цена оборудования (₽)
              </label>
              <input
                type="number"
                value={formData.base_price ?? ''}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value === '' ? null : Number(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Не указана"
                min="0"
                step="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Краткое описание оборудования..."
              />
            </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex flex-row justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium min-h-[44px] touch-manipulation"
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 font-medium min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  'Сохранение...'
                ) : equipment ? (
                  'Обновить'
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Создать
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EquipmentModal;
