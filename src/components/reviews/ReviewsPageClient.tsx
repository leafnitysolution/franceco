'use client';

import { useState } from 'react';
import { submitReviewAction } from '@/lib/actions/reviews';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, X, ExternalLink, Loader2 } from 'lucide-react';

interface ReviewsPageClientProps {
  initialReviews: any[];
}

export function ReviewsPageClient({ initialReviews }: ReviewsPageClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [rating, setRating] = useState(5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.currentTarget);
    formData.set('rating', rating.toString());

    const res = await submitReviewAction(formData);

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Thank you! Your review has been submitted and is awaiting approval. It will appear here once approved by our team.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
      }, 3000);
    } else {
      setErrorMsg(res.error || 'Failed to submit review.');
    }
  };

  return (
    <div className="space-y-12">
      {/* SCORE CARD & WRITE A REVIEW ACTION BAR (MATCHING SCREENSHOT 1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-black text-emerald-800 leading-none">5.0</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-700">
              Average rating on Tripadvisor & Google Reviews
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <a
            href="https://www.tripadvisor.com"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all flex items-center gap-1.5"
          >
            <span>Open Tripadvisor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write a review</span>
          </button>
        </div>
      </div>

      {/* REVIEWS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Review</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                "{r.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-black text-slate-900 text-sm">{r.authorName}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{r.location}</div>
              </div>

              <div className="text-right">
                <div className="text-brand-600 font-bold text-[11px]">{r.routeText}</div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WRITE A REVIEW INTERACTIVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Write a Customer Review</h3>
              <p className="text-xs text-slate-500 font-medium">
                Share your transfer experience with FastForward Shuttle.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                <input
                  type="text"
                  name="authorName"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country / City</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. London, UK"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transfer Route Taken</label>
                  <input
                    type="text"
                    name="routeText"
                    placeholder="e.g. CDG to Disneyland"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Star Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Review Comment</label>
                <textarea
                  name="comment"
                  required
                  rows={4}
                  placeholder="Describe your driver, punctuality, and overall trip experience..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SUBMIT REVIEW</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
