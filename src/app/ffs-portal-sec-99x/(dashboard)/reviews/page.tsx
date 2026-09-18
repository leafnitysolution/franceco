import { db } from '@/lib/db';
import { AdminReviewsClient } from '@/components/admin/AdminReviewsClient';
import { MessageSquareDiff, Star, CheckCircle2, Clock } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'Manage Reviews | FastForward Admin',
};

export default async function AdminReviewsPage() {
  const allReviews = await db.review.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalCount = allReviews.length;
  const publishedCount = allReviews.filter((r) => r.isPublished).length;
  const pendingCount = allReviews.filter((r) => !r.isPublished).length;
  const avgRating =
    totalCount > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
      : '—';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareDiff className="w-7 h-7 text-brand-500" />
            Customer Reviews
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Moderate public reviews before they appear on the website.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <MessageSquareDiff className="w-3.5 h-3.5 text-brand-500" />
            Total Reviews
          </div>
          <div className="text-3xl font-black text-slate-900">{totalCount}</div>
        </div>
        <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </div>
          <div className="text-3xl font-black text-amber-600">{pendingCount}</div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Published
          </div>
          <div className="text-3xl font-black text-emerald-700">{publishedCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Avg Rating
          </div>
          <div className="text-3xl font-black text-slate-900">{avgRating}</div>
        </div>
      </div>

      {/* Reviews Manager */}
      <AdminReviewsClient initialReviews={allReviews} />
    </div>
  );
}
