import type { Metadata } from 'next';
import Image from 'next/image';
import { getPublicReviews } from '@/lib/publicData';
import { ReviewsPageClient } from '@/components/reviews/ReviewsPageClient';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Customer Reviews & Ratings',
  description:
    'Read verified passenger reviews and 5-star ratings for FranceGo private airport and Disneyland Paris chauffeur transfers. Leave your review today!',
  alternates: {
    canonical: '/reviews',
  },
};

export default async function ReviewsPage() {
  const reviews = await getPublicReviews();
  const serializedReviews = JSON.parse(JSON.stringify(reviews));

  return (
    <div className="space-y-12 pb-20 bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 bg-slate-900 text-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src="/images/france_transfer_hero.jpg"
            alt="Customer Reviews - FranceGo Paris Transfers"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/95 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/20 px-4 py-1.5 rounded-full border border-brand-400/30 inline-block">
            CUSTOMER VOICES
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Reviews
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
            Genuine traveler feedback from families, tourists, and business executives across France.
          </p>
        </div>
      </section>

      {/* REVIEWS CLIENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReviewsPageClient initialReviews={serializedReviews} />
      </div>
    </div>
  );
}
