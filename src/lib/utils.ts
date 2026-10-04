import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FGO-${randomCode}`;
}

export function buildWhatsAppUrl(booking: {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: Date;
  flightOrTrainNumber?: string | null;
  vehicleTier: string;
  passengers: number;
  luggageCount: number;
  babySeats: number;
  boosterSeats: number;
  totalFareEur: number;
  notes?: string | null;
}): string {
  const formattedDate = new Date(booking.pickupDateTime).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const vehicleName =
    booking.vehicleTier === 'SEDAN'
      ? 'Berline Sedan (1-3 Pax)'
      : booking.vehicleTier === 'BUSINESS_VAN'
      ? 'VIP Business Van (1-7 Pax)'
      : booking.vehicleTier === 'MINIBUS'
      ? 'Executive Minibus (1-16 Pax)'
      : 'Economy Minivan (1-8 Pax)';

  const text = `🚕 *FRANCEGO - DISPATCH ORDER*
----------------------------------------
*Ref:* ${booking.bookingRef}
*Date/Time:* ${formattedDate}
*Vehicle:* ${vehicleName}

📍 *Pickup:* ${booking.pickupAddress}
🏁 *Dropoff:* ${booking.dropoffAddress}
✈️ *Flight/Train:* ${booking.flightOrTrainNumber || 'N/A'}

👤 *Passenger:* ${booking.customerName}
📞 *Phone:* ${booking.customerPhone}
👥 *Pax:* ${booking.passengers} | 🧳 *Bags:* ${booking.luggageCount}
👶 *Child Seats:* ${booking.babySeats} Baby, ${booking.boosterSeats} Booster

💶 *CASH FARE TO COLLECT:* ${booking.totalFareEur}€
${booking.notes ? `📝 *Notes:* ${booking.notes}` : ''}
----------------------------------------
Please confirm driver assignment.`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

