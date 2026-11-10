import Link from 'next/link';
import Image from 'next/image';
import { Home, CalendarCheck, Compass, Phone, Mail, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found (404)',
  description:
    'The page you are looking for could not be found. Return to FranceGo to book your private Paris or Disneyland Paris chauffeur transfer.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-navy-900 flex flex-col justify-between px-4 py-10 sm:py-16">
      <div className="max-w-3xl w-full mx-auto bg-white border border-[#E5D7BC] rounded-3xl p-6 sm:p-12 shadow-xl text-center space-y-8 my-auto">
        {/* Clickable Brand Logo */}
        <Link href="/" className="inline-block hover:scale-[1.02] transition-transform">
          <div className="relative h-14 w-48 mx-auto">
            <Image
              src="/images/logo.png"
              alt="FranceGo - VIP Transfers & Tours"
              fill
              sizes="192px"
              className="object-contain object-center"
            />
          </div>
        </Link>

        {/* 404 Badge & Copy */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F7F2E7] border border-[#E5D7BC] text-gold-800 text-xs font-black uppercase tracking-widest">
            404 • Route Not Found
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Oops! Wrong Turn in Paris
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            The page or transfer link you requested does not exist or may have moved. Let&apos;s get you back on track for your private chauffeur journey.
          </p>
        </div>

        {/* Action Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#0B192C] hover:bg-[#132338] text-white shadow-md transition-all"
          >
            <Home className="w-4 h-4 text-gold-400" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/book"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-slate-900 font-black shadow-md transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Transfer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/our-rates"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#F5F3ED] hover:bg-[#eae4d6] text-navy-900 border border-[#E5D7BC] transition-all"
          >
            <Compass className="w-4 h-4 text-gold-600" />
            <span>View Transfer Rates</span>
          </Link>
        </div>

        {/* Direct 24/7 Assistance */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <a
            href="tel:+33781118394"
            className="inline-flex items-center gap-1.5 text-navy-900 hover:text-gold-600 font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-gold-600" />
            <span>+33 7 81 11 83 94</span>
          </a>
          <span className="hidden sm:inline text-slate-300">•</span>
          <a
            href="mailto:projet15df@outlook.fr"
            className="inline-flex items-center gap-1.5 text-navy-900 hover:text-gold-600 font-bold transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-gold-600" />
            <span>projet15df@outlook.fr</span>
          </a>
        </div>
      </div>
    </div>
  );
}
