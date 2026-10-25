import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, CalendarX, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Cancellation & Refund Policy | FranceGo',
  description:
    'Learn about our zero-risk 24-hour free cancellation policy for airport shuttles and private transfers in Paris.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* HERO SECTION */}
      <section className="bg-[#0B192C] text-white py-16 border-b border-[#1E2D42]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Risk-Free Booking</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif">
            Cancellation Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
            Lock your price today with peace of mind. Free cancellation up to 24 hours before your pickup time.
          </p>
        </div>
      </section>

      {/* MAIN DOCUMENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>1. Free 24-Hour Cancellation Policy</span>
            </h2>
            <p>
              We understand that travel plans can change unexpectedly. FranceGo offers a <strong>100% Free Cancellation Policy</strong> for all private airport transfers, Disneyland shuttles, and custom tours.
            </p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1 font-semibold">
              <p className="font-extrabold text-sm">✓ Zero Cancellation Fees</p>
              <p className="text-xs text-emerald-700">
                You can cancel or modify your reservation up to <strong>24 hours prior to scheduled pickup time</strong> with absolutely zero penalty or cancellation fees.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CalendarX className="w-5 h-5 text-emerald-600" />
              <span>2. How to Cancel or Modify Your Transfer</span>
            </h2>
            <p>To cancel or request changes to your booking, simply provide your booking reference number through any of the following channels:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Email:</strong> Send a request to <code>projet15df@outlook.fr</code>
              </li>
              <li>
                <strong>WhatsApp / Hotline:</strong> Message our 24/7 dispatch desk at <a href="https://wa.me/33781118394" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 hover:underline">+33 7 81 11 83 94</a>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>3. Flight Delays & Airline Disruptions</span>
            </h2>
            <p>
              If your incoming flight to Paris CDG, Orly, or Beauvais Airport is delayed, cancelled by the airline, or rescheduled:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Automatic Delay Adjustment:</strong> Because we monitor live flight radar, your driver automatically adjusts to your actual landing time at no extra charge.
              </li>
              <li>
                <strong>Flight Cancellation by Airline:</strong> If your flight is cancelled by the airline, simply notify our dispatch desk as soon as possible to cancel your transfer with zero penalty.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>4. Late Cancellations & No-Shows</span>
            </h2>
            <p>
              If a cancellation notice is received less than 3 hours before pickup time or if passengers fail to arrive without notice, driver dispatch costs may be billed. However, we evaluate every situation compassionately in cases of severe flight disruptions or emergencies.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>5. Summary of Customer Guarantees</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-800">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Upfront Deposit</span>
                <span className="font-extrabold text-slate-900 text-sm">€0 Deposit Required</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Free Cancellation Window</span>
                <span className="font-extrabold text-slate-900 text-sm">Up to 24 Hours Before Pickup</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
