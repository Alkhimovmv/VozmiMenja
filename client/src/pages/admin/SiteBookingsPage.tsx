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
import { getApiErrorMessage } from '../../lib/apiError';
import { buildRentalFromBooking, formatLeadSource, formatSourcePage } from '../../lib/adminLeadConversion';

const formatContactSubject = (subject: string) => {
  const labels: Record<string, string> = {
    other: 'Контактная форма',
    'Заказ обратного звонка': 'Обратный звонок',
  };

  return labels[subject] || subject;
};

const extractBookingContext = (comment?: string) => {
  if (!comment) {
    return { scenario: null as string | null, managerHint: null as string | null, customerNote: null as string | null };
  }

  const lines = comment.split('\n').map((line) => line.trim()).filter(Boolean);
  const scenarioLine = lines.find((line) => line.toLowerCase().startsWith('сценарий:'));
  const managerLine = lines.find((line) => line.toLowerCase().startsWith('подсказка менеджеру:'));
  const rest = lines.filter((line) => line !== scenarioLine && line !== managerLine).join('\n');

  return {
    scenario: scenarioLine ? scenarioLine.replace(/^сценарий:\s*/i, '') : null,
    managerHint: managerLine ? managerLine.replace(/^подсказка менеджеру:\s*/i, '') : null,
    customerNote: rest || (scenarioLine || managerLine ? null : comment),
  };
};

const formatBookingAge = (createdAt: string) => {
  const normalizedCreatedAt = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(createdAt)
    ? `${createdAt.replace(' ', 'T')}Z`
    : createdAt;
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(normalizedCreatedAt).getTime()) / 60000));
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
};

const getBookingSortTime = (createdAt: string) => {
  const normalizedCreatedAt = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(createdAt)
    ? `${createdAt.replace(' ', 'T')}Z`
    : createdAt;
  return new Date(normalizedCreatedAt).getTime();
};

const formatBookingDate = (date: string) => {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return date;
  return `${match[3]}.${match[2]}.${match[1]}`;
};

const formatBookingPeriod = (booking: Booking) => {
  const start = `${formatBookingDate(booking.startDate)} ${booking.startTime || '10:00'}`;
  const end = `${formatBookingDate(booking.endDate)} ${booking.endTime || '10:00'}`;
  return `${start} — ${end}`;
};

const copyTextToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Не удалось загрузить данные';

export default function SiteBookingsPage() {
  const { currentOfficeId } = useOffice();
  const queryClient = useQueryClient();
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [initialRentalData, setInitialRentalData] = useState<Partial<CreateRentalDto> | null>(null);
  const [convertingBookingId, setConvertingBookingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');

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
        return getBookingSortTime(b.createdAt) - getBookingSortTime(a.createdAt);
      }),
    [bookings]
  );
  const archivedBookings = useMemo(
    () => bookings
      .filter((booking) => booking.status === 'completed' || booking.status === 'cancelled')
      .sort((a, b) => getBookingSortTime(b.createdAt) - getBookingSortTime(a.createdAt)),
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
        return getBookingSortTime(b.createdAt) - getBookingSortTime(a.createdAt);
      }),
    [contactLeads]
  );
  const archivedContactLeads = useMemo(
    () => contactLeads
      .filter((lead) => lead.status === 'completed' || lead.status === 'cancelled')
      .sort((a, b) => getBookingSortTime(b.createdAt) - getBookingSortTime(a.createdAt)),
    [contactLeads]
  );
  const activeCount = openBookings.length + openContactLeads.length;
  const totalCount = bookings.length + contactLeads.length;
  const totalProcessedCount = processedCount + contactLeads.filter((lead) => lead.status === 'completed').length;
  const totalCancelledCount = cancelledCount + contactLeads.filter((lead) => lead.status === 'cancelled').length;
  const visibleBookings = viewMode === 'active' ? openBookings : archivedBookings;
  const visibleContactLeads = viewMode === 'active' ? openContactLeads : archivedContactLeads;
  const visibleCount = visibleBookings.length + visibleContactLeads.length;

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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось создать аренду'));
    },
  });

  const bookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Booking['status'] }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Статус заявки обновлен');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось обновить заявку'));
    },
  });

  const contactLeadStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactLead['status'] }) => contactLeadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-leads'] });
      toast.success('Статус обращения обновлен');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось обновить обращение'));
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: bookingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Заявка удалена');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось удалить заявку'));
    },
  });

  const deleteContactLeadMutation = useMutation({
    mutationFn: contactLeadsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-leads'] });
      toast.success('Обращение удалено');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось удалить обращение'));
    },
  });

  const handleCreateRentalFromBooking = async (booking: Booking) => {
    setConvertingBookingId(booking.id);
    const targetOfficeId = booking.officeId || currentOfficeId;
    try {
      const officeEquipment = targetOfficeId === currentOfficeId
        ? equipment
        : await equipmentApi.getForRental(targetOfficeId);
      setInitialRentalData(buildRentalFromBooking(booking, officeEquipment as Equipment[], targetOfficeId, window.location.origin));
      setIsRentalModalOpen(true);
    } catch {
      setInitialRentalData(buildRentalFromBooking(booking, [], targetOfficeId, window.location.origin));
      setIsRentalModalOpen(true);
      toast.error('Не удалось загрузить оборудование офиса заявки — открыл без автоподбора');
    }
  };

  const handleCopyReply = async (text: string) => {
    try {
      await copyTextToClipboard(text);
      toast.success('Номер скопирован');
    } catch {
      toast.error('Не удалось скопировать номер');
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    if (!window.confirm(`Удалить заявку ${booking.customerName}? Это действие нельзя отменить.`)) return;
    deleteBookingMutation.mutate(booking.id);
  };

  const handleDeleteContactLead = (lead: ContactLead) => {
    if (!window.confirm(`Удалить обращение ${lead.name}? Это действие нельзя отменить.`)) return;
    deleteContactLeadMutation.mutate(lead.id);
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
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode('active')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              viewMode === 'active' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-amber-100 hover:bg-amber-50'
            }`}
          >
            Активные ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('archive')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              viewMode === 'archive' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-amber-100 hover:bg-amber-50'
            }`}
          >
            Обработанные и отменённые ({totalProcessedCount + totalCancelledCount})
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {visibleCount === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-gray-500 shadow-sm ring-1 ring-amber-100">
              {viewMode === 'active'
                ? 'Активных заявок с сайта сейчас нет. Новые заявки появятся здесь и в верхнем индикаторе админки.'
                : 'Обработанных или отменённых заявок пока нет.'}
            </div>
          )}
          {visibleBookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
              {(() => {
                const bookingContext = extractBookingContext(booking.comment);
                return (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
	                      booking.status === 'pending'
                          ? 'bg-blue-50 text-blue-700'
                          : booking.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-emerald-50 text-emerald-700'
	                    }`}>
	                      {booking.status === 'pending'
                          ? 'Новая'
                          : booking.status === 'confirmed'
                          ? 'В работе'
                          : booking.status === 'completed'
                          ? 'Обработана'
                          : 'Отменена'}
	                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      {formatBookingAge(booking.createdAt)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{booking.equipment?.name || booking.equipmentId}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Клиент: {booking.customerName}</span>
                    <a href={`tel:${booking.customerPhone}`} className="font-semibold text-indigo-600 hover:underline">{booking.customerPhone}</a>
                    <span>{formatBookingPeriod(booking)}</span>
                    <span className="font-semibold text-gray-900">{booking.totalPrice}₽</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                      Источник: {formatLeadSource(booking)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                      Страница: {formatSourcePage(booking.sourcePage)}
                    </span>
                    {booking.preferredContact && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                        Связь: {booking.preferredContact}
                      </span>
                    )}
                    {booking.deliveryMethod && (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-700">
                        {booking.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}
                      </span>
                    )}
                    {booking.officeName && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                        Офис: {booking.officeName}
                      </span>
                    )}
                  </div>
                  {booking.deliveryAddress && (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {booking.deliveryAddress && (
                        <div className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900 ring-1 ring-violet-100">
                          <span className="block text-xs font-bold uppercase tracking-wide text-violet-600">Адрес доставки</span>
                          {booking.deliveryAddress}
                        </div>
                      )}
                    </div>
                  )}
                  {(bookingContext.scenario || bookingContext.managerHint) && (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {bookingContext.scenario && (
                        <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-900 ring-1 ring-indigo-100">
                          <span className="block text-xs font-bold uppercase tracking-wide text-indigo-500">Сценарий</span>
                          {bookingContext.scenario}
                        </div>
                      )}
                      {bookingContext.managerHint && (
                        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100">
                          <span className="block text-xs font-bold uppercase tracking-wide text-emerald-600">Проверить комплект</span>
                          {bookingContext.managerHint}
                        </div>
                      )}
                    </div>
                  )}
                  {bookingContext.customerNote && (
                    <p className="mt-2 max-w-3xl whitespace-pre-wrap rounded-xl bg-amber-50 px-3 py-2 text-sm text-gray-700 ring-1 ring-amber-100">
                      {bookingContext.customerNote}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`tel:${booking.customerPhone}`}
                      className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Позвонить
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyReply(booking.customerPhone)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Скопировать номер
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {viewMode === 'active' && (
                    <button
                      type="button"
                      onClick={() => void handleCreateRentalFromBooking(booking)}
                      disabled={createRentalMutation.isPending || bookingStatusMutation.isPending}
                      className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      Создать аренду
                    </button>
                  )}
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
                  {viewMode === 'active' && (
                    <button
                      type="button"
                      onClick={() => bookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                      disabled={bookingStatusMutation.isPending}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Отменить
                    </button>
                  )}
                  {viewMode === 'archive' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBooking(booking)}
                      disabled={deleteBookingMutation.isPending}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
                );
              })()}
            </div>
          ))}

          {visibleContactLeads.map((lead) => (
            <div key={`contact-${lead.id}`} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
	                      lead.status === 'pending'
                          ? 'bg-blue-50 text-blue-700'
                          : lead.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-emerald-50 text-emerald-700'
	                    }`}>
	                      {lead.status === 'pending'
                          ? 'Новое обращение'
                          : lead.status === 'confirmed'
                          ? 'В работе'
                          : lead.status === 'completed'
                          ? 'Обработано'
                          : 'Отменено'}
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Позвонить
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyReply(lead.phone)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Скопировать номер
                    </button>
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Email
                      </a>
                    )}
                  </div>
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
                  {viewMode === 'active' && (
                    <button
                      type="button"
                      onClick={() => contactLeadStatusMutation.mutate({ id: lead.id, status: 'cancelled' })}
                      disabled={contactLeadStatusMutation.isPending}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Отменить
                    </button>
                  )}
                  {viewMode === 'archive' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteContactLead(lead)}
                      disabled={deleteContactLeadMutation.isPending}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  )}
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
        onSubmit={(data) => createRentalMutation.mutate(data as CreateRentalDto)}
        rental={null}
        initialData={initialRentalData}
        equipment={equipment}
        offices={offices}
        defaultOfficeId={currentOfficeId}
      />
    </div>
  );
}
