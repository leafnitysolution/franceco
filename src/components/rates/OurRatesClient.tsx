'use client';

import { useState } from 'react';
import { useBookingStore } from '@/lib/store';
import { ArrowRight, ArrowRightLeft, Car, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

interface OurRatesClientProps {
  locations: any[];
  initialRoutes: any[];
}

export function OurRatesClient({ locations, initialRoutes }: OurRatesClientProps) {
  const [selectedFromId, setSelectedFromId] = useState<string>('');
  const [selectedToId, setSelectedToId] = useState<string>('');
  const { openModal, setOrigin, setDestination } = useBookingStore();
  const { t } = useLanguage();

  // Smart Filter: exact match first, or partial match if no exact match
  const exactRoutes = initialRoutes.filter((r) => {
    const matchFrom = !selectedFromId || r.originId === selectedFromId;
    const matchTo = !selectedToId || r.destinationId === selectedToId;
    return matchFrom && matchTo;
  });

  // If user selected both From and To, but no exact route exists, find routes with either location
  const partialRoutes =
    exactRoutes.length === 0 && (selectedFromId || selectedToId)
      ? initialRoutes.filter((r) => r.originId === selectedFromId || r.destinationId === selectedToId)
      : [];

  const displayRoutes = exactRoutes.length > 0 ? exactRoutes : partialRoutes;
  const isFiltered = Boolean(selectedFromId || selectedToId);

  return (
    <div className="space-y-10">
      {/* Separate FROM and TO Filter Toolbar Card */}
      <div className="bg-white border border-[#E5D7BC] rounded-3xl p-6 sm:p-7 shadow-xl max-w-4xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* FROM SELECTOR */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
              FROM (Pickup Location)
            </label>
            <select
              value={selectedFromId}
              onChange={(e) => setSelectedFromId(e.target.value)}
              className="w-full bg-[#F5F3ED] border border-[#E5D7BC] rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-navy-900 focus:outline-none focus:border-gold-500 cursor-pointer"
            >
              <option value="">All Pickup Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-2 flex justify-center pb-1">
            <button
              type="button"
              onClick={() => {
                const temp = selectedFromId;
                setSelectedFromId(selectedToId);
                setSelectedToId(temp);
              }}
              title="Swap From & To"
              className="w-10 h-10 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] text-gold-600 hover:bg-gold-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* TO SELECTOR */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
              TO (Dropoff Location)
            </label>
            <select
              value={selectedToId}
              onChange={(e) => setSelectedToId(e.target.value)}
              className="w-full bg-[#F5F3ED] border border-[#E5D7BC] rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-navy-900 focus:outline-none focus:border-gold-500 cursor-pointer"
            >
              <option value="">All Dropoff Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filter Button */}
        {isFiltered && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setSelectedFromId('');
                setSelectedToId('');
              }}
              className="text-xs font-bold text-gold-700 hover:text-gold-800 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Reset Search / View All Fares</span>
            </button>
          </div>
        )}
      </div>

      {/* Rates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayRoutes.map((route) => {
          const sedanOneWay = route.sedanPriceEur;
          const sedanRoundTrip = route.sedanPriceEur * 2;

          const vanOneWay = route.economyVanPriceEur;
          const vanRoundTrip = route.economyVanPriceEur * 2;

          const vipOneWay = route.businessVanPriceEur;
          const vipRoundTrip = route.businessVanPriceEur * 2;

          const minibusOneWay = route.minibusPriceEur;
          const minibusRoundTrip = route.minibusPriceEur * 2;

          return (
            <div
              key={route.id}
              className="bg-white border border-[#E5D7BC]/90 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
            >
              {/* Header Info */}
              <div className="space-y-4">
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('from')}
                  </div>
                  <div className="font-serif text-lg font-bold text-navy-900 line-clamp-1">
                    {route.origin?.name || 'Pickup Location'}
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                    TO
                  </div>
                  <div className="font-serif text-lg font-bold text-gold-700 line-clamp-1">
                    {route.destination?.name || 'Dropoff Location'}
                  </div>
                </div>

                {/* PAX Price Breakdown Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 px-1">
                    <span>PAX</span>
                    <span className="text-center">ONE WAY</span>
                    <span className="text-right">ROUND TRIP</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs font-semibold text-slate-800 px-2 py-2 bg-[#F5F3ED] rounded-xl border border-[#E5D7BC]/40">
                    <span>1 – 3 Pax (Sedan)</span>
                    <span className="text-center text-navy-900 font-bold">{sedanOneWay}€</span>
                    <span className="text-right text-gold-700 font-extrabold">{sedanRoundTrip}€</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs font-semibold text-slate-800 px-2 py-2 bg-[#F7F2E7] rounded-xl border border-[#E5D7BC]">
                    <span>1 – 8 Pax (Van)</span>
                    <span className="text-center text-navy-900 font-bold">{vanOneWay}€</span>
                    <span className="text-right text-gold-700 font-extrabold">{vanRoundTrip}€</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs font-semibold text-slate-800 px-2 py-2 bg-[#F5F3ED] rounded-xl border border-[#E5D7BC]/40">
                    <span>1 – 7 Pax (VIP Van)</span>
                    <span className="text-center text-navy-900 font-bold">{vipOneWay}€</span>
                    <span className="text-right text-gold-700 font-extrabold">{vipRoundTrip}€</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs font-semibold text-slate-800 px-2 py-2 bg-[#F5F3ED] rounded-xl border border-[#E5D7BC]/40">
                    <span>1 – 16 Pax (Minibus)</span>
                    <span className="text-center text-navy-900 font-bold">{minibusOneWay}€</span>
                    <span className="text-right text-gold-700 font-extrabold">{minibusRoundTrip}€</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setOrigin(route.originId);
                  setDestination(route.destinationId);
                  openModal();
                }}
                className="w-full py-3.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Reserve Transfer Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* No Exact Route Notice shifted BELOW the cards grid */}
      {isFiltered && exactRoutes.length === 0 && (
        <div className="bg-[#F7F2E7] border border-[#E5D7BC] rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto text-center space-y-4 shadow-sm mt-8">
          <div className="w-12 h-12 bg-white rounded-full border border-[#E5D7BC] flex items-center justify-center mx-auto text-gold-600">
            <Car className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-navy-900">
              No Pre-Set Fixed Route for this exact pair
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
              We provide private chauffeur transfers between ANY locations in France! You can book by distance (€2.0/km) or by hour (€65/h) using our instant booking engine.
            </p>
          </div>
          <button
            onClick={() => {
              const fromLoc = locations.find((l) => l.id === selectedFromId);
              const toLoc = locations.find((l) => l.id === selectedToId);
              if (fromLoc) setOrigin(fromLoc);
              if (toLoc) setDestination(toLoc);
              openModal();
            }}
            className="px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>Book Custom Distance Transfer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

