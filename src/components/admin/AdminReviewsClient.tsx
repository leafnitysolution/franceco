'use client';

import { useState, useTransition } from 'react';
import {
  adminPublishReviewAction,
  adminUnpublishReviewAction,
  adminDeleteReviewAction,
} from '@/lib/actions/reviews';
import {
  Star,
  CheckCircle2,
  EyeOff,
  Eye,
  Trash2,
  MessageSquareDiff,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Review {
  id: string;
  authorName: string;
  location: string;
  routeText: string;
  rating: number;
  comment: string;
  isPublished: boolean;
  createdAt: Date;
}

interface AdminReviewsClientProps {
  initialReviews: Review[];
}

export function AdminReviewsClient({ initialReviews }: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'all'>('pending');
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const pendingReviews = reviews.filter((r) => !r.isPublished);
  const publishedReviews = reviews.filter((r) => r.isPublished);
  const displayedReviews =
    activeTab === 'pending'
      ? pendingReviews
      : activeTab === 'published'
      ? publishedReviews
      : reviews;

  const handlePublish = (id: string) => {
    setLoadingId(id);
    startTransition(async () => {
      await adminPublishReviewAction(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isPublished: true } : r))
      );
      setLoadingId(null);
    });
  };

  const handleUnpublish = (id: string) => {
    setLoadingId(id);
    startTransition(async () => {
      await adminUnpublishReviewAction(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isPublished: false } : r))
      );
      setLoadingId(null);
    });
  };

  const handleDelete = (id: string) => {
    setLoadingId(id);
    setConfirmDelete(null);
    startTransition(async () => {
      await adminDeleteReviewAction(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setLoadingId(null);
    });
  };

  const tabs = [
    { key: 'pending' as const, label: 'Awaiting Approval', count: pendingReviews.length, color: 'amber' },
    { key: 'published' as const, label: 'Published', count: publishedReviews.length, color: 'emerald' },
    { key: 'all' as const, label: 'All Reviews', count: reviews.length, color: 'brand' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-400'
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : tab.color === 'amber'
                  ? 'bg-amber-100 text-amber-700'
                  : tab.color === 'emerald'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {displayedReviews.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
          <MessageSquareDiff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">
            {activeTab === 'pending' ? 'No reviews awaiting approval.' : 'No reviews found.'}
          </p>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedReviews.map((review) => (
          <div
            key={review.id}
            className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 relative transition-all ${
              !review.isPublished ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
            }`}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              {review.isPublished ? (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Published
                </span>
              ) : (
                <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Pending
                </span>
              )}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-0.5 pr-24">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
              &ldquo;{review.comment}&rdquo;
            </p>

            {/* Author Info */}
            <div className="border-t border-slate-100 pt-3 flex items-end justify-between">
              <div>
                <div className="text-sm font-black text-slate-900">{review.authorName}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{review.location}</div>
                <div className="text-[11px] text-brand-600 font-bold mt-0.5">{review.routeText}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {new Date(review.createdAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {loadingId === review.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <>
                    {review.isPublished ? (
                      <button
                        onClick={() => handleUnpublish(review.id)}
                        title="Unpublish"
                        className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(review.id)}
                        title="Approve & Publish"
                        className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {confirmDelete === review.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white text-[10px] font-black hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(review.id)}
                        title="Delete"
                        className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
