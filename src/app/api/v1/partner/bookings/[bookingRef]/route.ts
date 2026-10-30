import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingRef: string }> }) {
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
    const { bookingRef } = await params;

    if (!bookingRef) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required bookingRef parameter',
        },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { bookingRef: bookingRef.trim().toUpperCase() },
      include: {
        origin: true,
        destination: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking with reference '${bookingRef}' was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingRef: booking.bookingRef,
      status: booking.status,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      origin: booking.origin
        ? { name: booking.origin.name, shortCode: booking.origin.shortCode }
        : null,
      destination: booking.destination
        ? { name: booking.destination.name, shortCode: booking.destination.shortCode }
        : null,
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      pickupDateTime: booking.pickupDateTime,
      returnDateTime: booking.returnDateTime,
      vehicleTier: booking.vehicleTier,
      passengers: booking.passengers,
      totalFareEur: booking.totalFareEur,
      flightOrTrainNumber: booking.flightOrTrainNumber,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching partner booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve booking information',
      },
      { status: 500 }
    );
  }
}
