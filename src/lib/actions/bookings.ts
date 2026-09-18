'use server';

import { db } from '@/lib/db';
import { bookingFormSchema, BookingFormValues } from '@/lib/validators';
import { generateBookingRef } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { sendBookingConfirmationEmails } from '@/lib/email';
import { getAdminSession } from '@/lib/auth';
import { headers } from 'next/headers';

// Simple In-Memory Sliding Window Rate Limiter (5 bookings per hour per IP)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_BOOKINGS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter timestamps within the 1-hour window
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_BOOKINGS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function createBookingAction(formData: BookingFormValues) {
  try {
    // 1. Bot Honeypot Check: if website_url is filled out by automated scripts, reject silently
    if (formData.website_url && formData.website_url.trim().length > 0) {
      console.warn('Bot submission blocked via honeypot field');
      return {
        success: true,
        booking: {
          id: 'dummy-id',
          bookingRef: 'PGT-BOT-BLOCK',
          customerEmail: formData.customerEmail,
        },
      };
    }

    // 2. IP Rate Limiting Check
    const headersList = await headers();
    const clientIp =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return {
        success: false,
        error: 'Too many booking attempts from your connection. Please wait an hour before submitting again.',
      };
    }

    // 3. Strict Input Schema Validation
    const validated = bookingFormSchema.parse(formData);

    // 4. Pickup Date Time Bounds Check
    const pickupDateTime = new Date(`${validated.pickupDate}T${validated.pickupTime}:00`);
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000); // Flexible for current day bookings

    if (isNaN(pickupDateTime.getTime())) {
      return { success: false, error: 'Invalid pickup date or time format.' };
    }

    if (pickupDateTime < thirtyMinsAgo) {
      return {
        success: false,
        error: 'Pickup time cannot be scheduled in the past.',
      };
    }

    let returnDateTime: Date | null = null;
    if (validated.isReturn && validated.returnDate && validated.returnTime) {
      returnDateTime = new Date(`${validated.returnDate}T${validated.returnTime}:00`);
      if (isNaN(returnDateTime.getTime()) || returnDateTime <= pickupDateTime) {
        return {
          success: false,
          error: 'Return date & time must be after the initial pickup time.',
        };
      }
    }

    // 5. SERVER-SIDE PRICE RECALCULATION (Eliminate Client Price Tampering Risk)
    let calculatedOneWayFare = 70; // Fallback standard fare

    if (validated.originId && validated.destinationId) {
      const dbRoute = await db.route.findFirst({
        where: {
          OR: [
            { originId: validated.originId, destinationId: validated.destinationId },
            { originId: validated.destinationId, destinationId: validated.originId },
          ],
          isActive: true,
        },
      });

      if (dbRoute) {
        if (validated.vehicleTier === 'SEDAN') calculatedOneWayFare = dbRoute.sedanPriceEur;
        else if (validated.vehicleTier === 'ECONOMY_VAN') calculatedOneWayFare = dbRoute.economyVanPriceEur;
        else if (validated.vehicleTier === 'BUSINESS_VAN') calculatedOneWayFare = dbRoute.businessVanPriceEur;
        else if (validated.vehicleTier === 'MINIBUS') calculatedOneWayFare = dbRoute.minibusPriceEur;
      }
    }

    // Exact fare computation server-side
    const finalTotalFareEur = validated.isReturn ? calculatedOneWayFare * 2 : calculatedOneWayFare;

    // 6. Idempotent Database Transaction
    const bookingRef = generateBookingRef();

    const booking = await db.$transaction(async (tx) => {
      return await tx.booking.create({
        data: {
          bookingRef,
          status: 'PENDING',
          originId: validated.originId || null,
          destinationId: validated.destinationId || null,
          pickupAddress: validated.pickupAddress,
          dropoffAddress: validated.dropoffAddress,
          pickupDateTime,
          flightOrTrainNumber: validated.flightOrTrainNumber || null,
          returnDateTime,
          returnFlightNumber: validated.returnFlightNumber || null,
          vehicleTier: validated.vehicleTier,
          passengers: validated.passengers,
          luggageCount: validated.luggageCount,
          babySeats: validated.babySeats,
          boosterSeats: validated.boosterSeats,
          totalFareEur: finalTotalFareEur, // Use 100% server calculated fare!
          customerName: validated.customerName,
          customerEmail: validated.customerEmail,
          customerPhone: validated.customerPhone,
          notes: validated.notes || null,
        },
        include: {
          origin: true,
          destination: true,
        },
      });
    });

    // 7. Send Dual Email Notifications safely
    try {
      await sendBookingConfirmationEmails({
        bookingRef: booking.bookingRef,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        originName: booking.origin?.name || 'Airport / Hub',
        destinationName: booking.destination?.name || 'Disneyland / Hotel',
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        pickupDate: validated.pickupDate,
        pickupTime: validated.pickupTime,
        isReturn: validated.isReturn,
        returnDate: validated.returnDate,
        returnTime: validated.returnTime,
        vehicleTier: booking.vehicleTier,
        passengers: booking.passengers,
        luggageCount: booking.luggageCount,
        babySeats: booking.babySeats,
        boosterSeats: booking.boosterSeats,
        totalFareEur: booking.totalFareEur,
        flightOrTrainNumber: booking.flightOrTrainNumber || undefined,
        notes: booking.notes || undefined,
      });
    } catch (emailErr) {
      console.error('Non-critical email notification error:', emailErr);
    }

    revalidatePath('/ffs-portal-sec-99x/bookings');

    return {
      success: true,
      booking: {
        id: booking.id,
        bookingRef: booking.bookingRef,
        customerEmail: booking.customerEmail,
      },
    };
  } catch (error: any) {
    console.error('Error creating booking:', error?.message || error);
    return {
      success: false,
      error: 'Unable to complete booking. Please verify your details and try again.',
    };
  }
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
) {
  try {
    // Defense-in-depth admin session validation
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    revalidatePath('/ffs-portal-sec-99x/bookings');
    return { success: true, booking: updated };
  } catch (error: any) {
    console.error('Error updating booking status:', error?.message || error);
    return { success: false, error: 'Failed to update booking status.' };
  }
}

export async function deleteBookingAction(bookingId: string) {
  try {
    // Defense-in-depth admin session validation
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    await db.booking.delete({
      where: { id: bookingId },
    });

    revalidatePath('/ffs-portal-sec-99x/bookings');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting booking:', error?.message || error);
    return { success: false, error: 'Failed to delete booking record.' };
  }
}
