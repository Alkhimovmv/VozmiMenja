import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../api/admin/bookings';
import { contactLeadsApi } from '../../api/admin/contactLeads';
import { equipmentApi } from '../../api/admin/equipment';
import { officesApi } from '../../api/admin/offices';
import { rentalsApi } from '../../api/admin/rentals';
import RentalModal from '../../components/admin/RentalModal';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { useOffice } from '../../hooks/useOffice';
import type { Booking, ContactLead, CreateRentalDto, Equipment } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const formatLeadSource = (lead: {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}) => {
  if (lead.utmSource) {
    return [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ');
  }

  if (lead.referrer) {
    try {
      return new URL(lead.referrer).hostname.replace(/^www\./, '');
    } catch {
      return lead.referrer;
    }
  }

  return 'Прямой заход';
};

const formatContactSubject = (subject: string) => {
  const labels: Record<string, string> = {
    other: 'Контактная форма',
    'Заказ обратного звонка': 'Обратный звонок',
  };

  return labels[subject] || subject;
};

const formatSourcePage = (sourcePage?: string) => {
  if (!sourcePage) return 'Страница не передана';
  try {
    const url = sourcePage.startsWith('http') ? new URL(sourcePage) : new URL(sourcePage, window.location.origin);
    return url.pathname === '/' ? 'Главная' : url.pathname;
  } catch {
    return sourcePage;
  }
};

const normalizeEquipmentName = (name: string) =>
  name.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');

const formatBookingDateTime = (date: string, time: '10:00' | '20:00') => `${date}T${time}`;

const formatBookingAge = (createdAt: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Не удалось загрузить данные';

export default function SiteBookingsPage() {
  const { currentOfficeId } = useOffice();
  const queryClient = useQueryClient();
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [initialRentalData, setInitialRentalData] = useState<Partial<CreateRentalDto> | null>(null);
  const [convertingBookingId, setConvertingBookingId] = useState<string | null>(null);

  const {
    data: bookings = [],
    isLoading,
    isError: isBookingsError,
    error: bookingsError,
  } = useAuthenticatedQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: bookingsApi.getAll,
    retry: false,
  });
  const {
    data: contactLeads = [],
    isLoading: isContactLeadsLoading,
    isError: isContactLeadsError,
    error: contactLeadsError,
  } = useAuthenticatedQuery<ContactLead[]>({
    queryKey: ['admin-contact-leads'],
    queryFn: contactLeadsApi.getAll,
    retry: false,
  });
  const { data: equipment = [] } = useAuthenticatedQuery<Equipment[]>(['equipment-rental', currentOfficeId], () => equipmentApi.getForRental(currentOfficeId));
  const { data: offices = [] } = useAuthenticatedQuery(['offices'], officesApi.getAll);

  const openBookings = useMemo(
    () => bookings
      .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [bookings]
  );

  const processedCount = bookings.filter((booking) => booking.status === 'completed').length;
  const cancelledCount = bookings.filter((booking) => booking.status === 'cancelled').length;
  const openContactLeads = useMemo(
    () => contactLeads
      .filter((lead) => lead.status === 'pending' || lead.status === 'confirmed')
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [contactLeads]
  );
  const activeCount = openBookings.length + openContactLeads.length;
  const totalCount = bookings.length + contactLeads.length;
  const totalProcessedCount = processedCount + contactLeads.filter((lead) => lead.status === 'completed').length;
  const totalCancelledCount = cancelledCount + contactLeads.filter((lead) => lead.status === 'cancelled').length;

  const createRentalMutation = useMutation({
    mutationFn: rentalsApi.create,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });

      if (convertingBookingId) {
        try {
          await bookingsApi.updateStatus(convertingBookingId, 'completed');
          toast.success('Аренда создана, заявка помечена обработанной');
        } catch {
          toast.error('Аренда создана, но статус заявки не обновился');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setConvertingBookingId(null);
      setInitialRentalData(null);
      setIsRentalModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || 'Не удалось создать аренду');
    },
  });

  const bookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Booking['status'] }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Статус заявки обновлен');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || 'Не удалось обновить заявку');
    },
  });

  const contactLeadStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactLead['status'] }) => contactLeadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-leads'] });
      toast.success('Статус обращения обновлен');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || 'Не удалось обновить обращение');
    },
  });

  const handleCreateRentalFromBooking = (booking: Booking) => {
    const bookingEquipmentName = normalizeEquipmentName(booking.equipment?.name || '');
    const matchedEquipment = bookingEquipmentName ? equipment.find((item) => {
      const adminName = normalizeEquipmentName(item.name);
      return adminName === bookingEquipmentName || adminName.includes(bookingEquipmentName) || bookingEquipmentName.includes(adminName);
    }) : undefined;
    const equipmentInstances = matchedEquipment
      ? [{ equipment_id: Number(matchedEquipment.id), instance_number: 1 }]
      : [];
    const sourceText = [
      `Заявка с сайта #${booking.id}`,
      booking.equipment?.name ? `Оборудование на сайте: ${booking.equipment.name}` : '',
      booking.comment ? `Комментарий клиента: ${booking.comment}` : '',
      `Страница: ${formatSourcePage(booking.sourcePage)}`,
      `Источник: ${formatLeadSource(booking)}`,
    ].filter(Boolean).join('\n');

    setConvertingBookingId(booking.id);
    setInitialRentalData({
      equipment_id: equipmentInstances[0]?.equipment_id || 0,
      equipment_ids: equipmentInstances.map(item => item.equipment_id),
      equipment_instances: equipmentInstances,
      start_date: formatBookingDateTime(booking.startDate, '10:00'),
      end_date: formatBookingDateTime(booking.endDate, '20:00'),
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      needs_delivery: false,
      rental_price: booking.totalPrice,
      delivery_price: null,
      delivery_costs: null,
      source: 'сайт',
      comment: sourceText,
      office_id: currentOfficeId,
    });
    setIsRentalModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Заявки с сайта</h1>
          <p className="mt-1 text-sm text-gray-500">Только заявки, которые пришли через публичный сайт.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold sm:min-w-[360px]">
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-100">
            <div className="text-xl font-black">{activeCount}</div>
            активных
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 ring-1 ring-emerald-100">
            <div className="text-xl font-black">{totalProcessedCount}</div>
            обработано
          </div>
          <div className="rounded-xl bg-gray-50 px-3 py-2 text-gray-700 ring-1 ring-gray-100">
            <div className="text-xl font-black">{totalCancelledCount}</div>
            отменено
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:p-5">
        {(isBookingsError || isContactLeadsError) && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            {isBookingsError && <p>Бронирования не загрузились: {getErrorMessage(bookingsError)}</p>}
            {isContactLeadsError && <p>Обращения contact/callback не загрузились: {getErrorMessage(contactLeadsError)}</p>}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Inbox</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">Новые лиды, которые ждут обработки</h2>
          </div>
          <div className="text-sm font-semibold text-amber-800">
            {activeCount} активных из {totalCount}{isContactLeadsLoading ? ' · обращения загружаются' : ''}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {openBookings.length === 0 && openContactLeads.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-gray-500 shadow-sm ring-1 ring-amber-100">
              Активных заявок с сайта сейчас нет. Новые заявки появятся здесь и в верхнем индикаторе админки.
            </div>
          )}
          {openBookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      booking.status === 'pending' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {booking.status === 'pending' ? 'Новая' : 'В работе'}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      {formatBookingAge(booking.createdAt)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{booking.equipment?.name || booking.equipmentId}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Клиент: {booking.customerName}</span>
                    <a href={`tel:${booking.customerPhone}`} className="font-semibold text-indigo-600 hover:underline">{booking.customerPhone}</a>
                    <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                    <span className="font-semibold text-gray-900">{booking.totalPrice}₽</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                      Источник: {formatLeadSource(booking)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                      Страница: {formatSourcePage(booking.sourcePage)}
                    </span>
                  </div>
                  {booking.comment && (
                    <p className="mt-2 max-w-3xl whitespace-pre-wrap rounded-xl bg-amber-50 px-3 py-2 text-sm text-gray-700 ring-1 ring-amber-100">
                      {booking.comment}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleCreateRentalFromBooking(booking)}
                    disabled={createRentalMutation.isPending || bookingStatusMutation.isPending}
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Создать аренду
                  </button>
                  {booking.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => bookingStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                      disabled={bookingStatusMutation.isPending}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      В работу
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => bookingStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                      disabled={bookingStatusMutation.isPending}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Обработана
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => bookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                    disabled={bookingStatusMutation.isPending}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Отменить
                  </button>
                </div>
              </div>
            </div>
          ))}

          {openContactLeads.map((lead) => (
            <div key={`contact-${lead.id}`} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      lead.status === 'pending' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {lead.status === 'pending' ? 'Новое обращение' : 'В работе'}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      {formatBookingAge(lead.createdAt)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{formatContactSubject(lead.subject)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Клиент: {lead.name}</span>
                    <a href={`tel:${lead.phone}`} className="font-semibold text-indigo-600 hover:underline">{lead.phone}</a>
                    {lead.email && <a href={`mailto:${lead.email}`} className="font-semibold text-indigo-600 hover:underline">{lead.email}</a>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                      Источник: {formatLeadSource(lead)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                      Страница: {formatSourcePage(lead.sourcePage)}
                    </span>
                  </div>
                  <p className="mt-2 max-w-3xl whitespace-pre-wrap rounded-xl bg-amber-50 px-3 py-2 text-sm text-gray-700 ring-1 ring-amber-100">
                    {lead.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {lead.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => contactLeadStatusMutation.mutate({ id: lead.id, status: 'confirmed' })}
                      disabled={contactLeadStatusMutation.isPending}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      В работу
                    </button>
                  )}
                  {lead.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => contactLeadStatusMutation.mutate({ id: lead.id, status: 'completed' })}
                      disabled={contactLeadStatusMutation.isPending}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Обработана
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => contactLeadStatusMutation.mutate({ id: lead.id, status: 'cancelled' })}
                    disabled={contactLeadStatusMutation.isPending}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Отменить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RentalModal
        isOpen={isRentalModalOpen}
        onClose={() => {
          setIsRentalModalOpen(false);
          setInitialRentalData(null);
          setConvertingBookingId(null);
        }}
        onSubmit={(data) => createRentalMutation.mutate({ ...data, office_id: currentOfficeId } as CreateRentalDto)}
        rental={null}
        initialData={initialRentalData}
        equipment={equipment}
        offices={offices}
        defaultOfficeId={currentOfficeId}
      />
    </div>
  );
}
