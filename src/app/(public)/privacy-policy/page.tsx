import React from 'react';
import { ShieldCheck, Lock, Eye, Server, UserCheck, Phone, Mail } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | FranceGo',
  description:
    'Learn how FranceGo protects your personal data, booking details, and privacy in compliance with EU GDPR regulations.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* HERO SECTION */}
      <section className="bg-[#0B192C] text-white py-16 border-b border-[#1E2D42]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-3.5 py-1.5 rounded-full text-gold-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>GDPR Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
            Your privacy is fully protected. Learn how we collect, safeguard, and process your transfer information.
          </p>
        </div>
      </section>

      {/* MAIN DOCUMENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>1. Introduction & GDPR Commitment</span>
            </h2>
            <p>
              FranceGo (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) strictly respects your personal privacy. This Privacy Policy explains how your personal data is handled when you use our transfer reservation platform in accordance with the European Union General Data Protection Regulation (EU GDPR 2016/679) and French data protection legislation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span>2. Personal Data We Collect</span>
            </h2>
            <p>When you submit a booking request or communicate with our dispatch desk, we collect:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Lead Passenger Contact Info:</strong> Full Name, Email Address, and Mobile Phone Number.
              </li>
              <li>
                <strong>Trip & Itinerary Specifications:</strong> Pickup date, time, pickup address/terminal, dropoff address/hotel, flight or train numbers, and passenger/luggage counts.
              </li>
              <li>
                <strong>Driver Notes & Preferences:</strong> Child seat requests, luggage details, or custom pickup sign text provided voluntarily.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>3. How We Use Your Information</span>
            </h2>
            <p>We process personal data solely for the operational fulfillment of your transfer reservation:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To issue your instant electronic booking voucher via automated email.</li>
              <li>To allow your assigned chauffeur to track your arrival flight radar and meet you inside the airport terminal.</li>
              <li>To dispatch driver contact details via SMS or WhatsApp prior to pickup.</li>
              <li>We never sell, rent, or trade your personal contact details to third-party advertisers.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>4. Data Storage & Security Measures</span>
            </h2>
            <p>
              Your personal data is encrypted in transit using SSL/TLS protocols and stored securely in protected databases. Access is strictly limited to authorized dispatch personnel and assigned chauffeurs performing your service.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>5. Your GDPR Rights & Data Control</span>
            </h2>
            <p>Under GDPR legislation, you hold the following rights regarding your personal information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Right to Access & Rectify:</strong> Request a copy of your stored booking data or update incorrect information.
              </li>
              <li>
                <strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your booking records after service completion.
              </li>
            </ul>
            <p className="pt-2">
              To exercise your privacy rights, request data updates or permanent removal, contact our Data Protection and Customer Support team:
            </p>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 font-semibold text-xs sm:text-sm mt-3">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Hotline & WhatsApp: <a href="https://wa.me/33781118394" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-extrabold hover:underline">+33 7 81 11 83 94</a>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Email: <a href="mailto:projet15df@outlook.fr" className="text-emerald-700 font-bold hover:underline">projet15df@outlook.fr</a>
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
