import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | FastForward Shuttle 24/7 Hotline',
  description:
    'Contact FastForward Shuttle for 24/7 passenger inquiries, dispatch assistance, and group bookings in Paris & Disneyland Paris.',
};

export default function ContactUsPage() {
  return (
    <div className="space-y-16 pb-20 bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 bg-slate-900 text-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src="/images/meet_greet_driver.jpg"
            alt="Contact FastForward Shuttle Paris"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/95 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/20 px-4 py-1.5 rounded-full border border-brand-400/30">
            24/7 CUSTOMER DISPATCH
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
            Our dispatch office is available 24 hours a day, 7 days a week to assist with your transfer inquiries.
          </p>
        </div>
      </section>

      {/* CONTACT INFO & FORM GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900">24/7 Dispatch Office</h2>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-700 shrink-0">
                  <Phone className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Hotline & WhatsApp</div>
                  <div className="text-slate-900 font-bold text-sm">+33 1 89 40 00 00</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-700 shrink-0">
                  <Mail className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Email Support</div>
                  <div className="text-slate-900 font-bold text-sm">booking@fastforwardshuttle.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-700 shrink-0">
                  <MapPin className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Location</div>
                  <div className="text-slate-900 font-bold text-xs">CDG & Orly Airport Hubs, Paris, France</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900">Send Us a Direct Message</h2>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Message / Inquiry</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist with your Paris transfer or group booking?"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>SEND MESSAGE</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
