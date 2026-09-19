import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | FranceGo',
  description:
    'Review the official terms and conditions for private airport transfers and shuttle services in Paris and Disneyland Paris.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* HERO SECTION */}
      <section className="bg-[#0B192C] text-white py-16 border-b border-[#1E2D42]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-3.5 py-1.5 rounded-full text-gold-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif">
            Terms and Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
            Effective Date: January 1, 2026 • FranceGo Paris & Tourism Services
          </p>
        </div>
      </section>

      {/* MAIN DOCUMENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>1. Agreement & Service Overview</span>
            </h2>
            <p>
              These Terms and Conditions govern the private transfer services provided by <strong>FranceGo</strong> (&quot;the Company&quot;). By making a reservation via our website or booking widget, you (&quot;the Customer&quot; or &quot;Lead Passenger&quot;) agree to be legally bound by these terms.
            </p>
            <p>
              We provide fixed-rate door-to-door private chauffeur services between Paris Airports (CDG, Orly, Beauvais), Disneyland Paris Hotels & Parks, Paris City Center, and surrounding regions.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-600" />
              <span>2. Reservations & Instant Confirmation</span>
            </h2>
            <p>
              All bookings requested through our website are confirmed instantly upon submission. An automated booking voucher containing your unique reference code, pickup location details, driver instructions, and total guaranteed price will be dispatched to your provided email address.
            </p>
            <p>
              It is the lead passenger&apos;s responsibility to ensure that all submitted contact details, flight numbers, pickup dates, and luggage counts are accurate.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>3. Fixed Pricing & Zero Upfront Deposit</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>No Deposit Required:</strong> You do not need to pay anything online at the time of booking.
              </li>
              <li>
                <strong>Guaranteed Fixed Rates:</strong> All quoted prices include highway tolls, airport parking fees, driver meet & greet, and VAT taxes. The price shown on your booking confirmation is final with zero hidden extras.
              </li>
              <li>
                <strong>Payment Methods:</strong> Full payment is made directly to your chauffeur upon arrival at your destination. We accept Cash (Euros) or Major Credit/Debit Cards (Visa, Mastercard, Amex, Apple Pay, Google Pay).
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>4. Airport Meet & Greet and Flight Delay Tracking</span>
            </h2>
            <p>
              For airport pickups, your private chauffeur will meet you inside the arrivals terminal holding a greeting sign displaying the passenger or family name requested during booking.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Free Waiting Allowance:</strong> Includes up to 60 minutes of complimentary waiting time from the actual landed time of your aircraft.
              </li>
              <li>
                <strong>Flight Radar Tracking:</strong> We track all commercial flights into CDG, Orly, and Beauvais. If your flight is delayed, your driver schedule will automatically adjust with zero penalty fees.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>5. Free Baby & Booster Child Seats</span>
            </h2>
            <p>
              In accordance with European passenger safety regulations, child seats are recommended for minors. We provide infant, baby, and booster seats 100% free of charge upon request. Please specify the child ages or weight requirements in the driver notes field during booking.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>6. Luggage & Vehicle Capacity Limits</span>
            </h2>
            <p>
              Each vehicle class (Sedan, Economy Minivan, Business Van, 16-Pax Minibus) has specific maximum passenger and luggage limits. It is the customer&apos;s duty to select a vehicle tier capable of accommodating all passengers and luggage items. If extra luggage exceeds vehicle capacity, an upgraded vehicle may be dispatched subject to availability and fare differential.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>7. Cancellations & Modifications</span>
            </h2>
            <p>
              Cancellations and booking updates are completely free up to 24 hours prior to scheduled pickup time. Please refer to our full <Link href="/cancellation-policy" className="text-gold-700 font-bold hover:underline">Cancellation Policy</Link> for full details.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              <span>8. Contact Information & Jurisdiction</span>
            </h2>
            <p>
              These Terms and Conditions are governed by the laws of the Republic of France. For inquiries or customer service:
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-semibold space-y-1 text-xs">
              <p>FranceGo Transport & Tourism Services</p>
              <p>Email: contact@francego.com</p>
              <p>24/7 Hotline: +33 1 89 40 00 00</p>
              <p>Location: Paris CDG, Orly & Beauvais Airports, France</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
