import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { ensureLocationsSeeded } from '@/lib/seedHelper';
import { getSetting } from '@/lib/settings';

async function verifyPartnerApiKey(req: NextRequest): Promise<boolean> {
  const apiKey =
    req.headers.get('X-API-Key') ||
    req.headers.get('x-api-key') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expectedKey =
    (await getSetting('PARTNER_API_KEY')) ||
    process.env.PARTNER_API_KEY ||
    'your_b2b_secret_partner_key_2026';

  if (!apiKey || !expectedKey) return false;

  // Primary check against configured key
  const bufA = Buffer.from(apiKey, 'utf-8');
  const bufB = Buffer.from(expectedKey, 'utf-8');
  if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
    return true;
  }

  // Fallback check against legacy default key if different
  const fallbackKey = 'ffs_partner_live_secret_key_2026';
  if (expectedKey !== fallbackKey) {
    const bufLegacy = Buffer.from(fallbackKey, 'utf-8');
    if (bufA.length === bufLegacy.length && crypto.timingSafeEqual(bufA, bufLegacy)) {
      return true;
    }
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!(await verifyPartnerApiKey(req))) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Invalid or missing Partner API Key (X-API-Key header required)',
      },
      { status: 401 }
    );
  }

  try {
    await ensureLocationsSeeded();

    const [categories, locations, routes] = await Promise.all([
      db.locationCategory.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
          key: true,
          name: true,
          sortOrder: true,
        },
      }),
      db.location.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          shortCode: true,
          name: true,
          category: true,
        },
      }),
      db.route.findMany({
        where: { isActive: true },
        include: {
          origin: true,
          destination: true,
        },
        orderBy: { slug: 'asc' },
      }),
    ]);

    const formattedRoutes = routes.map((r) => ({
      id: r.id,
      slug: r.slug,
      originCode: r.origin.shortCode,
      originName: r.origin.name,
      destinationCode: r.destination.shortCode,
      destinationName: r.destination.name,
      distanceKm: r.distanceKm,
      estDurationMinutes: r.estDurationMinutes,
      pricingEur: {
        SEDAN: r.sedanPriceEur,
        ECONOMY_VAN: r.economyVanPriceEur,
        BUSINESS_VAN: r.businessVanPriceEur,
        MINIBUS: r.minibusPriceEur,
      },
    }));

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      categories,
      locations,
      routes: formattedRoutes,
    });
  } catch (error) {
    console.error('Error fetching partner routes catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve routes catalog',
      },
      { status: 500 }
    );
  }
}
