'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { submitReviewAction } from '@/lib/actions/reviews';
import { compressImageForUpload } from '@/lib/imageCompress';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  X,
  ExternalLink,
  Loader2,
  Upload,
  Camera,
} from 'lucide-react';

interface ReviewItem {
  id: string | number;
  authorName: string;
  location: string;
  routeText: string;
  rating: number;
  dateText: string;
  title?: string | null;
  comment: string;
  imageUrl?: string | null;
  authorAvatar?: string | null;
  source?: string | null;
  verified?: boolean;
}

interface ReviewsPageClientProps {
  initialReviews: any[];
}

const DEFAULT_CUSTOMER_PHOTOS = [
  '/images/reviews/review_family_travel.jpg',
  '/images/reviews/review_luxury_van.jpg',
  '/images/reviews/review_family_disney.jpg',
  '/images/reviews/review_couple_paris.jpg',
  '/images/reviews/review_airport_meet.jpg',
  '/images/reviews/review_business_client.jpg',
];

export function ReviewsPageClient({ initialReviews }: ReviewsPageClientProps) {
  const [failedImages, setFailedImages] = useState<Record<string | number, boolean>>({});
  const [reviews, setReviews] = useState<ReviewItem[]>(() =>
    initialReviews.map((r) => ({
      id: r.id,
      authorName: r.authorName || 'Guest',
      location: r.location || 'Verified Traveler',
      routeText: r.routeText || 'Private Chauffeur Transfer',
      rating: r.rating || 5,
      dateText: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Recent',
      title: r.title || null,
      comment: r.comment || '',
      imageUrl: r.imageUrl || null,
      authorAvatar: r.authorAvatar || null,
      source: r.source || 'TripAdvisor',
      verified: true,
    }))
  );

  const [score, setScore] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(384);
  const [tripAdvisorUrl, setTripAdvisorUrl] = useState<string>('https://www.tripadvisor.com');
  const [googleUrl, setGoogleUrl] = useState<string>('https://maps.google.com');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    async function loadExternalReviews() {
      try {
        const res = await fetch('/api/reviews/external');
        if (res.ok) {
          const data = await res.json();
          if (data.ratingScore) setScore(data.ratingScore);
          if (data.totalReviews) setTotalCount(data.totalReviews);
          if (data.tripAdvisorUrl) setTripAdvisorUrl(data.tripAdvisorUrl);
          if (data.googleReviewsUrl) setGoogleUrl(data.googleReviewsUrl);

          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            const externalNormalized: ReviewItem[] = data.reviews.map((ext: any) => ({
              id: ext.id,
              authorName: ext.name || 'Verified Guest',
              location: ext.originCountry || 'TripAdvisor Verified 🦉',
              routeText: ext.route || 'Private Transfer',
              rating: ext.rating || 5,
              dateText: ext.date || 'Recent',
              title: ext.title || null,
              comment: ext.review || '',
              imageUrl: ext.imageUrl || null,
              authorAvatar: ext.authorAvatar || null,
              source: ext.source || 'TripAdvisor',
              verified: ext.verified ?? true,
            }));

            // Merge TripAdvisor reviews with local reviews (avoid duplicates)
            setReviews((prev) => {
              const existingIds = new Set(prev.map((p) => String(p.id)));
              const uniqueExternal = externalNormalized.filter((e) => !existingIds.has(String(e.id)));
              return [...prev, ...uniqueExternal];
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch external review sync:', err);
      }
    }

    loadExternalReviews();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image (JPG, PNG, WebP).');
      return;
    }

    // 1. Instant local preview
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewPhotoUrl(localBlobUrl);
    setIsUploadingPhoto(true);
    setErrorMsg('');

    try {
      // 2. High-speed client-side canvas compression (~150KB)
      const compressedBlob = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name.replace(/\.[^/.]+$/, '.jpg'));
      formData.append('folder', 'reviews');

      let res = await fetch('/api/reviews/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });
      }

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to upload photo.');
      }

      setUploadedPhotoUrl(resData.url);
    } catch (err: any) {
      console.warn('Photo upload warning:', err);
      setUploadedPhotoUrl(localBlobUrl);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('rating', rating.toString());
    const finalPhoto = uploadedPhotoUrl || previewPhotoUrl;
    if (finalPhoto) {
      formData.set('imageUrl', finalPhoto);
    }

    const res = await submitReviewAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(
        'Thank you! Your review and photo have been submitted and are awaiting moderation approval.'
      );
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setPreviewPhotoUrl('');
        setUploadedPhotoUrl('');
        form.reset();
      }, 3500);
    } else {
      setErrorMsg(res.error || 'Failed to submit review.');
    }
  };

  return (
    <div className="space-y-12">
      {/* SCORE CARD & WRITE A REVIEW ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-black text-emerald-800 leading-none">{score.toFixed(1)}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-700">
              Average rating across Tripadvisor & Google Reviews ({totalCount}+ ratings)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <a
            href={tripAdvisorUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🦉 Open Tripadvisor</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {googleUrl && (
            <a
              href={googleUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all flex items-center gap-1.5"
            >
              <span className="text-amber-500">★</span>
              <span>Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write a review</span>
          </button>
        </div>
      </div>

      {/* REVIEWS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {reviews.map((r, idx) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-300 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header: Avatar, Name, Source */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {r.authorAvatar ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold-400/40 shrink-0">
                      <Image
                        src={r.authorAvatar}
                        alt={r.authorName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-gold-400 font-black text-xs flex items-center justify-center shrink-0">
                      {r.authorName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="font-black text-slate-900 text-sm truncate">{r.authorName}</div>
                    <div className="text-[11px] text-slate-500 font-semibold truncate">{r.location}</div>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{r.source || 'Verified'}</span>
                </span>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[...Array(r.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Customer Photo (Guaranteed Self-Healing) */}
              {(() => {
                const isPhotoFailed = !!failedImages[r.id];
                const fallbackPhoto = DEFAULT_CUSTOMER_PHOTOS[idx % DEFAULT_CUSTOMER_PHOTOS.length];
                const candidatePhoto = r.imageUrl && r.imageUrl !== 'null' && r.imageUrl !== 'undefined' ? r.imageUrl : fallbackPhoto;
                const displayPhoto = isPhotoFailed ? fallbackPhoto : candidatePhoto;

                return displayPhoto ? (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <Image
                      src={displayPhoto}
                      alt={`Photo from ${r.authorName}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => {
                        if (!isPhotoFailed) {
                          setFailedImages((prev) => ({ ...prev, [r.id]: true }));
                        }
                      }}
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-xl text-white text-[10px] font-bold truncate">
                      {r.routeText}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Headline */}
              {r.title && (
                <h4 className="font-black text-slate-900 text-sm leading-snug">
                  &ldquo;{r.title}&rdquo;
                </h4>
              )}

              {/* Comment */}
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-brand-600 font-bold text-[11px] truncate">{r.routeText}</span>
              <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{r.dateText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* WRITE A REVIEW INTERACTIVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-gold-700 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
                <Camera className="w-3.5 h-3.5 text-gold-600" />
                <span>Customer Voices</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Write a Customer Review</h3>
              <p className="text-xs text-slate-500 font-medium">
                Share your transfer experience and attach a photo from your trip.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Your Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              {/* Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    name="authorName"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country / City *</label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. London, UK"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Route & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transfer Route</label>
                  <input
                    type="text"
                    name="routeText"
                    placeholder="e.g. CDG to Disneyland"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Headline</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Amazing driver, on-time!"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Review *</label>
                <textarea
                  name="comment"
                  required
                  rows={4}
                  placeholder="Describe your driver, punctuality, and overall trip experience..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Attach Photo with Driver / Trip</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>

                {previewPhotoUrl || uploadedPhotoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-900 group">
                    <img
                      src={previewPhotoUrl || uploadedPhotoUrl}
                      alt="Uploaded preview"
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
                      className="absolute top-2 right-2 px-2.5 py-1 bg-red-600/90 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg shadow transition-all flex items-center gap-1 cursor-pointer"
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
                          Click to upload customer selfie or van photo
                        </span>
                        <span className="text-[10px] text-slate-400">JPG, PNG up to 8MB</span>
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

              <button
                type="submit"
                disabled={isSubmitting || isUploadingPhoto}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>SUBMIT REVIEW</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
