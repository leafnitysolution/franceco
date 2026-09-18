import { db } from '@/lib/db';
import Link from 'next/link';
import {
  CalendarCheck,
  Route as RouteIcon,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const totalBookingsCount = await db.booking.count();
  const pendingBookingsCount = await db.booking.count({ where: { status: 'PENDING' } });
  const totalRoutesCount = await db.route.count();

  const recentBookings = await db.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      origin: true,
      destination: true,
    },
  });

  const featuredRoutes = await db.route.findMany({
    take: 4,
    orderBy: { isFeatured: 'desc' },
    include: {
      origin: true,
      destination: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admin Overview & Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time reservation metrics, chauffeur dispatching, and route pricing control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ffs-portal-sec-99x/routes/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Route</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>Total Reservations</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalBookingsCount}</div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active transfer bookings</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>Pending Dispatches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{pendingBookingsCount}</div>
          <div className="text-[11px] text-amber-700 font-bold">Awaiting chauffeur assignment</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>Active Transfer Routes</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600">
              <RouteIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalRoutesCount}</div>
          <div className="text-[11px] text-slate-500 font-bold">SEO landing pages published</div>
        </div>
      </div>

      {/* Grid: Recent Bookings & Quick Route Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Reservations Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Recent Passenger Bookings</h2>
              <p className="text-xs text-slate-500">Latest incoming transfer requests</p>
            </div>
            <Link
              href="/ffs-portal-sec-99x/bookings"
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Date/Time</th>
                  <th className="p-3">Fare</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-brand-600">{b.bookingRef}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.customerName}</div>
                      <div className="text-[10px] text-slate-500">{b.customerPhone}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {b.origin?.shortCode || 'CDG'} → {b.destination?.shortCode || 'DLP'}
                    </td>
                    <td className="p-3 text-slate-600">
                      {new Date(b.pickupDateTime).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {formatCurrency(b.totalFareEur)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Featured Routes Quick Fares */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Managed Routes</h2>
              <p className="text-xs text-slate-500">Live SEO & Fare Control</p>
            </div>
            <Link
              href="/ffs-portal-sec-99x/routes"
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>All Routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {featuredRoutes.map((r) => (
              <div
                key={r.id}
                className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {r.origin.shortCode} → {r.destination.shortCode}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Sedan: {formatCurrency(r.sedanPriceEur)} | Van: {formatCurrency(r.economyVanPriceEur)}
                  </div>
                </div>

                <Link
                  href={`/ffs-portal-sec-99x/routes/${r.id}`}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-brand-500 text-slate-800 font-bold text-[11px] transition-colors"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
