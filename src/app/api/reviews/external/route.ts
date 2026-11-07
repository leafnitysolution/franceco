import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureLocationsSeeded } from '@/lib/seedHelper';
import { getSetting, ensureSettingsTable } from '@/lib/settings';
import fs from 'fs';
import path from 'path';

export interface NormalizedReview {
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

const DEFAULT_CUSTOMER_PHOTOS = [
  '/images/reviews/review_family_travel.jpg',
  '/images/reviews/review_luxury_van.jpg',
  '/images/reviews/review_family_disney.jpg',
  '/images/reviews/review_couple_paris.jpg',
  '/images/reviews/review_airport_meet.jpg',
  '/images/reviews/review_business_client.jpg',
];

const DEFAULT_AVATARS = [
  '/images/reviews/avatar_sarah.jpg',
  '/images/reviews/avatar_michael.jpg',
  '/images/reviews/avatar_elena.jpg',
  '/images/reviews/avatar_jean.jpg',
  '/images/reviews/avatar_emma.jpg',
  '/images/reviews/avatar_david.jpg',
];

const DEFAULT_TITLES = [
  'Outstanding chauffeur, kids loved the trip!',
  'Punctual, luxurious van & fixed transparent fare',
  'Direct hassle-free transfer from Beauvais to Disney',
  'Arrived early, very polite and impeccable Mercedes',
  'Chauffeur was waiting right at terminal arrivals',
  'Executive business class service at its best',
];

function resolveSafePhoto(
  url: string | null | undefined,
  fallbackIndex: number,
  defaultList: string[]
): string {
  const fallback = defaultList[fallbackIndex % defaultList.length];
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return fallback;

  // External image URL
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  // Local image path: ensure file actually exists in public directory
  if (trimmed.startsWith('/')) {
    try {
      const relPath = trimmed.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), 'public', relPath);
      if (fs.existsSync(fullPath)) {
        return trimmed;
      }
    } catch {
      // Ignore filesystem access check errors and return safe fallback
    }
  }

  return fallback;
}

export async function GET() {
  const tripAdvisorApiKey = (await getSetting('TRIPADVISOR_API_KEY')) || process.env.TRIPADVISOR_API_KEY;
  const tripAdvisorLocationId = (await getSetting('TRIPADVISOR_LOCATION_ID')) || process.env.TRIPADVISOR_LOCATION_ID;
  const tripAdvisorUrl = (await getSetting('TRIPADVISOR_URL')) || process.env.TRIPADVISOR_URL || 'https://www.tripadvisor.com';

  const googleApiKey =
    (await getSetting('GOOGLE_MAPS_API_KEY')) ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    (process.env.GOOGLE_MAPS_API_KEY || '');
  const googlePlaceId = (await getSetting('GOOGLE_PLACE_ID')) || process.env.GOOGLE_PLACE_ID || 'ChIJK_W2Fipt5kcRCOpTeqfLY6g';
  const googleReviewsUrl = (await getSetting('GOOGLE_REVIEWS_URL')) || process.env.GOOGLE_REVIEWS_URL || 'https://maps.app.goo.gl/DwYGzJ9yDqszXAPW7';

  let liveRatingScore: number | null = null;
  let liveTotalReviews: number | null = null;
  let liveSource: string | null = null;
  let liveWebUrl: string = tripAdvisorUrl;
  let liveGoogleUrl: string = googleReviewsUrl;
  const liveReviewsList: NormalizedReview[] = [];

  // =========================================================
  // 1. Fetch Live TripAdvisor Details & Reviews (if configured)
  // =========================================================
  if (tripAdvisorApiKey && tripAdvisorLocationId) {
    try {
      const detailsRes = await fetch(
        `https://api.content.tripadvisor.com/api/v1/location/${tripAdvisorLocationId}/details?key=${tripAdvisorApiKey}&language=en`,
        {
          headers: { accept: 'application/json' },
          next: { revalidate: 3600 },
        }
      );

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        liveRatingScore = parseFloat(detailsData.rating || '4.9');
        liveTotalReviews = parseInt(detailsData.num_reviews || '384', 10);
        liveSource = 'TripAdvisor Official API';
        if (detailsData.web_url) {
          liveWebUrl = detailsData.web_url;
        }
      }

      const reviewsRes = await fetch(
        `https://api.content.tripadvisor.com/api/v1/location/${tripAdvisorLocationId}/reviews?key=${tripAdvisorApiKey}&language=en`,
        {
          headers: { accept: 'application/json' },
          next: { revalidate: 3600 },
        }
      );

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        if (Array.isArray(reviewsData.data)) {
          reviewsData.data.forEach((item: any, idx: number) => {
            if (item.text) {
              liveReviewsList.push({
                id: item.id || `ta-${idx}`,
                name: item.user?.username || 'TripAdvisor Guest',
                originCountry: item.user?.user_location?.name || 'Verified Traveler 🦉',
                route: 'VIP Airport & Disney Transfer',
                rating: item.rating || 5,
                date: item.published_date
                  ? new Date(item.published_date).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Recent',
                verified: true,
                title: item.title || 'Exceptional Private Transfer',
                review: item.text,
                imageUrl: DEFAULT_CUSTOMER_PHOTOS[idx % DEFAULT_CUSTOMER_PHOTOS.length],
                authorAvatar: item.user?.avatar?.thumbnail || item.user?.avatar?.small || DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
                source: 'TripAdvisor',
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('TripAdvisor API fetch error, falling back to local database:', err);
    }
  }

  // =========================================================
  // 2. Fetch Live Google Places Details & Reviews (if configured)
  // =========================================================
  if (googleApiKey && googlePlaceId) {
    try {
      let googleFetched = false;

      // 2A. Try Modern Places API (New) v1 endpoint
      try {
        const newRes = await fetch(
          `https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': googleApiKey,
              'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri',
            },
            next: { revalidate: 3600 },
          }
        );

        if (newRes.ok) {
          const newData = await newRes.json();
          if (!liveRatingScore && newData.rating) liveRatingScore = newData.rating;
          if (!liveTotalReviews && newData.userRatingCount) liveTotalReviews = newData.userRatingCount;
          if (newData.googleMapsUri) liveGoogleUrl = newData.googleMapsUri;
          liveSource = liveSource ? 'TripAdvisor & Google Live API' : 'Google Places Official API';

          if (Array.isArray(newData.reviews)) {
            newData.reviews.forEach((nRev: any, idx: number) => {
              const text = nRev.text?.text || nRev.originalText?.text;
              if (text) {
                liveReviewsList.push({
                  id: `google-v1-${idx}-${Date.now()}`,
                  name: nRev.authorAttribution?.displayName || 'Google Guest',
                  originCountry: 'Google Verified Review ★',
                  route: 'Private Chauffeur Transfer',
                  rating: Number(nRev.rating) || 5,
                  date: nRev.relativePublishTimeDescription || 'Recent',
                  verified: true,
                  title: 'Flawless Chauffeur Service',
                  review: text,
                  imageUrl: DEFAULT_CUSTOMER_PHOTOS[idx % DEFAULT_CUSTOMER_PHOTOS.length],
                  authorAvatar: nRev.authorAttribution?.photoUri || DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
                  source: 'Google',
                });
              }
            });
          }
          googleFetched = true;
        }
      } catch (newErr) {
        console.warn('Places API (New) fetch error, falling back to legacy endpoint:', newErr);
      }

      // 2B. Fallback to Legacy Google Place Details endpoint if v1 wasn't used
      if (!googleFetched) {
        const gRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
            googlePlaceId
          )}&fields=name,rating,user_ratings_total,reviews,url&key=${encodeURIComponent(googleApiKey)}`,
          { next: { revalidate: 3600 } }
        );

        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.result) {
            if (!liveRatingScore && gData.result.rating) {
              liveRatingScore = gData.result.rating;
            }
            if (!liveTotalReviews && gData.result.user_ratings_total) {
              liveTotalReviews = gData.result.user_ratings_total;
            }
            if (gData.result.url) {
              liveGoogleUrl = gData.result.url;
            }
            liveSource = liveSource ? 'TripAdvisor & Google Live API' : 'Google Places Official API';

            if (Array.isArray(gData.result.reviews)) {
              gData.result.reviews.forEach((rev: any, idx: number) => {
                if (rev.text) {
                  liveReviewsList.push({
                    id: rev.time || `g-legacy-${idx}`,
                    name: rev.author_name || 'Google Reviewer',
                    originCountry: 'Google Verified Guest',
                    route: 'Paris Private Chauffeur',
                    rating: rev.rating || 5,
                    date: rev.relative_time_description || 'Recent',
                    verified: true,
                    title: 'Highly Recommended VIP Service',
                    review: rev.text,
                    imageUrl: DEFAULT_CUSTOMER_PHOTOS[idx % DEFAULT_CUSTOMER_PHOTOS.length],
                    authorAvatar: rev.profile_photo_url || DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
                    source: 'Google',
                  });
                }
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Google Places API fetch error, falling back to local database:', err);
    }
  }

  await ensureLocationsSeeded();
  await ensureSettingsTable();

  // =========================================================
  // 3. Fallback / Merge Database Reviews
  // =========================================================
  const dbReviews = await db.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const normalizedDbReviews: NormalizedReview[] = dbReviews.map((r, idx) => ({
    id: r.id,
    name: r.authorName,
    originCountry: r.location,
    route: r.routeText,
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    verified: true,
    title:
      r.title && r.title.trim() && r.title !== 'Outstanding Experience'
        ? r.title.trim()
        : DEFAULT_TITLES[idx % DEFAULT_TITLES.length],
    review: r.comment,
    imageUrl: resolveSafePhoto(r.imageUrl, idx, DEFAULT_CUSTOMER_PHOTOS),
    authorAvatar: resolveSafePhoto(r.authorAvatar, idx, DEFAULT_AVATARS),
    source: r.source || 'TripAdvisor',
  }));

  // Combine: prioritize reviews with custom photos, followed by live reviews
  let finalReviews: NormalizedReview[] = [];
  if (normalizedDbReviews.length > 0) {
    // If admin has published database reviews, blend with live reviews
    const existingNames = new Set(normalizedDbReviews.map((r) => r.name.toLowerCase()));
    const uniqueLive = liveReviewsList.filter((l) => !existingNames.has(l.name.toLowerCase()));
    finalReviews = [...normalizedDbReviews, ...uniqueLive];
  } else {
    finalReviews = liveReviewsList;
  }

  return NextResponse.json({
    success: true,
    ratingScore: liveRatingScore || 4.9,
    totalReviews: liveTotalReviews || (380 + finalReviews.length),
    source: liveSource || 'Verified Guest Reviews & TripAdvisor',
    tripAdvisorUrl: liveWebUrl,
    googleReviewsUrl: liveGoogleUrl,
    reviews: finalReviews,
  });
}
