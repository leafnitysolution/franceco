'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { CountryCodePhoneInput } from '@/components/UI/CountryCodePhoneInput';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Transfer Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20 bg-[#FBF9F5] text-navy-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 bg-[#0B192C] text-white border-b border-[#1E2D42] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src="/images/meet_greet_driver.jpg"
            alt="Contact FranceGo VIP Transfers & Tours"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B192C]/85 via-[#0B192C]/70 to-[#0B192C]/40 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-gold-400 bg-gold-500/20 px-4 py-1.5 rounded-full border border-gold-400/30">
            24/7 CUSTOMER DISPATCH & HOTLINE
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-black text-white tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
            Our Paris dispatch desk is available 24 hours a day, 7 days a week for inquiries, instant WhatsApp support, and custom group quotes.
          </p>
        </div>
      </section>

      {/* CONTACT INFO & FORM GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5D7BC] shadow-xl space-y-6">
            <h2 className="text-xl font-bold font-serif text-navy-900 border-b border-slate-100 pb-3">
              24/7 Dispatch Office
            </h2>

            <div className="space-y-5 text-xs font-semibold text-slate-700">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-700 shrink-0">
                  <Phone className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">24/7 Hotline & WhatsApp</div>
                  <div className="text-navy-900 font-extrabold text-sm sm:text-base">+33 7 81 11 83 94</div>
                  <p className="text-[11px] text-slate-500 font-medium">Bilingual English & French operators available 24/7</p>
                </div>
              </div>

              {/* WhatsApp Instant Chat */}
              <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">WhatsApp Direct Message</div>
                  <div className="text-emerald-700 font-extrabold text-xs">Instant Driver Assistance</div>
                  <a
                    href="https://wa.me/33781118394?text=Hello%20FranceGo,%20I%20have%20an%20inquiry%20regarding%20a%20private%20transfer."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-700 shrink-0">
                  <Mail className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Email Dispatch Desk</div>
                  <div className="text-navy-900 font-bold text-xs sm:text-sm">projet15df@outlook.fr</div>
                  <p className="text-[11px] text-slate-500 font-medium">Instant email confirmations & voucher inquiries</p>
                </div>
              </div>

              {/* Operating Hubs */}
              <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center text-gold-700 shrink-0">
                  <MapPin className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Airports & Operating Hubs</div>
                  <div className="text-navy-900 font-bold text-xs">Paris Charles de Gaulle (CDG), Orly (ORY), Beauvais (BVA) & Disneyland Paris</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#E5D7BC] shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-navy-900">Send Us a Direct Message</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Have a question about your transfer or custom group quote? Fill out the form below and our dispatch team will reply within 15 minutes.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-base text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Message Sent Successfully!</span>
                </div>
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>! Our 24/7 dispatch desk has received your inquiry and will reply to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold animate-in fade-in">
                    {errorMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F5F3ED] border border-[#E5D7BC] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-navy-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F5F3ED] border border-[#E5D7BC] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-navy-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone / Mobile Number *</label>
                    <CountryCodePhoneInput
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                      placeholder="7 81 11 83 94"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Inquiry Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#F5F3ED] border border-[#E5D7BC] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-navy-900 focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="General Transfer Inquiry">General Transfer Inquiry</option>
                      <option value="Airport Pickup Assistance">Airport Pickup Assistance</option>
                      <option value="Disneyland Paris Shuttle">Disneyland Paris Shuttle</option>
                      <option value="Group / Minibus Booking">Large Group / Minibus Booking</option>
                      <option value="Modify Existing Booking">Modify Existing Reservation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Message / Flight Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist with your Paris transfer or group trip?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#F5F3ED] border border-[#E5D7BC] rounded-xl p-3 text-xs sm:text-sm font-medium text-navy-900 focus:outline-none focus:border-gold-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-gold-400" />
                  <span>{loading ? 'Sending Message...' : 'Send Message Now'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

