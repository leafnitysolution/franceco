import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingRef: string }> }) {
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
    const { bookingRef } = await params;

    const booking = await db.booking.findUnique({
      where: { bookingRef },
      include: {
        origin: true,
        destination: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking with reference '${bookingRef}' not found.`,
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
      origin: booking.origin ? { name: booking.origin.name, shortCode: booking.origin.shortCode } : null,
      destination: booking.destination ? { name: booking.destination.name, shortCode: booking.destination.shortCode } : null,
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      pickupDateTime: booking.pickupDateTime,
      vehicleTier: booking.vehicleTier,
      passengers: booking.passengers,
      totalFareEur: booking.totalFareEur,
      flightOrTrainNumber: booking.flightOrTrainNumber,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching partner B2B booking status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch booking status',
      },
      { status: 500 }
    );
  }
}
