'use client';

import { useState } from 'react';
import { useBookingStore } from '@/lib/store';
import { createBookingAction } from '@/lib/actions/bookings';
import { formatCurrency } from '@/lib/utils';
import { CountryCodePhoneInput } from '@/components/UI/CountryCodePhoneInput';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Plane,
  Car,
  FileText,
  Loader2,
  Printer,
} from 'lucide-react';

export function CheckoutModal() {
  const store = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  if (!store.isModalOpen) return null;

  const basePrice =
    store.vehicleTier === 'SEDAN'
      ? store.sedanPriceEur
      : store.vehicleTier === 'BUSINESS_VAN'
      ? store.businessVanPriceEur
      : store.economyVanPriceEur;

  const totalFare = store.isReturn ? basePrice * 2 : basePrice;

  const handleNextStep = () => {
    store.setStep(2);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Frontend debouncing
    setErrorMsg('');

    if (!store.customerName || !store.customerEmail || !store.customerPhone) {
      setErrorMsg('Please complete all contact fields (Name, Email, Phone).');
      return;
    }

    setIsSubmitting(true);

    try {
      const pickupAddress =
        store.pickupAddress.trim() ||
        `${store.origin?.name || 'Airport'} Terminal / Arrivals`;
      const dropoffAddress =
        store.dropoffAddress.trim() ||
        `${store.destination?.name || 'Disneyland Paris'} Hotel`;

      const result = await createBookingAction({
        originId: store.origin?.id,
        destinationId: store.destination?.id,
        pickupAddress,
        dropoffAddress,
        pickupDate: store.pickupDate,
        pickupTime: store.pickupTime,
        isReturn: store.isReturn,
        returnDate: store.returnDate,
        returnTime: store.returnTime,
        returnFlightNumber: store.returnFlightNumber,
        flightOrTrainNumber: store.flightOrTrainNumber,
        vehicleTier: store.vehicleTier,
        passengers: store.passengers,
        luggageCount: store.luggageCount,
        babySeats: store.babySeats,
        boosterSeats: store.boosterSeats,
        customerName: store.customerName,
        customerEmail: store.customerEmail,
        customerPhone: store.customerPhone,
        notes: store.notes,
        totalFareEur: totalFare,
        website_url: '', // Honeypot field sent empty by real browser users
      });

      if (result.success && result.booking) {
        setCreatedRef(result.booking.bookingRef);
        store.setStep(3);
      } else {
        setErrorMsg(result.error || 'Failed to submit reservation. Please check your inputs.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('An unexpected error occurred. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {store.currentStep === 3 ? 'Booking Confirmed!' : 'Complete Transfer Reservation'}
              </h3>
              <p className="text-xs text-slate-500">Step {store.currentStep} of 3</p>
            </div>
          </div>

          <button
            onClick={() => store.closeModal()}
            className="p-2 rounded-xl bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* STEP 1: REVIEW TRIP SUMMARY */}
          {store.currentStep === 1 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      Selected Route
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      {store.origin?.name || 'CDG Airport'} → {store.destination?.name || 'Disneyland Paris'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium font-bold">Guaranteed Fare</span>
                    <div className="text-2xl font-black text-brand-600">{formatCurrency(totalFare)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-medium">Pickup Date & Time:</span>
                    <div className="text-slate-900 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{store.pickupDate} at {store.pickupTime}</span>
                    </div>
                  </div>

                  {store.isReturn && (
                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">Return Date & Time:</span>
                      <div className="text-slate-900 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{store.returnDate} at {store.returnTime}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-slate-500 font-medium">Vehicle Class:</span>
                    <div className="text-slate-900 font-bold">
                      {store.vehicleTier === 'SEDAN'
                        ? 'Berline Sedan (1-3 Pax)'
                        : store.vehicleTier === 'BUSINESS_VAN'
                        ? 'VIP Business Van (1-7 Pax)'
                        : store.vehicleTier === 'MINIBUS'
                        ? 'Executive Minibus (1-16 Pax)'
                        : 'Economy Minivan (1-8 Pax)'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-medium">Passengers & Bags:</span>
                    <div className="text-slate-900 font-bold">
                      {store.passengers} Pax, {store.luggageCount} Bags
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-medium">Child Safety Seats:</span>
                    <div className="text-emerald-700 font-bold">
                      {store.babySeats > 0 || store.boosterSeats > 0
                        ? `${store.babySeats} Baby Seat(s), ${store.boosterSeats} Booster(s) (Free of charge)`
                        : 'None requested'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Pay Chauffeur on Arrival</span>
                  No credit card required upfront. You can pay your driver in cash or card upon arrival at your hotel. Free cancellation anytime up to 24h before pickup.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>CONTINUE TO PASSENGER DETAILS</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PASSENGER DETAILS FORM */}
          {store.currentStep === 2 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Invisible Honeypot Field for Bot Prevention */}
              <input
                type="text"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                className="hidden opacity-0 pointer-events-none absolute h-0 w-0"
              />

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-brand-500" />
                    <span>Lead Passenger Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={store.customerName}
                    onChange={(e) => store.setCustomerDetails({ name: e.target.value, email: store.customerEmail, phone: store.customerPhone, notes: store.notes })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-brand-500" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={store.customerEmail}
                    onChange={(e) => store.setCustomerDetails({ name: store.customerName, email: e.target.value, phone: store.customerPhone, notes: store.notes })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-500" />
                    <span>Phone Number (with country code) *</span>
                  </label>
                  <CountryCodePhoneInput
                    required
                    value={store.customerPhone}
                    onChange={(val) =>
                      store.setCustomerDetails({
                        name: store.customerName,
                        email: store.customerEmail,
                        phone: val,
                        notes: store.notes,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-brand-500" />
                    <span>Flight or Train # (For Live Tracking)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AF 1234 or BA 304"
                    value={store.flightOrTrainNumber}
                    onChange={(e) => store.setFlightOrTrainNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Special Pickup Notes / Hotel Room / Child Ages</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please bring 1 booster for 5yo child. Terminal 2F arrivals."
                  value={store.notes}
                  onChange={(e) => store.setCustomerDetails({ name: store.customerName, email: store.customerEmail, phone: store.customerPhone, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => store.setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Summary
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-extrabold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRM & BOOK RESERVATION</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CONFIRMATION SUCCESS */}
          {store.currentStep === 3 && createdRef && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">RESERVATION CONFIRMED!</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Your booking request has been registered. An instant confirmation email has been sent to{' '}
                  <span className="text-slate-900 font-bold">{store.customerEmail}</span>.
                </p>
                <p className="text-red-600 text-xs font-bold animate-pulse pt-1">
                  (Please check your SPAM / Junk folder if you do not see the confirmation email in your Inbox)
                </p>
              </div>

              <div className="bg-slate-50 border border-brand-500/40 rounded-2xl p-4 max-w-sm mx-auto shadow-sm">
                <div className="text-xs text-slate-500 font-bold">Your Unique Booking Reference:</div>
                <div className="text-3xl font-black text-brand-600 tracking-wider my-1">
                  {createdRef}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold">
                  Status: PENDING CHAUFFEUR DISPATCH
                </div>
              </div>

              <div className="text-left bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Route:</span>
                  <span className="text-slate-900 font-bold">
                    {store.origin?.name} → {store.destination?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Date & Time:</span>
                  <span className="text-slate-900 font-bold">
                    {store.pickupDate} at {store.pickupTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Fare to Collect on Arrival:</span>
                  <span className="text-brand-600 font-black text-sm">
                    {formatCurrency(totalFare)} (Cash or Card)
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    store.resetForm();
                    store.closeModal();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
