'use client';

import Image from 'next/image';
import { Users, Briefcase, Baby, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

interface FleetShowcaseProps {
  sedanPrice?: number;
  economyVanPrice?: number;
  businessVanPrice?: number;
  minibusPrice?: number;
}

export function FleetShowcase({
  sedanPrice = 70,
  economyVanPrice = 90,
  businessVanPrice = 120,
  minibusPrice = 180,
}: FleetShowcaseProps) {
  const { t } = useLanguage();

  const vehicles = [
    {
      id: 'SEDAN',
      name: t('sedanName'),
      tagline: 'Ideal for couples or small families',
      model: 'Peugeot 508, VW Passat or equivalent',
      image: '/images/fleet_sedan.jpg',
      maxPax: 3,
      maxBags: 3,
      price: sedanPrice,
      isPopular: false,
      features: [
        'Door-to-door private service',
        '3 Passengers + 3 Standard Bags',
        'Free Baby or Booster seat on request',
        'Flight delay monitoring included',
        'Cash or card payment on arrival',
      ],
    },
    {
      id: 'ECONOMY_VAN',
      name: t('economyVanName'),
      tagline: 'Most popular choice for Disney family trips',
      model: 'Mercedes-Benz Vito, Renault Trafic',
      image: '/images/fleet_economy_van.jpg',
      maxPax: 8,
      maxBags: 8,
      price: economyVanPrice,
      isPopular: true,
      features: [
        'Up to 8 Passengers + 8 Large Suitcases',
        'Spacious legroom & large trunk space',
        'Free multiple infant & booster seats',
        'Meet & Greet inside terminal with sign',
        'Fixed non-metered price per vehicle',
      ],
    },
    {
      id: 'BUSINESS_VAN',
      name: t('businessVanName'),
      tagline: 'Premium luxury transfer experience',
      model: 'Mercedes-Benz V-Class / EQV Luxury',
      image: '/images/fleet_business_van.jpg',
      maxPax: 7,
      maxBags: 7,
      price: businessVanPrice,
      isPopular: false,
      features: [
        'Leather seats & ambient privacy lighting',
        'Up to 7 Passengers + 7 Luggage items',
        'Bottled water & Wi-Fi on board',
        'Suit-attired executive chauffeur',
        'VIP Terminal arrival priority',
      ],
    },
    {
      id: 'MINIBUS',
      name: t('minibusName'),
      tagline: 'Ideal for large group tours & events',
      model: 'Mercedes-Benz Sprinter Executive',
      image: '/images/service_minibus.jpg',
      maxPax: 16,
      maxBags: 16,
      price: minibusPrice,
      isPopular: false,
      features: [
        'Up to 16 Passengers + 16 Large Suitcases',
        'Reclining seats & climate control',
        'Dedicated tour luggage compartment',
        'Professional licensed group driver',
        'Custom group excursion itineraries',
      ],
    },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 bg-[#F7F2E7] px-3.5 py-1.5 rounded-full border border-[#E5D7BC]">
          {t('fleetCapacityBadge')}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
          {t('fleetTitle')}
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto font-medium">
          {t('fleetSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className={`relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
              v.isPopular
                ? 'bg-white border-2 border-gold-600 shadow-xl shadow-gold-500/10'
                : 'bg-white border border-[#E5D7BC]/80 hover:border-gold-500 shadow-sm'
            }`}
          >
            {v.isPopular && (
              <div className="absolute top-3 right-3 z-10 bg-gold-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('familyFavorite')}</span>
              </div>
            )}

            <div>
              <div className="relative h-44 w-full bg-slate-100 border-b border-slate-200">
                <Image
                  src={v.image}
                  alt={v.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-navy-900">{v.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{v.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-500 font-medium">{t('from')}</div>
                    <div className="text-xl font-extrabold text-navy-900">
                      {formatCurrency(v.price)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="flex items-center gap-1 bg-[#F5F3ED] border border-[#E5D7BC]/60 px-2 py-0.5 rounded-lg text-navy-900 font-medium text-[11px]">
                    <Users className="w-3 h-3 text-gold-600" />
                    <span>Max {v.maxPax} Pax</span>
                  </span>
                  <span className="flex items-center gap-1 bg-[#F5F3ED] border border-[#E5D7BC]/60 px-2 py-0.5 rounded-lg text-navy-900 font-medium text-[11px]">
                    <Briefcase className="w-3 h-3 text-gold-600" />
                    <span>Max {v.maxBags} Bags</span>
                  </span>
                  <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-emerald-700 font-bold text-[11px]">
                    <Baby className="w-3 h-3 text-emerald-600" />
                    <span>{t('freeSeatsBadge')}</span>
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                  {v.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 bg-[#FBF9F5] border-t border-slate-100">
              <div className="text-[11px] text-slate-500 text-center font-semibold">
                {v.model}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
