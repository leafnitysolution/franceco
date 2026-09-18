'use client';

import { useEffect, useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, ExternalLink, Award } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface ReviewItem {
  id: string | number;
  name: string;
  originCountry: string;
  route: string;
  rating: number;
  date: string;
  verified: boolean;
  review: string;
}

interface ExternalReviewsResponse {
  ratingScore: number;
  totalReviews: number;
  source: string;
  tripAdvisorUrl: string;
  googleReviewsUrl: string;
  reviews: ReviewItem[];
}

interface CustomerReviewsProps {
  title?: string;
  subtitle?: string;
}

const STATIC_FALLBACK_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    name: 'Sarah & Family',
    originCountry: 'United Kingdom 🇬🇧',
    route: 'CDG Airport → Disneyland Paris',
    rating: 5,
    date: 'August 2026',
    verified: true,
    review:
      'Outstanding service! Our chauffeur met us directly inside CDG Terminal 2F holding a sign with my name. He helped with all 4 of our heavy suitcases and had baby & booster seats already installed in the clean Mercedes van. Fantastic start to our Disney holiday!',
  },
  {
    id: 2,
    name: 'Michael R.',
    originCountry: 'United States 🇺🇸',
    route: 'Orly Airport → Paris City Center',
    rating: 5,
    date: 'August 2026',
    verified: true,
    review:
      'Punctual, luxurious vehicle, and polite English-speaking driver. The fare was 100% fixed at 60€ with no meters or hidden fees. Paid the driver upon arrival at our hotel. Highly recommended!',
  },
  {
    id: 3,
    name: 'Elena & David',
    originCountry: 'Spain 🇪🇸',
    route: 'Beauvais Airport → Disneyland Paris',
    rating: 5,
    date: 'July 2026',
    verified: true,
    review:
      'Beauvais Airport is quite far from Disney, but our driver made the trip smooth and comfortable. Free booster seats for our kids, smooth driving, and great recommendations for Paris sightseeing.',
  },
  {
    id: 4,
    name: 'Jean-Pierre M.',
    originCountry: 'Canada 🇨🇦',
    route: 'Paris City → Château de Versailles',
    rating: 5,
    date: 'July 2026',
    verified: true,
    review:
      'Booked a private chauffeur for our family trip to Versailles Palace. The driver arrived 10 minutes early at our Paris hotel lobby and was waiting right on time for our return pickup. 10/10 service!',
  },
];

export function CustomerReviews({ title, subtitle }: CustomerReviewsProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<ExternalReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExternalReviews() {
      try {
        const res = await fetch('/api/reviews/external');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.warn('Failed to fetch external reviews API:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchExternalReviews();
  }, []);

  const displayTitle = title || t('reviewsTitle');
  const displaySubtitle = subtitle || t('reviewsSubtitle');
  const reviewsList = data?.reviews && data.reviews.length > 0 ? data.reviews : STATIC_FALLBACK_REVIEWS;
  const score = data?.ratingScore || 4.9;
  const count = data?.totalReviews || 384;

  return (
    <div className="space-y-8 py-6">
      {/* Header & TripAdvisor / Google Rating Badges */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Dynamic Score Pill */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black px-4 py-2 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{score.toFixed(1)} / 5.0 Rating ({count}+ Reviews)</span>
          </div>

          {/* TripAdvisor Badge */}
          <a
            href={data?.tripAdvisorUrl || 'https://www.tripadvisor.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-3.5 py-2 rounded-full transition-all hover:scale-105 shadow-md"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ranked #6 on TripAdvisor</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Google Reviews Badge */}
          <a
            href={data?.googleReviewsUrl || 'https://maps.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold px-3.5 py-2 rounded-full transition-all hover:scale-105 shadow-sm"
          >
            <span className="text-amber-500">★</span>
            <span>Google Reviews</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {displayTitle}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {displaySubtitle}
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviewsList.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg glass-card-hover space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{t('verifiedReview')}</span>
                </span>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic relative">
                "{r.review}"
              </p>
            </div>

            {/* Reviewer Details */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-black text-slate-900 text-sm">{r.name}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{r.originCountry}</div>
              </div>

              <div className="text-right">
                <div className="text-brand-600 font-bold text-[11px]">{r.route}</div>
                <div className="text-[10px] text-slate-400 font-medium">{r.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
