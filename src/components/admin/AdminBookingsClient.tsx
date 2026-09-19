'use client';

import React, { useState, useMemo } from 'react';
import { BookingStatusSelect } from '@/components/admin/BookingStatusSelect';
import { DeleteBookingButton } from '@/components/admin/DeleteBookingButton';
import {
  Search,
  Filter,
  Download,
  CheckSquare,
  Square,
  Clock,
  User,
  Phone,
  Mail,
  Car,
  Plane,
  Send,
  Eye,
  X,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface BookingWithDetails {
  id: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDateTime: string | Date;
  vehicleTier: string;
  passengers: number;
  luggageCount: number;
  babySeats: number;
  boosterSeats: number;
  flightOrTrainNumber?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  totalFareEur: number;
  status: string;
  notes?: string | null;
  createdAt: string | Date;
  origin?: { name: string; shortCode: string } | null;
  destination?: { name: string; shortCode: string } | null;
}

interface AdminBookingsClientProps {
  initialBookings: BookingWithDetails[];
}

export function AdminBookingsClient({ initialBookings }: AdminBookingsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeModalBooking, setActiveModalBooking] = useState<BookingWithDetails | null>(null);

  // Filter bookings based on search & filter dropdowns
  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => {
      // Status Filter
      if (statusFilter !== 'ALL' && b.status !== statusFilter) {
        return false;
      }
      // Vehicle Filter
      if (vehicleFilter !== 'ALL' && b.vehicleTier !== vehicleFilter) {
        return false;
      }
      // Search Term Matching
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const matchesRef = b.bookingRef.toLowerCase().includes(query);
        const matchesName = b.customerName.toLowerCase().includes(query);
        const matchesEmail = b.customerEmail.toLowerCase().includes(query);
        const matchesPhone = b.customerPhone.toLowerCase().includes(query);
        const matchesFlight = (b.flightOrTrainNumber || '').toLowerCase().includes(query);
        const matchesOrigin = (b.origin?.name || '').toLowerCase().includes(query);
        const matchesDest = (b.destination?.name || '').toLowerCase().includes(query);
        const matchesPickup = b.pickupAddress.toLowerCase().includes(query);
        const matchesDropoff = b.dropoffAddress.toLowerCase().includes(query);

        return (
          matchesRef ||
          matchesName ||
          matchesEmail ||
          matchesPhone ||
          matchesFlight ||
          matchesOrigin ||
          matchesDest ||
          matchesPickup ||
          matchesDropoff
        );
      }
      return true;
    });
  }, [initialBookings, searchTerm, statusFilter, vehicleFilter]);

  // Checkbox selection logic
  const isAllSelected =
    filteredBookings.length > 0 &&
    filteredBookings.every((b) => selectedIds.includes(b.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBookings.map((b) => b.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Export to CSV / Excel
  const exportToCSV = (bookingsToExport: BookingWithDetails[], filenameSuffix: string) => {
    if (bookingsToExport.length === 0) return;

    const headers = [
      'Booking Ref',
      'Pickup Date & Time',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Flight/Train #',
      'Vehicle Tier',
      'Passengers',
      'Luggage Count',
      'Origin Hub',
      'Destination Hub',
      'Pickup Address',
      'Dropoff Address',
      'Total Fare (€)',
      'Payment Method',
      'Special Notes',
      'Booking Status',
      'Created At',
    ];

    const rows = bookingsToExport.map((b) => [
      `"${b.bookingRef}"`,
      `"${new Date(b.pickupDateTime).toLocaleString()}"`,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.customerEmail.replace(/"/g, '""')}"`,
      `"${b.customerPhone.replace(/"/g, '""')}"`,
      `"${(b.flightOrTrainNumber || 'N/A').replace(/"/g, '""')}"`,
      `"${b.vehicleTier}"`,
      b.passengers,
      b.luggageCount,
      `"${(b.origin?.name || '').replace(/"/g, '""')}"`,
      `"${(b.destination?.name || '').replace(/"/g, '""')}"`,
      `"${b.pickupAddress.replace(/"/g, '""')}"`,
      `"${b.dropoffAddress.replace(/"/g, '""')}"`,
      b.totalFareEur,
      '"Pay Chauffeur on Arrival"',
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      `"${b.status}"`,
      `"${new Date(b.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `FranceGo_Bookings_${filenameSuffix}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Global Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Ref, Name, Email, Phone, Flight #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Export Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Vehicle Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700">
              <Car className="w-3.5 h-3.5 text-slate-400" />
              <span>Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Vehicles</option>
                <option value="SEDAN">SEDAN</option>
                <option value="ECONOMY_VAN">ECONOMY VAN</option>
                <option value="BUSINESS_VAN">BUSINESS VAN</option>
                <option value="MINIBUS">MINIBUS</option>
              </select>
            </div>

            {/* Export Selected Button */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  exportToCSV(
                    filteredBookings.filter((b) => selectedIds.includes(b.id)),
                    `Selected_${selectedIds.length}`
                  )
                }
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Selected ({selectedIds.length})</span>
              </button>
            )}

            {/* Export All Button */}
            <button
              type="button"
              onClick={() => exportToCSV(filteredBookings, 'All')}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export All ({filteredBookings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Data Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-slate-900" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Ref & Date</th>
                <th className="p-4">Passenger Contact</th>
                <th className="p-4">Route & Flight #</th>
                <th className="p-4">Vehicle & Specs</th>
                <th className="p-4">Fare & Payment</th>
                <th className="p-4">Status & Dispatch</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const isSelected = selectedIds.includes(b.id);
                  const vehicleLabel =
                    b.vehicleTier === 'SEDAN'
                      ? 'Berline Sedan'
                      : b.vehicleTier === 'BUSINESS_VAN'
                      ? 'VIP Business Van'
                      : b.vehicleTier === 'MINIBUS'
                      ? '16-Pax Minibus'
                      : 'Economy Minivan';

                  const whatsappMsg = `FastForward Shuttle Alert! Ref: ${b.bookingRef}%0ACustomer: ${b.customerName} (${b.customerPhone})%0ARoute: ${b.origin?.name || 'Pickup'} -> ${b.destination?.name || 'Dropoff'}%0APickup Date: ${new Date(b.pickupDateTime).toLocaleString()}%0AVehicle: ${vehicleLabel}%0AFlight: ${b.flightOrTrainNumber || 'None'}%0AFare to Collect: ${b.totalFareEur}€`;

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(b.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Ref & Date */}
                      <td className="p-4 space-y-1">
                        <div className="font-mono font-black text-slate-900 text-sm">
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
                          <User className="w-3.5 h-3.5 text-slate-500" />
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

                      {/* Route Details & Flight # */}
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
                          <div className="text-emerald-700 text-[11px] font-extrabold flex items-center gap-1 pt-0.5">
                            <Plane className="w-3.5 h-3.5" />
                            <span>Flight/Train: {b.flightOrTrainNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="p-4 space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-slate-500" />
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

                      {/* Actions & Details Trigger */}
                      <td className="p-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => setActiveModalBooking(b)}
                          title="View Full Booking Details & User Notes"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <DeleteBookingButton bookingId={b.id} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No bookings found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {activeModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Booking Specification
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  Ref #{activeModalBooking.bookingRef}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Lead Passenger</span>
                <p className="font-extrabold text-slate-900 text-sm">{activeModalBooking.customerName}</p>
                <p className="text-slate-600 font-semibold">{activeModalBooking.customerPhone}</p>
                <p className="text-slate-600 font-semibold">{activeModalBooking.customerEmail}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Date & Pickup Time</span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {new Date(activeModalBooking.pickupDateTime).toLocaleString()}
                </p>
                <p className="text-slate-600 font-semibold">
                  Vehicle: {activeModalBooking.vehicleTier.replace('_', ' ')}
                </p>
                <p className="text-slate-600 font-semibold">
                  Total Fare: {formatCurrency(activeModalBooking.totalFareEur)}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 col-span-1 sm:col-span-2 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Flight / Train Number</span>
                <p className="font-extrabold text-emerald-800 text-sm flex items-center gap-2">
                  <Plane className="w-4 h-4 text-emerald-600" />
                  <span>{activeModalBooking.flightOrTrainNumber || 'None specified'}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 col-span-1 sm:col-span-2 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Pickup & Dropoff Locations</span>
                <p className="font-extrabold text-slate-900">
                  From: {activeModalBooking.pickupAddress}
                </p>
                <p className="font-extrabold text-slate-900">
                  To: {activeModalBooking.dropoffAddress}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 col-span-1 sm:col-span-2 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Driver Notes & Pickup Sign</span>
                <p className="font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeModalBooking.notes || 'No special notes or pickup sign text provided.'}
                </p>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 col-span-1 sm:col-span-2 space-y-1 text-emerald-900">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Terms & Policy Status</span>
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Confirmed & Accepted Terms, Privacy & 24h Free Cancellation Policy</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalBooking(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
