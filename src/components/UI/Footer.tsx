'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Award, Star, ArrowRight, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface FooterProps {
  routes?: any[];
}

export function Footer({ routes }: FooterProps) {
  const { t } = useLanguage();

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

  const transferLinks = hasDynamicRoutes
    ? routes!
        .filter((r) => r.origin?.category !== 'PALACE' && r.destination?.category !== 'PALACE')
        .slice(0, 8)
        .map((r) => ({
          label: formatCleanRouteLabel(r),
          href: `/transfers/${r.slug}`,
        }))
    : [
        { label: 'Paris Airport Transfers', href: '/transfers/cdg-to-paris-city' },
        { label: 'Disneyland Paris Transfers', href: '/transfers/cdg-to-disneyland-paris' },
        { label: 'Orly Airport Transfers', href: '/transfers/orly-to-disneyland-paris' },
        { label: 'Beauvais Airport Transfers', href: '/transfers/beauvais-to-disneyland-paris' },
        { label: 'Versailles Transfers', href: '/transfers/paris-to-versailles' },
      ];

  const tourLinks = hasDynamicRoutes
    ? routes!
        .filter(
          (r) =>
            r.origin?.category === 'PALACE' ||
            r.destination?.category === 'PALACE' ||
            ['giverny', 'asterix', 'fontainebleau', 'champagne', 'normandy', 'mont-saint-michel', 'loire'].some((k) => r.slug.includes(k))
        )
        .slice(0, 8)
        .map((r) => ({
          label: formatCleanRouteLabel(r),
          href: `/transfers/${r.slug}`,
        }))
    : [
        { label: 'Paris to Giverny (Monet Gardens)', href: '/transfers/paris-to-giverny' },
        { label: 'Versailles Palace Excursions', href: '/transfers/paris-to-versailles' },
        { label: 'Normandy Day Trips', href: '/transfers/paris-to-normandy' },
        { label: 'Reims Champagne Tours', href: '/transfers/paris-to-champagne' },
        { label: 'Loire Valley Castles Tour', href: '/transfers/paris-to-loire-valley' },
        { label: 'Mont Saint-Michel Excursions', href: '/transfers/paris-to-mont-saint-michel' },
      ];

  return (
    <footer className="bg-[#0B192C] text-slate-300 pt-16 pb-8 border-t border-[#1E2D42] relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* TOP BRAND & TRUST SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-[#1E2D42] items-start">
          {/* Brand Info & Contact Quick Actions (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-block bg-white rounded-2xl px-4 py-2.5 shadow-md border border-white/20 hover:scale-[1.02] transition-transform self-start"
              >
                <div className="relative h-14 w-52 sm:w-60">
                  <Image
                    src="/images/logo.png"
                    alt="FranceGo - VIP Transfers & Tours"
                    fill
                    className="object-contain object-center scale-105"
                  />
                </div>
              </Link>

              {/* Quick Badge */}
              <div className="inline-flex items-center gap-2 bg-[#132338] border border-gold-500/30 px-3.5 py-1.5 rounded-full text-gold-400 text-xs font-bold self-start">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>{t('officialChauffeurService')}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              {t('footerDesc')}
            </p>

            {/* Quick Contact Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-2xl bg-[#0F1E36] border border-[#1E2D42] flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold-600/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">{t('hotline')}</div>
                  <div className="flex items-center gap-2">
                    <a href="tel:+33781118394" className="font-extrabold text-white hover:text-gold-400 transition-colors">
                      +33 7 81 11 83 94
                    </a>
                    <span className="text-slate-500">•</span>
                    <a href="https://wa.me/33781118394" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] underline">
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0F1E36] border border-[#1E2D42] flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold-600/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Email Dispatch</div>
                  <a href="mailto:projet15df@outlook.fr" className="font-extrabold text-white hover:text-gold-400 transition-colors">
                    projet15df@outlook.fr
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0F1E36] border border-[#1E2D42] flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold-600/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Head Office & Hubs</div>
                  <span className="font-bold text-slate-200">Paris CDG, Orly & DLP</span>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/book"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-gold-950/40 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>{t('planTransferBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact-us"
                className="px-6 py-3.5 rounded-2xl bg-[#132338] hover:bg-gold-600 border border-gold-500/40 text-gold-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-gold-900/20 transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4 text-gold-400 group-hover:text-white" />
                <span>{t('talkToUsBtn')}</span>
              </Link>
            </div>
          </div>

          {/* Awards & Trust Card (Col 4) */}
          <div className="lg:col-span-4 bg-[#0F1E36] border border-[#1E2D42] rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase font-black text-gold-400 tracking-wider">
                {t('awardsAndTrust')}
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                {t('verifiedBadge')}
              </span>
            </div>

            <div className="bg-[#0B192C] border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                  TRIPADVISOR 2026
                </span>
                <div className="text-sm font-serif font-black text-white">
                  Travellers&apos; Choice Award
                </div>
                <p className="text-[11px] text-slate-400 leading-snug font-medium">
                  Awarded for consistent 5-star private chauffeur reviews in Paris.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E2D42] flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.9 / 5.0 Rating</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">1,400+ Reviews</span>
            </div>
          </div>
        </div>

        {/* 4 COLUMNS FOOTER NAVIGATION GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Transfers */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#1E2D42] pb-2 font-serif">
              TRANSFERS
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              {transferLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-gold-400 transition-colors block truncate">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Tours & Day Trips */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#1E2D42] pb-2 font-serif">
              TOURS & DAY TRIPS
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              {tourLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-gold-400 transition-colors block truncate">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#1E2D42] pb-2 font-serif">
              COMPANY
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <Link href="/about-us" className="hover:text-gold-400 transition-colors">
                  About FranceGo
                </Link>
              </li>
              <li>
                <Link href="/our-rates" className="hover:text-gold-400 transition-colors">
                  Transfer Rates
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-gold-400 transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-gold-400 transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Policies */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#1E2D42] pb-2 font-serif">
              {t('legalPolicies')}
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <Link href="/faqs" className="hover:text-gold-400 transition-colors">
                  {t('faqs')}
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-gold-400 transition-colors">
                  {t('termsConditions')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-gold-400 transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-gold-400 transition-colors">
                  {t('cancellationPolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="pt-8 border-t border-[#1E2D42] text-center text-[11px] text-slate-400 font-medium flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} FranceGo. {t('rightsReserved')}</p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/terms-and-conditions" className="hover:text-gold-400 transition-colors">
              {t('termsConditions')}
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-gold-400 transition-colors">
              {t('privacyPolicy')}
            </Link>
            <span>•</span>
            <Link href="/cancellation-policy" className="hover:text-gold-400 transition-colors">
              {t('cancellationPolicy')}
            </Link>
          </div>
          <p>Official Door-to-Door Private Chauffeur & Shuttle Service in France</p>
        </div>
      </div>
    </footer>
  );
}
