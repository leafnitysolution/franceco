import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureLocationsSeeded } from '@/lib/seedHelper';
import { getSetting } from '@/lib/settings';

interface NormalizedReview {
  id: string | number;
  name: string;
  originCountry: string;
  route: string;
  rating: number;
  date: string;
  verified: boolean;
  review: string;
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
    'AIzaSyAbKOFmzULGRBcEaqygSCIMjncsjrjL564';
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
      // 1A. Fetch Location Summary Score & Total Review Count
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

      // 1B. Fetch Live Review Text Submissions from TripAdvisor
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
          for (const item of reviewsData.data) {
            if (item.text) {
              liveReviewsList.push({
                id: item.id || Math.random(),
                name: item.user?.username || 'TripAdvisor Guest',
                originCountry: item.user?.user_location?.name || 'Verified Traveler',
                route: 'VIP Airport Transfer',
                rating: item.rating || 5,
                date: item.published_date
                  ? new Date(item.published_date).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Recent',
                verified: true,
                review: item.text,
              });
            }
          }
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
                  originCountry: 'Google Review ★',
                  route: 'Private Chauffeur Transfer',
                  rating: Number(nRev.rating) || 5,
                  date: nRev.relativePublishTimeDescription || 'Recent',
                  verified: true,
                  review: text,
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
              for (const rev of gData.result.reviews) {
                if (rev.text) {
                  liveReviewsList.push({
                    id: rev.time || Math.random(),
                    name: rev.author_name || 'Google Reviewer',
                    originCountry: 'Google Verified Guest',
                    route: 'Paris Private Chauffeur',
                    rating: rev.rating || 5,
                    date: rev.relative_time_description || 'Recent',
                    verified: true,
                    review: rev.text,
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Google Places API fetch error, falling back to local database:', err);
    }
  }

  await ensureLocationsSeeded();

  // =========================================================
  // 3. Fallback to Database Reviews if external APIs not configured or empty
  // =========================================================
  let finalReviews = liveReviewsList;

  if (finalReviews.length === 0) {
    const dbReviews = await db.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    finalReviews = dbReviews.map((r) => ({
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
      review: r.comment,
    }));
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
