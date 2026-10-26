'use client';

import { useState, useEffect, useTransition } from 'react';
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
  ExternalLink,
  ShieldCheck,
  RefreshCw,
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
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'all' | 'external'>('pending');
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // External live sync data (Google & TripAdvisor)
  const [externalData, setExternalData] = useState<any>(null);
  const [loadingExternal, setLoadingExternal] = useState(false);

  const fetchExternal = async () => {
    setLoadingExternal(true);
    try {
      const res = await fetch('/api/reviews/external');
      if (res.ok) {
        const json = await res.json();
        setExternalData(json);
      }
    } catch (e) {
      console.warn('Failed to load external reviews:', e);
    } finally {
      setLoadingExternal(false);
    }
  };

  useEffect(() => {
    fetchExternal();
  }, []);

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
    { key: 'pending' as const, label: 'Website Submissions (Pending)', count: String(pendingReviews.length), color: 'amber' },
    { key: 'published' as const, label: 'Published on Site', count: String(publishedReviews.length), color: 'emerald' },
    { key: 'all' as const, label: 'All Database Reviews', count: String(reviews.length), color: 'slate' },
    { key: 'external' as const, label: 'Google & TripAdvisor Live Sync', count: 'Live', color: 'brand' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-gold-400'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : tab.color === 'amber'
                  ? 'bg-amber-100 text-amber-700'
                  : tab.color === 'emerald'
                  ? 'bg-emerald-100 text-emerald-700'
                  : tab.color === 'brand'
                  ? 'bg-gold-100 text-gold-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 4: EXTERNAL LIVE SYNC (GOOGLE & TRIPADVISOR) */}
      {activeTab === 'external' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-black text-white">Live External Review Synchronization</h3>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Google Maps and TripAdvisor reviews are automatically verified by Google/TripAdvisor and display directly on your website without requiring manual approval.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchExternal}
                disabled={loadingExternal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingExternal ? 'animate-spin text-gold-400' : ''}`} />
                <span>Refresh Live Sync</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Aggregated Score</div>
                <div className="text-2xl font-black text-emerald-400">
                  {externalData?.ratingScore?.toFixed(1) || '4.9'} / 5.0
                </div>
                <div className="text-[11px] text-slate-400">
                  Across {externalData?.totalReviews || '380+'} verified ratings
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Google Maps Place ID</div>
                <div className="text-xs font-mono font-black text-gold-400 truncate">
                  ChIJK_W2Fipt5kcRCOpTeqfLY6g
                </div>
                <div className="text-[11px] text-slate-400">FranceGo VIP Transfer (Pantin)</div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Direct Google Link</div>
                <a
                  href={externalData?.googleReviewsUrl || 'https://maps.app.goo.gl/DwYGzJ9yDqszXAPW7'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 mt-1 truncate"
                >
                  <span>Open on Google Maps</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Live Reviews Feed */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Live Synced Reviews ({externalData?.reviews?.length || 0})
            </h4>

            {externalData?.reviews && externalData.reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {externalData.reviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (r.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                        {r.originCountry || 'Google Review ★'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 font-medium italic leading-relaxed">
                      &ldquo;{r.review}&rdquo;
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="font-black text-slate-900">{r.name}</div>
                      <div className="text-slate-400 text-[10px]">{r.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-gold-600 mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  Loading live external reviews...
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {displayedReviews.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
              <MessageSquareDiff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                {activeTab === 'pending'
                  ? 'No website reviews awaiting approval.'
                  : 'No reviews found in this category.'}
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
                      Pending Approval
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
                    <div className="text-[11px] text-gold-600 font-bold mt-0.5">{review.routeText}</div>
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
                            className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(review.id)}
                            title="Approve & Publish"
                            className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {confirmDelete === review.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white text-[10px] font-black hover:bg-red-700 cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(review.id)}
                            title="Delete"
                            className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
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
        </>
      )}
    </div>
  );
}
