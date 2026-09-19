'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { LocationItem, CategoryItem, VehicleTier } from '@/types';
import { createBookingAction } from '@/lib/actions/bookings';
import { CountryCodePhoneInput } from '@/components/UI/CountryCodePhoneInput';
import { LocationDropdown } from './LocationDropdown';
import {
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  Plane,
  MapPin,
  Clock,
  Calendar,
  Users,
  Briefcase,
  Car,
  ShieldCheck,
  CreditCard,
  Plus,
  Minus,
  AlertCircle,
  Loader2,
  MessageSquare,
  HelpCircle,
  PhoneCall,
  Sparkles,
  ArrowRightLeft,
  Edit2,
  Tag,
  Mail,
} from 'lucide-react';

interface FullPageBookingClientProps {
  locations: LocationItem[];
  categories?: CategoryItem[];
}

export function FullPageBookingClient({ locations, categories }: FullPageBookingClientProps) {
  const router = useRouter();
  const store = useBookingStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingRef, setCreatedBookingRef] = useState<string | null>(null);

  // Separate First & Last Name for Step 3
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showChildSeats, setShowChildSeats] = useState(false);
  const [pickupSignText, setPickupSignText] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: boolean;
    lastName?: boolean;
    customerEmail?: boolean;
    customerPhone?: boolean;
    agreedTerms?: boolean;
  }>({});

  // Location selector modal/dropdown triggers
  const [activeDropdown, setActiveDropdown] = useState<'ORIGIN' | 'DESTINATION' | null>(null);
  const [isEditJourneyModalOpen, setIsEditJourneyModalOpen] = useState(false);

  // Group locations for native select dropdowns
  const groupedLocations = useMemo(() => {
    const map: Record<string, LocationItem[]> = {
      AIRPORT: [],
      AMUSEMENT_PARK: [],
      CITY_CENTER: [],
      TRAIN_STATION: [],
      PALACE: [],
      OTHER: [],
    };

    locations.forEach((loc) => {
      const cat = loc.category && map[loc.category] ? loc.category : 'OTHER';
      map[cat].push(loc);
    });

    return map;
  }, [locations]);

  // Sync initial locations if empty
  useEffect(() => {
    if (locations && locations.length > 0) {
      if (!store.origin) {
        const orig = locations.find((l) => l.shortCode === 'CDG') || locations[0];
        store.setOrigin(orig);
      }
      if (!store.destination) {
        const dest = locations.find((l) => l.shortCode === 'DLP') || locations[1] || locations[0];
        store.setDestination(dest);
      }
    }
  }, [locations]);

  // Vehicle prices calculation
  const getVehiclePrice = (tier: VehicleTier): number => {
    if (store.serviceMode === 'HOURLY_TOUR') {
      const hourlyRate =
        tier === 'SEDAN' ? 65 : tier === 'ECONOMY_VAN' ? 80 : tier === 'BUSINESS_VAN' ? 110 : 150;
      return store.rentalHours * hourlyRate;
    }
    if (store.serviceMode === 'DISTANCE') {
      const kmRate =
        tier === 'SEDAN' ? 2.0 : tier === 'ECONOMY_VAN' ? 2.7 : tier === 'BUSINESS_VAN' ? 3.5 : 4.5;
      return Math.max(40, Math.round(store.estimatedKm * kmRate));
    }
    return tier === 'SEDAN'
      ? store.sedanPriceEur
      : tier === 'BUSINESS_VAN'
      ? store.businessVanPriceEur
      : tier === 'MINIBUS'
      ? store.minibusPriceEur
      : store.economyVanPriceEur;
  };

  const currentPrice = getVehiclePrice(store.vehicleTier);
  const totalFare = store.isReturn && store.serviceMode !== 'HOURLY_TOUR' ? currentPrice * 2 : currentPrice;

  // Navigation handlers
  const handleNextToStep2 = () => {
    setErrorMsg(null);
    if (!store.vehicleTier) {
      setErrorMsg('Please select a vehicle to continue.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextToStep3 = () => {
    setErrorMsg(null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const errors: typeof fieldErrors = {};
    if (!firstName.trim()) errors.firstName = true;
    if (!lastName.trim()) errors.lastName = true;
    if (!store.customerEmail.trim() || !store.customerEmail.includes('@')) errors.customerEmail = true;
    if (!store.customerPhone.trim()) errors.customerPhone = true;
    if (!agreedTerms) errors.agreedTerms = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please fill in all highlighted required fields in red and accept the Terms & Conditions.');
      window.scrollTo({ top: 250, behavior: 'smooth' });
      return;
    }
    setFieldErrors({});

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    setIsSubmitting(true);

    try {
      // Sync customer name in store
      store.setCustomerDetails({
        name: fullName,
        email: store.customerEmail,
        phone: store.customerPhone,
        notes: pickupSignText ? `[Pickup Sign: ${pickupSignText}] ${store.notes}` : store.notes,
      });

      const res = await createBookingAction({
        originId: store.origin?.id,
        destinationId: store.destination?.id,
        pickupAddress: store.pickupAddress || store.origin?.name || 'Airport / Hub',
        dropoffAddress: store.dropoffAddress || store.destination?.name || 'Hotel / Destination',
        pickupDate: store.pickupDate,
        pickupTime: store.pickupTime,
        isReturn: store.isReturn,
        returnDate: store.isReturn ? store.returnDate : undefined,
        returnTime: store.isReturn ? store.returnTime : undefined,
        flightOrTrainNumber: store.flightOrTrainNumber || undefined,
        returnFlightNumber: store.returnFlightNumber || undefined,
        vehicleTier: store.vehicleTier,
        passengers: store.passengers,
        luggageCount: store.luggageCount,
        babySeats: store.babySeats,
        boosterSeats: store.boosterSeats,
        customerName: fullName,
        customerEmail: store.customerEmail,
        customerPhone: store.customerPhone,
        notes: pickupSignText ? `Pickup Sign Name: ${pickupSignText}. ${store.notes}` : store.notes,
      });

      if (res.success && res.booking) {
        setCreatedBookingRef(res.booking.bookingRef);
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Unable to confirm booking. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 pb-28">
      {/* ========================================================================= */}
      {/* 1. TOP STEPPER HEADER BAR */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-black text-xl tracking-tight text-slate-900">
              FRANCE<span className="text-gold-600">GO</span>
            </span>
          </Link>

          <h1 className="text-base sm:text-lg font-bold text-slate-900 hidden md:block">
            Book your Ride
          </h1>


        </div>

        {/* 4-Step Progress Stepper Bar */}
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="relative flex items-center justify-between">
            {/* Connecting Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{
                width:
                  step === 1
                    ? '0%'
                    : step === 2
                    ? '33%'
                    : step === 3
                    ? '66%'
                    : '100%',
              }}
            />

            {/* Step 1 Circle */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > 1
                    ? 'bg-emerald-500 text-white'
                    : step === 1
                    ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                    : 'bg-white text-slate-400 border border-slate-300'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <span className="text-[10px] font-extrabold text-slate-600 mt-1 uppercase tracking-wider">
                Vehicle
              </span>
            </div>

            {/* Step 2 Circle */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > 2
                    ? 'bg-emerald-500 text-white'
                    : step === 2
                    ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                    : 'bg-white text-slate-400 border border-slate-300'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <span className="text-[10px] font-extrabold text-slate-600 mt-1 uppercase tracking-wider">
                Extras
              </span>
            </div>

            {/* Step 3 Circle */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > 3
                    ? 'bg-emerald-500 text-white'
                    : step === 3
                    ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                    : 'bg-white text-slate-400 border border-slate-300'
                }`}
              >
                {step > 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
              </div>
              <span className="text-[10px] font-extrabold text-slate-600 mt-1 uppercase tracking-wider">
                Passenger
              </span>
            </div>

            {/* Step 4 Circle */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === 4
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                    : 'bg-white text-slate-400 border border-slate-300'
                }`}
              >
                {step === 4 ? <Check className="w-4 h-4 stroke-[3]" /> : '4'}
              </div>
              <span className="text-[10px] font-extrabold text-slate-600 mt-1 uppercase tracking-wider">
                Confirmation
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN SPLIT CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: STEP CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: CHOOSE YOUR TRANSFER & VEHICLES */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Choose your transfer
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      All prices include VAT, taxes & tolls
                    </p>
                  </div>

                  {/* Top Counter Bar: Passengers / Checked Luggage / Hand Luggage */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Passengers */}
                    <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/70">
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider mb-1">
                        Passengers
                      </label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                          <Users className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{store.passengers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => store.setPassengers(Math.max(1, store.passengers - 1))}
                            className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => store.setPassengers(Math.min(16, store.passengers + 1))}
                            className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Checked Luggage */}
                    <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/70">
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider mb-1">
                        Checked Luggage
                      </label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                          <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{store.luggageCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => store.setLuggageCount(Math.max(0, store.luggageCount - 1))}
                            className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => store.setLuggageCount(Math.min(16, store.luggageCount + 1))}
                            className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hand Luggage */}
                    <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/70">
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider mb-1">
                        Hand Luggage
                      </label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                          <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{store.handLuggageCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => store.setHandLuggageCount(Math.max(0, store.handLuggageCount - 1))}
                            className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs hover:bg-slate-800 transition-colors"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => store.setHandLuggageCount(Math.min(16, store.handLuggageCount + 1))}
                            className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs hover:bg-slate-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Options List */}
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        tier: 'SEDAN' as VehicleTier,
                        title: 'Economy Class Car',
                        desc: 'Up to 3 passengers. Max Luggage: 2 checked, 2 hand.',
                        paxMax: 3,
                        checkedMax: 2,
                        handMax: 2,
                        price: getVehiclePrice('SEDAN'),
                        image: '/images/fleet_sedan.jpg',
                      },
                      {
                        tier: 'ECONOMY_VAN' as VehicleTier,
                        title: 'Economy Class Minivan',
                        desc: 'Up to 8 passengers. Max Luggage: 6 checked, 5 hand.',
                        paxMax: 8,
                        checkedMax: 6,
                        handMax: 5,
                        price: getVehiclePrice('ECONOMY_VAN'),
                        image: '/images/fleet_economy_van.jpg',
                      },
                      {
                        tier: 'BUSINESS_VAN' as VehicleTier,
                        title: 'Business Class Minivan',
                        desc: 'Up to 8 passengers. Max Luggage: 6 checked, 5 hand. Premium service.',
                        paxMax: 8,
                        checkedMax: 6,
                        handMax: 5,
                        price: getVehiclePrice('BUSINESS_VAN'),
                        image: '/images/fleet_business_van.jpg',
                      },
                      {
                        tier: 'MINIBUS' as VehicleTier,
                        title: 'Group Minibus Shuttle (16 Pax)',
                        desc: 'Up to 16 passengers. Large luggage space.',
                        paxMax: 16,
                        checkedMax: 12,
                        handMax: 10,
                        price: getVehiclePrice('MINIBUS'),
                        image: '/images/service_minibus.jpg',
                      },
                    ].map((item) => {
                      const isSelected = store.vehicleTier === item.tier;

                      return (
                        <div
                          key={item.tier}
                          onClick={() => store.setVehicleTier(item.tier)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-white border-slate-900 ring-1 ring-slate-900 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium leading-tight">
                                {item.desc}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 pt-0.5">
                                <span>Up to {item.paxMax} passengers</span>
                                <span>Checked {item.checkedMax}</span>
                                <span>Hand {item.handMax}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 self-end sm:self-center">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">
                              Total price
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900">
                              €{item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Free Cancellation Banner */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-0.5 text-emerald-800">
                    <span className="text-xs font-black uppercase flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      FREE 24H Cancellation
                    </span>
                    <p className="text-[11px] font-medium text-emerald-700">
                      Book today, lock the price. You can cancel for free up to 24 hours before the transfer time.
                    </p>
                  </div>

                  {/* Inline Continue Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextToStep2}
                      className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EXTRAS & NOTES */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Extras & notes
                    </h2>
                  </div>

                  {/* Flight / Train Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Arrival flight number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Plane className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. LH1868 (Outward Journey)"
                        value={store.flightOrTrainNumber}
                        onChange={(e) => store.setFlightOrTrainNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Please provide your arrival flight or train number so the driver can track your arrival in real-time.
                    </p>
                  </div>

                  {/* Child & Booster Seat Toggle */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showChildSeats}
                        onChange={(e) => setShowChildSeats(e.target.checked)}
                        className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        Need a child or booster seat? (100% Free of Charge)
                      </span>
                    </label>

                    {showChildSeats && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Baby Seat (0-2 Yrs)</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => store.setBabySeats(store.babySeats - 1)}
                              className="w-7 h-7 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="text-sm font-black w-6 text-center">{store.babySeats}</span>
                            <button
                              type="button"
                              onClick={() => store.setBabySeats(store.babySeats + 1)}
                              className="w-7 h-7 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Child Booster Seat (3-10 Yrs)</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => store.setBoosterSeats(store.boosterSeats - 1)}
                              className="w-7 h-7 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="text-sm font-black w-6 text-center">{store.boosterSeats}</span>
                            <button
                              type="button"
                              onClick={() => store.setBoosterSeats(store.boosterSeats + 1)}
                              className="w-7 h-7 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Driver Notes Textarea */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-4">
                    <label className="text-xs font-bold text-slate-700 block">
                      Driver notes (Outward)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g., Specific pickup point, luggage details, child's age/weight for seats."
                      value={store.notes}
                      onChange={(e) => store.setCustomerDetails({ ...store, name: store.customerName, email: store.customerEmail, phone: store.customerPhone, notes: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  {/* Inline Action Buttons for Step 2 */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextToStep3}
                      className="px-8 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <span>Continue to Passenger Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PASSENGER DETAILS */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Passenger Details
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Enter details for the lead passenger. This person must be 18 years or older.
                    </p>
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>First name(s) *</span>
                        {fieldErrors.firstName && <span className="text-red-600 text-[10px] font-bold">Required</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name(s)"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (fieldErrors.firstName) setFieldErrors({ ...fieldErrors, firstName: false });
                        }}
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none transition-all ${
                          fieldErrors.firstName
                            ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                            : 'border-slate-300 focus:border-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Last name *</span>
                        {fieldErrors.lastName && <span className="text-red-600 text-[10px] font-bold">Required</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (fieldErrors.lastName) setFieldErrors({ ...fieldErrors, lastName: false });
                        }}
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none transition-all ${
                          fieldErrors.lastName
                            ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                            : 'border-slate-300 focus:border-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Email address *</span>
                      {fieldErrors.customerEmail && <span className="text-red-600 text-[10px] font-bold">Valid Email Required</span>}
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={store.customerEmail}
                      onChange={(e) => {
                        store.setCustomerDetails({ name: `${firstName} ${lastName}`.trim(), email: e.target.value, phone: store.customerPhone, notes: store.notes });
                        if (fieldErrors.customerEmail) setFieldErrors({ ...fieldErrors, customerEmail: false });
                      }}
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none transition-all ${
                        fieldErrors.customerEmail
                          ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30'
                          : 'border-slate-300 focus:border-slate-900'
                      }`}
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      We&apos;ll send your instant booking confirmation voucher here.
                    </p>
                  </div>

                  {/* Mobile Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Mobile number *</span>
                      {fieldErrors.customerPhone && <span className="text-red-600 text-[10px] font-bold">Phone Number Required</span>}
                    </label>
                    <CountryCodePhoneInput
                      value={store.customerPhone}
                      hasError={fieldErrors.customerPhone}
                      onChange={(phone) => {
                        store.setCustomerDetails({ name: `${firstName} ${lastName}`.trim(), email: store.customerEmail, phone, notes: store.notes });
                        if (fieldErrors.customerPhone) setFieldErrors({ ...fieldErrors, customerPhone: false });
                      }}
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Please provide a contact number so our driver can reach the passenger if needed.
                    </p>
                  </div>

                  {/* Pickup Sign Text */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-4">
                    <label className="text-xs font-bold text-slate-700">Pickup sign text (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter text for pickup sign (e.g., family name)"
                      value={pickupSignText}
                      onChange={(e) => setPickupSignText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Optional: Text to display on the driver&apos;s pickup sign at the airport arrivals terminal.
                    </p>
                  </div>

                  {/* Terms & Privacy Acceptance Box */}
                  <div className={`p-4 border rounded-2xl space-y-2 transition-all ${
                    fieldErrors.agreedTerms ? 'bg-red-50/50 border-red-500 ring-2 ring-red-100' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => {
                          setAgreedTerms(e.target.checked);
                          if (fieldErrors.agreedTerms) setFieldErrors({ ...fieldErrors, agreedTerms: false });
                        }}
                        className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 mt-0.5 shrink-0"
                      />
                      <span className="text-xs text-slate-700 font-medium leading-relaxed">
                        By confirming this booking you agree to our{' '}
                        <Link href="/terms-and-conditions" target="_blank" className="font-bold text-slate-900 underline hover:text-amber-600 transition-colors">
                          Terms and Conditions
                        </Link>
                        ,{' '}
                        <Link href="/privacy-policy" target="_blank" className="font-bold text-slate-900 underline hover:text-amber-600 transition-colors">
                          Privacy Policy
                        </Link>
                        , and{' '}
                        <Link href="/cancellation-policy" target="_blank" className="font-bold text-slate-900 underline hover:text-amber-600 transition-colors">
                          Cancellation Policy
                        </Link>
                        . Pay driver on arrival.
                      </span>
                    </label>
                    {fieldErrors.agreedTerms && (
                      <p className="text-xs text-red-600 font-bold pt-1">
                        ⚠️ Please check the box to agree to our terms and cancellation policy before proceeding.
                      </p>
                    )}
                  </div>

                  {/* Inline Action Buttons for Step 3 */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm and Book</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 4: CONFIRMATION / BOOKING RECEIVED */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                  {/* Green Banner Header */}
                  <div className="bg-emerald-600 text-white p-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-7 h-7 stroke-[3]" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">
                      Booking Received!
                    </h2>
                    <p className="text-xs font-semibold text-emerald-100">
                      Thank you! Your reservation <strong className="text-white">#{createdBookingRef}</strong> has been received.
                    </p>
                  </div>

                  {/* Booking Details Breakdown */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Email Confirmation Notice Alert */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-emerald-900">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                        <Mail className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                        <span>Instant Confirmation Voucher Sent!</span>
                      </div>
                      <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                        A complete booking summary has been sent to <strong className="text-slate-900 underline">{store.customerEmail}</strong>.
                      </p>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>💡 <u>Spam/Junk Folder Notice</u>: If you don&apos;t see our email in your main inbox shortly, please check your Spam or Junk folder.</span>
                      </div>
                    </div>

                    {/* Trip Summary */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        Trip Summary
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200/70">
                        <div className="flex items-start gap-2 text-xs font-bold text-slate-900">
                          <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase block">From</span>
                            <span>{store.origin?.name}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs font-bold text-slate-900 border-t border-slate-200/60 pt-2">
                          <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase block">To</span>
                            <span>{store.destination?.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{store.pickupDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{store.pickupTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Passenger & Vehicle */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        Passenger & Vehicle Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 uppercase block">Lead Passenger</span>
                          <span className="font-bold">{store.customerName}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 uppercase block">Total Passengers</span>
                          <span className="font-bold">{store.passengers} Pax</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 uppercase block">Luggage</span>
                          <span className="font-bold">{store.luggageCount} Checked Bags</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 uppercase block">Vehicle</span>
                          <span className="font-bold">{store.vehicleTier.replace('_', ' ')}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 col-span-2">
                          <span className="text-[10px] text-slate-500 uppercase block">Payment Method</span>
                          <span className="font-bold text-emerald-700">Pay Chauffeur on Arrival (Zero Upfront Deposit)</span>
                        </div>
                      </div>
                    </div>

                    {/* User Provided Data Section: Flight #, Notes, Sign, Terms */}
                    <div className="space-y-3 border-t border-slate-200/80 pt-4">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        User Provided Flight & Special Instructions
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 uppercase block">Flight / Train Number</span>
                          <span className="font-bold text-slate-900">{store.flightOrTrainNumber || 'None specified'}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 uppercase block">Driver Pickup Sign Text</span>
                          <span className="font-bold text-slate-900">{pickupSignText || 'Standard Name Sign'}</span>
                        </div>

                        <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase block">Special Driver Notes</span>
                          <p className="font-medium text-slate-700 text-xs">{store.notes || 'No special notes provided'}</p>
                        </div>

                        <div className="sm:col-span-2 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                          <span className="text-[10px] text-emerald-700 uppercase font-black block">Terms & Policy Acceptance</span>
                          <p className="font-bold text-xs">✓ Terms & Conditions Accepted • Privacy Policy Accepted • 24H Free Cancellation Policy Confirmed</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-slate-900 font-extrabold text-lg">
                      <span>Total Guaranteed Fare:</span>
                      <span className="text-2xl font-black text-slate-900">€{totalFare.toFixed(2)}</span>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          store.resetForm();
                          setStep(1);
                        }}
                        className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                      >
                        Book Another Transfer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: "YOUR BOOKING" SUMMARY CARD */}
          <div className="lg:col-span-4 space-y-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Your Booking
              </h3>

              {/* OUTWARD JOURNEY CARD */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    OUTWARD JOURNEY
                  </span>
                  {step < 4 && (
                    <button
                      type="button"
                      onClick={() => setIsEditJourneyModalOpen(true)}
                      title="Edit pickup, dropoff, date or time"
                      className="text-slate-400 hover:text-amber-600 transition-colors flex items-center gap-1 text-[10px] font-extrabold uppercase bg-slate-200/60 hover:bg-amber-100 px-2 py-1 rounded-lg"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-900">
                  <div className="flex items-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0 mt-1" />
                    <span>{store.origin?.name || 'Pickup Location'}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                    <span>{store.destination?.name || 'Drop-off Location'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 border-t border-slate-200/60 pt-2">
                  <span>{store.pickupDate} • {store.pickupTime}</span>
                  <span>{store.passengers} Passengers</span>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ FREE CANCELLATION
                  </span>
                </div>
              </div>

              {/* Selected Vehicle & Price Tag */}
              <div className="flex items-center justify-between bg-slate-100 p-3.5 rounded-xl text-xs font-bold text-slate-900">
                <span>{store.vehicleTier.replace('_', ' ')}</span>
                <span className="text-base font-black">€{totalFare.toFixed(2)}</span>
              </div>

              {/* Add Return Button */}
              {step < 4 && (
                <button
                  type="button"
                  onClick={() => store.setIsReturn(!store.isReturn)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    store.isReturn
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-50/50'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{store.isReturn ? 'Remove return trip' : 'Add return trip'}</span>
                </button>
              )}

              {/* What's Included List */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">What&apos;s included</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Free waiting time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Door-to-door Service</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Free Baby & Booster Seats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Private Transfer</span>
                  </li>
                </ul>
              </div>

              {/* Accepted Payment Methods Logos */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Accepted Payment Methods
                </span>
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-black text-slate-600">
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">VISA</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">Mastercard</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">AMEX</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">PayPal</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">Apple Pay</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">Google Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM STICKY ACTION BAR */}
      {/* ========================================================================= */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-xl">
          {/* Error message in footer */}
          {errorMsg && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 py-3.5 px-4 pr-20 md:pr-24">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                  className="w-9 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="text-xs font-bold text-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Your choice</span>
                <span>{store.vehicleTier.replace('_', ' ')} (€{totalFare.toFixed(2)})</span>
              </div>
            </div>

            <div>
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleNextToStep2}
                  className="px-8 py-3 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  Continue
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={handleNextToStep3}
                  className="px-8 py-3 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  Continue
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-8 py-3 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Confirm and Book</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* EDIT JOURNEY MODAL */}
      {/* ========================================================================= */}
      {isEditJourneyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                  Edit Journey Specifications
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Pickup, Drop-off & Schedule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditJourneyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Origin & Destination Dropdowns */}
            <div className="space-y-3">
              {/* Pickup Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Pickup Location (From)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={store.origin?.id || ''}
                    onChange={(e) => {
                      const loc = locations.find((l) => l.id === e.target.value);
                      if (loc) store.setOrigin(loc);
                    }}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="" disabled>Select Pickup Location...</option>
                    {Object.entries(groupedLocations).map(([catKey, locs]) => {
                      if (locs.length === 0) return null;
                      const catLabel =
                        catKey === 'AIRPORT'
                          ? '✈️ Paris Airports'
                          : catKey === 'AMUSEMENT_PARK'
                          ? '🏰 Euro Disney Paris'
                          : catKey === 'CITY_CENTER'
                          ? '📍 Paris City & Hotels'
                          : catKey === 'TRAIN_STATION'
                          ? '🚆 Paris Train Stations'
                          : '🏛️ Excursions & Other';
                      return (
                        <optgroup key={catKey} label={catLabel} className="font-bold text-slate-800">
                          {locs.map((loc) => (
                            <option key={loc.id} value={loc.id} className="font-medium text-slate-900">
                              {loc.name} ({loc.shortCode})
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => store.swapLocations()}
                  className="p-2 rounded-full bg-slate-900 text-white hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold"
                  title="Swap Pickup & Dropoff Locations"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Swap Locations</span>
                </button>
              </div>

              {/* Drop-off Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Drop-off Location (To)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={store.destination?.id || ''}
                    onChange={(e) => {
                      const loc = locations.find((l) => l.id === e.target.value);
                      if (loc) store.setDestination(loc);
                    }}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="" disabled>Select Drop-off Location...</option>
                    {Object.entries(groupedLocations).map(([catKey, locs]) => {
                      if (locs.length === 0) return null;
                      const catLabel =
                        catKey === 'AIRPORT'
                          ? '✈️ Paris Airports'
                          : catKey === 'AMUSEMENT_PARK'
                          ? '🏰 Euro Disney Paris'
                          : catKey === 'CITY_CENTER'
                          ? '📍 Paris City & Hotels'
                          : catKey === 'TRAIN_STATION'
                          ? '🚆 Paris Train Stations'
                          : '🏛️ Excursions & Other';
                      return (
                        <optgroup key={catKey} label={catLabel} className="font-bold text-slate-800">
                          {locs.map((loc) => (
                            <option key={loc.id} value={loc.id} className="font-medium text-slate-900">
                              {loc.name} ({loc.shortCode})
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Time Selectors */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Pickup Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={store.pickupDate}
                    onChange={(e) => store.setPickupDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Pickup Time</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={store.pickupTime}
                    onChange={(e) => store.setPickupTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Return Trip Toggle */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900">Add Return Journey (+10% Discount)</span>
                <button
                  type="button"
                  onClick={() => store.setIsReturn(!store.isReturn)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    store.isReturn ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    store.isReturn ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {store.isReturn && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                  <div>
                    <label className="text-[10px] font-bold text-amber-800 uppercase block mb-1">Return Date</label>
                    <input
                      type="date"
                      value={store.returnDate}
                      onChange={(e) => store.setReturnDate(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-800 uppercase block mb-1">Return Time</label>
                    <input
                      type="time"
                      value={store.returnTime}
                      onChange={(e) => store.setReturnTime(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditJourneyModalOpen(false)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all w-full"
              >
                Save & Update Journey
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Location Selector Dropdown Modal */}
      {activeDropdown && (
        <LocationDropdown
          isOpen={!!activeDropdown}
          onClose={() => setActiveDropdown(null)}
          title={activeDropdown === 'ORIGIN' ? 'Select Pickup Location...' : 'Select Drop-off Location...'}
          locations={locations}
          categories={categories}
          selectedLocationId={activeDropdown === 'ORIGIN' ? store.origin?.id : store.destination?.id}
          onSelectLocation={(loc) => {
            if (activeDropdown === 'ORIGIN') {
              store.setOrigin(loc);
            } else {
              store.setDestination(loc);
            }
            setActiveDropdown(null);
          }}
        />
      )}
    </div>
  );
}
