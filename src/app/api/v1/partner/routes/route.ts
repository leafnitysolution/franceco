import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

function verifyPartnerApiKey(req: NextRequest): boolean {
  const apiKey =
    req.headers.get('X-API-Key') ||
    req.headers.get('x-api-key') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expectedKey = process.env.PARTNER_API_KEY || 'ffs_partner_live_secret_key_2026';

  if (!apiKey || !expectedKey) return false;
  const bufA = Buffer.from(apiKey, 'utf-8');
  const bufB = Buffer.from(expectedKey, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest) {
  if (!verifyPartnerApiKey(req)) {
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

    const [locations, categories, routes] = await Promise.all([
      db.location.findMany({
        orderBy: { name: 'asc' },
      }),
      db.locationCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      db.route.findMany({
        where: { isActive: true },
        include: {
          origin: true,
          destination: true,
        },
        orderBy: { isFeatured: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      categories: categories.map((cat) => ({
        key: cat.key,
        name: cat.name,
        sortOrder: cat.sortOrder,
      })),
      locations: locations.map((loc) => ({
        id: loc.id,
        shortCode: loc.shortCode,
        name: loc.name,
        category: loc.category,
      })),
      routes: routes.map((r) => ({
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
      })),
    });
  } catch (error) {
    console.error('Error fetching partner routes catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch live partner routes and locations',
      },
      { status: 500 }
    );
  }
}
