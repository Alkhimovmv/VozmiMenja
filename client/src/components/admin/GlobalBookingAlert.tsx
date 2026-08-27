import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../../api/admin/bookings';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import type { Booking } from '../../types';

interface GlobalBookingAlertProps {
  enabled?: boolean;
}

export default function GlobalBookingAlert({ enabled = true }: GlobalBookingAlertProps) {
  const { data: bookings = [] } = useAuthenticatedQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: bookingsApi.getAll,
    enabled,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });

  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;
  const openCount = pendingCount + confirmedCount;

  useEffect(() => {
    document.title = pendingCount > 0
      ? `(${pendingCount}) Новые заявки | Возьми меня`
      : 'Админка | Возьми меня';

    return () => {
      document.title = 'Возьми меня';
    };
  }, [pendingCount]);

  if (!enabled || openCount === 0) return null;

  return (
    <div className="flex-shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-2 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-3 w-3 flex-shrink-0">
            {pendingCount > 0 && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
            )}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${pendingCount > 0 ? 'bg-red-500' : 'bg-amber-500'}`} />
          </span>
          <p className="truncate text-sm text-amber-950">
            {pendingCount > 0 && <strong>{pendingCount} новых</strong>}
            {pendingCount > 0 && confirmedCount > 0 && <span>, </span>}
            {confirmedCount > 0 && <strong>{confirmedCount} в работе</strong>}
            <span className="hidden sm:inline"> заявок с сайта</span>
          </p>
        </div>
        <Link
          to="/admin/rentals#site-bookings"
          className="flex-shrink-0 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-800 sm:text-sm"
        >
          Открыть
        </Link>
      </div>
    </div>
  );
}
