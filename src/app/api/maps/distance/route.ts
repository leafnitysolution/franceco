import { NextRequest, NextResponse } from 'next/server';
import { getSetting, getPricingSettings, PricingEngineSettings } from '@/lib/settings';
import { db } from '@/lib/db';
import { findZoneRoute, detectZone } from '@/lib/zoneResolver';

interface RouteCacheEntry {
  distanceKm: number;
  durationMinutes: number;
  originAddress: string;
  destinationAddress: string;
  isFixedZoneRate: boolean;
  matchedZoneLabel?: string;
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

function calculateDynamicTierPrices(
  distanceKm: number,
  pricing: PricingEngineSettings,
  isParisIntramuros: boolean = false
) {
  const base = pricing.baseBookingFee || 0;
  let sedan = Math.round(base + distanceKm * pricing.ratePerKmSedan);
  let economyVan = Math.round(base + distanceKm * pricing.ratePerKmEconomyVan);
  let businessVan = Math.round(base + distanceKm * pricing.ratePerKmBusinessVan);
  let minibus = Math.round(base + distanceKm * pricing.ratePerKmMinibus);

  // 1. Enforce minimum floor fares per vehicle tier
  sedan = Math.max(pricing.minFareSedan, sedan);
  economyVan = Math.max(pricing.minFareEconomyVan, economyVan);
  businessVan = Math.max(pricing.minFareBusinessVan, businessVan);
  minibus = Math.max(pricing.minFareMinibus, minibus);

  // 2. Enforce Paris Intra-Muros minimum if trip is within Paris City Center
  if (isParisIntramuros && pricing.parisIntramurosMinFare > 0) {
    sedan = Math.max(pricing.parisIntramurosMinFare, sedan);
    economyVan = Math.max(Math.round(pricing.parisIntramurosMinFare * 1.25), economyVan);
    businessVan = Math.max(Math.round(pricing.parisIntramurosMinFare * 1.65), businessVan);
    minibus = Math.max(Math.round(pricing.parisIntramurosMinFare * 2.3), minibus);
  }

  return { sedan, economyVan, businessVan, minibus };
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
        isFixedZoneRate: cached.isFixedZoneRate || false,
        matchedZoneLabel: cached.matchedZoneLabel,
        originAddress: cached.originAddress,
        destinationAddress: cached.destinationAddress,
        cached: true,
      });
    }

    // Dynamic API key resolution: Admin Panel DB -> .env -> Verified Default
    const apiKey =
      (await getSetting('GOOGLE_MAPS_API_KEY')) ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      (process.env.GOOGLE_MAPS_API_KEY || '');
    if (!apiKey) return NextResponse.json({ error: 'Google Maps API key not configured.' }, { status: 503 });

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

    // 3. Zone-Based Fixed Pricing Check
    // If endpoints belong to a predefined fixed route (e.g. CDG ↔ Paris City Center),
    // apply the database route rate regardless of individual street distance.
    let matchedZone = null;
    try {
      const dbRoutes = await db.route.findMany({
        where: { isActive: true },
        include: { origin: true, destination: true },
      });
      matchedZone = findZoneRoute(body.originLocation || origin, body.destinationLocation || destination, dbRoutes);
    } catch (dbErr) {
      console.warn('Zone route resolution DB check skipped:', dbErr);
    }

    const isFixedZoneRate = Boolean(matchedZone);
    const matchedZoneLabel = matchedZone?.zoneLabel;

    // Load admin pricing rules and check intra-Paris boundary
    const pricingCfg = await getPricingSettings();
    const originZone = detectZone(origin, body.originLocation);
    const destZone = detectZone(destination, body.destinationLocation);
    const isParisIntramuros = originZone === 'PAR' && destZone === 'PAR';

    const pricing = matchedZone
      ? matchedZone.pricing
      : calculateDynamicTierPrices(distanceKm, pricingCfg, isParisIntramuros);

    const resultEntry: RouteCacheEntry = {
      distanceKm,
      durationMinutes,
      originAddress,
      destinationAddress,
      isFixedZoneRate,
      matchedZoneLabel,
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
      isFixedZoneRate,
      matchedZoneLabel,
      originAddress,
      destinationAddress,
      cached: false,
      liveApiUsed: usedGoogleApi,
      apiDiagnostics: usedGoogleApi ? 'CONNECTED_AND_ACTIVE' : apiError,
      keyConfigured: Boolean(apiKey),
    });
  } catch (err: any) {
    console.error('Distance calculation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to calculate distance.' },
      { status: 500 }
    );
  }
}
