import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type Rental, type CreateRentalDto, type Equipment, type RentalSource, type EquipmentInstance } from '../types/index';
import CustomSelect from './CustomSelect';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRentalDto | Partial<CreateRentalDto & { status: string }>) => void;
  rental?: Rental | null;
  equipment: Equipment[];
  isLoading?: boolean;
}

const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rental,
  equipment,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateRentalDto>({
    equipment_id: 0,
    equipment_ids: [],
    start_date: '',
    end_date: '',
    customer_name: '',
    customer_phone: '',
    needs_delivery: false,
    delivery_address: '',
    rental_price: null,
    delivery_price: null,
    delivery_costs: null,
    source: 'авито',
    comment: '',
  });

  // Дополнительное состояние для отслеживания выбранных экземпляров
  // Формат: Set<"equipmentId:instanceNumber">
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());

  const [validationErrors, setValidationErrors] = useState<{
    phone?: string | null;
    dates?: string | null;
    equipment?: string | null;
    customer_name?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  }>({});

  // Храним ID редактируемой аренды для отслеживания изменений
  const [initialRentalId, setInitialRentalId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Проверяем, это новое открытие модального окна или просто обновление данных
      const isNewOpen = rental?.id !== initialRentalId;

      if (rental) {
        // Если есть equipment_list, используем его для множественного выбора
        const equipmentIds = rental.equipment_list
          ? rental.equipment_list.map((eq: { id: number; name: string; instance_number: number }) => eq.id)
          : [rental.equipment_id];

        setFormData({
          equipment_id: rental.equipment_id,
          equipment_ids: equipmentIds,
          start_date: rental.start_date.slice(0, 16),
          end_date: rental.end_date.slice(0, 16),
          customer_name: rental.customer_name,
          customer_phone: rental.customer_phone,
          needs_delivery: rental.needs_delivery,
          delivery_address: rental.delivery_address || '',
          rental_price: rental.rental_price,
          delivery_price: rental.delivery_price,
          delivery_costs: rental.delivery_costs,
          source: rental.source,
          comment: rental.comment || '',
        });

        // Восстанавливаем selectedInstances только при новом открытии модального окна
        if (isNewOpen) {
          setInitialRentalId(rental.id);

          if (rental.equipment_list) {
            const instances = new Set<string>();
            rental.equipment_list.forEach((eq: { id: number; name: string; instance_number: number }) => {
              instances.add(`${eq.id}:${eq.instance_number}`);
            });
            setSelectedInstances(instances);
          } else {
            setSelectedInstances(new Set());
          }
        }
      } else {
        // Новая аренда
        setInitialRentalId(null);
        setFormData({
          equipment_id: 0,
          equipment_ids: [],
          start_date: '',
          end_date: '',
          customer_name: '',
          customer_phone: '',
          needs_delivery: false,
          delivery_address: '',
          rental_price: null,
          delivery_price: null,
          delivery_costs: null,
          source: 'авито',
          comment: '',
        });
        setSelectedInstances(new Set());
      }
      // Очищаем ошибки валидации при открытии
      if (isNewOpen || !rental) {
        setValidationErrors({});
      }
    } else {
      // При закрытии модального окна сбрасываем ID
      setInitialRentalId(null);
    }
  }, [rental, isOpen]);

  const validatePhone = (phone: string): string | null => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      return 'Номер телефона должен содержать 11 цифр';
    }
    return null;
  };

  const validateDates = (startDate: string, endDate: string): string | null => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return 'Дата окончания должна быть позже даты начала';
    }
    return null;
  };

  // Helper-функция для синхронизации equipment_instances из selectedInstances
  const syncEquipmentInstances = () => {
    const equipmentMap = new Map<number, number[]>();

    selectedInstances.forEach(inst => {
      const [idStr, instanceStr] = inst.split(':');
      const id = Number(idStr);
      const instanceNum = Number(instanceStr);

      if (!equipmentMap.has(id)) {
        equipmentMap.set(id, []);
      }
      equipmentMap.get(id)!.push(instanceNum);
    });

    const equipmentIdsArray: number[] = [];
    const equipmentInstancesArray: EquipmentInstance[] = [];

    equipmentMap.forEach((instances, id) => {
      instances.sort((a, b) => a - b);
      instances.forEach((instanceNum) => {
        equipmentIdsArray.push(id);
        equipmentInstancesArray.push({
          equipment_id: id,
          instance_number: instanceNum
        });
      });
    });

    return { equipmentIdsArray, equipmentInstancesArray };
  };

  // Обёртка для setFormData, которая автоматически синхронизирует equipment_instances
  const updateFormData = (updates: Partial<CreateRentalDto>) => {
    const { equipmentIdsArray, equipmentInstancesArray } = syncEquipmentInstances();

    setFormData({
      ...formData,
      ...updates,
      equipment_ids: equipmentIdsArray,
      equipment_instances: equipmentInstancesArray
    });
  };

  const handlePhoneChange = (value: string) => {
    // Разрешаем только цифры и ограничиваем до 11 символов
    const cleanValue = value.replace(/\D/g, '').slice(0, 11);
    updateFormData({ customer_phone: cleanValue });

    // Валидация телефона
    const phoneError = validatePhone(cleanValue);
    setValidationErrors(prev => ({ ...prev, phone: phoneError }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    updateFormData({ [field]: value });

    // Валидация дат
    const start = field === 'start_date' ? value : formData.start_date;
    const end = field === 'end_date' ? value : formData.end_date;
    const dateError = validateDates(start, end);
    setValidationErrors(prev => ({ ...prev, dates: dateError }));
  };

  const isFormValid = () => {
    const phoneError = validatePhone(formData.customer_phone);
    const dateError = validateDates(formData.start_date, formData.end_date);

    // Проверяем все обязательные поля
    const isEquipmentSelected = (formData.equipment_ids && formData.equipment_ids.length > 0) || formData.equipment_id > 0;
    const hasStartDate = formData.start_date.trim() !== '';
    const hasEndDate = formData.end_date.trim() !== '';
    const hasCustomerName = formData.customer_name.trim() !== '';
    const hasValidPhone = !phoneError && formData.customer_phone.length === 11;

    return isEquipmentSelected && hasStartDate && hasEndDate && hasCustomerName && hasValidPhone && !dateError;
  };

  const validateAllFields = () => {
    const errors: typeof validationErrors = {};

    // Валидация оборудования
    if ((!formData.equipment_ids || formData.equipment_ids.length === 0) && !formData.equipment_id) {
      errors.equipment = 'Необходимо выбрать хотя бы одно оборудование';
    }

    // Валидация дат
    if (!formData.start_date.trim()) {
      errors.start_date = 'Необходимо указать дату начала';
    }
    if (!formData.end_date.trim()) {
      errors.end_date = 'Необходимо указать дату окончания';
    }

    // Валидация ФИО
    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Необходимо указать ФИО арендатора';
    }

    // Валидация телефона
    const phoneError = validatePhone(formData.customer_phone);
    if (phoneError) {
      errors.phone = phoneError;
    }

    // Валидация дат (соотношение)
    const dateError = validateDates(formData.start_date, formData.end_date);
    if (dateError) {
      errors.dates = dateError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAllFields()) {
      return;
    }

    onSubmit(formData);
  };

  const sources: { value: RentalSource; label: string }[] = [
    { value: 'авито', label: 'Авито' },
    { value: 'сайт', label: 'Сайт' },
    { value: 'рекомендация', label: 'Рекомендация' },
    { value: 'карты', label: 'Карты' }
  ];

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 sm:items-start sm:p-4 sm:pt-8 sm:pb-8 overflow-y-auto" style={{zIndex: 1000}}>
      <div className="bg-white shadow-xl w-full h-full sm:w-full sm:max-w-2xl sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:rounded-lg modal-container overflow-y-auto flex flex-col" style={{position: 'relative', zIndex: 1001, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)'}}>
        <div className="flex-1 flex flex-col p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {rental ? 'Редактировать аренду' : 'Добавить новую аренду'}
          </h3>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оборудование (можно выбрать несколько)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {equipment.flatMap((item) =>
                    Array.from({ length: item.quantity }, (_, index) => {
                      const instanceNumber = index + 1;
                      const instanceKey = `${item.id}-${instanceNumber}`;

                      // Уникальный ключ для этого экземпляра
                      const instanceId = `${item.id}:${instanceNumber}`;
                      const isThisInstanceSelected = selectedInstances.has(instanceId);

                      return (
                        <label key={instanceKey} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isThisInstanceSelected}
                            onChange={(e) => {
                              const newSelectedInstances = new Set(selectedInstances);

                              if (e.target.checked) {
                                // Добавляем этот конкретный экземпляр
                                newSelectedInstances.add(instanceId);
                              } else {
                                // Удаляем этот конкретный экземпляр
                                newSelectedInstances.delete(instanceId);
                              }

                              setSelectedInstances(newSelectedInstances);

                              // Преобразуем Set в массив для отправки на сервер
                              // Создаём два массива: equipment_ids (для обратной совместимости) и equipment_instances (с номерами)
                              const equipmentMap = new Map<number, number[]>(); // id -> [instanceNumbers]

                              newSelectedInstances.forEach(inst => {
                                const [idStr, instanceStr] = inst.split(':');
                                const id = Number(idStr);
                                const instanceNum = Number(instanceStr);

                                if (!equipmentMap.has(id)) {
                                  equipmentMap.set(id, []);
                                }
                                equipmentMap.get(id)!.push(instanceNum);
                              });

                              // Создаём массивы ID и инстансов
                              const equipmentIdsArray: number[] = [];
                              const equipmentInstancesArray: EquipmentInstance[] = [];

                              equipmentMap.forEach((instances, id) => {
                                // Сортируем номера экземпляров
                                instances.sort((a, b) => a - b);
                                // Добавляем в оба массива
                                instances.forEach((instanceNum) => {
                                  equipmentIdsArray.push(id);
                                  equipmentInstancesArray.push({
                                    equipment_id: id,
                                    instance_number: instanceNum
                                  });
                                });
                              });

                              setFormData({
                                ...formData,
                                equipment_id: equipmentIdsArray.length > 0 ? equipmentIdsArray[0] : 0,
                                equipment_ids: equipmentIdsArray,
                                equipment_instances: equipmentInstancesArray
                              });

                              // Очищаем ошибку при выборе
                              if (equipmentIdsArray.length > 0) {
                                setValidationErrors(prev => ({ ...prev, equipment: null }));
                              }
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-900">
                            {item.name} {item.quantity > 1 ? `#${instanceNumber}` : ''}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                {formData.equipment_ids && formData.equipment_ids.length > 0 && (
                  <div className="text-sm text-gray-600 mt-2">
                    Выбрано: {formData.equipment_ids.length} единиц оборудования
                  </div>
                )}
                {validationErrors.equipment && (
                  <div className="text-red-600 text-sm mt-1">
                    {validationErrors.equipment}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Источник
                </label>
                <CustomSelect
                  value={formData.source}
                  onChange={(value) => updateFormData({ source: value as RentalSource })}
                  options={sources}
                  placeholder="Выберите источник"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата начала
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => {
                    handleDateChange('start_date', e.target.value);
                    // Очищаем ошибку при вводе
                    if (e.target.value.trim()) {
                      setValidationErrors(prev => ({ ...prev, start_date: null }));
                    }
                  }}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.dates || validationErrors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max="9999-12-31T23:59"
                  required
                />
                {validationErrors.start_date && (
                  <div className="text-red-600 text-sm mt-1">
                    {validationErrors.start_date}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата окончания
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => {
                    handleDateChange('end_date', e.target.value);
                    // Очищаем ошибку при вводе
                    if (e.target.value.trim()) {
                      setValidationErrors(prev => ({ ...prev, end_date: null }));
                    }
                  }}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.dates || validationErrors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max="9999-12-31T23:59"
                  required
                />
                {validationErrors.end_date && (
                  <div className="text-red-600 text-sm mt-1">
                    {validationErrors.end_date}
                  </div>
                )}
                {validationErrors.dates && (
                  <div className="text-red-600 text-sm mt-1">
                    {validationErrors.dates}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ФИО арендатора
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => {
                    updateFormData({ customer_name: e.target.value });
                    // Очищаем ошибку при вводе
                    if (e.target.value.trim()) {
                      setValidationErrors(prev => ({ ...prev, customer_name: null }));
                    }
                  }}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.customer_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.customer_name && (
                  <div className="text-red-600 text-sm mt-1">
                    {validationErrors.customer_name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="11 цифр"
                  required
                />
                {validationErrors.phone && (
                  <div className="text-red-600 text-sm mt-1">
                    {validationErrors.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Цена аренды (₽)
                </label>
                <input
                  type="number"
                  value={formData.rental_price ?? ''}
                  onChange={(e) => updateFormData({ rental_price: e.target.value === '' ? null : Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Не указана"
                  min="0"
                  step="10"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.needs_delivery}
                    onChange={(e) => updateFormData({ needs_delivery: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Нужна доставка</span>
                </label>
              </div>
            </div>

            {!!formData.needs_delivery && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Адрес доставки
                  </label>
                  <textarea
                    value={formData.delivery_address}
                    onChange={(e) => updateFormData({ delivery_address: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Цена доставки (₽)
                  </label>
                  <input
                    type="number"
                    value={formData.delivery_price ?? ''}
                    onChange={(e) => updateFormData({ delivery_price: e.target.value === '' ? null : Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Не указана"
                    min="0"
                    step="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Расходы на доставку (₽)
                  </label>
                  <input
                    type="number"
                    value={formData.delivery_costs ?? ''}
                    onChange={(e) => updateFormData({ delivery_costs: e.target.value === '' ? null : Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Не указаны"
                    min="0"
                    step="10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Комментарий
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => updateFormData({ comment: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
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
                ) : rental ? (
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

export default RentalModal;