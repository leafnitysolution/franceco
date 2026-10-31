'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getAdminSession } from '@/lib/auth';

// Rate Limiter for public reviews (3 reviews per hour per IP)
const reviewRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REVIEWS_PER_WINDOW = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = reviewRateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REVIEWS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  reviewRateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function submitReviewAction(formData: FormData) {
  try {
    // 1. IP Rate Limiting Check
    const headersList = await headers();
    const clientIp =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return {
        success: false,
        error: 'Too many review submissions from your IP. Please try again later.',
      };
    }

    const rawAuthorName = (formData.get('authorName') as string) || '';
    const rawLocation = (formData.get('location') as string) || 'Paris, France';
    const rawRouteText = (formData.get('routeText') as string) || 'Paris Airport Transfer';
    const rawRating = parseInt((formData.get('rating') as string) || '5', 10);
    const rawTitle = (formData.get('title') as string) || '';
    const rawComment = (formData.get('comment') as string) || '';
    const rawImageUrl = (formData.get('imageUrl') as string) || '';
    const rawAuthorAvatar = (formData.get('authorAvatar') as string) || '';
    const rawSource = (formData.get('source') as string) || 'TripAdvisor';

    // 2. Strict Input Trimming & Sanitization
    const authorName = rawAuthorName.trim().slice(0, 100);
    const location = rawLocation.trim().slice(0, 100);
    const routeText = rawRouteText.trim().slice(0, 100);
    const rating = Math.min(Math.max(isNaN(rawRating) ? 5 : rawRating, 1), 5);
    const title = rawTitle.trim().slice(0, 150) || null;
    const comment = rawComment.trim().slice(0, 1000);
    const imageUrl = rawImageUrl.trim() || null;
    const authorAvatar = rawAuthorAvatar.trim() || null;
    const source = rawSource.trim().slice(0, 50) || 'TripAdvisor';

    if (!authorName || authorName.length < 2) {
      return { success: false, error: 'Please enter a valid author name (min 2 characters).' };
    }

    if (!comment || comment.length < 5) {
      return { success: false, error: 'Please enter a valid review comment (min 5 characters).' };
    }

    // New reviews are pending approval by default
    const review = await db.review.create({
      data: {
        authorName,
        location,
        routeText,
        rating,
        title,
        comment,
        imageUrl,
        authorAvatar,
        source,
        isPublished: false, // require admin approval
      },
    });

    revalidatePath('/reviews');
    revalidatePath('/');
    return { success: true, review };
  } catch (e: any) {
    console.error('Error submitting review:', e?.message || e);
    return { success: false, error: 'Failed to submit review. Please try again.' };
  }
}

// ─── ADMIN ACTIONS (auth-gated) ────────────────────────────────────────────

export async function adminCreateReviewAction(data: {
  authorName: string;
  location?: string;
  routeText?: string;
  rating?: number;
  title?: string;
  comment: string;
  imageUrl?: string | null;
  authorAvatar?: string | null;
  source?: string;
  isPublished?: boolean;
}) {
  const auth = await getAdminSession();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const authorName = data.authorName.trim();
    if (!authorName) return { success: false, error: 'Author name is required.' };
    const comment = data.comment.trim();
    if (!comment) return { success: false, error: 'Review comment is required.' };

    const review = await db.review.create({
      data: {
        authorName,
        location: data.location?.trim() || 'Paris, France',
        routeText: data.routeText?.trim() || 'Paris Airport Transfer',
        rating: Math.min(Math.max(data.rating || 5, 1), 5),
        title: data.title?.trim() || null,
        comment,
        imageUrl: data.imageUrl?.trim() || null,
        authorAvatar: data.authorAvatar?.trim() || null,
        source: data.source?.trim() || 'TripAdvisor',
        isPublished: data.isPublished ?? true,
      },
    });

    revalidatePath('/ffs-portal-sec-99x/reviews');
    revalidatePath('/reviews');
    revalidatePath('/');
    return { success: true, review };
  } catch (err: any) {
    console.error('Error in adminCreateReviewAction:', err);
    return { success: false, error: err?.message || 'Failed to create review.' };
  }
}

export async function adminUpdateReviewAction(
  id: string,
  data: {
    authorName?: string;
    location?: string;
    routeText?: string;
    rating?: number;
    title?: string;
    comment?: string;
    imageUrl?: string | null;
    authorAvatar?: string | null;
    source?: string;
    isPublished?: boolean;
  }
) {
  const auth = await getAdminSession();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const review = await db.review.update({
      where: { id },
      data: {
        ...(data.authorName !== undefined ? { authorName: data.authorName.trim() } : {}),
        ...(data.location !== undefined ? { location: data.location.trim() } : {}),
        ...(data.routeText !== undefined ? { routeText: data.routeText.trim() } : {}),
        ...(data.rating !== undefined ? { rating: Math.min(Math.max(data.rating, 1), 5) } : {}),
        ...(data.title !== undefined ? { title: data.title?.trim() || null } : {}),
        ...(data.comment !== undefined ? { comment: data.comment.trim() } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl?.trim() || null } : {}),
        ...(data.authorAvatar !== undefined ? { authorAvatar: data.authorAvatar?.trim() || null } : {}),
        ...(data.source !== undefined ? { source: data.source.trim() } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
      },
    });

    revalidatePath('/ffs-portal-sec-99x/reviews');
    revalidatePath('/reviews');
    revalidatePath('/');
    return { success: true, review };
  } catch (err: any) {
    console.error('Error in adminUpdateReviewAction:', err);
    return { success: false, error: err?.message || 'Failed to update review.' };
  }
}

export async function adminPublishReviewAction(id: string) {
  const auth = await getAdminSession();
  if (!auth) return { success: false, error: 'Unauthorized' };

  await db.review.update({ where: { id }, data: { isPublished: true } });
  revalidatePath('/ffs-portal-sec-99x/reviews');
  revalidatePath('/reviews');
  revalidatePath('/');
  return { success: true };
}

export async function adminUnpublishReviewAction(id: string) {
  const auth = await getAdminSession();
  if (!auth) return { success: false, error: 'Unauthorized' };

  await db.review.update({ where: { id }, data: { isPublished: false } });
  revalidatePath('/ffs-portal-sec-99x/reviews');
  revalidatePath('/reviews');
  revalidatePath('/');
  return { success: true };
}

export async function adminDeleteReviewAction(id: string) {
  const auth = await getAdminSession();
  if (!auth) return { success: false, error: 'Unauthorized' };

  await db.review.delete({ where: { id } });
  revalidatePath('/ffs-portal-sec-99x/reviews');
  revalidatePath('/reviews');
  revalidatePath('/');
  return { success: true };
}
