'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { FleetShowcase } from '@/components/UI/FleetShowcase';
import { CustomerReviews } from '@/components/UI/CustomerReviews';
import { FaqAccordion } from '@/components/UI/FaqAccordion';
import { HeroBackgroundSlider } from '@/components/home/HeroBackgroundSlider';
import { useLanguage } from '@/lib/LanguageContext';
import { useBookingStore } from '@/lib/store';
import { LocationItem, CategoryItem } from '@/types';
import { TripAdvisorLogo, RepubliqueFrancaiseBadge, TripAdvisorTravellersChoiceCard, TripAdvisorLockupLogo } from '@/components/UI/TrustBadges';
import {
  ShieldCheck,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
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
  originId?: string;
  destinationId?: string;
  distanceKm: number;
  estDurationMinutes: number;
  sedanPriceEur: number;
  economyVanPriceEur?: number;
  businessVanPriceEur?: number;
  minibusPriceEur?: number;
  imageUrl?: string | null;
  h1Heading?: string;
  origin: { shortCode: string; name: string };
  destination: { shortCode: string; name: string };
}

function getRouteImage(slug: string, originCode: string, destCode: string): string {
  if (slug) {
    const cleanSlug = slug.toLowerCase().trim();
    const knownSlugs = [
      'cdg-to-disneyland-paris',
      'orly-to-disneyland-paris',
      'beauvais-to-disneyland-paris',
      'disneyland-to-cdg-airport',
      'disneyland-to-orly-airport',
      'cdg-to-paris-city',
      'orly-to-paris-city',
      'beauvais-to-paris-city',
      'paris-to-cdg-airport',
      'paris-to-orly-airport',
      'paris-to-disneyland',
      'paris-to-versailles',
      'cdg-to-versailles',
      'versailles-to-paris',
      'paris-train-stations-to-disneyland',
      'paris-train-stations-to-paris',
      'paris-to-giverny',
      'cdg-to-giverny',
      'cdg-to-parc-asterix',
      'paris-to-parc-asterix',
      'paris-to-fontainebleau',
      'paris-to-champagne',
      'paris-to-normandy',
      'paris-to-mont-saint-michel',
      'paris-to-loire-valley',
    ];
    if (knownSlugs.includes(cleanSlug)) {
      return `/images/routes_unique/${cleanSlug}.jpg`;
    }
  }

  return '/images/routes_unique/cdg-to-paris-city.jpg';
}

function RouteCardImage({
  src,
  alt,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  fallbackSrc: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100px, 120px"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      unoptimized={currentSrc.startsWith('http')}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}

interface HomePageClientProps {
  locations: LocationItem[];
  categories?: CategoryItem[];
  featuredRoutes: RouteData[];
  defaultFaqs: { question: string; answer: string }[];
  heroSlides?: any[];
  heroIntervalSeconds?: number;
  initialReviews?: any[];
}

export function HomePageClient({
  locations,
  categories,
  featuredRoutes,
  defaultFaqs,
  heroSlides,
  heroIntervalSeconds,
  initialReviews,
}: HomePageClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const store = useBookingStore();

  const handleBookRoute = (route: RouteData) => {
    store.setServiceMode('TRANSFER');
    const orig = locations.find((l) => l.id === route.originId || l.shortCode === route.origin.shortCode) || {
      id: route.originId || `loc-${route.origin.shortCode.toLowerCase()}`,
      name: route.origin.name,
      shortCode: route.origin.shortCode,
      category: 'AIRPORT',
    };
    const dest = locations.find((l) => l.id === route.destinationId || l.shortCode === route.destination.shortCode) || {
      id: route.destinationId || `loc-${route.destination.shortCode.toLowerCase()}`,
      name: route.destination.name,
      shortCode: route.destination.shortCode,
      category: 'CITY_CENTER',
    };
    store.setOrigin(orig as any);
    store.setDestination(dest as any);
    store.setRoutePricing({
      sedan: route.sedanPriceEur,
      economyVan: route.economyVanPriceEur || Math.round(route.sedanPriceEur * 1.3),
      businessVan: route.businessVanPriceEur || Math.round(route.sedanPriceEur * 1.7),
      minibus: route.minibusPriceEur || Math.round(route.sedanPriceEur * 2.5),
    });
    store.setEstimatedKm(route.distanceKm);
    store.setEstimatedDurationMinutes(route.estDurationMinutes);
    store.setIsFixedZoneRate(true, `${route.origin.name} ↔ ${route.destination.name}`);
    router.push('/book');
  };

  return (
    <div className="space-y-16 pb-20 bg-[#FBF9F5] text-navy-900">
      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section className="relative pt-6 lg:pt-12 pb-12 lg:pb-20 overflow-hidden lg:min-h-[620px] flex items-center">
        {/* Dynamic Background Slideshow with Smooth Cross-fade */}
        <HeroBackgroundSlider slides={heroSlides} intervalSeconds={heroIntervalSeconds} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-8">
          {/* Main 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* LEFT COLUMN: HEADLINE & BADGES (Hidden on Mobile/Android, Visible on Desktop) */}
            <div className="hidden lg:block lg:col-span-6 space-y-6 text-white">
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

              {/* TRIPADVISOR TRAVELLERS' CHOICE 2025 AWARD CARD (DESKTOP) */}
              <TripAdvisorTravellersChoiceCard theme="dark" className="mt-4" />
            </div>

            {/* RIGHT COLUMN: BOOKING ENGINE WIDGET */}
            <div className="lg:col-span-6 space-y-4">
              <BookingWidget locations={locations} categories={categories} routes={featuredRoutes as any} />
              
              {/* TRIPADVISOR TRAVELLERS' CHOICE 2025 AWARD CARD (MOBILE / TABLET) */}
              <TripAdvisorTravellersChoiceCard theme="light" className="lg:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SPECS & STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5D7BC]/70 shadow-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center items-center">
          <div className="p-2 space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-amber-500 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-navy-900 text-sm">4.9 / 5</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{t('averageRating')}</div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-navy-900 text-sm">3,444+</div>
            <div className="text-[10px] text-slate-500 font-medium">{t('verifiedReviewsCount')}</div>
          </div>

          {/* OFFICIAL TRIPADVISOR BADGE WITH BRAND LOGO */}
          <div className="p-2 flex flex-col items-center justify-center space-y-1">
            <TripAdvisorLockupLogo className="h-5.5 w-auto" />
            <div className="text-[10px] text-slate-500 font-medium">Ranked #6 Travellers' Choice</div>
          </div>

          {/* OFFICIAL LICENSED COMPANY - RÉPUBLIQUE FRANÇAISE BADGE */}
          <div className="p-2 flex items-center justify-center">
            <RepubliqueFrancaiseBadge variant="compact" />
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-navy-900 text-xs">{t('fixedPricingBadge')}</div>
            <div className="text-[10px] text-slate-500 font-medium">{t('noHiddenFees')}</div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className="font-bold text-navy-900 text-xs">{t('freeChildSeats')}</div>
            <div className="text-[10px] text-slate-500 font-medium">{t('includedAlways')}</div>
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 bg-[#F7F2E7] px-3.5 py-1 rounded-full border border-[#E5D7BC]">
            {t('popularRoutesBadge')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            {t('featuredRoutesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {t('featuredRoutesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRoutes.map((route) => {
            const imgPath = route.imageUrl || getRouteImage(route.slug, route.origin.shortCode, route.destination.shortCode);
            return (
              <div
                key={`${route.id}-${route.imageUrl || 'default'}`}
                onClick={() => router.push(`/transfers/${route.slug}`)}
                className="bg-white border border-[#E5D7BC]/90 hover:border-gold-500 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="flex gap-3 sm:gap-4 items-start">
                  {/* Left: Illustrative Route Picture */}
                  <div className="relative w-24 sm:w-28 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 shadow-xs border border-slate-100">
                    <RouteCardImage
                      src={imgPath}
                      alt={`Transfer from ${route.origin.name} to ${route.destination.name}`}
                      fallbackSrc={getRouteImage(route.slug, route.origin.shortCode, route.destination.shortCode)}
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[9px] font-bold text-white flex items-center gap-1">
                      <Compass className="w-2.5 h-2.5 text-gold-400" />
                      <span>{route.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Right: Route Details & Price */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-navy-900 group-hover:text-gold-700 transition-colors leading-snug">
                        {route.origin.name} to {route.destination.name}
                      </h3>
                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">
                          {formatCurrency(route.sedanPriceEur)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500">
                      Private transfer
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      Door-to-door transfer with free flight delay tracking and child seats.
                    </p>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookRoute(route);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-bold text-slate-500 group-hover:text-gold-700 flex items-center gap-0.5 transition-colors">
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FLEET SHOWCASE */}
      <section id="fleet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FleetShowcase />
      </section>

      {/* CUSTOMER REVIEWS */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomerReviews initialReviews={initialReviews} />
      </section>

      {/* FAQ SECTION */}
      <section id="faqs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 bg-[#F7F2E7] px-3.5 py-1 rounded-full border border-[#E5D7BC]">
            {t('gotQuestions')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            {t('faqsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {t('faqsSubtitle')}
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
              {t('bottomCtaTitle')}
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {t('bottomCtaSubtitle')}
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

