import { db } from '@/lib/db';
import Link from 'next/link';
import { Route as RouteIcon, PlusCircle, MapPin, Edit3, Globe } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminRoutesPage() {
  const routes = await db.route.findMany({
    orderBy: { isFeatured: 'desc' },
    include: {
      origin: true,
      destination: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5D7BC] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Route Fares & SEO Editor
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage dynamic route pricing tables, meta titles, descriptions, and dynamic FAQs.
          </p>
        </div>

        <Link
          href="/ffs-portal-sec-99x/routes/new"
          className="px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Route</span>
        </Link>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routes.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-[#E5D7BC]/90 rounded-3xl p-6 shadow-sm space-y-4 hover:border-gold-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-600 font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-navy-900">
                      {r.origin.name} → {r.destination.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      /transfers/{r.slug}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    r.isFeatured
                      ? 'bg-[#F7F2E7] text-gold-800 border border-[#E5D7BC]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {r.isFeatured ? 'FEATURED' : 'STANDARD'}
                </span>
              </div>

              {/* Fares Bar */}
              <div className="grid grid-cols-4 gap-2 bg-[#F5F3ED] p-3 rounded-2xl border border-[#E5D7BC]/60 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">Sedan</div>
                  <div className="font-bold text-navy-900">{formatCurrency(r.sedanPriceEur)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">Van (8)</div>
                  <div className="font-bold text-gold-700">{formatCurrency(r.economyVanPriceEur)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">VIP Van</div>
                  <div className="font-bold text-navy-900">{formatCurrency(r.businessVanPriceEur)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">Minibus</div>
                  <div className="font-bold text-navy-900">{formatCurrency(r.minibusPriceEur)}</div>
                </div>
              </div>

              {/* SEO Specs */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-500 font-medium line-clamp-1">
                  <span className="font-bold text-slate-700">SEO Title:</span> {r.metaTitle}
                </div>
                <div className="text-slate-500 font-medium line-clamp-1">
                  <span className="font-bold text-slate-700">Distance:</span> {r.distanceKm} km (~{r.estDurationMinutes} mins)
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <Link
                href={`/transfers/${r.slug}`}
                target="_blank"
                className="text-slate-600 hover:text-navy-900 font-bold flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>View Live SEO Page</span>
              </Link>

              <Link
                href={`/ffs-portal-sec-99x/routes/${r.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-gold-400" />
                <span>Edit Fares & Content</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

