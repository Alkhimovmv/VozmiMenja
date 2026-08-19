import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOffice } from '../../hooks/useOffice';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { equipmentApi } from '../../api/admin/equipment';
import { rentalsApi } from '../../api/admin/rentals';
import type { RentalAvailabilityResult, RentalEquipment } from '../../types/admin';
import CustomDateTimeInput from '../../components/admin/CustomDateTimeInput';

const toDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildDefaultStart = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return toDateTimeLocal(date);
};

const buildDefaultEnd = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 25);
  return toDateTimeLocal(date);
};

const SchedulePage: React.FC = () => {
  const { currentOfficeId, currentOffice } = useOffice();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(buildDefaultStart);
  const [endDate, setEndDate] = useState(buildDefaultEnd);
  const [submittedFilters, setSubmittedFilters] = useState<{
    equipmentId: number;
    startDate: string;
    endDate: string;
    officeId?: number;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: equipment = [], isLoading: isEquipmentLoading } = useAuthenticatedQuery<RentalEquipment[]>(
    ['equipment-rental', currentOfficeId],
    () => equipmentApi.getForRental(currentOfficeId)
  );

  useEffect(() => {
    if (equipment.length === 0) {
      setSelectedEquipmentId('');
      return;
    }

    if (!equipment.some(item => item.id === selectedEquipmentId)) {
      setSelectedEquipmentId(equipment[0].id);
    }
  }, [equipment, selectedEquipmentId]);

  const selectedEquipment = useMemo(
    () => equipment.find(item => item.id === selectedEquipmentId),
    [equipment, selectedEquipmentId]
  );

  const availabilityQuery = useQuery<RentalAvailabilityResult>({
    queryKey: ['rentals', 'availability', submittedFilters],
    queryFn: () => rentalsApi.checkAvailability(
      submittedFilters!.equipmentId,
      submittedFilters!.startDate,
      submittedFilters!.endDate,
      submittedFilters!.officeId
    ),
    enabled: submittedFilters !== null,
    retry: false,
  });

  const handleCheck = () => {
    if (!selectedEquipmentId) {
      setFormError('Выберите оборудование для проверки.');
      return;
    }

    if (!startDate || !endDate) {
      setFormError('Укажите начало и конец периода.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setFormError('Дата окончания должна быть позже даты начала.');
      return;
    }

    setFormError(null);
    setSubmittedFilters({
      equipmentId: selectedEquipmentId,
      startDate,
      endDate,
      officeId: currentOfficeId,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Параметры проверки</h2>
            <p className="mt-1 text-sm text-gray-500">
              Офис: {currentOffice?.name || `#${currentOfficeId}`}. Проверка использует те же правила доступности, что и создание аренды.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Оборудование</label>
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  disabled={isEquipmentLoading || equipment.length === 0}
                >
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} шт.)
                    </option>
                  ))}
                </select>
              </div>

              <CustomDateTimeInput
                label="Начало аренды"
                value={startDate}
                onChange={setStartDate}
                required
              />

              <CustomDateTimeInput
                label="Конец аренды"
                value={endDate}
                onChange={setEndDate}
                required
              />

              {selectedEquipment && (
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{selectedEquipment.name}</div>
                  <div className="mt-1">Всего экземпляров: {selectedEquipment.quantity}</div>
                  {selectedEquipment.description && (
                    <div className="mt-2 line-clamp-3 text-xs text-gray-500">{selectedEquipment.description}</div>
                  )}
                </div>
              )}

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <button
                type="button"
                onClick={handleCheck}
                disabled={isEquipmentLoading || equipment.length === 0}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Проверить слот
              </button>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            {!submittedFilters && (
              <div className="flex h-full min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Пока нет результата</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Запустите проверку, и здесь появится статус слота, свободные экземпляры и пересекающиеся аренды.
                  </p>
                </div>
              </div>
            )}

            {submittedFilters && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedEquipment?.name || 'Результат проверки'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      {formatDateTime(submittedFilters.startDate)} - {formatDateTime(submittedFilters.endDate)}
                    </p>
                  </div>
                  {availabilityQuery.data && (
                    <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                      availabilityQuery.data.available
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {availabilityQuery.data.available ? 'Есть свободный слот' : 'Свободных слотов нет'}
                    </div>
                  )}
                </div>

                {availabilityQuery.isLoading && (
                  <div className="flex min-h-[280px] items-center justify-center">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      Проверяем доступность оборудования...
                    </div>
                  </div>
                )}

                {availabilityQuery.isError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {availabilityQuery.error instanceof Error ? availabilityQuery.error.message : 'Не удалось проверить слот.'}
                  </div>
                )}

                {availabilityQuery.data && (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <div className="text-sm text-gray-500">Всего экземпляров</div>
                        <div className="mt-2 text-3xl font-semibold text-gray-900">{availabilityQuery.data.total_instances}</div>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <div className="text-sm text-emerald-700">Свободны сейчас</div>
                        <div className="mt-2 text-3xl font-semibold text-emerald-800">{availabilityQuery.data.available_instances.length}</div>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-4">
                        <div className="text-sm text-amber-700">Пересечений найдено</div>
                        <div className="mt-2 text-3xl font-semibold text-amber-800">{availabilityQuery.data.conflicting_rentals.length}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-5">
                      <h3 className="text-base font-semibold text-gray-900">Свободные экземпляры</h3>
                      {availabilityQuery.data.available_instances.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {availabilityQuery.data.available_instances.map((instanceNumber) => (
                            <span
                              key={instanceNumber}
                              className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800"
                            >
                              Экземпляр #{instanceNumber}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-gray-500">На выбранный период все экземпляры заняты.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-5">
                      <h3 className="text-base font-semibold text-gray-900">Пересекающиеся аренды</h3>
                      {availabilityQuery.data.conflicting_rentals.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-500">Для этой позиции нет пересечений в выбранном диапазоне.</p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {availabilityQuery.data.conflicting_rentals.map((rental) => (
                            <div
                              key={`${rental.id}-${rental.instance_number ?? 1}`}
                              className="rounded-2xl bg-gray-50 p-4"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{rental.customer_name}</div>
                                  <div className="mt-1 text-sm text-gray-600">{rental.customer_phone}</div>
                                </div>
                                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                  Экземпляр #{rental.instance_number ?? 1}
                                </div>
                              </div>
                              <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                                <div>Период: {formatDateTime(rental.start_date)} - {formatDateTime(rental.end_date)}</div>
                                <div>Статус: {rental.status}</div>
                                {rental.rental_price !== null && <div>Цена аренды: {rental.rental_price} ₽</div>}
                                {rental.comment && <div>Комментарий: {rental.comment}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
