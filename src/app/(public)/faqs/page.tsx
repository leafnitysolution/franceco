import Image from 'next/image';
import { FaqAccordion } from '@/components/UI/FaqAccordion';

export const metadata = {
  title: 'Frequently Asked Questions | FastForward Shuttle',
  description:
    'Answers to common questions regarding airport pickups, child seats, flight delay tracking, and payment methods.',
};

export default function FaqsPage() {
  const faqs = [
    {
      question: 'Where do I meet my private chauffeur at CDG, Orly or Beauvais Airport?',
      answer: 'Your personal driver meets you directly inside the terminal arrivals gate holding a name sign right after baggage collection.',
    },
    {
      question: 'Do I need to pay in advance when booking online?',
      answer: 'No upfront deposit is required. You can pay your driver upon arrival at your hotel in cash or credit card.',
    },
    {
      question: 'What happens if my incoming flight to Paris is delayed?',
      answer: 'We monitor live flight radar for all incoming flights. If your flight is delayed, your driver adjusts pickup time automatically without charging any delay penalties.',
    },
    {
      question: 'Are baby and booster seats really free of charge?',
      answer: 'Yes! Infant, child, and booster seats are provided 100% free of charge upon request.',
    },
    {
      question: 'Are fares fixed or metered?',
      answer: 'All our fares are 100% fixed at the time of booking. Parking, tolls, luggage, and traffic delays are fully included.',
    },
  ];

  return (
    <div className="space-y-16 pb-20 bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 bg-slate-900 text-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src="/images/meet_greet_driver.jpg"
            alt="FAQs FastForward Shuttle"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/95 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/20 px-4 py-1.5 rounded-full border border-brand-400/30">
            HELP CENTER & FAQS
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
            Everything you need to know about your private transfer in Paris & Disneyland.
          </p>
        </div>
      </section>

      {/* FAQS ACCORDION */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FaqAccordion faqs={faqs} title="Popular Transfer Questions & Answers" />
      </main>
    </div>
  );
}
