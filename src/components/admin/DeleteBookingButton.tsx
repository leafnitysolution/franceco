'use client';

import { useTransition } from 'react';
import { deleteBookingAction } from '@/lib/actions/bookings';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteBookingButtonProps {
  bookingId: string;
}

export function DeleteBookingButton({ bookingId }: DeleteBookingButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm('Are you sure you want to delete this booking reservation?')) {
          startTransition(async () => {
            await deleteBookingAction(bookingId);
          });
        }
      }}
      title="Delete Booking"
      className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors border border-slate-200 disabled:opacity-50"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
