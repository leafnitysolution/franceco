'use client';

import { useState } from 'react';
import { updateBookingStatusAction } from '@/lib/actions/bookings';
import { BookingStatus } from '@/types';

interface BookingRowActionsProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

export function BookingRowActions({ bookingId, currentStatus }: BookingRowActionsProps) {
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as BookingStatus;
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      await updateBookingStatusAction(bookingId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={status}
      disabled={isUpdating}
      onChange={handleStatusChange}
      className={`bg-slate-900 border text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none ${
        status === 'PENDING'
          ? 'border-amber-500/50 text-amber-400'
          : status === 'CONFIRMED'
          ? 'border-blue-500/50 text-blue-400'
          : status === 'COMPLETED'
          ? 'border-emerald-500/50 text-emerald-400'
          : 'border-rose-500/50 text-rose-400'
      }`}
    >
      <option value="PENDING">PENDING</option>
      <option value="CONFIRMED">CONFIRMED</option>
      <option value="COMPLETED">COMPLETED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}
