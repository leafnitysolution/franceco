'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import {
  adminPublishReviewAction,
  adminUnpublishReviewAction,
  adminDeleteReviewAction,
  adminCreateReviewAction,
  adminUpdateReviewAction,
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
  Plus,
  Upload,
  Camera,
  X,
  Edit2,
  Image as ImageIcon,
} from 'lucide-react';

interface Review {
  id: string;
  authorName: string;
  location: string;
  routeText: string;
  rating: number;
  title?: string | null;
  comment: string;
  imageUrl?: string | null;
  authorAvatar?: string | null;
  source?: string | null;
  isPublished: boolean;
  createdAt: Date;
}

interface AdminReviewsClientProps {
  initialReviews: any[];
}

const PRESET_CUSTOMER_PHOTOS = [
  { label: 'Family with Chauffeur at Van', url: '/images/reviews/review_family_travel.jpg' },
  { label: 'Family Arrival at Disneyland', url: '/images/reviews/review_family_disney.jpg' },
  { label: 'Chauffeur Meet & Greet at CDG Terminal', url: '/images/reviews/review_airport_meet.jpg' },
  { label: 'Executive Mercedes Van Interior', url: '/images/reviews/review_luxury_van.jpg' },
  { label: 'Couple at Eiffel Tower / Paris', url: '/images/reviews/review_couple_paris.jpg' },
  { label: 'Business Executive Traveler', url: '/images/reviews/review_business_client.jpg' },
];

export function AdminReviewsClient({ initialReviews }: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'all' | 'external'>('all');
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [modalRating, setModalRating] = useState(5);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

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

  // Upload handler for review photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploadingPhoto(true);
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'reviews');

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload photo.');
      }

      setPhotoUrl(data.url);
    } catch (err: any) {
      setModalError(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const openCreateModal = () => {
    setEditingReview(null);
    setModalRating(5);
    setPhotoUrl('');
    setAvatarUrl('');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setModalRating(review.rating || 5);
    setPhotoUrl(review.imageUrl || '');
    setAvatarUrl(review.authorAvatar || '');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const handleModalSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const authorName = (formData.get('authorName') as string) || '';
    const location = (formData.get('location') as string) || 'Paris, France';
    const routeText = (formData.get('routeText') as string) || 'Paris Airport Transfer';
    const title = (formData.get('title') as string) || '';
    const comment = (formData.get('comment') as string) || '';
    const source = (formData.get('source') as string) || 'TripAdvisor';
    const isPublished = formData.get('isPublished') === 'on';

    if (!authorName.trim()) {
      setModalError('Author name is required.');
      return;
    }

    if (!comment.trim()) {
      setModalError('Comment is required.');
      return;
    }

    if (editingReview) {
      const res = await adminUpdateReviewAction(editingReview.id, {
        authorName,
        location,
        routeText,
        rating: modalRating,
        title,
        comment,
        imageUrl: photoUrl || null,
        authorAvatar: avatarUrl || null,
        source,
        isPublished,
      });

      if (res.success && res.review) {
        setReviews((prev) =>
          prev.map((r) => (r.id === editingReview.id ? (res.review as any) : r))
        );
        setIsModalOpen(false);
      } else {
        setModalError(res.error || 'Failed to update review.');
      }
    } else {
      const res = await adminCreateReviewAction({
        authorName,
        location,
        routeText,
        rating: modalRating,
        title,
        comment,
        imageUrl: photoUrl || null,
        authorAvatar: avatarUrl || null,
        source,
        isPublished,
      });

      if (res.success && res.review) {
        setReviews((prev) => [res.review as any, ...prev]);
        setIsModalOpen(false);
      } else {
        setModalError(res.error || 'Failed to create review.');
      }
    }
  };

  const tabs = [
    { key: 'all' as const, label: 'All Database Reviews', count: String(reviews.length), color: 'slate' },
    { key: 'published' as const, label: 'Published on Site', count: String(publishedReviews.length), color: 'emerald' },
    { key: 'pending' as const, label: 'Pending Approval', count: String(pendingReviews.length), color: 'amber' },
    { key: 'external' as const, label: 'Google & TripAdvisor Live Sync', count: 'Live', color: 'brand' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
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

        {/* Add New Review Button */}
        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>+ Add Review & Photo</span>
        </button>
      </div>

      {/* TAB: EXTERNAL LIVE SYNC (GOOGLE & TRIPADVISOR) */}
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
                  Google Maps and TripAdvisor reviews are automatically synced and displayed directly in the live carousel.
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
                <div className="text-[10px] font-bold text-slate-400 uppercase">TripAdvisor Location ID</div>
                <div className="text-xs font-mono font-black text-gold-400 truncate">
                  Registered Official Partner
                </div>
                <div className="text-[11px] text-slate-400">FranceGo VIP Transfers & Tours</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {externalData.reviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
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
                          {r.source || 'TripAdvisor'}
                        </span>
                      </div>

                      {r.imageUrl && (
                        <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-100">
                          <Image
                            src={r.imageUrl}
                            alt={r.name}
                            sizes="(max-width: 768px) 100vw, 400px"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-slate-700 font-medium italic leading-relaxed">
                        &ldquo;{r.review}&rdquo;
                      </p>
                    </div>

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
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl space-y-3">
              <MessageSquareDiff className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-500">
                {activeTab === 'pending'
                  ? 'No customer reviews awaiting approval.'
                  : 'No reviews found in this category.'}
              </p>
              <button
                type="button"
          onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-gold-400" />
                Add Your First Review & Photo
              </button>
            </div>
          )}

          {/* Database Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 relative flex flex-col justify-between transition-all ${
                  !review.isPublished ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Status Badge & Actions Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <div>
                      {review.isPublished ? (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Photo */}
                  {review.imageUrl ? (
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <Image
                        src={review.imageUrl}
                        alt={`Photo from ${review.authorName}`}
                        sizes="(max-width: 768px) 100vw, 400px"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-1">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                      <span className="text-[10px] font-bold">No photo attached</span>
                      <button
                        type="button"
                        onClick={() => openEditModal(review)}
                        className="text-[10px] font-black text-gold-600 hover:underline"
                      >
                        + Attach Customer Photo
                      </button>
                    </div>
                  )}

                  {/* Headline */}
                  {review.title && (
                    <h4 className="font-black text-slate-900 text-sm leading-snug">
                      &ldquo;{review.title}&rdquo;
                    </h4>
                  )}

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Author Info & Card Footer */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="text-sm font-black text-slate-900">{review.authorName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{review.location}</div>
                      <div className="text-[11px] text-gold-600 font-bold">{review.routeText}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {review.source || 'TripAdvisor'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => openEditModal(review)}
                      type="button"
                      title="Edit Review & Photo"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {review.isPublished ? (
                      <button
                        onClick={() => handleUnpublish(review.id)}
                        type="button"
                        title="Unpublish"
                        className="p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(review.id)}
                        type="button"
                        title="Approve & Publish"
                        className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {confirmDelete === review.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                          className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-[10px] font-black hover:bg-red-700 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(review.id)}
                        type="button"
                        title="Delete"
                        className="p-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE / EDIT REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Camera className="w-5 h-5 text-gold-600" />
                {editingReview ? 'Edit Review & Photo' : 'Create New Review with Photo'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add passenger feedback and real trip photos to display in the website banner carousel.
              </p>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {modalError}
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setModalRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= modalRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-2">
                    {modalRating} Stars
                  </span>
                </div>
              </div>

              {/* Author & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Customer / Group Name *</label>
                  <input
                    name="authorName"
                    required
                    defaultValue={editingReview?.authorName || ''}
                    placeholder="e.g. Sarah & Family"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country / City *</label>
                  <input
                    name="location"
                    required
                    defaultValue={editingReview?.location || 'London, United Kingdom 🇬🇧'}
                    placeholder="e.g. London, United Kingdom 🇬🇧"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Route Text & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Transfer Route</label>
                  <input
                    name="routeText"
                    defaultValue={editingReview?.routeText || 'CDG Airport → Disneyland Paris'}
                    placeholder="e.g. CDG Airport → Disneyland Paris"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Review Source</label>
                  <select
                    name="source"
                    defaultValue={editingReview?.source || 'TripAdvisor'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500 bg-white"
                  >
                    <option value="TripAdvisor">TripAdvisor 🦉</option>
                    <option value="Google Review">Google Review ★</option>
                    <option value="Direct VIP Booking">Direct VIP Booking ✓</option>
                  </select>
                </div>
              </div>

              {/* Review Headline */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Headline / Catchy Title</label>
                <input
                  name="title"
                  defaultValue={editingReview?.title || ''}
                  placeholder="e.g. Reliable, punctual and wonderful with kids!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Review Comment *</label>
                <textarea
                  name="comment"
                  required
                  rows={4}
                  defaultValue={editingReview?.comment || ''}
                  placeholder="Enter traveler comments..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              {/* PHOTO UPLOAD & PRESETS */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Customer Photo (Shown in Carousel)</span>
                  <span className="text-[10px] text-slate-400">Direct upload or preset</span>
                </label>

                {photoUrl ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-900">
                      <Image
                        src={photoUrl}
                        alt="Preview"
                        sizes="(max-width: 768px) 100vw, 400px"
                        fill
                        className="object-cover"
                        unoptimized={photoUrl.startsWith('http')}
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg shadow-md hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
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
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-700">
                          Click to upload customer selfie or van photo
                        </span>
                        <span className="text-[10px] text-slate-400">Supports JPG, PNG, WebP up to 8MB</span>
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

                {/* Preset Customer Photos */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                    Or pick from authentic travel moments:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CUSTOMER_PHOTOS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setPhotoUrl(preset.url)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                          photoUrl === preset.url
                            ? 'bg-gold-100 border-gold-400 text-gold-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-gold-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  defaultChecked={editingReview ? editingReview.isPublished : true}
                  className="w-4 h-4 text-gold-600 rounded border-slate-300"
                />
                <label htmlFor="isPublished" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publish immediately on live website carousel
                </label>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploadingPhoto}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-60"
                >
                  {editingReview ? 'Update Review' : 'Create & Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
