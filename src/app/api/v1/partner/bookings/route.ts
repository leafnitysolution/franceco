import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendBookingConfirmationEmails } from '@/lib/email';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

export async function POST(req: NextRequest) {
  // 1. Authenticate Partner API Key
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  const expectedKey = process.env.PARTNER_API_KEY || 'ffs_partner_live_secret_key_2026';

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Invalid or missing Partner API Key (X-API-Key header required)',
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const {
      originCode,
      destinationCode,
      pickupAddress,
      dropoffAddress,
      pickupDateTime,
      returnDateTime,
      vehicleTier = 'SEDAN',
      passengers = 1,
      luggageCount = 1,
      babySeats = 0,
      boosterSeats = 0,
      flightNumber,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      partnerReference,
    } = body;

    // 2. Validate Required Fields
    if (!originCode || !destinationCode || !pickupAddress || !dropoffAddress || !pickupDateTime || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required booking fields: originCode, destinationCode, pickupAddress, dropoffAddress, pickupDateTime, customerName, customerEmail, customerPhone',
        },
        { status: 400 }
      );
    }

    // Auto-seed if database has 0 locations
    await ensureLocationsSeeded();

    // 3. Resolve Origin & Destination Locations
    const originLoc = await db.location.findFirst({
      where: {
        OR: [{ shortCode: originCode.toUpperCase() }, { id: originCode }, { name: { contains: originCode } }],
      },
    });

    const destLoc = await db.location.findFirst({
      where: {
        OR: [{ shortCode: destinationCode.toUpperCase() }, { id: destinationCode }, { name: { contains: destinationCode } }],
      },
    });

    if (!originLoc || !destLoc) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid route location codes. Origin '${originCode}' or Destination '${destinationCode}' not found.`,
        },
        { status: 400 }
      );
    }

    // 4. Calculate Route Pricing
    const route = await db.route.findFirst({
      where: {
        originId: originLoc.id,
        destinationId: destLoc.id,
      },
    });

    let basePrice = 70;
    if (route) {
      basePrice =
        vehicleTier === 'SEDAN'
          ? route.sedanPriceEur
          : vehicleTier === 'BUSINESS_VAN'
          ? route.businessVanPriceEur
          : vehicleTier === 'MINIBUS'
          ? route.minibusPriceEur
          : route.economyVanPriceEur;
    } else {
      basePrice = vehicleTier === 'SEDAN' ? 75 : vehicleTier === 'BUSINESS_VAN' ? 120 : vehicleTier === 'MINIBUS' ? 180 : 95;
    }

    const isReturn = Boolean(returnDateTime);
    const totalFareEur = isReturn ? basePrice * 2 : basePrice;

    // 5. Generate Unique Partner Booking Reference (e.g., FFS-B2B-894102)
    const randomRef = Math.floor(100000 + Math.random() * 900000);
    const bookingRef = `FFS-B2B-${randomRef}`;

    const formattedNotes = `[B2B Partner Booking | Ref: ${partnerReference || 'N/A'}] ${notes || ''}`.trim();

    // 6. Insert Booking Record into Database via Prisma
    const newBooking = await db.booking.create({
      data: {
        bookingRef,
        status: 'PENDING',
        originId: originLoc.id,
        destinationId: destLoc.id,
        pickupAddress,
        dropoffAddress,
        pickupDateTime: new Date(pickupDateTime),
        returnDateTime: returnDateTime ? new Date(returnDateTime) : null,
        flightOrTrainNumber: flightNumber || null,
        vehicleTier,
        passengers: Number(passengers),
        luggageCount: Number(luggageCount),
        babySeats: Number(babySeats),
        boosterSeats: Number(boosterSeats),
        totalFareEur,
        customerName,
        customerEmail,
        customerPhone,
        notes: formattedNotes,
      },
      include: {
        origin: true,
        destination: true,
      },
    });

    // 7. Dispatch Automated Dual Confirmation Emails
    const dateObj = new Date(pickupDateTime);
    const pickupDateStr = dateObj.toISOString().split('T')[0];
    const pickupTimeStr = dateObj.toTimeString().slice(0, 5);

    await sendBookingConfirmationEmails({
      bookingRef: newBooking.bookingRef,
      customerName: newBooking.customerName,
      customerEmail: newBooking.customerEmail,
      customerPhone: newBooking.customerPhone,
      originName: originLoc.name,
      destinationName: destLoc.name,
      pickupAddress: newBooking.pickupAddress,
      dropoffAddress: newBooking.dropoffAddress,
      pickupDate: pickupDateStr,
      pickupTime: pickupTimeStr,
      isReturn,
      vehicleTier: newBooking.vehicleTier,
      passengers: newBooking.passengers,
      luggageCount: newBooking.luggageCount,
      babySeats: newBooking.babySeats,
      boosterSeats: newBooking.boosterSeats,
      totalFareEur: newBooking.totalFareEur,
      flightOrTrainNumber: newBooking.flightOrTrainNumber || undefined,
      notes: newBooking.notes || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Partner booking created and confirmation emails dispatched.',
        bookingRef: newBooking.bookingRef,
        status: newBooking.status,
        totalFareEur: newBooking.totalFareEur,
        partnerReference: partnerReference || null,
        route: `${originLoc.name} (${originLoc.shortCode}) → ${destLoc.name} (${destLoc.shortCode})`,
        pickupDateTime: newBooking.pickupDateTime,
        adminPanelUrl: `/ffs-portal-sec-99x/bookings`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating partner B2B booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create partner booking: ' + (error?.message || 'Server Error'),
      },
      { status: 500 }
    );
  }
}
