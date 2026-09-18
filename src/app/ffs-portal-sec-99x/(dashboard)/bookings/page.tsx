import { db } from '@/lib/db';
import { BookingStatusSelect } from '@/components/admin/BookingStatusSelect';
import { DeleteBookingButton } from '@/components/admin/DeleteBookingButton';
import {
  CalendarCheck,
  Phone,
  Mail,
  Car,
  Clock,
  Send,
  Plane,
  User,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
            Manage incoming bookings, update chauffeur status, and send WhatsApp driver dispatches.
          </p>
        </div>

        <div className="text-xs font-bold bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-slate-700">
          Total Bookings: <span className="text-brand-600 font-black">{bookings.length}</span>
        </div>
      </div>

      {/* Bookings Data Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Ref & Date</th>
                <th className="p-4">Passenger Contact</th>
                <th className="p-4">Route Details</th>
                <th className="p-4">Vehicle & Specs</th>
                <th className="p-4">Fare & Payment</th>
                <th className="p-4">Status & Dispatch</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {bookings.map((b) => {
                const vehicleLabel =
                  b.vehicleTier === 'SEDAN'
                    ? 'Berline Sedan'
                    : b.vehicleTier === 'BUSINESS_VAN'
                    ? 'VIP Business Van'
                    : b.vehicleTier === 'MINIBUS'
                    ? '16-Pax Minibus'
                    : 'Economy Minivan';

                const whatsappMsg = `FastForward Shuttle Alert! Ref: ${b.bookingRef}%0ACustomer: ${b.customerName} (${b.customerPhone})%0ARoute: ${b.origin?.name || 'Pickup'} -> ${b.destination?.name || 'Dropoff'}%0APickup Date: ${new Date(b.pickupDateTime).toLocaleString()}%0AVehicle: ${vehicleLabel}%0AFare to Collect: ${b.totalFareEur}€`;

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Ref & Date */}
                    <td className="p-4 space-y-1">
                      <div className="font-mono font-black text-brand-600 text-sm">
                        {b.bookingRef}
                      </div>
                      <div className="text-slate-500 font-semibold flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(b.pickupDateTime).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Passenger */}
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                        <User className="w-3.5 h-3.5 text-brand-500" />
                        <span>{b.customerName}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{b.customerPhone}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{b.customerEmail}</span>
                      </div>
                    </td>

                    {/* Route Details */}
                    <td className="p-4 space-y-1 max-w-xs">
                      <div className="font-bold text-slate-900">
                        {b.origin?.shortCode || 'CDG'} → {b.destination?.shortCode || 'DLP'}
                      </div>
                      <div className="text-slate-500 text-[11px] line-clamp-1">
                        Pickup: {b.pickupAddress}
                      </div>
                      <div className="text-slate-500 text-[11px] line-clamp-1">
                        Dropoff: {b.dropoffAddress}
                      </div>
                      {b.flightOrTrainNumber && (
                        <div className="text-emerald-700 text-[10px] font-bold flex items-center gap-1 pt-0.5">
                          <Plane className="w-3 h-3" />
                          <span>Flight/Train #: {b.flightOrTrainNumber}</span>
                        </div>
                      )}
                    </td>

                    {/* Vehicle */}
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-brand-500" />
                        <span>{vehicleLabel}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {b.passengers} Pax, {b.luggageCount} Bags
                      </div>
                      {(b.babySeats > 0 || b.boosterSeats > 0) && (
                        <div className="text-emerald-700 text-[10px] font-bold">
                          Child Seats: {b.babySeats} Baby, {b.boosterSeats} Booster
                        </div>
                      )}
                    </td>

                    {/* Fare */}
                    <td className="p-4">
                      <div className="text-base font-black text-slate-900">
                        {formatCurrency(b.totalFareEur)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        Pay Chauffeur on Arrival
                      </div>
                    </td>

                    {/* Status & Dispatch */}
                    <td className="p-4 space-y-2">
                      <BookingStatusSelect bookingId={b.id} currentStatus={b.status} />

                      {/* WhatsApp Dispatch Button */}
                      <a
                        href={`https://wa.me/?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Chauffeur</span>
                      </a>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <DeleteBookingButton bookingId={b.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
