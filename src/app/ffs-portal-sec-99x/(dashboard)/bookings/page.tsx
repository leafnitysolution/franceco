import { db } from '@/lib/db';
import { AdminBookingsClient } from '@/components/admin/AdminBookingsClient';

export const revalidate = 0;

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      origin: true,
      destination: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Transfer Reservations & Dispatch
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage incoming bookings, search, filter, export to Excel/CSV, and send WhatsApp driver dispatches.
          </p>
        </div>

        <div className="text-xs font-bold bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-slate-700">
          Total Bookings: <span className="text-slate-900 font-black">{bookings.length}</span>
        </div>
      </div>

      {/* Interactive Bookings Table Component */}
      <AdminBookingsClient initialBookings={bookings as any} />
    </div>
  );
}
