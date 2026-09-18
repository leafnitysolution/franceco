'use client';

import { useTransition } from 'react';
import { updateBookingStatusAction } from '@/lib/actions/bookings';

interface BookingStatusSelectProps {
  bookingId: string;
  currentStatus: string;
}

export function BookingStatusSelect({ bookingId, currentStatus }: BookingStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      disabled={isPending}
      defaultValue={currentStatus}
      onChange={(e) => {
        const newStatus = e.target.value as any;
        startTransition(async () => {
          await updateBookingStatusAction(bookingId, newStatus);
        });
      }}
      className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border focus:outline-none transition-all ${
        currentStatus === 'CONFIRMED'
          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
          : currentStatus === 'COMPLETED'
          ? 'bg-blue-50 border-blue-300 text-blue-800'
          : currentStatus === 'CANCELLED'
          ? 'bg-red-50 border-red-300 text-red-800'
          : 'bg-amber-50 border-amber-300 text-amber-800'
      }`}
    >
      <option value="PENDING">PENDING</option>
      <option value="CONFIRMED">CONFIRMED</option>
      <option value="COMPLETED">COMPLETED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}
