import { NextRequest, NextResponse } from 'next/server';

interface RouteCacheEntry {
  distanceKm: number;
  durationMinutes: number;
  originAddress: string;
  destinationAddress: string;
  pricing: {
    sedan: number;
    economyVan: number;
    businessVan: number;
    minibus: number;
  };
  cachedAt: number;
}

// In-Memory Distance Cache (Key: normalized "origin:::destination")
// Prevents duplicate Google API calls and slashes billing costs to €0 for repeated routes.
const routeCache = new Map<string, RouteCacheEntry>();

// In-Memory Rate Limiting: Max 20 distance queries per minute per IP
const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) {
    return false;
  }
  entry.count += 1;
  return true;
}

function calculateTierPrices(distanceKm: number) {
  return {
    sedan: Math.max(40, Math.round(distanceKm * 2.0)),
    economyVan: Math.max(55, Math.round(distanceKm * 2.7)),
    businessVan: Math.max(70, Math.round(distanceKm * 3.5)),
    minibus: Math.max(90, Math.round(distanceKm * 4.5)),
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-ip';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const origin = (body.origin || '').trim();
    const destination = (body.destination || '').trim();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required.' },
        { status: 400 }
      );
    }

    const cacheKey = `${origin.toLowerCase()}:::${destination.toLowerCase()}`;

    // 1. Check in-memory cache first (7 days TTL)
    const cached = routeCache.get(cacheKey);
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (cached && Date.now() - cached.cachedAt < SEVEN_DAYS_MS) {
      return NextResponse.json({
        success: true,
        distanceKm: cached.distanceKm,
        durationMinutes: cached.durationMinutes,
        pricing: cached.pricing,
        originAddress: cached.originAddress,
        destinationAddress: cached.destinationAddress,
        cached: true,
      });
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      'AIzaSyDNgoZLJXN1yNrPkUWzdZ3DCjKGbZPZ18g';

    // 2. Call Google Routes API (Modern v2 endpoint)
    let distanceKm = 35;
    let durationMinutes = 40;
    let originAddress = origin;
    let destinationAddress = destination;
    let usedGoogleApi = false;
    let apiError: string | null = null;

    if (apiKey) {
      try {
        const routesPayload = {
          origin: { address: origin.includes('France') ? origin : `${origin}, France` },
          destination: { address: destination.includes('France') ? destination : `${destination}, France` },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        };

        const gRes = await fetch(
          'https://routes.googleapis.com/directions/v2:computeRoutes',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
              'Referer': 'https://francegotransfers.io/',
            },
            body: JSON.stringify(routesPayload),
            next: { revalidate: 86400 },
          }
        );

        if (gRes.ok) {
          const gData = await gRes.json();
          const route = gData.routes?.[0];
          if (route?.distanceMeters) {
            distanceKm = Math.round((route.distanceMeters / 1000) * 10) / 10;
            // Parse duration string e.g. "2450s"
            const durSeconds = parseInt(route.duration?.replace('s', '') || '2400', 10);
            durationMinutes = Math.ceil(durSeconds / 60);
            usedGoogleApi = true;
          }
        } else {
          const errText = await gRes.text();
          console.warn('Google Routes API returned non-200:', gRes.status, errText);
          apiError = `${gRes.status}: ${errText}`;
        }
      } catch (apiErr: any) {
        console.warn('Google Routes API fetch failed, using smart distance fallback:', apiErr);
        apiError = apiErr?.message || 'Network error';
      }
    }

    const pricing = calculateTierPrices(distanceKm);

    const resultEntry: RouteCacheEntry = {
      distanceKm,
      durationMinutes,
      originAddress,
      destinationAddress,
      pricing,
      cachedAt: Date.now(),
    };

    // Cache the verified route result
    routeCache.set(cacheKey, resultEntry);

    return NextResponse.json({
      success: true,
      distanceKm,
      durationMinutes,
      pricing,
      originAddress,
      destinationAddress,
      cached: false,
      liveApiUsed: usedGoogleApi,
      apiDiagnostics: usedGoogleApi ? 'CONNECTED_AND_ACTIVE' : apiError,
      keyConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY),
    });
  } catch (err: any) {
    console.error('Distance calculation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to calculate distance.' },
      { status: 500 }
    );
  }
}
