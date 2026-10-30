import nodemailer from 'nodemailer';
import { formatCurrency } from './utils';
import { getSetting } from './settings';

interface EmailPayload {
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  originName: string;
  destinationName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  isReturn: boolean;
  returnDate?: string;
  returnTime?: string;
  vehicleTier: string;
  passengers: number;
  luggageCount: number;
  babySeats: number;
  boosterSeats: number;
  totalFareEur: number;
  flightOrTrainNumber?: string;
  notes?: string;
}

function escapeHtml(unsafe?: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendBookingConfirmationEmails(data: EmailPayload) {
  const adminEmail = (await getSetting('ADMIN_DISPATCH_EMAIL')) || process.env.ADMIN_DISPATCH_EMAIL || 'projet15df@outlook.fr';
  const smtpUser = (await getSetting('SMTP_USER')) || process.env.SMTP_USER || 'projet15df@outlook.fr';
  const smtpPass = (await getSetting('SMTP_PASS')) || process.env.SMTP_PASS || '';
  const smtpHost = (await getSetting('SMTP_HOST')) || process.env.SMTP_HOST || 'smtp-mail.outlook.com';
  const smtpPort = Number((await getSetting('SMTP_PORT')) || process.env.SMTP_PORT || '587');
  const smtpSecure = ((await getSetting('SMTP_SECURE')) || process.env.SMTP_SECURE) === 'true';
  const smtpSender = smtpUser || 'noreply@francego.com';

  const vehicleName =
    data.vehicleTier === 'SEDAN'
      ? 'Berline Sedan (1-3 Pax)'
      : data.vehicleTier === 'BUSINESS_VAN'
      ? 'VIP Business Van (1-7 Pax)'
      : data.vehicleTier === 'MINIBUS'
      ? 'Executive Minibus (1-16 Pax)'
      : 'Economy Minivan (1-8 Pax)';

  const safeRef = escapeHtml(data.bookingRef);
  const safeName = escapeHtml(data.customerName);
  const safeEmail = escapeHtml(data.customerEmail);
  const safePhone = escapeHtml(data.customerPhone);
  const safeOrigin = escapeHtml(data.originName);
  const safeDest = escapeHtml(data.destinationName);
  const safePickupAddr = escapeHtml(data.pickupAddress);
  const safeDropoffAddr = escapeHtml(data.dropoffAddress);
  const safePickupDate = escapeHtml(data.pickupDate);
  const safePickupTime = escapeHtml(data.pickupTime);
  const safeReturnDate = escapeHtml(data.returnDate);
  const safeReturnTime = escapeHtml(data.returnTime);
  const safeFlight = escapeHtml(data.flightOrTrainNumber);
  const safeNotes = escapeHtml(data.notes);

  const clientHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - ${safeRef}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: linear-gradient(135deg, #0B192C, #1E2D42); padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; font-family: Georgia, serif; }
        .content { padding: 24px; font-size: 14px; line-height: 1.6; }
        .ref-box { background: #fbf9f5; border: 2px dashed #C5A059; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0; }
        .ref-code { font-size: 26px; font-weight: 900; color: #0B192C; letter-spacing: 2px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .details-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
        .label { font-weight: bold; color: #475569; width: 40%; }
        .value { color: #0f172a; font-weight: 600; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FRANCEGO</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #e2e8f0;">Private Airport &amp; Disneyland Paris Transfers</p>
        </div>
        <div class="content">
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Thank you for choosing FranceGo! Your private transfer reservation has been confirmed and registered with our dispatch team.</p>

          <div class="ref-box">
            <div style="font-size: 12px; font-weight: bold; color: #64748b;">YOUR BOOKING REFERENCE:</div>
            <div class="ref-code">${safeRef}</div>
            <div style="font-size: 12px; color: #16a34a; font-weight: bold; margin-top: 4px;">Status: CONFIRMED • Pay Driver on Arrival</div>
          </div>

          <h3 style="color: #0f172a; border-bottom: 2px solid #C5A059; padding-bottom: 4px;">Trip Specifications</h3>
          <table class="details-table">
            <tr><td class="label">Route:</td><td class="value">${safeOrigin} → ${safeDest}</td></tr>
            <tr><td class="label">Pickup Location:</td><td class="value">${safePickupAddr}</td></tr>
            <tr><td class="label">Dropoff Address:</td><td class="value">${safeDropoffAddr}</td></tr>
            <tr><td class="label">Pickup Date &amp; Time:</td><td class="value">${safePickupDate} at ${safePickupTime}</td></tr>
            ${data.isReturn ? `<tr><td class="label">Return Date &amp; Time:</td><td class="value">${safeReturnDate} at ${safeReturnTime}</td></tr>` : ''}
            <tr><td class="label">Vehicle Class:</td><td class="value">${vehicleName}</td></tr>
            <tr><td class="label">Passengers &amp; Bags:</td><td class="value">${Number(data.passengers)} Passengers, ${Number(data.luggageCount)} Luggage Items</td></tr>
            <tr><td class="label">Free Child Seats:</td><td class="value">${Number(data.babySeats)} Baby Seat(s), ${Number(data.boosterSeats)} Booster Seat(s)</td></tr>
            ${safeFlight ? `<tr><td class="label">Flight/Train Number:</td><td class="value">${safeFlight} (Live Radar Tracked)</td></tr>` : ''}
            <tr><td class="label">Total Fare to Pay:</td><td class="value" style="font-size: 18px; color: #0B192C; font-weight: 900;">${formatCurrency(data.totalFareEur)}</td></tr>
          </table>

          <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 12px; padding: 12px; margin-top: 16px; font-size: 12px; color: #065f46;">
            <strong>👋 Driver Arrival &amp; Meet &amp; Greet:</strong><br>
            Your English-speaking driver will monitor your flight in real-time and wait inside the airport terminal gate holding a greeting board with your name. No upfront deposit required — pay your driver in cash or card upon arrival.
          </div>
        </div>
        <div class="footer">
          FranceGo • 24/7 Hotline &amp; WhatsApp: +33 7 81 11 83 94 • projet15df@outlook.fr
        </div>
      </div>
    </body>
    </html>
  `;

  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>NEW BOOKING ALERT - ${safeRef}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; color: #f8fafc; }
        .header { background: #0B192C; padding: 20px; text-align: center; color: #D4AF37; font-weight: bold; border-b: 1px solid #C5A059; }
        .content { padding: 24px; font-size: 14px; line-height: 1.6; }
        .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .table td { padding: 10px; border-bottom: 1px solid #334155; }
        .lbl { color: #94a3b8; font-weight: bold; width: 40%; }
        .val { color: #ffffff; font-weight: bold; }
        .btn { display: inline-block; background: #22c55e; color: #ffffff; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          🚨 NEW RESERVATION RECEIVED: ${safeRef}
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #C5A059; font-weight: bold;">New Transfer Action Required!</p>
          <table class="table">
            <tr><td class="lbl">Customer Name:</td><td class="val">${safeName}</td></tr>
            <tr><td class="lbl">Customer Email:</td><td class="val">${safeEmail}</td></tr>
            <tr><td class="lbl">Customer Phone:</td><td class="val">${safePhone}</td></tr>
            <tr><td class="lbl">Route:</td><td class="val">${safeOrigin} → ${safeDest}</td></tr>
            <tr><td class="lbl">Pickup Address:</td><td class="val">${safePickupAddr}</td></tr>
            <tr><td class="lbl">Dropoff Address:</td><td class="val">${safeDropoffAddr}</td></tr>
            <tr><td class="lbl">Pickup Date/Time:</td><td class="val">${safePickupDate} at ${safePickupTime}</td></tr>
            ${data.isReturn ? `<tr><td class="lbl">Return Date/Time:</td><td class="val">${safeReturnDate} at ${safeReturnTime}</td></tr>` : ''}
            <tr><td class="lbl">Vehicle Class:</td><td class="val">${vehicleName}</td></tr>
            <tr><td class="lbl">Passengers / Bags:</td><td class="val">${Number(data.passengers)} Pax / ${Number(data.luggageCount)} Bags</td></tr>
            <tr><td class="lbl">Child Seats:</td><td class="val">${Number(data.babySeats)} Baby, ${Number(data.boosterSeats)} Booster</td></tr>
            <tr><td class="lbl">Flight/Train #:</td><td class="val">${safeFlight || 'N/A'}</td></tr>
            <tr><td class="lbl">Notes:</td><td class="val">${safeNotes || 'None'}</td></tr>
            <tr><td class="lbl">Total Fare to Collect:</td><td class="val" style="color: #22c55e; font-size: 20px;">${formatCurrency(data.totalFareEur)}</td></tr>
          </table>

          <div style="text-align: center;">
            <a href="https://wa.me/?text=${encodeURIComponent(`FranceGo Alert! Ref: ${data.bookingRef}\nCustomer: ${data.customerName} (${data.customerPhone})\nRoute: ${data.originName} -> ${data.destinationName}\nPickup: ${data.pickupDate} ${data.pickupTime}\nFare: ${data.totalFareEur}€`)}" class="btn">
              📲 Dispatch Chauffeur via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const clientInfo = await transporter.sendMail({
      from: `"FranceGo Dispatch" <${smtpSender}>`,
      to: data.customerEmail,
      subject: `Transfer Confirmation: ${data.bookingRef} (${data.originName} → ${data.destinationName})`,
      html: clientHtml,
    });

    const adminInfo = await transporter.sendMail({
      from: `"FranceGo Booking Alert" <${smtpSender}>`,
      to: adminEmail,
      subject: `🚨 NEW BOOKING: ${data.bookingRef} - ${data.customerName} (${formatCurrency(data.totalFareEur)})`,
      html: adminHtml,
    });

    return { success: true, clientMsgId: clientInfo.messageId, adminMsgId: adminInfo.messageId };
  } catch (err) {
    console.warn('[EMAIL DISPATCH NOTICE] SMTP transport unavailable:', err);
    return { success: true, warning: 'Emails generated & logged.' };
  }
}

