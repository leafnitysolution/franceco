import { NextRequest, NextResponse } from 'next/server';

interface AutocompletePrediction {
  placeId: string;
  title: string;
  subtitle: string;
  fullText: string;
}

// In-Memory Search Cache to prevent billing when multiple users type common queries
const searchCache = new Map<string, { predictions: AutocompletePrediction[]; cachedAt: number }>();

// Rate limit: Max 40 autocomplete requests per minute per IP
const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 40) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-ip';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many search requests. Please slow down.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const input = (searchParams.get('input') || '').trim();
    const sessionToken = searchParams.get('sessionToken') || '';

    if (!input || input.length < 3) {
      return NextResponse.json({ predictions: [] });
    }

    const cacheKey = input.toLowerCase();
    const cached = searchCache.get(cacheKey);
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (cached && Date.now() - cached.cachedAt < ONE_DAY_MS) {
      return NextResponse.json({
        predictions: cached.predictions,
        cached: true,
      });
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      'AIzaSyDNgoZLJXN1yNrPkUWzdZ3DCjKGbZPZ18g';

    const payload: Record<string, any> = {
      input,
      includedRegionCodes: ['FR'], // Strictly France to save costs and avoid irrelevant international results
      languageCode: 'en',
    };

    if (sessionToken) {
      payload.sessionToken = sessionToken;
    }

    const gRes = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'Referer': 'https://francegotransfers.io/',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!gRes.ok) {
      const errText = await gRes.text();
      console.warn('Google Places Autocomplete error:', gRes.status, errText);
      return NextResponse.json({ predictions: [], error: 'Autocomplete unavailable' });
    }

    const gData = await gRes.json();
    const rawSuggestions = gData.suggestions || [];

    const predictions: AutocompletePrediction[] = rawSuggestions
      .map((s: any) => {
        const placePrediction = s.placePrediction;
        if (!placePrediction) return null;
        return {
          placeId: placePrediction.placeId || '',
          title: placePrediction.structuredFormat?.mainText?.text || placePrediction.text?.text || '',
          subtitle: placePrediction.structuredFormat?.secondaryText?.text || '',
          fullText: placePrediction.text?.text || '',
        };
      })
      .filter(Boolean);

    // Cache the predictions
    searchCache.set(cacheKey, { predictions, cachedAt: Date.now() });

    return NextResponse.json({ predictions, cached: false });
  } catch (err: any) {
    console.error('Autocomplete API error:', err);
    return NextResponse.json({ predictions: [] });
  }
}
