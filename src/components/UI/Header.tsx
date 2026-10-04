'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import {
  PARIS_AIRPORT_ROUTES,
  DISNEYLAND_ROUTES,
  VERSAILLES_ROUTES,
  TRAIN_STATION_ROUTES,
  EXCURSIONS_ROUTES,
} from '@/lib/data/navigationRoutes';

interface HeaderProps {
  routes?: any[];
}

export function Header({ routes }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const pathname = usePathname();

  const isHomeActive = pathname === '/';
  const isRatesActive = pathname === '/our-rates';
  const isParisTransfersActive = pathname.startsWith('/transfers') && !pathname.includes('disneyland');
  const isDisneyTransfersActive = pathname.includes('disneyland');
  const isToursActive = pathname.startsWith('/tours');
  const isMoreActive = ['/about-us', '/contact-us', '/reviews', '/faqs'].includes(pathname);

  const hasDynamicRoutes = Boolean(routes && routes.length > 0);

  function formatCleanRouteLabel(r: any) {
    const cleanName = (name?: string, shortCode?: string) => {
      if (!name) return shortCode || '';
      return name
        .replace('Paris Charles de Gaulle Airport', 'CDG Airport')
        .replace('Paris Orly Airport', 'Orly Airport')
        .replace('Paris Beauvais Tillé Airport', 'Beauvais Airport')
        .replace('Disneyland Paris Hotels & Parks', 'Disneyland Paris')
        .replace('Paris City Center (All Arrondissements)', 'Paris City')
        .replace('Gare du Nord & Paris Train Stations', 'Gare du Nord')
        .replace('Fondation Claude Monet Giverny & Village', 'Giverny (Monet)')
        .replace('Château de Versailles & Hotels', 'Versailles Palace')
        .replace('Château de Fontainebleau & Barbizon', 'Fontainebleau')
        .replace('Champagne Region & Reims Cathedral', 'Champagne & Reims')
        .replace('Normandy D-Day Beaches & Caen', 'Normandy Beaches')
        .replace('Mont Saint-Michel Abbey & Bay', 'Mont Saint-Michel')
        .replace('Loire Valley Châteaux & Amboise', 'Loire Valley Castles');
    };

    const from = cleanName(r.origin?.name, r.origin?.shortCode);
    const to = cleanName(r.destination?.name, r.destination?.shortCode);
    return `${from} → ${to}`;
  }

  const airportRoutes = hasDynamicRoutes
    ? routes!
        .filter((r) => r.origin?.category === 'AIRPORT' || r.destination?.category === 'AIRPORT')
        .map((r) => ({
          label: formatCleanRouteLabel(r),
          slug: r.slug,
        }))
    : PARIS_AIRPORT_ROUTES;

  const disneylandRoutes = hasDynamicRoutes
    ? routes!
        .filter(
          (r) =>
            r.origin?.shortCode === 'DLP' ||
            r.destination?.shortCode === 'DLP' ||
            r.slug.includes('disneyland')
        )
        .map((r) => ({
          label: formatCleanRouteLabel(r),
          slug: r.slug,
        }))
    : DISNEYLAND_ROUTES;

  const versaillesRoutes = hasDynamicRoutes
    ? routes!
        .filter(
          (r) =>
            r.origin?.shortCode === 'VERS' ||
            r.destination?.shortCode === 'VERS' ||
            r.slug.includes('versailles')
        )
        .map((r) => ({
          label: formatCleanRouteLabel(r),
          slug: r.slug,
        }))
    : VERSAILLES_ROUTES;

  const trainStationRoutes = hasDynamicRoutes
    ? routes!
        .filter(
          (r) =>
            r.origin?.category === 'TRAIN_STATION' ||
            r.destination?.category === 'TRAIN_STATION' ||
            r.slug.includes('station') ||
            r.slug.includes('gare')
        )
        .map((r) => ({
          label: formatCleanRouteLabel(r),
          slug: r.slug,
        }))
    : TRAIN_STATION_ROUTES;

  const excursionsRoutes = hasDynamicRoutes
    ? routes!
        .filter(
          (r) =>
            r.origin?.category === 'PALACE' ||
            r.destination?.category === 'PALACE' ||
            ['giverny', 'asterix', 'fontainebleau', 'champagne', 'normandy', 'mont-saint-michel', 'loire'].some((k) => r.slug.includes(k))
        )
        .map((r) => ({
          label: formatCleanRouteLabel(r),
          slug: r.slug,
        }))
    : EXCURSIONS_ROUTES;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-sm transition-all duration-300">
      {/* Top Notice Banner - Deep Midnight Navy */}
      <div className="bg-[#0B192C] text-white text-[11px] font-bold py-2 px-4 text-center tracking-wider flex items-center justify-center gap-2 relative overflow-hidden uppercase">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
        <span className="text-slate-200">{t('topBanner')}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Header Logo - FRANCE GO */}
          <Link href="/" className="flex items-center gap-3 group shrink-0 py-1">
            <div className="relative h-16 sm:h-20 w-56 sm:w-72 hover:scale-[1.02] transition-transform duration-200">
              <Image
                src="/images/logo.png"
                alt="FRANCE GO - VIP Transfers & Tours"
                fill
                priority
                sizes="(max-width: 768px) 240px, 300px"
                className="object-contain object-left scale-105"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 shrink-0">
            <Link
              href="/"
              className={`text-xs sm:text-sm font-bold transition-all duration-200 ${
                isHomeActive
                  ? 'text-[#C5A059] font-black border-b-2 border-[#C5A059] pb-0.5'
                  : 'text-slate-800 hover:text-[#C5A059]'
              }`}
            >
              {t('home')}
            </Link>

            {/* PARIS TRANSFERS DROPDOWN */}
            <div className="relative group py-6">
              <button
                className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 ${
                  isParisTransfersActive
                    ? 'text-[#C5A059] font-black'
                    : 'text-slate-800 group-hover:text-[#C5A059]'
                }`}
              >
                <span>{t('parisTransfers')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C5A059] transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 w-[580px] bg-white border border-[#E5D7BC] rounded-3xl p-6 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#9E7B3B] mb-3">
                    Paris Airport Transfers
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    {airportRoutes.map((r) => (
                      <li key={r.slug}>
                        <Link href={`/transfers/${r.slug}`} className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                          {r.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#9E7B3B] mb-3">
                      Versailles Transfers
                    </h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      {versaillesRoutes.map((r) => (
                        <li key={r.slug}>
                          <Link href={`/transfers/${r.slug}`} className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                            {r.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {trainStationRoutes.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-[#9E7B3B] mb-3">
                        Train Station Transfers
                      </h4>
                      <ul className="space-y-2 text-xs font-semibold text-slate-700">
                        {trainStationRoutes.map((r) => (
                          <li key={r.slug}>
                            <Link href={`/transfers/${r.slug}`} className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                              {r.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DISNEYLAND TRANSFERS DROPDOWN */}
            <div className="relative group py-6">
              <button
                className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 ${
                  isDisneyTransfersActive
                    ? 'text-[#C5A059] font-black'
                    : 'text-slate-800 group-hover:text-[#C5A059]'
                }`}
              >
                <span>{t('disneylandTransfers')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C5A059] transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 w-[450px] bg-white border border-[#E5D7BC] rounded-3xl p-6 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50 space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#9E7B3B]">
                  Disneyland Paris Transfers
                </h4>
                <ul className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-700">
                  {disneylandRoutes.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/transfers/${r.slug}`} className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TOURS DROPDOWN */}
            <div className="relative group py-6">
              <button
                className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 ${
                  isToursActive
                    ? 'text-[#C5A059] font-black'
                    : 'text-slate-800 group-hover:text-[#C5A059]'
                }`}
              >
                <span>{t('tours')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C5A059] transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 w-64 bg-white border border-[#E5D7BC] rounded-2xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50 space-y-1">
                <h4 className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#9E7B3B]">
                  Excursions & Day Trips
                </h4>
                {excursionsRoutes.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/transfers/${r.slug}`}
                    className="block px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#F7F2E7] hover:text-[#9E7B3B] transition-all duration-150"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* TRANSFER RATES */}
            <Link
              href="/our-rates"
              className={`text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1 hover:-translate-y-0.5 shrink-0 ${
                isRatesActive
                  ? 'text-[#C5A059] font-black border-b-2 border-[#C5A059] pb-0.5'
                  : 'text-slate-800 hover:text-[#C5A059]'
              }`}
            >
              <span>{t('transferRates')}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            </Link>

            {/* MORE DROPDOWN */}
            <div className="relative group py-6">
              <button
                className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 ${
                  isMoreActive
                    ? 'text-[#C5A059] font-black'
                    : 'text-slate-800 group-hover:text-[#C5A059]'
                }`}
              >
                <span>{t('more')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C5A059] transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full right-0 w-[540px] bg-white border border-[#E5D7BC] rounded-3xl p-6 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 z-50 grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#9E7B3B] mb-3">
                    {t('company')}
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    <li>
                      <Link href="/about-us" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        {t('aboutUs')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/#services" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        Our Services
                      </Link>
                    </li>
                    <li>
                      <Link href="/#fleet" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        Our Fleet
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#9E7B3B] mb-3">
                    {t('support')}
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    <li>
                      <Link href="/reviews" className="hover:text-[#C5A059] font-black text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        {t('reviews')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact-us" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        {t('contactUs')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/faqs" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        {t('faqs')}
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#9E7B3B] mb-3">
                    Legal & Policies
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    <li>
                      <Link href="/terms-and-conditions" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/cancellation-policy" className="hover:text-[#C5A059] hover:translate-x-1 transition-all duration-150 block py-1">
                        Cancellation Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>

          {/* Right Action Bar: Language Selector & Gold Book Button */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguageSelector />

            <a
              href="#booking-widget"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] text-slate-900 font-black text-xs uppercase tracking-wider hover:brightness-105 hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-900/10"
            >
              <span>BOOK NOW</span>
            </a>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#F5F2EA] text-slate-800 hover:text-slate-900 border border-[#E5D7BC] transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5D7BC] bg-white px-4 pt-4 pb-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-slate-900 hover:text-[#C5A059] py-2 border-b border-slate-100"
          >
            {t('home')}
          </Link>

          <div className="space-y-2 border-b border-slate-100 pb-3">
            <div className="text-xs font-black text-[#9E7B3B] uppercase">{t('support')} & {t('reviews')}</div>
            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-black text-[#C5A059] py-1"
            >
              {t('reviews')}
            </Link>
            <Link
              href="/about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-800 py-1"
            >
              {t('aboutUs')}
            </Link>
            <Link
              href="/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-800 py-1"
            >
              {t('contactUs')}
            </Link>
            <Link
              href="/faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-slate-800 py-1"
            >
              {t('faqs')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
