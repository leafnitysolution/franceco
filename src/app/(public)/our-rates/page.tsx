import { db } from '@/lib/db';
import { OurRatesClient } from '@/components/rates/OurRatesClient';
import { Sparkles } from 'lucide-react';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

export const revalidate = 60;

export const metadata = {
  title: 'Our Rates & Transfer Prices | FastForward Shuttle',
  description:
    'Transparent fixed pricing for private airport transfers between CDG, Orly, Beauvais, Disneyland Paris, and Paris City Center. No meters, free child seats.',
};

export default async function OurRatesPage() {
  await ensureLocationsSeeded();

  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  const routes = await db.route.findMany({
    include: {
      origin: true,
      destination: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-navy-900 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F2E7] border border-[#E5D7BC] text-gold-800 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span className="uppercase tracking-wider">TRANSPARENT FIXED PRICING</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-900 tracking-tight">
          Choose your route
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
          Toggle between departures and arrivals, then pick a location to view guaranteed fixed fares.
        </p>
      </div>

      {/* Interactive Rate Filtering & Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <OurRatesClient locations={locations} initialRoutes={routes} />
      </div>
    </div>
  );
}

