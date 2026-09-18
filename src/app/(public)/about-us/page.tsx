import Image from 'next/image';
import { ShieldCheck, Award, Car, Users, Clock, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'About Us | FastForward Shuttle',
  description:
    'Premier private chauffeur & airport transfer operator in Paris & Disneyland Paris. Delivering reliable door-to-door comfort for families and business travelers.',
};

export default function AboutUsPage() {
  return (
    <div className="space-y-16 pb-20 bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 bg-slate-900 text-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src="/images/meet_greet_driver.jpg"
            alt="About FastForward Shuttle Paris"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/95 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/20 px-4 py-1.5 rounded-full border border-brand-400/30">
            OUR STORY & MISSION
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            About FastForward Shuttle
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
            Delivering safe, comfortable, fixed-price private chauffeur transfers across Paris, Disneyland Paris, and greater France.
          </p>
        </div>
      </section>

      {/* CONTENT & MISSION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Paris's Most Reliable Family & Airport Transfer Partner
            </h2>

            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              FastForward Shuttle was founded with a singular purpose: to remove the stress and anxiety from airport arrivals and family travel across Paris. Navigating crowded public train stations with heavy suitcases or small children after a long international flight is exhausting.
            </p>

            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              We specialize in door-to-door private transfers linking Charles de Gaulle (CDG), Orly (ORY), and Beauvais (BVA) airports directly to Disneyland Paris hotels, central Paris apartments, and historic regional châteaux.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-800 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Fixed Rates (Zero Meter Surprise)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free Infant & Booster Car Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>English-Speaking Professional Drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Upfront Deposit Required</span>
              </div>
            </div>
          </div>

          <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <Image
              src="/images/france_transfer_hero.jpg"
              alt="Private Luxury Van Fleet Paris"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
