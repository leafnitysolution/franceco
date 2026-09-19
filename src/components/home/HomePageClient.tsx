'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { FleetShowcase } from '@/components/UI/FleetShowcase';
import { CustomerReviews } from '@/components/UI/CustomerReviews';
import { FaqAccordion } from '@/components/UI/FaqAccordion';
import { useLanguage } from '@/lib/LanguageContext';
import { LocationItem, CategoryItem } from '@/types';
import {
  ShieldCheck,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Users,
  Plane,
  Compass,
  Bus,
  Star,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RouteData {
  id: string;
  slug: string;
  distanceKm: number;
  estDurationMinutes: number;
  sedanPriceEur: number;
  h1Heading: string;
  origin: { shortCode: string; name: string };
  destination: { shortCode: string; name: string };
}

interface HomePageClientProps {
  locations: LocationItem[];
  categories?: CategoryItem[];
  featuredRoutes: RouteData[];
  defaultFaqs: { question: string; answer: string }[];
}

export function HomePageClient({ locations, categories, featuredRoutes, defaultFaqs }: HomePageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-16 pb-20 bg-[#FBF9F5] text-navy-900">
      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section className="relative pt-12 pb-20 overflow-hidden min-h-[620px] flex items-center">
        {/* Background Image & Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/france_transfer_hero.jpg"
            alt="Paris Chauffeur Transfer Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B192C]/55 via-[#0B192C]/30 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-8">
          {/* Main 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* LEFT COLUMN: HEADLINE & BADGES */}
            <div className="lg:col-span-6 space-y-6 text-white">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-gold-300 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span className="uppercase tracking-wider">{t('heroBadge')}</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] drop-shadow-md">
                  {t('heroTitle')}
                </h1>

                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow-sm">
                  {t('heroDesc')}
                </p>
              </div>

              {/* TRUST HIGHLIGHT BULLETS */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{t('fixedPricing')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{t('noDepositRequired')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{t('payOnArrival')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{t('bilingualDrivers')}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BOOKING ENGINE WIDGET */}
            <div className="lg:col-span-6">
              <BookingWidget locations={locations} categories={categories} />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SPECS & STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5D7BC]/70 shadow-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
          <div className="p-2 space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-amber-500 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-navy-900 text-sm">4.9 / 5</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Average Rating</div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-navy-900 text-sm">3,444+</div>
            <div className="text-[10px] text-slate-500 font-medium">Verified Reviews</div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-gold-700 text-xs uppercase tracking-wider">Tripadvisor</div>
            <div className="text-[10px] text-slate-500 font-medium">Travelers' Choice</div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-navy-900 text-xs">Fixed Pricing</div>
            <div className="text-[10px] text-slate-500 font-medium">No hidden fees</div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-navy-900 text-xs">Zero Deposit</div>
            <div className="text-[10px] text-slate-500 font-medium">Pay on arrival</div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-navy-900 text-xs">Free Child Seats</div>
            <div className="text-[10px] text-slate-500 font-medium">Included always</div>
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 bg-[#F7F2E7] px-3.5 py-1 rounded-full border border-[#E5D7BC]">
            POPULAR ROUTES & FARES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            Popular Transfer Routes & Fixed Fares
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Instant fixed pricing for top airport and Disneyland Paris private transfers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRoutes.map((route) => (
            <Link
              key={route.id}
              href={`/transfers/${route.slug}`}
              className="bg-white border border-[#E5D7BC]/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-600 group-hover:scale-105 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gold-800 bg-[#F7F2E7] px-2.5 py-1 rounded-md border border-[#E5D7BC]">
                  From {formatCurrency(route.sedanPriceEur)}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-navy-900 group-hover:text-gold-600 transition-colors">
                  {route.origin.shortCode} → {route.destination.shortCode}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {route.origin.name} → {route.destination.name}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-gold-600" />
                  <span>{route.distanceKm} km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold-600" />
                  <span>~{route.estDurationMinutes} mins</span>
                </div>
              </div>

              <div className="pt-2 text-xs font-bold text-gold-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FLEET SHOWCASE */}
      <section id="fleet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FleetShowcase />
      </section>

      {/* CUSTOMER REVIEWS */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomerReviews />
      </section>

      {/* FAQ SECTION */}
      <section id="faqs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 bg-[#F7F2E7] px-3.5 py-1 rounded-full border border-[#E5D7BC]">
            GOT QUESTIONS?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Everything you need to know about our airport pickup process, zero deposit policy, and child seat options.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <FaqAccordion faqs={defaultFaqs} />
        </div>
      </section>

      {/* BOTTOM MIDNIGHT NAVY CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B192C] text-white rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Your Paris Journey Starts Here
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Book your private chauffeur today with fixed pricing, zero deposit, and payment on arrival.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
            >
              BOOK YOUR TRANSFER
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

