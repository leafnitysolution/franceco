'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBookingAction } from '@/lib/actions/bookings';
import { useBookingStore, ServiceMode } from '@/lib/store';
import { LocationItem, CategoryItem } from '@/types';
import { VehicleCard } from './VehicleCard';
import { LocationDropdown } from './LocationDropdown';
import { useLanguage } from '@/lib/LanguageContext';
import { CountryCodePhoneInput } from '@/components/UI/CountryCodePhoneInput';
import {
  MapPin,
  ArrowRightLeft,
  Calendar,
  Clock,
  Users,
  Baby,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Plane,
  AlertCircle,
  Car,
  Compass,
  Navigation,
  Plus,
  Minus,
  Search,
  ChevronDown,
} from 'lucide-react';

interface BookingWidgetProps {
  locations: LocationItem[];
  categories?: CategoryItem[];
  routes?: any[];
  defaultOriginId?: string;
  defaultDestinationId?: string;
  defaultSedanPrice?: number;
  defaultEconomyVanPrice?: number;
  defaultBusinessVanPrice?: number;
  defaultMinibusPrice?: number;
  compact?: boolean;
}

export function BookingWidget({
  locations,
  categories,
  routes,
  defaultOriginId,
  defaultDestinationId,
  defaultSedanPrice = 70,
  defaultEconomyVanPrice = 90,
  defaultBusinessVanPrice = 120,
  defaultMinibusPrice = 180,
  compact = false,
}: BookingWidgetProps) {
  const router = useRouter();
  const store = useBookingStore();
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'ORIGIN' | 'DESTINATION' | null>(null);

  useEffect(() => {
    if (locations && locations.length > 0) {
      if (defaultOriginId) {
        const orig = locations.find((l) => l.id === defaultOriginId || l.shortCode === defaultOriginId);
        if (orig) store.setOrigin(orig);
      } else {
        store.setOrigin(null);
      }

      if (defaultDestinationId) {
        const dest = locations.find((l) => l.id === defaultDestinationId || l.shortCode === defaultDestinationId);
        if (dest) store.setDestination(dest);
      } else {
        store.setDestination(null);
      }
    }

    store.setRoutePricing({
      sedan: defaultSedanPrice,
      economyVan: defaultEconomyVanPrice,
      businessVan: defaultBusinessVanPrice,
      minibus: defaultMinibusPrice,
    });
  }, [defaultOriginId, defaultDestinationId, defaultSedanPrice, defaultEconomyVanPrice, defaultBusinessVanPrice, defaultMinibusPrice, locations]);

  // Dynamically sync route pricing from Admin Panel database routes whenever origin/destination changes
  useEffect(() => {
    if (routes && routes.length > 0 && store.origin && store.destination) {
      const matched = routes.find(
        (r) =>
          (r.originId === store.origin?.id && r.destinationId === store.destination?.id) ||
          (r.originId === store.destination?.id && r.destinationId === store.origin?.id) ||
          (r.origin?.shortCode === store.origin?.shortCode && r.destination?.shortCode === store.destination?.shortCode) ||
          (r.origin?.shortCode === store.destination?.shortCode && r.destination?.shortCode === store.origin?.shortCode)
      );
      if (matched) {
        store.setRoutePricing({
          sedan: matched.sedanPriceEur ?? defaultSedanPrice,
          economyVan: matched.economyVanPriceEur ?? defaultEconomyVanPrice,
          businessVan: matched.businessVanPriceEur ?? defaultBusinessVanPrice,
          minibus: matched.minibusPriceEur ?? defaultMinibusPrice,
        });
      }
    }
  }, [store.origin, store.destination, routes, defaultSedanPrice, defaultEconomyVanPrice, defaultBusinessVanPrice, defaultMinibusPrice]);

  // Calculate prices dynamically based on Service Mode
  const getVehiclePrice = (tier: string): number => {
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

    // Default TRANSFER mode
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

  // Step Nav Validation
  const goToStep2 = () => {
    setErrorMsg(null);
    if (store.serviceMode === 'TRANSFER') {
      if (!store.origin || !store.destination) {
        setErrorMsg('Please select both pickup and drop-off locations.');
        return;
      }
      if (store.origin.id === store.destination.id) {
        setErrorMsg('Pickup and drop-off locations cannot be identical.');
        return;
      }
    }
    if (!store.pickupDate) {
      setErrorMsg('Please select a pickup date.');
      return;
    }
    if (!store.pickupTime) {
      setErrorMsg('Please select a pickup time.');
      return;
    }
    if (store.isReturn && (!store.returnDate || !store.returnTime)) {
      setErrorMsg('Please select both return date and return time.');
      return;
    }
    router.push('/book');
  };

  const goToStep3 = () => {
    setErrorMsg(null);
    if (!store.pickupDate) {
      setErrorMsg('Please select a pickup date.');
      return;
    }
    if (!store.pickupTime) {
      setErrorMsg('Please select a pickup time.');
      return;
    }
    if (!store.vehicleTier) {
      setErrorMsg('Please select a vehicle tier.');
      return;
    }
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!store.customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!store.customerEmail.trim() || !store.customerEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!store.customerPhone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const pickupAddress = store.pickupAddress || store.origin?.name || 'Paris CDG Airport';
      const dropoffAddress = store.dropoffAddress || store.destination?.name || 'Disneyland Paris Hotels';

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
        website_url: '',
      });

      if (result.success && result.booking) {
        setIsSuccess(true);
      } else {
        setErrorMsg(result.error || 'Failed to submit reservation. Please check your inputs.');
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMsg('An unexpected error occurred. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl relative text-navy-900 ${
        compact ? 'p-4 space-y-3.5' : 'p-6 sm:p-7 space-y-4'
      }`}
    >
      {/* FORM TITLE IN ELEGANT SERIF */}
      <div className="text-center space-y-1">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-navy-900 tracking-wider uppercase">
          {t('bookNow')}
        </h2>
        <p className="text-[11px] text-slate-500 font-medium">
          {t('noDepositRequired')}
        </p>
      </div>



      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUCCESS CONFIRMATION CONTAINER */}
      {isSuccess ? (
        <div className="py-6 px-3 text-center space-y-4 animate-in zoom-in-95 duration-300">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Reservation Confirmed!</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Thank you, <span className="font-extrabold text-slate-900">{store.customerName}</span>! Your transfer is scheduled.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-sm mx-auto space-y-1.5 text-xs font-bold text-slate-700 text-left">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-400">Total Fare:</span>
              <span className="text-slate-900 font-black">{totalFare} € (Pay Chauffeur)</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-400">Pickup Date & Time:</span>
              <span>{store.pickupDate} at {store.pickupTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Confirmation Email:</span>
              <span className="truncate max-w-[180px]">{store.customerEmail}</span>
            </div>
          </div>

          <p className="text-red-600 text-[11px] font-bold max-w-sm mx-auto animate-pulse">
            (Please check your SPAM / Junk folder if you do not see the confirmation email in your Inbox)
          </p>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all shadow-md"
          >
            Book Another Service
          </button>
        </div>
      ) : (
        <>
          {/* STEP 1: ROUTE & SCHEDULING (Streamlined & Compact) */}
          {step === 1 && (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              {/* POINT-TO-POINT TRANSFER MODE */}
              {store.serviceMode === 'TRANSFER' && (
                <>
                  {/* FROM FIELD */}
                  <div className="relative">
                    <div
                      onClick={() => setActiveDropdown(activeDropdown === 'ORIGIN' ? null : 'ORIGIN')}
                      className={`bg-slate-100/90 hover:bg-slate-200/60 rounded-xl p-2.5 border space-y-0.5 transition-all cursor-pointer group ${
                        activeDropdown === 'ORIGIN' ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200/80'
                      }`}
                    >
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider cursor-pointer">
                        {t('fromLabel')}
                      </label>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {store.origin?.category === 'AIRPORT' ? (
                            <Plane className="w-4 h-4 text-slate-700 shrink-0" />
                          ) : (
                            <MapPin className={`w-4 h-4 shrink-0 ${store.origin ? 'text-slate-700' : 'text-slate-400'}`} />
                          )}
                          <span
                            className={`text-xs sm:text-sm truncate ${
                              store.origin ? 'font-black text-slate-900' : 'font-semibold text-slate-400'
                            }`}
                          >
                            {store.origin ? store.origin.name : t('selectPickupPlaceholder')}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 shrink-0 ${
                          activeDropdown === 'ORIGIN' ? 'rotate-180 text-slate-900' : ''
                        }`} />
                      </div>
                    </div>

                    {/* LOCATION INLINE DROPDOWN (ORIGIN) */}
                    <LocationDropdown
                      isOpen={activeDropdown === 'ORIGIN'}
                      onClose={() => setActiveDropdown(null)}
                      title={t('selectPickupPlaceholder')}
                      placeholder="Type airport, hotel, or station..."
                      locations={locations}
                      categories={categories}
                      selectedLocationId={store.origin?.id}
                      onSelectLocation={(loc) => store.setOrigin(loc)}
                    />
                  </div>

                  {/* SWAP BUTTON (Centered between From & To) */}
                  <div className="relative h-1 flex justify-center items-center z-10">
                    <button
                      type="button"
                      onClick={() => store.swapLocations()}
                      title={t('swapLocations')}
                      className="w-7 h-7 rounded-full bg-white border border-slate-300 hover:border-slate-400 text-slate-700 shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                    >
                      <ArrowRightLeft className="w-3 h-3 rotate-90" />
                    </button>
                  </div>

                  {/* TO FIELD */}
                  <div className="relative">
                    <div
                      onClick={() => setActiveDropdown(activeDropdown === 'DESTINATION' ? null : 'DESTINATION')}
                      className={`bg-slate-100/90 hover:bg-slate-200/60 rounded-xl p-2.5 border space-y-0.5 transition-all cursor-pointer group ${
                        activeDropdown === 'DESTINATION' ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200/80'
                      }`}
                    >
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider cursor-pointer">
                        {t('toLabel')}
                      </label>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {store.destination?.category === 'AIRPORT' ? (
                            <Plane className="w-4 h-4 text-slate-700 shrink-0" />
                          ) : (
                            <MapPin className={`w-4 h-4 shrink-0 ${store.destination ? 'text-slate-700' : 'text-slate-400'}`} />
                          )}
                          <span
                            className={`text-xs sm:text-sm truncate ${
                              store.destination ? 'font-black text-slate-900' : 'font-semibold text-slate-400'
                            }`}
                          >
                            {store.destination ? store.destination.name : t('selectDropoffPlaceholder')}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 shrink-0 ${
                          activeDropdown === 'DESTINATION' ? 'rotate-180 text-slate-900' : ''
                        }`} />
                      </div>
                    </div>

                    {/* LOCATION INLINE DROPDOWN (DESTINATION) */}
                    <LocationDropdown
                      isOpen={activeDropdown === 'DESTINATION'}
                      onClose={() => setActiveDropdown(null)}
                      title="Please select drop-off destination"
                      placeholder="Type destination, hotel, or park..."
                      locations={locations}
                      categories={categories}
                      selectedLocationId={store.destination?.id}
                      onSelectLocation={(loc) => store.setDestination(loc)}
                    />
                  </div>
                </>
              )}

              {/* HOURLY TOUR MODE */}
              {store.serviceMode === 'HOURLY_TOUR' && (
                <div className="space-y-2">
                  <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                    <label className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider">
                      Tour Duration (Hours)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <select
                        value={store.rentalHours}
                        onChange={(e) => store.setRentalHours(parseInt(e.target.value, 10))}
                        className="w-full bg-transparent text-xs sm:text-sm font-black text-slate-900 focus:outline-none cursor-pointer"
                      >
                        {[2, 3, 4, 5, 6, 8, 10, 12].map((hr) => (
                          <option key={hr} value={hr}>
                            {hr} Hours {hr === 8 ? '(Full Day Sightseeing Tour)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Pickup Hotel / Address"
                    value={store.pickupAddress}
                    onChange={(e) => store.setPickupAddress(e.target.value)}
                    className="w-full bg-slate-100/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              )}

              {/* DISTANCE MODE */}
              {store.serviceMode === 'DISTANCE' && (
                <div className="space-y-2">
                  <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                    <label className="text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider">
                      Trip Distance (KM)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={store.estimatedKm}
                        onChange={(e) => store.setEstimatedKm(parseFloat(e.target.value) || 1)}
                        className="w-full bg-transparent text-xs sm:text-sm font-black text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PICKUP DATE & PICKUP TIME (Side-by-Side) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                  <label className="text-[9px] font-extrabold text-slate-500 block uppercase tracking-wider">
                    Pickup date
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="relative flex-1 flex items-center">
                      {!store.pickupDate && (
                        <span className="pointer-events-none absolute left-0 text-xs font-semibold text-slate-400 select-none">
                          Select date
                        </span>
                      )}
                      <input
                        type="date"
                        value={store.pickupDate}
                        onClick={(e) => (e.currentTarget as any).showPicker?.()}
                        onChange={(e) => store.setPickupDate(e.target.value)}
                        className={`w-full bg-transparent text-xs focus:outline-none cursor-pointer ${
                          store.pickupDate
                            ? 'font-black text-slate-900'
                            : 'text-transparent [&::-webkit-datetime-edit]:opacity-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                  <label className="text-[9px] font-extrabold text-slate-500 block uppercase tracking-wider">
                    Pickup time
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="relative flex-1 flex items-center">
                      {!store.pickupTime && (
                        <span className="pointer-events-none absolute left-0 text-xs font-semibold text-slate-400 select-none">
                          Select time
                        </span>
                      )}
                      <input
                        type="time"
                        value={store.pickupTime}
                        onClick={(e) => (e.currentTarget as any).showPicker?.()}
                        onChange={(e) => store.setPickupTime(e.target.value)}
                        className={`w-full bg-transparent text-xs focus:outline-none cursor-pointer ${
                          store.pickupTime
                            ? 'font-black text-slate-900'
                            : 'text-transparent [&::-webkit-datetime-edit]:opacity-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RETURN TRIP TOGGLE BUTTON (+ ADD RETURN / REMOVE RETURN) */}
              {store.serviceMode !== 'HOURLY_TOUR' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => store.setIsReturn(!store.isReturn)}
                    className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                      store.isReturn
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {store.isReturn ? (
                      <>
                        <span>REMOVE RETURN</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                        <span>ADD RETURN TRIP</span>
                      </>
                    )}
                  </button>

                  {/* RETURN DATE & RETURN TIME (Expanded when isReturn === true) */}
                  {store.isReturn && (
                    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                        <label className="text-[9px] font-extrabold text-slate-500 block uppercase tracking-wider">
                          Return date
                        </label>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="relative flex-1 flex items-center">
                            {!store.returnDate && (
                              <span className="pointer-events-none absolute left-0 text-xs font-semibold text-slate-400 select-none">
                                Select date
                              </span>
                            )}
                            <input
                              type="date"
                              value={store.returnDate}
                              onClick={(e) => (e.currentTarget as any).showPicker?.()}
                              onChange={(e) => store.setReturnDate(e.target.value)}
                              className={`w-full bg-transparent text-xs focus:outline-none cursor-pointer ${
                                store.returnDate
                                  ? 'font-black text-slate-900'
                                  : 'text-transparent [&::-webkit-datetime-edit]:opacity-0'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                        <label className="text-[9px] font-extrabold text-slate-500 block uppercase tracking-wider">
                          Return time
                        </label>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="relative flex-1 flex items-center">
                            {!store.returnTime && (
                              <span className="pointer-events-none absolute left-0 text-xs font-semibold text-slate-400 select-none">
                                Select time
                              </span>
                            )}
                            <input
                              type="time"
                              value={store.returnTime}
                              onClick={(e) => (e.currentTarget as any).showPicker?.()}
                              onChange={(e) => store.setReturnTime(e.target.value)}
                              className={`w-full bg-transparent text-xs focus:outline-none cursor-pointer ${
                                store.returnTime
                                  ? 'font-black text-slate-900'
                                  : 'text-transparent [&::-webkit-datetime-edit]:opacity-0'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASSENGERS & LUGGAGE COUNTERS (Side-by-Side Split Grid) */}
              <div className="grid grid-cols-2 gap-2">
                {/* PASSENGERS COUNTER */}
                <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                  <label className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider truncate">
                    Passengers (inc. kids)
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900 pl-1">{store.passengers}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => store.setPassengers(Math.max(1, store.passengers - 1))}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center text-xs shadow-sm transition-all active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => store.setPassengers(Math.min(16, store.passengers + 1))}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center text-xs shadow-sm transition-all active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* LUGGAGE COUNTER */}
                <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 space-y-0.5">
                  <label className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 block uppercase tracking-wider truncate">
                    Luggage Count
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900 pl-1">{store.luggageCount}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => store.setLuggageCount(Math.max(0, store.luggageCount - 1))}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center text-xs shadow-sm transition-all active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => store.setLuggageCount(Math.min(16, store.luggageCount + 1))}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center text-xs shadow-sm transition-all active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUBTEXT: FREE BABY SEATS */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong className="font-black uppercase">FREE</strong> baby and booster seats can be requested during booking</span>
              </div>

              {/* MAIN CTA BUTTON: GOLD BOOK NOW */}
              <button
                type="button"
                onClick={goToStep2}
                className="w-full py-3.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-bold text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{t('bookNow')}</span>
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* STEP 2: SELECT VEHICLE TIER */}
          {step === 2 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    <span>{t('scheduleTitle')}</span>
                  </h3>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Total Fare: {totalFare} €
                </span>
              </div>

              {/* Vehicle Tier Cards */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {t('selectVehicleTier')}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <VehicleCard
                    tier="SEDAN"
                    title={t('sedanName')}
                    paxLimit={3}
                    bagLimit={3}
                    price={getVehiclePrice('SEDAN')}
                    rateLabel={
                      store.serviceMode === 'HOURLY_TOUR'
                        ? '65€ / Hour (Guide Included)'
                        : store.serviceMode === 'DISTANCE'
                        ? '2.00 € / KM'
                        : undefined
                    }
                    isRoundTrip={store.isReturn && store.serviceMode !== 'HOURLY_TOUR'}
                    isSelected={store.vehicleTier === 'SEDAN'}
                    onSelect={() => store.setVehicleTier('SEDAN')}
                  />
                  <VehicleCard
                    tier="ECONOMY_VAN"
                    title={t('economyVanName')}
                    paxLimit={8}
                    bagLimit={8}
                    price={getVehiclePrice('ECONOMY_VAN')}
                    rateLabel={
                      store.serviceMode === 'HOURLY_TOUR'
                        ? '80€ / Hour (Guide Included)'
                        : store.serviceMode === 'DISTANCE'
                        ? '2.70 € / KM'
                        : undefined
                    }
                    isRoundTrip={store.isReturn && store.serviceMode !== 'HOURLY_TOUR'}
                    isSelected={store.vehicleTier === 'ECONOMY_VAN'}
                    onSelect={() => store.setVehicleTier('ECONOMY_VAN')}
                  />
                  <VehicleCard
                    tier="BUSINESS_VAN"
                    title={t('businessVanName')}
                    paxLimit={7}
                    bagLimit={7}
                    price={getVehiclePrice('BUSINESS_VAN')}
                    rateLabel={
                      store.serviceMode === 'HOURLY_TOUR'
                        ? '110€ / Hour (VIP Guide)'
                        : store.serviceMode === 'DISTANCE'
                        ? '3.50 € / KM'
                        : undefined
                    }
                    isRoundTrip={store.isReturn && store.serviceMode !== 'HOURLY_TOUR'}
                    isSelected={store.vehicleTier === 'BUSINESS_VAN'}
                    onSelect={() => store.setVehicleTier('BUSINESS_VAN')}
                  />
                  <VehicleCard
                    tier="MINIBUS"
                    title={t('minibusName')}
                    paxLimit={16}
                    bagLimit={16}
                    price={getVehiclePrice('MINIBUS')}
                    rateLabel={
                      store.serviceMode === 'HOURLY_TOUR'
                        ? '150€ / Hour (Group Tour)'
                        : store.serviceMode === 'DISTANCE'
                        ? '4.50 € / KM'
                        : undefined
                    }
                    isRoundTrip={store.isReturn && store.serviceMode !== 'HOURLY_TOUR'}
                    isSelected={store.vehicleTier === 'MINIBUS'}
                    onSelect={() => store.setVehicleTier('MINIBUS')}
                  />
                </div>
              </div>

              {/* Step 2 Action Bar */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 transition-all flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('back')}</span>
                </button>

                <button
                  type="button"
                  onClick={goToStep3}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{t('btnPassengerDetails')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PASSENGER DETAILS & CONFIRMATION */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-500" />
                  <span>{t('passengerContactTitle')}</span>
                </h3>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-700">{t('fullName')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={store.customerName}
                    onChange={(e) => store.setCustomerDetails({ name: e.target.value, email: store.customerEmail, phone: store.customerPhone, notes: store.notes })}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-700">{t('emailAddress')} *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={store.customerEmail}
                    onChange={(e) => store.setCustomerDetails({ name: store.customerName, email: e.target.value, phone: store.customerPhone, notes: store.notes })}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-700">{t('mobilePhone')} *</label>
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
              </div>

              {/* Free Child Seats & Flight Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-700">{t('babyCarSeats')}</label>
                  <select
                    value={store.babySeats}
                    onChange={(e) => store.setBabySeats(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none"
                  >
                    {[0, 1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} Free {num === 1 ? 'Seat' : 'Seats'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-700">{t('boosterSeats')}</label>
                  <select
                    value={store.boosterSeats}
                    onChange={(e) => store.setBoosterSeats(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none"
                  >
                    {[0, 1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} Free {num === 1 ? 'Seat' : 'Seats'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-700">{t('flightNumberLabel')}</label>
                  <input
                    type="text"
                    placeholder="e.g. AF1234"
                    value={store.flightOrTrainNumber}
                    onChange={(e) => store.setFlightOrTrainNumber(e.target.value)}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Summary Ticker Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs font-semibold text-slate-800">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-extrabold text-slate-900">
                    {store.serviceMode === 'HOURLY_TOUR'
                      ? `Private Tour (${store.rentalHours} Hours)`
                      : store.serviceMode === 'DISTANCE'
                      ? `Distance Rate (${store.estimatedKm} KM)`
                      : `${store.origin?.shortCode || 'CDG'} → ${store.destination?.shortCode || 'DLP'} (${store.isReturn ? t('roundTrip') : t('oneWay')})`}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Pickup Date & Time:</span>
                  <span className="font-bold text-slate-900">
                    {store.pickupDate} at {store.pickupTime}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-slate-500">Total Fixed Fare ({t('payOnArrival')}):</span>
                  <span className="text-lg font-black text-slate-900">{totalFare} €</span>
                </div>
              </div>

              {/* Step 3 Action Bar */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 transition-all flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('back')}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSubmitting ? 'Confirming...' : t('btnReserveNow')}</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* TRIPADVISOR TRUST BADGE FOOTER */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <a
          href="https://www.tripadvisor.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-0.5 text-amber-500">
            <span className="text-xs">★</span>
            <span className="text-xs">★</span>
            <span className="text-xs">★</span>
            <span className="text-xs">★</span>
            <span className="text-xs">★</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-navy-900 leading-tight group-hover:text-gold-700">4.9 / 5.0</div>
            <div className="text-[9px] text-slate-500 font-medium">3444+ Reviews</div>
          </div>
        </a>

        <a
          href="https://www.tripadvisor.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[#E5D7BC] bg-[#F7F2E7] hover:bg-[#EAE0CA] transition-colors rounded-lg px-2.5 py-1 text-center group"
        >
          <div className="text-[8px] font-bold text-gold-800 uppercase tracking-wider group-hover:underline">Tripadvisor</div>
          <div className="text-[9px] font-bold text-navy-900 leading-none">Ranked #6 Travellers' Choice</div>
        </a>
      </div>
    </div>
  );
}
