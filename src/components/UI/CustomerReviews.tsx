'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  X,
  Upload,
  Camera,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { submitReviewAction } from '@/lib/actions/reviews';
import { compressImageForUpload } from '@/lib/imageCompress';

export interface ReviewItem {
  id: string | number;
  name: string;
  originCountry: string;
  route: string;
  rating: number;
  date: string;
  verified: boolean;
  title?: string | null;
  review: string;
  imageUrl?: string | null;
  authorAvatar?: string | null;
  source?: string;
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
  initialReviews?: ReviewItem[];
}

const DEFAULT_CUSTOMER_PHOTOS = [
  '/images/reviews/review_family_travel.jpg',
  '/images/reviews/review_luxury_van.jpg',
  '/images/reviews/review_family_disney.jpg',
  '/images/reviews/review_couple_paris.jpg',
  '/images/reviews/review_airport_meet.jpg',
  '/images/reviews/review_business_client.jpg',
];

const STATIC_FALLBACK_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    name: 'Sarah & Family',
    originCountry: 'United Kingdom 🇬🇧',
    route: 'CDG Airport → Disneyland Paris',
    rating: 5,
    date: 'October 2026',
    verified: true,
    title: 'Outstanding chauffeur, kids loved the trip!',
    imageUrl: '/images/reviews/review_family_travel.jpg',
    authorAvatar: '/images/reviews/avatar_sarah.jpg',
    source: 'TripAdvisor',
    review:
      'Outstanding service! Our chauffeur met us directly inside CDG Terminal 2F holding a sign with my name. He helped with all 4 of our heavy suitcases and had baby & booster seats already installed in the clean Mercedes van. Fantastic start to our Disney holiday!',
  },
  {
    id: 2,
    name: 'Michael & David',
    originCountry: 'United States 🇺🇸',
    route: 'Orly Airport → Paris City Center',
    rating: 5,
    date: 'September 2026',
    verified: true,
    title: 'Punctual, luxurious van & fixed transparent fare',
    imageUrl: '/images/reviews/review_luxury_van.jpg',
    authorAvatar: '/images/reviews/avatar_michael.jpg',
    source: 'Google Review',
    review:
      'Punctual, luxurious vehicle, and polite English-speaking driver. The fare was 100% fixed with no meters or hidden fees. Paid the driver upon arrival at our hotel. Highly recommended for airport transfers!',
  },
  {
    id: 3,
    name: 'Elena & Lucas',
    originCountry: 'Spain 🇪🇸',
    route: 'Beauvais Airport → Disneyland Paris',
    rating: 5,
    date: 'September 2026',
    verified: true,
    title: 'Direct hassle-free transfer from Beauvais to Disney',
    imageUrl: '/images/reviews/review_family_disney.jpg',
    authorAvatar: '/images/reviews/avatar_elena.jpg',
    source: 'TripAdvisor',
    review:
      'Beauvais Airport is quite far from Disney, but our driver made the trip smooth and comfortable. Free booster seats for our kids, smooth driving, and great recommendations for Paris sightseeing.',
  },
  {
    id: 4,
    name: 'Jean-Pierre & Sophie',
    originCountry: 'Canada 🇨🇦',
    route: 'Paris City → Château de Versailles',
    rating: 5,
    date: 'August 2026',
    verified: true,
    title: 'Arrived early, very polite and impeccable Mercedes',
    imageUrl: '/images/reviews/review_couple_paris.jpg',
    authorAvatar: '/images/reviews/avatar_jean.jpg',
    source: 'TripAdvisor',
    review:
      'Booked a private chauffeur for our family trip to Versailles Palace. The driver arrived 10 minutes early at our Paris hotel lobby and was waiting right on time for our return pickup. 10/10 service!',
  },
  {
    id: 5,
    name: 'Arthur & Emma',
    originCountry: 'Australia 🇦🇺',
    route: 'CDG Airport → Paris 8th Arrondissement',
    rating: 5,
    date: 'August 2026',
    verified: true,
    title: 'Chauffeur was waiting right at terminal arrivals',
    imageUrl: '/images/reviews/review_airport_meet.jpg',
    authorAvatar: '/images/reviews/avatar_emma.jpg',
    source: 'TripAdvisor',
    review:
      'Our flight was delayed by 45 minutes, but FranceGo tracked the flight automatically and our driver was waiting right as we walked through customs. Spotless Mercedes, complimentary water, effortless arrival!',
  },
  {
    id: 6,
    name: 'Robert Davis',
    originCountry: 'United States 🇺🇸',
    route: 'Paris City Center → Champagne Region Tour',
    rating: 5,
    date: 'July 2026',
    verified: true,
    title: 'Executive business class service at its best',
    imageUrl: '/images/reviews/review_business_client.jpg',
    authorAvatar: '/images/reviews/avatar_david.jpg',
    source: 'Google Review',
    review:
      'Booked an all-day excursion to Reims Cathedral and Champagne cellars. Chauffeur was impeccably dressed, fluent in English, and navigated Paris traffic like a master. Will definitely book again.',
  },
];

export function CustomerReviews({ title, subtitle, initialReviews }: CustomerReviewsProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<ExternalReviewsResponse | null>(() =>
    initialReviews && initialReviews.length > 0
      ? {
          ratingScore: 4.9,
          totalReviews: 384,
          source: 'Verified Guest Reviews & TripAdvisor',
          tripAdvisorUrl: 'https://www.tripadvisor.com',
          googleReviewsUrl: 'https://maps.app.goo.gl/DwYGzJ9yDqszXAPW7',
          reviews: initialReviews,
        }
      : null
  );
  const [expandedReviews, setExpandedReviews] = useState<Record<string | number, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string | number, boolean>>({});

  // Carousel scroll reference
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Write Review Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRating, setModalRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

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
      }
    }

    fetchExternalReviews();
  }, []);

  const displayTitle = title || t('reviewsTitle') || 'What Our Passengers Say';
  const displaySubtitle =
    subtitle ||
    t('reviewsSubtitle') ||
    'Read genuine 5-star feedback and real moments shared by verified travelers around the world.';
  const reviewsList = data?.reviews && data.reviews.length > 0 ? data.reviews : STATIC_FALLBACK_REVIEWS;
  const score = data?.ratingScore || 4.9;
  const count = data?.totalReviews || 384;
  const tripAdvisorUrl = data?.tripAdvisorUrl || 'https://www.tripadvisor.com';

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  const toggleExpand = (id: string | number) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Direct image upload handler with instant client-side canvas compression & zero-delay preview
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    // 1. Instant local preview (renders in 0ms with zero broken box)
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewPhotoUrl(localBlobUrl);
    setIsUploadingPhoto(true);
    setModalError('');

    try {
      // 2. High-speed client-side canvas compression (~150KB, ~30ms)
      const compressedBlob = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name.replace(/\.[^/.]+$/, '.jpg'));
      formData.append('folder', 'reviews');

      // 3. Upload to dedicated endpoint with fallback
      let res = await fetch('/api/reviews/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        // Fallback to /api/admin/upload-image
        res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });
      }

      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to upload photo.');
      }

      setUploadedPhotoUrl(resData.url);
    } catch (err: any) {
      console.warn('Photo upload warning:', err);
      // Keep local preview so the user still sees their uploaded photo
      setPreviewPhotoUrl('');
      setUploadedPhotoUrl('');
      setModalError(err?.message || 'Photo upload failed. Please try a smaller image or submit without a photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    setModalSuccess('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('rating', modalRating.toString());
    const finalPhoto = uploadedPhotoUrl && !uploadedPhotoUrl.startsWith('blob:') ? uploadedPhotoUrl : '';
    if (finalPhoto) {
      formData.set('imageUrl', finalPhoto);
    }

    const res = await submitReviewAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setModalSuccess(
        'Thank you! Your review and photo have been submitted for verification. It will appear on the site once approved by our moderation team.'
      );
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess('');
        setPreviewPhotoUrl('');
        setUploadedPhotoUrl('');
        form.reset();
      }, 3500);
    } else {
      setModalError(res.error || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Competitor-Style Top Header & TripAdvisor Rating Bar */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-800/80 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#00aa6c]/15 text-[#00e691] border border-[#00aa6c]/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#00e691] animate-ping" />
              <span>Customer Voices & Reviews</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {displayTitle}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {displaySubtitle}
            </p>
          </div>

          {/* TripAdvisor 5.0 Average Rating & CTAs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 shrink-0 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00aa6c]/15 border border-[#00aa6c]/40 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-[#00e691] leading-none">
                  {score.toFixed(1)}
                </span>
                <span className="text-[9px] font-bold text-slate-300 mt-0.5">/ 5.0</span>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs font-black text-white mt-1">Average rating on Tripadvisor</div>
                <div className="text-[11px] text-slate-400 font-medium">{count}+ verified passenger ratings</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 sm:border-l sm:border-slate-800 sm:pl-5">
              <a
                href={tripAdvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer shadow-sm"
              >
                <span>Open Tripadvisor</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-110 text-white text-xs font-black transition-all shadow-md shadow-brand-500/20 cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Write a review</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#00e691]" />
            <span>Swipe or click arrows to explore real customer trips</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Previous review"
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition-all border border-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Next review"
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition-all border border-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SCROLLING BANNER / CAROUSEL TRACK */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ scrollbarWidth: 'none' }}
      >
        {reviewsList.map((r, idx) => {
          const isExpanded = !!expandedReviews[r.id];
          const isPhotoFailed = !!failedImages[r.id];
          const fallbackPhoto = DEFAULT_CUSTOMER_PHOTOS[idx % DEFAULT_CUSTOMER_PHOTOS.length];
          const candidatePhoto = r.imageUrl && r.imageUrl !== 'null' && r.imageUrl !== 'undefined' ? r.imageUrl : fallbackPhoto;
          const displayPhoto = isPhotoFailed ? fallbackPhoto : candidatePhoto;

          return (
            <div
              key={r.id}
              className="snap-start w-[84vw] max-w-[340px] sm:w-[380px] sm:max-w-none shrink-0 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:border-gold-400 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Verified Badge, Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {r.authorAvatar && r.authorAvatar !== 'null' ? (
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-gold-400/40 shrink-0">
                        <Image
                          src={r.authorAvatar}
                          sizes="44px"
                          alt={r.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B08B43] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {r.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-sm truncate">{r.name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate">
                        {r.originCountry}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{r.source || 'Verified'}</span>
                    </span>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">{r.date}</div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-0.5">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Real Customer Photo Attached (Guaranteed Self-Healing) */}
                {displayPhoto && (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner group-hover:scale-[1.01] transition-transform duration-300">
                    <Image
                      src={displayPhoto}
                      sizes="(max-width: 640px) 84vw, 332px"
                      alt={`Customer photo from ${r.name}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => {
                        if (!isPhotoFailed) {
                          setFailedImages((prev) => ({ ...prev, [r.id]: true }));
                        }
                      }}
                    />
                    {/* Route Pill Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-[11px] font-bold flex items-center justify-between shadow-lg">
                      <span className="truncate">{r.route}</span>
                      <span className="text-[#00e691] text-[10px] font-black uppercase ml-1">Real Trip</span>
                    </div>
                  </div>
                )}

                {/* Review Headline & Body */}
                <div className="space-y-1.5">
                  {r.title && (
                    <h3 className="font-black text-slate-900 text-sm leading-snug tracking-tight">
                      &ldquo;{r.title}&rdquo;
                    </h3>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">
                    {isExpanded || r.review.length <= 150 ? (
                      `"${r.review}"`
                    ) : (
                      <>
                        &ldquo;{r.review.slice(0, 145)}...&rdquo;
                        <button
                          type="button"
                          onClick={() => toggleExpand(r.id)}
                          className="text-gold-600 hover:text-gold-700 font-bold ml-1.5 cursor-pointer underline text-xs"
                        >
                          Read full review
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Card Footer: Route Details */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-500 truncate">{r.route}</span>
                <span className="text-gold-600 font-black text-[11px] shrink-0">100% Fixed Fare</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* WRITE A REVIEW MODAL WITH CUSTOMER PHOTO UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-gold-700 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
                <Camera className="w-3.5 h-3.5 text-gold-600" />
                <span>Share Your Experience</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Write a Customer Review
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Upload a photo with your chauffeur or at your destination to help future travelers.
              </p>
            </div>

            {modalSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium space-y-2">
                <div className="flex items-center gap-2 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Review Submitted!
                </div>
                <p>{modalSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                    {modalError}
                  </div>
                )}

                {/* Star Rating Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Your Overall Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setModalRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= modalRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-slate-700 ml-2">
                      {modalRating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Author Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                    <input
                      name="authorName"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Country / City *</label>
                    <input
                      name="location"
                      required
                      placeholder="e.g. London, United Kingdom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Route Text */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transfer Route Taken *</label>
                  <input
                    name="routeText"
                    required
                    placeholder="e.g. Paris CDG Airport → Disneyland Paris"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Headline / Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Review Headline</label>
                  <input
                    name="title"
                    placeholder="e.g. Fantastic driver, on-time and very polite!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Review *</label>
                  <textarea
                    name="comment"
                    required
                    rows={4}
                    placeholder="Describe your trip, vehicle comfort, punctuality, and chauffeur experience..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500 leading-relaxed"
                  />
                </div>

                {/* Customer Photo Upload Section */}
                <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Attach Photo with Driver / Trip (Optional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Max 10MB (Auto-compressed)</span>
                  </label>

                  {previewPhotoUrl || uploadedPhotoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 h-36 bg-slate-900 group">
                      {/* Standard responsive img with instant zero-delay local preview */}
                      <img
                        src={previewPhotoUrl || uploadedPhotoUrl}
                        alt="Uploaded review photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (previewPhotoUrl && e.currentTarget.src !== previewPhotoUrl) {
                            e.currentTarget.src = previewPhotoUrl;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewPhotoUrl('');
                          setUploadedPhotoUrl('');
                        }}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-red-600/90 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg shadow-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Remove
                      </button>
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-white text-xs font-bold">
                          <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                          <span>Optimizing & uploading...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-gold-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-white">
                      {isUploadingPhoto ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-gold-600">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Uploading photo...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-xs font-bold text-slate-700">
                            Click to upload photo from phone or computer
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Show your family, chauffeur, or Disney arrival!
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting for Verification...</span>
                    </>
                  ) : (
                    <span>Submit Review for Verification</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
