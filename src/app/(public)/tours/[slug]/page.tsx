import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { db } from '@/lib/db';
import { MapPin, Clock, ShieldCheck, CheckCircle2, Star, Sparkles } from 'lucide-react';

export const revalidate = 60;

interface TourPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const TOURS_DATA: Record<string, any> = {
  'paris-city-tour': {
    title: 'Paris City Sightseeing Private Tour by Chauffeur',
    subtitle: 'Discover the Eiffel Tower, Louvre Museum, Arc de Triomphe, and Notre-Dame in luxury private comfort.',
    heroImage: '/images/france_transfer_hero.jpg',
    duration: '4 Hours or 8 Hours Full Day',
    priceEur: 220,
    overview: 'Experience the magic of Paris without the exhaustion of walking or fighting for taxis. Our private luxury chauffeur tour takes you directly to the iconic landmarks of Paris with flexible stopovers for photos and exploration.',
    highlights: [
      'Personal Chauffeur with local Parisian knowledge',
      'Door-to-door hotel pickup and drop-off in Paris',
      'Flexible itinerary tailored to your group preferences',
      'Complimentary bottled water and Wi-Fi on board',
      'Complimentary child seats for family tours',
    ],
  },
  'france-day-trips': {
    title: 'Private France Day Trips & Excursions',
    subtitle: 'Day trips from Paris to Champagne Region, Normandy D-Day Beaches, or Mont Saint-Michel.',
    heroImage: '/images/hero_disney_shuttle.jpg',
    duration: '10 to 12 Hours Day Trip',
    priceEur: 450,
    overview: 'Escape the city and venture into the romantic countryside of France. From world-famous Champagne vineyards in Reims to historical battlefields of Normandy, enjoy a seamless day trip with a dedicated private driver.',
    highlights: [
      'Direct private transfer to regional France destinations',
      'Custom departure time from your Paris hotel',
      'Generous waiting time at attractions and vineyards',
      'Luxury Minivan or Sedan with panoramic views',
    ],
  },
  'outside-paris-tours': {
    title: 'Tours Outside Paris (Versailles, Giverny & Fontainebleau)',
    subtitle: 'Half-day and full-day private excursions to royal châteaux and Impressionist gardens.',
    heroImage: '/images/meet_greet_driver.jpg',
    duration: '6 Hours Excursion',
    priceEur: 280,
    overview: 'Explore the grand Palace of Versailles, Monet’s Gardens at Giverny, or the medieval Château de Fontainebleau with stress-free private transport.',
    highlights: [
      'Skip the crowded trains and ticket queues',
      'Comfortable private van for up to 8 passengers',
      'Round-trip transportation with waiting chauffeur',
      'Fixed pricing with all tolls and fuel included',
    ],
  },
};

export default async function TourDetailPage({ params }: TourPageProps) {
  const { slug } = await params;
  const tour = TOURS_DATA[slug];

  if (!tour) {
    notFound();
  }

  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-16 pb-20 bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 bg-slate-900 text-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src={tour.heroImage}
            alt={tour.title}
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/95 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="space-y-3 pt-4 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>PRIVATE TOUR & EXCURSION</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {tour.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {tour.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-200 pt-2">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>{tour.duration}</span>
              </span>

              <span className="flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-400/30 text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>From {tour.priceEur}€ Private Vehicle</span>
              </span>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="max-w-5xl mx-auto">
            <BookingWidget locations={locations} />
          </div>
        </div>
      </section>

      {/* OVERVIEW & HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Tour Overview
            </h2>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium shadow-sm">
              <p>{tour.overview}</p>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight pt-2">
              Key Tour Highlights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tour.highlights.map((h: string, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tour Pricing Card */}
          <div className="bg-white p-6 rounded-3xl border border-brand-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Private Tour Package</h3>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-700 font-semibold">Duration:</span>
                <span className="text-slate-900 font-bold">{tour.duration}</span>
              </div>

              <div className="flex justify-between items-center bg-[#F7F2E7] p-3 rounded-xl border border-[#E5D7BC]">
                <span className="text-slate-900 font-bold">Private Vehicle Fare:</span>
                <span className="text-brand-600 font-black text-base">{tour.priceEur}€</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center font-semibold pt-1">
              ✓ Door-to-door hotel pickup & drop-off included.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
