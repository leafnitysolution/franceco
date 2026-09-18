'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Clock, Award, Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0B192C] text-slate-300 pt-12 pb-8 border-t border-[#1E2D42]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Trust Highlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#0F1E36] border border-[#1E2D42]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-600/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">Licensed Chauffeurs</h4>
              <p className="text-[11px] text-slate-400">Professional bilingual drivers in France.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-600/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">Flight Tracking</h4>
              <p className="text-[11px] text-slate-400">Free waiting time if your flight is delayed.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-600/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">Pay on Arrival</h4>
              <p className="text-[11px] text-slate-400">Zero upfront deposit. Cash or card to driver.</p>
            </div>
          </div>
        </div>

        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="inline-block bg-white rounded-2xl px-4 py-2.5 shadow-md border border-white/20 hover:scale-[1.02] transition-transform">
              <div className="relative h-16 w-56 sm:w-64">
                <Image
                  src="/images/logo.png"
                  alt="FRANCE GO - VIP Transfers & Tours"
                  fill
                  className="object-contain object-center scale-105"
                />
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {t('footerDesc')}
            </p>
            {/* TripAdvisor Backlink */}
            <a
              href="https://www.tripadvisor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gold-400 font-bold hover:underline hover:text-gold-300 transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Ranked #6 on TripAdvisor • 4.9/5 Rating</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Col 2: Top Routes */}
          <div>
            <h3 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Top Transfer Routes</h3>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li>
                <Link href="/transfers/cdg-to-disneyland-paris" className="hover:text-gold-400 transition-colors">
                  CDG Airport to Disneyland Paris
                </Link>
              </li>
              <li>
                <Link href="/transfers/orly-to-disneyland-paris" className="hover:text-gold-400 transition-colors">
                  Orly Airport to Disneyland Paris
                </Link>
              </li>
              <li>
                <Link href="/transfers/beauvais-to-disneyland-paris" className="hover:text-gold-400 transition-colors">
                  Beauvais Airport to Disneyland Paris
                </Link>
              </li>
              <li>
                <Link href="/transfers/cdg-to-paris-city" className="hover:text-gold-400 transition-colors">
                  CDG Airport to Paris City Center
                </Link>
              </li>
              <li>
                <Link href="/transfers/paris-to-chateau-de-versailles" className="hover:text-gold-400 transition-colors">
                  Paris City to Palace of Versailles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Vehicle Fleet */}
          <div>
            <h3 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Vehicle Classes</h3>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                <span>Berline Sedan (1–3 Passengers)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                <span>Economy Minivan (1–8 Passengers)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                <span>VIP Business Class Van (1–7 Passengers)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                <span>16-Pax Executive Minibus</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Hotline */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">24/7 Dispatch Hotline</h3>
            <div className="space-y-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2 text-white font-bold">
                <Phone className="w-4 h-4 text-gold-400" />
                <span>+33 1 89 40 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400" />
                <span>booking@fastforwardshuttle.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Paris CDG, Orly & Beauvais Airports, France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="pt-6 border-t border-[#1E2D42] text-center text-[11px] text-slate-400 font-medium flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} FastForward Shuttle. {t('rightsReserved')}</p>
          <p>Official Door-to-Door Private Chauffeur Service</p>
        </div>
      </div>
    </footer>
  );
}

