import Image from 'next/image';
import { db } from '@/lib/db';
import { Metadata } from 'next';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { FleetShowcase } from '@/components/UI/FleetShowcase';
import { CustomerReviews } from '@/components/UI/CustomerReviews';
import { FaqAccordion } from '@/components/UI/FaqAccordion';
import { ShieldCheck, Clock, MapPin, CheckCircle2, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

export const revalidate = 60;

interface RoutePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await db.route.findUnique({
    where: { slug },
  });

  const title = route?.metaTitle || `${formatSlugToTitle(slug)} | FastForward Shuttle`;
  const description =
    route?.metaDescription ||
    `Book door-to-door private transfers for ${formatSlugToTitle(
      slug
    )}. Fixed pricing, free child seats, flight tracking, and pay on arrival.`;

  return {
    title,
    description,
  };
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  await ensureLocationsSeeded();

  let route = await db.route.findUnique({
    where: { slug },
    include: {
      origin: true,
      destination: true,
    },
  });

  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  const categories = await db.locationCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  // Customized details per hub location category
  let distanceKm = 45;
  let estDurationMinutes = 45;
  let sedanPriceEur = 70;
  let economyVanPriceEur = 90;
  let businessVanPriceEur = 120;
  let minibusPriceEur = 180;
  let heroImage = '/images/france_transfer_hero.jpg';
  let terminalGuide = 'Your driver will meet you inside the arrivals hall holding a sign with your name.';

  if (slug.includes('beauvais')) {
    distanceKm = 110;
    estDurationMinutes = 80;
    sedanPriceEur = 130;
    economyVanPriceEur = 160;
    businessVanPriceEur = 190;
    minibusPriceEur = 260;
    heroImage = '/images/meet_greet_driver.jpg';
    terminalGuide = 'Paris Beauvais Airport has 2 main terminals. Your driver greets you right outside your terminal arrivals exit with a name card.';
  } else if (slug.includes('orly')) {
    distanceKm = 48;
    estDurationMinutes = 50;
    sedanPriceEur = 90;
    economyVanPriceEur = 110;
    businessVanPriceEur = 140;
    minibusPriceEur = 200;
    heroImage = '/images/fleet_economy_van.jpg';
    terminalGuide = 'For Orly 1, 2, 3 or 4, your personal chauffeur greets you right at the arrivals exit gate following luggage collection.';
  } else if (slug.includes('disneyland')) {
    heroImage = '/images/hero_disney_shuttle.jpg';
  } else if (slug.includes('cdg-to-paris') || slug.includes('paris-to-cdg')) {
    distanceKm = 30;
    estDurationMinutes = 40;
    sedanPriceEur = 65;
    economyVanPriceEur = 85;
    businessVanPriceEur = 110;
    minibusPriceEur = 170;
    heroImage = '/images/france_transfer_hero.jpg';
    terminalGuide = 'At CDG Terminals 1, 2A-2G, and 3, your driver waits directly at the arrival gates with your passenger name board.';
  } else if (slug.includes('versailles')) {
    distanceKm = 25;
    estDurationMinutes = 35;
    sedanPriceEur = 75;
    economyVanPriceEur = 95;
    businessVanPriceEur = 125;
    minibusPriceEur = 190;
    heroImage = '/images/fleet_business_van.jpg';
    terminalGuide = 'Door-to-door pickup directly at your hotel lobby or palace main entrance gates.';
  }

  // Dynamic route fallback
  if (!route) {
    const titleText = formatSlugToTitle(slug);
    route = {
      id: 'dynamic-fallback',
      slug,
      originId: locations[0]?.id || '',
      destinationId: locations[1]?.id || '',
      origin: { name: titleText.split(' To ')[0] || 'Pickup Location', shortCode: 'DEP' },
      destination: { name: titleText.split(' To ')[1] || 'Dropoff Location', shortCode: 'ARR' },
      distanceKm,
      estDurationMinutes,
      sedanPriceEur,
      economyVanPriceEur,
      businessVanPriceEur,
      minibusPriceEur,
      h1Heading: `Transfers from ${titleText}`,
      metaTitle: `${titleText} | Fixed Fares from ${sedanPriceEur}€`,
      metaDescription: `Book your private shuttle for ${titleText}. Door-to-door luxury transport, free child seats, zero hidden fees.`,
      overviewText: `Pre-book a ${titleText} transfer with fixed pricing, flight-aware pickup, and direct drop-off at your hotel, apartment, or train station in the city.`,
      faqs: JSON.stringify([
        {
          question: `How do I meet my driver for ${titleText}?`,
          answer: terminalGuide,
        },
        {
          question: 'Are there extra charges for luggage or delayed flights?',
          answer: 'No! All prices are 100% fixed per vehicle. Flight tracking and luggage assistance are fully included.',
        },
      ]),
      isActive: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }

  const currentRoute = route!;

  let faqs = [];
  try {
    faqs = typeof currentRoute.faqs === 'string' ? JSON.parse(currentRoute.faqs) : currentRoute.faqs;
  } catch (e) {
    faqs = [];
  }

  return (
    <div className="space-y-16 pb-20 bg-[#FBF9F5] text-navy-900">
      {/* 2-COLUMN SPLIT LAYOUT */}
      <section className="pt-8 pb-12 bg-[#FBF9F5] border-b border-[#E5D7BC]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: TITLE, FEATURED IMAGE BANNER & SUMMARY */}
            <div className="lg:col-span-7 space-y-6 pt-2">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold bg-white px-3.5 py-1.5 rounded-full border border-[#E5D7BC] shadow-sm w-fit">
                <span>Transfers</span>
                <span>/</span>
                <span className="text-slate-700">{currentRoute.origin?.name}</span>
                <span>→</span>
                <span className="text-gold-700 font-bold">{currentRoute.destination?.name}</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight leading-tight">
                {currentRoute.h1Heading}
              </h1>

              {/* Metric Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-navy-900">
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E5D7BC] shadow-sm">
                  <MapPin className="w-4 h-4 text-gold-600" />
                  <span>Distance: {currentRoute.distanceKm} km</span>
                </span>

                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E5D7BC] shadow-sm">
                  <Clock className="w-4 h-4 text-gold-600" />
                  <span>Est. Time: ~{currentRoute.estDurationMinutes} Mins</span>
                </span>

                <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Fixed Rate from {formatCurrency(currentRoute.sedanPriceEur)}</span>
                </span>
              </div>

              {/* FEATURED ROUTE IMAGE BANNER */}
              <div className="relative w-full h-[280px] sm:h-[360px] rounded-3xl overflow-hidden shadow-xl border border-[#E5D7BC] group">
                <Image
                  src={heroImage}
                  alt={currentRoute.h1Heading}
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white font-bold text-xs flex items-center justify-between">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/30">
                    Door-to-door Private Shuttle
                  </span>
                  <span className="bg-gold-600 text-white px-3 py-1 rounded-lg font-bold uppercase tracking-wider shadow-md">
                    Pay Chauffeur on Arrival
                  </span>
                </div>
              </div>

              {/* Sub-text Overview */}
              <p className="text-sm sm:text-base text-navy-900 font-medium leading-relaxed bg-white p-5 rounded-2xl border border-[#E5D7BC] shadow-sm">
                {currentRoute.overviewText}
              </p>
            </div>

            {/* RIGHT COLUMN: COMPACT RESERVATION ENGINE */}
            <div className="lg:col-span-5 sticky top-24">
              <BookingWidget
                compact={true}
                locations={locations}
                categories={categories as any}
                defaultOriginId={currentRoute.originId}
                defaultDestinationId={currentRoute.destinationId}
                defaultSedanPrice={currentRoute.sedanPriceEur}
                defaultEconomyVanPrice={currentRoute.economyVanPriceEur}
                defaultBusinessVanPrice={currentRoute.businessVanPriceEur}
              />
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED ARTICLE CONTENT & FARES BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Article Body */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-navy-900 tracking-tight">
                About this Transfer Route ({currentRoute.origin?.shortCode || 'DEP'} → {currentRoute.destination?.shortCode || 'ARR'})
              </h2>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5D7BC] text-sm text-navy-900 leading-relaxed space-y-4 font-medium shadow-sm">
                <p className="text-base font-semibold text-navy-900">
                  Traveling between {currentRoute.origin?.name} and {currentRoute.destination?.name} can often be taxing with heavy bags or young children. Our private transfer service guarantees a smooth journey without waiting in taxi lines or transferring between public train stations.
                </p>
              </div>
            </div>

            {/* Terminal / Location Arrival Guide */}
            <div className="bg-[#F7F2E7] border border-[#E5D7BC] rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-navy-900 text-base">
                <AlertCircle className="w-5 h-5 text-gold-600 shrink-0" />
                <span>Driver Meet & Greet Instructions</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                {terminalGuide} We track your arrival schedule in real-time so even if your arrival is delayed, your driver will be waiting for you.
              </p>
            </div>

            {/* Private Transfer vs Public Transport Comparison Box */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-navy-900 tracking-tight">
                Why Book Private Transfer over Train / Public Taxi?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>FastForward Private Shuttle</span>
                  </div>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Direct door-to-door hotel delivery
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      100% Fixed price confirmed in advance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Free baby & booster seats fitted
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Meet & Greet sign at terminal arrivals
                    </li>
                  </ul>
                </div>

                <div className="bg-white border border-[#E5D7BC] rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-navy-900 font-bold text-base">
                    <HelpCircle className="w-5 h-5 text-slate-500 shrink-0" />
                    <span>RER Train / Metered Taxis</span>
                  </div>
                  <ul className="space-y-2 text-xs font-medium text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Requires carrying luggage through stairs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Unpredictable meters in traffic jams
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      No child seats provided in public cabs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Long terminal queues after flights
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Route Rate Summary Side Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5D7BC] space-y-6 shadow-xl sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-base font-bold text-navy-900">Fixed Fares for this Route</h3>
              <Sparkles className="w-4 h-4 text-gold-600" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-[#F5F3ED] p-3.5 rounded-xl border border-[#E5D7BC]/40">
                <span className="text-slate-700 font-semibold">Berline Sedan (1–3 Pax):</span>
                <span className="text-navy-900 font-extrabold text-base">{formatCurrency(currentRoute.sedanPriceEur)}</span>
              </div>

              <div className="flex justify-between items-center bg-[#F7F2E7] p-3.5 rounded-xl border border-[#E5D7BC]">
                <span className="text-navy-900 font-bold">Economy Van (1–8 Pax):</span>
                <span className="text-gold-700 font-extrabold text-base">{formatCurrency(currentRoute.economyVanPriceEur)}</span>
              </div>

              <div className="flex justify-between items-center bg-[#F5F3ED] p-3.5 rounded-xl border border-[#E5D7BC]/40">
                <span className="text-slate-700 font-semibold">VIP Business Van (1–7 Pax):</span>
                <span className="text-navy-900 font-extrabold text-base">{formatCurrency(currentRoute.businessVanPriceEur)}</span>
              </div>

              <div className="flex justify-between items-center bg-[#F5F3ED] p-3.5 rounded-xl border border-[#E5D7BC]/40">
                <span className="text-slate-700 font-semibold">16-Pax Minibus:</span>
                <span className="text-navy-900 font-extrabold text-base">{formatCurrency(currentRoute.minibusPriceEur || 180)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center font-semibold pt-1">
              ✓ All prices are fixed per vehicle. No meter, no extra toll fees.
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomerReviews />
      </section>

      {/* FLEET SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FleetShowcase
          sedanPrice={currentRoute.sedanPriceEur}
          economyVanPrice={currentRoute.economyVanPriceEur}
          businessVanPrice={currentRoute.businessVanPriceEur}
        />
      </section>

      {/* DYNAMIC ROUTE FAQS */}
      {faqs && faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FaqAccordion faqs={faqs} title={`Frequently Asked Questions (${currentRoute.origin?.shortCode || 'DEP'} → ${currentRoute.destination?.shortCode || 'ARR'})`} />
        </section>
      )}
    </div>
  );
}
