'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { LocationDropdown } from '@/components/booking/LocationDropdown';
import {
  ArrowRight,
  ArrowRightLeft,
  Navigation,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MapPin,
  ChevronDown,
  Search,
  Car,
  Check,
  Users,
  Compass,
  Clock,
  Award,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { VehicleTier } from '@/types';

interface VehicleOption {
  tier: VehicleTier;
  key: 'sedan' | 'economyVan' | 'businessVan' | 'minibus';
  label: string;
  pax: string;
  paxCount: number;
  hourlyRate: number;
  kmRate: number;
  desc: string;
  icon: string;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    tier: 'SEDAN',
    key: 'sedan',
    label: 'Car (Sedan)',
    pax: '1–3 Pax',
    paxCount: 2,
    hourlyRate: 65,
    kmRate: 2.0,
    desc: 'Mercedes E-Class / Executive Sedan',
    icon: '🚗',
  },
  {
    tier: 'ECONOMY_VAN',
    key: 'economyVan',
    label: 'Standard Van',
    pax: '1–6 Pax',
    paxCount: 4,
    hourlyRate: 80,
    kmRate: 2.7,
    desc: 'Mercedes Vito / VW Caravelle',
    icon: '🚐',
  },
  {
    tier: 'BUSINESS_VAN',
    key: 'businessVan',
    label: 'VIP Luxury Van',
    pax: '1–7 Pax',
    paxCount: 5,
    hourlyRate: 110,
    kmRate: 3.5,
    desc: 'Mercedes V-Class Luxury Chauffeur',
    icon: '👑',
  },
  {
    tier: 'MINIBUS',
    key: 'minibus',
    label: 'Group Minibus',
    pax: '1–8 Pax',
    paxCount: 8,
    hourlyRate: 150,
    kmRate: 4.5,
    desc: 'Spacious Group Minibus',
    icon: '🚌',
  },
];

const POPULAR_TOURS = [
  {
    id: 'paris-highlights',
    title: 'Paris Highlights & City Tour',
    durationHours: 4,
    description:
      'Eiffel Tower, Arc de Triomphe, Champs-Élysées, Louvre Pyramid, Notre-Dame & Montmartre with dedicated English-speaking driver guide.',
    carPrice: 4 * 65, // 260€
    vanPrice: 4 * 80, // 320€
    badge: 'Popular Half-Day',
    highlights: ['Eiffel Tower Photo Stop', 'Montmartre & Sacré-Cœur', 'Champs-Élysées', 'Notre-Dame Cathedral'],
  },
  {
    id: 'paris-versailles',
    title: 'Paris City & Palace of Versailles',
    durationHours: 8,
    description:
      'Morning panoramic tour of Paris landmarks, followed by private chauffeur transfer to Versailles Grand Palace & Royal Estate.',
    carPrice: 8 * 65, // 520€
    vanPrice: 8 * 80, // 640€
    badge: 'Full Day Luxury Tour',
    highlights: ['Versailles Palace & Gardens', 'Paris Landmarks', 'Direct Hotel Pickup', 'Skip-the-Line Coordination'],
  },
  {
    id: 'normandy-dday',
    title: 'Normandy D-Day Landing Beaches & Caen',
    durationHours: 10,
    description:
      'Omaha Beach, Pointe du Hoc cliffs, Normandy American Cemetery at Colleville-sur-Mer, Arromanches artificial harbor & Caen Memorial.',
    carPrice: 10 * 65, // 650€
    vanPrice: 10 * 80, // 800€
    badge: 'Historic Excursion',
    highlights: ['Omaha Beach & Bunkers', 'Pointe du Hoc', 'Colleville American Cemetery', 'Scenic Normandy Coast'],
  },
  {
    id: 'champagne-reims',
    title: 'Champagne Region & Grand Cellars Tour',
    durationHours: 10,
    description:
      'Reims Notre-Dame Cathedral, Avenue de Champagne in Épernay, prestigious Champagne houses (Moët & Chandon, Veuve Clicquot) and vineyard tastings.',
    carPrice: 10 * 65, // 650€
    vanPrice: 10 * 80, // 800€
    badge: 'Tasting Experience',
    highlights: ['Reims Gothic Cathedral', 'Avenue de Champagne Épernay', 'Famous Champagne Cellars', 'Vineyard Landscapes'],
  },
  {
    id: 'giverny-monet',
    title: "Giverny & Claude Monet's Gardens",
    durationHours: 6,
    description:
      "Explore Claude Monet's iconic Japanese bridge, water lilies pond, Clos Normand flower estate, and the impressionist master's restored house.",
    carPrice: 6 * 65, // 390€
    vanPrice: 6 * 80, // 480€
    badge: 'Art & Heritage',
    highlights: ['Monet Water Lilies Pond', 'Japanese Footbridge', "Master's Historic House", 'Charming Giverny Village'],
  },
];

interface OurRatesClientProps {
  locations: any[];
  initialRoutes: any[];
}

export function OurRatesClient({ locations, initialRoutes }: OurRatesClientProps) {
  const router = useRouter();
  const [activeServiceTab, setActiveServiceTab] = useState<'TRANSFERS' | 'HOURLY_TOURS'>('TRANSFERS');
  const [customTourHours, setCustomTourHours] = useState<number>(4);

  const [activeDropdown, setActiveDropdown] = useState<'ORIGIN' | 'DESTINATION' | 'VEHICLE' | null>(null);
  const [selectedFromLoc, setSelectedFromLoc] = useState<any>(null);
  const [selectedToLoc, setSelectedToLoc] = useState<any>(null);

  const [selectedFromId, setSelectedFromId] = useState<string>('');
  const [selectedToId, setSelectedToId] = useState<string>('');

  const [selectedVehicleTier, setSelectedVehicleTier] = useState<VehicleTier>('ECONOMY_VAN');

  const [customRouteData, setCustomRouteData] = useState<{
    distanceKm: number;
    durationMinutes: number;
    pricing: { sedan: number; economyVan: number; businessVan: number; minibus: number };
  } | null>(null);
  const [isCalculatingCustom, setIsCalculatingCustom] = useState(false);

  const {
    setServiceMode,
    setRentalHours,
    setOrigin,
    setDestination,
    setRoutePricing,
    setEstimatedKm,
    setEstimatedDurationMinutes,
    setDistanceRouteCalculated,
    setVehicleTier,
    setPassengers,
  } = useBookingStore();
  const { t } = useLanguage();

  const selectedVehicleConfig =
    VEHICLE_OPTIONS.find((v) => v.tier === selectedVehicleTier) || VEHICLE_OPTIONS[1];

  // Smart Filter: exact match first, or partial match if no exact match
  const exactRoutes = initialRoutes.filter((r) => {
    const matchFrom =
      !selectedFromId ||
      r.originId === selectedFromId ||
      r.origin?.shortCode === selectedFromLoc?.shortCode ||
      r.origin?.name === selectedFromLoc?.name;
    const matchTo =
      !selectedToId ||
      r.destinationId === selectedToId ||
      r.destination?.shortCode === selectedToLoc?.shortCode ||
      r.destination?.name === selectedToLoc?.name;
    return matchFrom && matchTo;
  });

  const partialRoutes =
    exactRoutes.length === 0 && (selectedFromId || selectedToId)
      ? initialRoutes.filter(
          (r) =>
            r.originId === selectedFromId ||
            r.destinationId === selectedToId ||
            r.origin?.name === selectedFromLoc?.name ||
            r.destination?.name === selectedToLoc?.name
        )
      : [];

  const displayRoutes = exactRoutes.length > 0 ? exactRoutes : partialRoutes;
  const isFiltered = Boolean(selectedFromLoc || selectedToLoc);

  // Dynamic Google Route Distance Calculator
  useEffect(() => {
    let isCancelled = false;
    if (selectedFromLoc && selectedToLoc && selectedFromLoc.id !== selectedToLoc.id) {
      const dbMatch = initialRoutes.find(
        (r) =>
          (r.originId === selectedFromLoc.id && r.destinationId === selectedToLoc.id) ||
          (r.originId === selectedToLoc.id && r.destinationId === selectedFromLoc.id) ||
          (r.origin?.name === selectedFromLoc.name && r.destination?.name === selectedToLoc.name) ||
          (r.origin?.name === selectedToLoc.name && r.destination?.name === selectedFromLoc.name)
      );

      if (!dbMatch) {
        setIsCalculatingCustom(true);
        fetch('/api/maps/distance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: selectedFromLoc.name,
            destination: selectedToLoc.name,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!isCancelled && data.success && data.pricing) {
              setCustomRouteData({
                distanceKm: data.distanceKm,
                durationMinutes: data.durationMinutes,
                pricing: data.pricing,
              });
            }
          })
          .catch((err) => {
            console.warn('Failed to calculate custom route:', err);
          })
          .finally(() => {
            if (!isCancelled) setIsCalculatingCustom(false);
          });
      } else {
        setCustomRouteData(null);
      }
    } else {
      setCustomRouteData(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedFromLoc, selectedToLoc, initialRoutes]);

  const handleSearchClick = () => {
    if (!selectedFromLoc) {
      setActiveDropdown('ORIGIN');
      return;
    }
    if (!selectedToLoc) {
      setActiveDropdown('DESTINATION');
      return;
    }
    const el = document.getElementById('rates-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookRoute = (
    originLoc: any,
    destLoc: any,
    pricing: { sedan: number; economyVan: number; businessVan: number; minibus: number },
    distanceKm: number,
    durationMinutes: number,
    isDynamic: boolean = false,
    vehicleTier: VehicleTier = selectedVehicleTier
  ) => {
    setServiceMode('TRANSFER');
    if (originLoc) setOrigin(originLoc);
    if (destLoc) setDestination(destLoc);
    setRoutePricing(pricing);
    setEstimatedKm(distanceKm);
    setEstimatedDurationMinutes(durationMinutes);
    setDistanceRouteCalculated(isDynamic);
    setVehicleTier(vehicleTier);
    const chosen = VEHICLE_OPTIONS.find((v) => v.tier === vehicleTier);
    if (chosen) setPassengers(chosen.paxCount);
    router.push('/book');
  };

  const handleBookTour = (hours: number, vehicleTier: VehicleTier = selectedVehicleTier) => {
    setServiceMode('HOURLY_TOUR');
    setRentalHours(hours);
    setVehicleTier(vehicleTier);
    const chosen = VEHICLE_OPTIONS.find((v) => v.tier === vehicleTier);
    if (chosen) setPassengers(chosen.paxCount);
    router.push('/book');
  };

  return (
    <div className="space-y-10">
      {/* ========================================================================= */}
      {/* 1. TOP SERVICE MODE SELECTOR TABS: DIRECT TRANSFERS vs HOURLY CHAUFFEUR TOURS */}
      {/* ========================================================================= */}
      <div className="max-w-2xl mx-auto flex p-1.5 bg-[#F5F3ED] rounded-2xl border border-[#E5D7BC] shadow-sm">
        <button
          type="button"
          onClick={() => setActiveServiceTab('TRANSFERS')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeServiceTab === 'TRANSFERS'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-4 h-4 text-gold-400" />
          <span>Point-to-Point & Distance Fares</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveServiceTab('HOURLY_TOURS')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeServiceTab === 'HOURLY_TOURS'
              ? 'bg-gold-600 text-white shadow-md'
              : 'text-slate-600 hover:text-gold-700'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Hourly Tours (Driver Guide Incl.)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: DIRECT TRANSFERS & DISTANCE-BASED SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      {activeServiceTab === 'TRANSFERS' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Searchable FROM and TO Filter Toolbar Card with VEHICLE SELECTOR & SEARCH BUTTON */}
          <div className="bg-white border border-[#E5D7BC] rounded-3xl p-6 sm:p-7 shadow-xl max-w-5xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
              {/* FROM SELECTOR (Searchable & Typable Input Dropdown) */}
              <div className="lg:col-span-3 relative space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
                  FROM (Pickup Location)
                </label>
                <div
                  onClick={() => setActiveDropdown(activeDropdown === 'ORIGIN' ? null : 'ORIGIN')}
                  className={`w-full bg-[#F5F3ED] hover:bg-[#eae6db] border rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-navy-900 cursor-pointer flex items-center justify-between transition-colors shadow-sm ${
                    activeDropdown === 'ORIGIN' ? 'ring-2 ring-gold-600 border-gold-600' : 'border-[#E5D7BC]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                    <span
                      className={
                        selectedFromLoc ? 'text-navy-900 font-extrabold truncate' : 'text-slate-400 font-medium'
                      }
                    >
                      {selectedFromLoc ? selectedFromLoc.name : 'Type pickup location...'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      activeDropdown === 'ORIGIN' ? 'rotate-180 text-gold-600' : ''
                    }`}
                  />
                </div>

                {/* Typable Search Dropdown with Google Maps Autocomplete */}
                <LocationDropdown
                  isOpen={activeDropdown === 'ORIGIN'}
                  onClose={() => setActiveDropdown(null)}
                  title="Select Pickup Location or Type Address"
                  placeholder="Type airport, hotel, station, or street address..."
                  locations={locations}
                  selectedLocationId={selectedFromLoc?.id}
                  onSelectLocation={(loc) => {
                    setSelectedFromLoc(loc);
                    setSelectedFromId(loc.id);
                  }}
                />
              </div>

              {/* SWAP BUTTON */}
              <div className="hidden lg:flex lg:col-span-1 justify-center pb-1">
                <button
                  type="button"
                  onClick={() => {
                    const tempLoc = selectedFromLoc;
                    const tempId = selectedFromId;
                    setSelectedFromLoc(selectedToLoc);
                    setSelectedToLoc(tempLoc);
                    setSelectedFromId(selectedToId);
                    setSelectedToId(tempId);
                  }}
                  title="Swap From & To"
                  className="w-10 h-10 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] text-gold-600 hover:bg-gold-600 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* TO SELECTOR (Searchable & Typable Input Dropdown) */}
              <div className="lg:col-span-3 relative space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
                  TO (Dropoff Location)
                </label>
                <div
                  onClick={() => setActiveDropdown(activeDropdown === 'DESTINATION' ? null : 'DESTINATION')}
                  className={`w-full bg-[#F5F3ED] hover:bg-[#eae6db] border rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-navy-900 cursor-pointer flex items-center justify-between transition-colors shadow-sm ${
                    activeDropdown === 'DESTINATION' ? 'ring-2 ring-gold-600 border-gold-600' : 'border-[#E5D7BC]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                    <span
                      className={
                        selectedToLoc ? 'text-navy-900 font-extrabold truncate' : 'text-slate-400 font-medium'
                      }
                    >
                      {selectedToLoc ? selectedToLoc.name : 'Type dropoff location...'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      activeDropdown === 'DESTINATION' ? 'rotate-180 text-gold-600' : ''
                    }`}
                  />
                </div>

                {/* Typable Search Dropdown with Google Maps Autocomplete */}
                <LocationDropdown
                  isOpen={activeDropdown === 'DESTINATION'}
                  onClose={() => setActiveDropdown(null)}
                  title="Select Dropoff Destination or Type Address"
                  placeholder="Type hotel, Disneyland, Paris street address..."
                  locations={locations}
                  selectedLocationId={selectedToLoc?.id}
                  onSelectLocation={(loc) => {
                    setSelectedToLoc(loc);
                    setSelectedToId(loc.id);
                  }}
                />
              </div>

              {/* VEHICLE / PASSENGERS SELECTOR (JUST NEXT TO SEARCH BUTTON) */}
              <div className="lg:col-span-3 relative space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
                  VEHICLE & PASSENGERS
                </label>
                <div
                  onClick={() => setActiveDropdown(activeDropdown === 'VEHICLE' ? null : 'VEHICLE')}
                  className={`w-full bg-[#F5F3ED] hover:bg-[#eae6db] border rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-navy-900 cursor-pointer flex items-center justify-between transition-colors shadow-sm ${
                    activeDropdown === 'VEHICLE' ? 'ring-2 ring-gold-600 border-gold-600' : 'border-[#E5D7BC]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{selectedVehicleConfig.icon}</span>
                    <span className="text-navy-900 font-extrabold truncate">
                      {selectedVehicleConfig.label} ({selectedVehicleConfig.pax})
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      activeDropdown === 'VEHICLE' ? 'rotate-180 text-gold-600' : ''
                    }`}
                  />
                </div>

                {/* Vehicle Options Dropdown */}
                {activeDropdown === 'VEHICLE' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E5D7BC] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {VEHICLE_OPTIONS.map((opt) => {
                      const isSelected = selectedVehicleTier === opt.tier;
                      return (
                        <button
                          key={opt.tier}
                          type="button"
                          onClick={() => {
                            setSelectedVehicleTier(opt.tier);
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-gold-50 border border-gold-300 text-gold-900'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{opt.icon}</span>
                            <div>
                              <div className="text-xs font-black text-navy-900">{opt.label}</div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {opt.pax} • {opt.kmRate}€/km • {opt.hourlyRate}€/h
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-gold-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PROMINENT SEARCH BUTTON */}
              <div className="lg:col-span-2 pb-0.5">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="w-full py-3.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search Fares</span>
                </button>
              </div>
            </div>

            {/* Guaranteed Distance Rate Transparency Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5D7BC]/70">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase text-gold-800 bg-[#F7F2E7] px-2.5 py-1 rounded-lg border border-[#E5D7BC]">
                  Guaranteed Distance Rate:
                </span>
                <span className="text-xs font-bold text-navy-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5">
                  <span>🚗</span>
                  <span>CAR: <strong className="text-gold-700">2.00 € / km</strong></span>
                </span>
                <span className="text-xs font-bold text-navy-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5">
                  <span>🚐</span>
                  <span>VAN: <strong className="text-gold-700">2.70 € / km</strong></span>
                </span>
              </div>

              {isFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFromLoc(null);
                    setSelectedToLoc(null);
                    setSelectedFromId('');
                    setSelectedToId('');
                    setCustomRouteData(null);
                  }}
                  className="text-xs font-bold text-gold-700 hover:text-gold-800 underline flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <span>Reset / View All Routes</span>
                </button>
              )}
            </div>
          </div>

          {/* RESULTS SECTION ANCHOR */}
          <div id="rates-results" className="space-y-8 scroll-mt-24">
            {/* DYNAMIC CALCULATED ROUTE CARD (When user types or selects custom locations without a fixed DB route) */}
            {selectedFromLoc && selectedToLoc && selectedFromLoc.id !== selectedToLoc.id && (
              <>
                {isCalculatingCustom ? (
                  <div className="bg-white border border-gold-200 rounded-3xl p-6 text-center max-w-xl mx-auto shadow-md space-y-2 animate-in fade-in">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Calculating exact road distance and guaranteed fare...
                    </p>
                  </div>
                ) : customRouteData ? (
                  <div className="bg-gradient-to-r from-gold-50 via-white to-gold-50 border-2 border-gold-300 rounded-3xl p-6 sm:p-7 shadow-xl max-w-2xl mx-auto space-y-5 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-gold-200/80 pb-3">
                      <div className="flex items-center gap-2 text-xs font-black text-gold-900 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-gold-600" />
                        <span>Custom Route Distance Fare</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>
                          {customRouteData.distanceKm} km • ~{customRouteData.durationMinutes} mins
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FROM</div>
                        <div className="font-serif text-lg font-bold text-navy-900">{selectedFromLoc.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TO</div>
                        <div className="font-serif text-lg font-bold text-gold-700">{selectedToLoc.name}</div>
                      </div>
                    </div>

                    {/* SELECTABLE VEHICLE FARES (Interactive Clickable Vehicle Options) */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>SELECT VEHICLE CATEGORY (CLICK TO CHOOSE):</span>
                        <span className="text-gold-700 font-extrabold">{selectedVehicleConfig.label} Active</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs font-bold">
                        {VEHICLE_OPTIONS.map((v) => {
                          const price = customRouteData.pricing[v.key];
                          const isSelected = selectedVehicleTier === v.tier;
                          return (
                            <button
                              key={v.tier}
                              type="button"
                              onClick={() => setSelectedVehicleTier(v.tier)}
                              className={`p-3 rounded-2xl transition-all cursor-pointer relative text-left sm:text-center flex flex-col justify-between group active:scale-95 ${
                                isSelected
                                  ? 'bg-gradient-to-b from-gold-50 to-white border-2 border-gold-600 shadow-md ring-2 ring-gold-400/40'
                                  : 'bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-gold-300 shadow-sm'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute -top-2.5 right-2 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 bg-gold-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>Selected</span>
                                </div>
                              )}
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-base">{v.icon}</span>
                                <span
                                  className={`text-[10px] uppercase font-black tracking-wider ${
                                    isSelected ? 'text-gold-900' : 'text-slate-500'
                                  }`}
                                >
                                  {v.label} ({v.pax})
                                </span>
                              </div>
                              <div className="text-base font-black text-navy-900 mt-1.5">
                                {price}€
                              </div>
                              <div className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center justify-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>Guaranteed</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleBookRoute(
                          selectedFromLoc,
                          selectedToLoc,
                          customRouteData.pricing,
                          customRouteData.distanceKm,
                          customRouteData.durationMinutes,
                          true,
                          selectedVehicleTier
                        )
                      }
                      className="w-full py-4 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>
                        Book {selectedVehicleConfig.label} ({customRouteData.pricing[selectedVehicleConfig.key]}€) Now
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </>
            )}

            {/* Rates Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRoutes.map((route) => {
                return (
                  <div
                    key={route.id}
                    className="bg-white border border-[#E5D7BC]/90 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
                  >
                    {/* Header Info */}
                    <div className="space-y-4">
                      <div className="space-y-2 border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {t('from')}
                          </div>
                          {/* Route Distance & Time Badge */}
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{route.distanceKm || 45} km (~{route.estDurationMinutes || 40}m)</span>
                          </div>
                        </div>

                        <div className="font-serif text-lg font-bold text-navy-900 line-clamp-1">
                          {route.origin?.name || 'Pickup Location'}
                        </div>

                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                          TO
                        </div>
                        <div className="font-serif text-lg font-bold text-gold-700 line-clamp-1">
                          {route.destination?.name || 'Dropoff Location'}
                        </div>
                      </div>

                      {/* PAX Price Breakdown Table (Clickable vehicle rows) */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 px-1">
                          <span>VEHICLE / PAX</span>
                          <span className="text-center">ONE WAY</span>
                          <span className="text-right">ROUND TRIP</span>
                        </div>

                        {VEHICLE_OPTIONS.map((opt) => {
                          const oneWay =
                            opt.tier === 'SEDAN'
                              ? route.sedanPriceEur
                              : opt.tier === 'ECONOMY_VAN'
                              ? route.economyVanPriceEur
                              : opt.tier === 'BUSINESS_VAN'
                              ? route.businessVanPriceEur
                              : route.minibusPriceEur;
                          const roundTrip = oneWay * 2;
                          const isSelected = selectedVehicleTier === opt.tier;

                          return (
                            <button
                              key={opt.tier}
                              type="button"
                              onClick={() =>
                                handleBookRoute(
                                  route.origin,
                                  route.destination,
                                  {
                                    sedan: route.sedanPriceEur,
                                    economyVan: route.economyVanPriceEur,
                                    businessVan: route.businessVanPriceEur,
                                    minibus: route.minibusPriceEur,
                                  },
                                  route.distanceKm || 45,
                                  route.estDurationMinutes || 40,
                                  false,
                                  opt.tier
                                )
                              }
                              title={`Book ${opt.label} (${opt.pax}) for ${oneWay}€`}
                              className={`w-full grid grid-cols-3 text-xs font-semibold px-2.5 py-2.5 rounded-xl border transition-all text-left items-center cursor-pointer active:scale-98 ${
                                isSelected
                                  ? 'bg-[#F7F2E7] border-2 border-gold-500 shadow-sm ring-1 ring-gold-400'
                                  : 'bg-[#F5F3ED] hover:bg-[#ede8dc] border-[#E5D7BC]/50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-xs">{opt.icon}</span>
                                <span className="text-slate-800 font-bold truncate">
                                  {opt.pax} ({opt.label})
                                </span>
                              </div>
                              <span className="text-center text-navy-900 font-black">{oneWay}€</span>
                              <span className="text-right text-gold-700 font-extrabold">{roundTrip}€</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Primary Action Button using Selected Vehicle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleBookRoute(
                          route.origin,
                          route.destination,
                          {
                            sedan: route.sedanPriceEur,
                            economyVan: route.economyVanPriceEur,
                            businessVan: route.businessVanPriceEur,
                            minibus: route.minibusPriceEur,
                          },
                          route.distanceKm || 45,
                          route.estDurationMinutes || 40,
                          false,
                          selectedVehicleTier
                        )
                      }
                      className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Reserve {selectedVehicleConfig.label} Transfer</span>
                      <ArrowRight className="w-4 h-4 text-gold-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: HOURLY CHAUFFEUR TOURS WITH DRIVER GUIDE INCLUDED */}
      {/* ========================================================================= */}
      {activeServiceTab === 'HOURLY_TOURS' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Hourly Rates Showcase Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-10 border border-[#C5A059]/40 shadow-2xl text-white space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/15 px-4 py-1.5 rounded-full border border-[#D4AF37]/30">
                ⭐ ALL-INCLUSIVE CHAUFFEUR & LOCAL GUIDE
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Private Hourly Tours with Driver Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Explore Paris, Versailles, Normandy, Champagne & Giverny at your own pace with a dedicated, professional English-speaking chauffeur & local guide. Unlimited stops, custom itinerary, and complete flexibility.
              </p>
            </div>

            {/* Official Hourly Pricing Cards (CAR: 65€/h • VAN: 80€/h) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VEHICLE_OPTIONS.map((v) => {
                const isSelected = selectedVehicleTier === v.tier;
                return (
                  <div
                    key={v.tier}
                    onClick={() => setSelectedVehicleTier(v.tier)}
                    className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#C5A059]/25 to-slate-900 border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-xl'
                        : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{v.icon}</span>
                        {isSelected && (
                          <span className="bg-[#D4AF37] text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-white text-base">{v.label}</div>
                      <div className="text-xs text-slate-400 font-semibold">{v.pax} • {v.desc}</div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#D4AF37]">{v.hourlyRate}€</span>
                        <span className="text-xs text-slate-400 font-bold">/ Hour</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Driver Guide Included</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Custom Tour Hours Calculator */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                    Instant Tour Fare Estimator
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    Select how many hours you need your driver guide:
                  </div>
                </div>

                {/* Hours Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {[3, 4, 6, 8, 10, 12].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setCustomTourHours(hr)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        customTourHours === hr
                          ? 'bg-[#D4AF37] text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {hr}h {hr === 4 ? '(Half Day)' : hr === 8 ? '(Full Day)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Total Bar */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs text-slate-400 font-medium">
                    Estimated total for <strong className="text-white">{customTourHours} Hours</strong> with{' '}
                    <strong className="text-[#D4AF37]">{selectedVehicleConfig.label} ({selectedVehicleConfig.pax})</strong>:
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {customTourHours * selectedVehicleConfig.hourlyRate} €{' '}
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider ml-1">
                      (All Taxes & Tolls Included)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookTour(customTourHours, selectedVehicleTier)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Book {customTourHours}h Tour Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Popular Curated Tour Packages Grid */}
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-black uppercase text-gold-700 tracking-wider bg-[#F7F2E7] px-3.5 py-1 rounded-full border border-[#E5D7BC]">
                CURATED EXPERIENCES
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900">
                Recommended Private Sightseeing Tours
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
                All tours include door-to-door hotel pickup, luxury air-conditioned vehicle, and English-speaking chauffeur guide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {POPULAR_TOURS.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white border border-[#E5D7BC] rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gold-800 bg-[#F7F2E7] px-2.5 py-1 rounded-full border border-[#E5D7BC]">
                        {tour.badge}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        <span>{tour.durationHours} Hours</span>
                      </div>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-navy-900">
                      {tour.title}
                    </h4>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {tour.description}
                    </p>

                    {/* Highlights bullet list */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {tour.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown & Booking Button */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E5D7BC]/70">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">🚗 Car (1–3p)</div>
                        <div className="text-base font-black text-navy-900 mt-0.5">{tour.carPrice} €</div>
                        <div className="text-[9px] text-slate-400 font-medium">(65€/h)</div>
                      </div>
                      <div className="bg-[#F7F2E7] p-2.5 rounded-xl border border-gold-300">
                        <div className="text-[10px] text-gold-800 uppercase font-bold">🚐 Van (1–6p)</div>
                        <div className="text-base font-black text-navy-900 mt-0.5">{tour.vanPrice} €</div>
                        <div className="text-[9px] text-slate-400 font-medium">(80€/h)</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookTour(tour.durationHours, selectedVehicleTier)}
                      className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Book This {tour.durationHours}h Tour</span>
                      <ArrowRight className="w-4 h-4 text-gold-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRANSPARENT RATE GUARANTEE BANNER */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E5D7BC] rounded-3xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase text-gold-700 tracking-wider bg-[#F7F2E7] px-3.5 py-1 rounded-full border border-[#E5D7BC]">
            OUR FIXED RATE PROMISE
          </span>
          <h2 className="font-serif text-2xl font-bold text-navy-900">
            What is Included in Your Guaranteed Fare?
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            No surprises, no taximeters, and zero upfront deposits. Everything is included in your booking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-[#E5D7BC]/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-navy-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Fixed Rates</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Highway tolls, airport parking fees, and VAT taxes are fully included. Prices never change due to traffic delays.
            </p>
          </div>

          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-[#E5D7BC]/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-navy-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free Child Seats</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Infant, baby, and booster seats provided 100% free of charge upon request for your family&apos;s safety.
            </p>
          </div>

          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-[#E5D7BC]/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-navy-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Driver Guide Included</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Hourly tours include a dedicated English-speaking chauffeur & local guide with unlimited stops and complete itinerary flexibility.
            </p>
          </div>

          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-[#E5D7BC]/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-navy-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pay on Arrival</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Zero upfront deposit required. Pay your private driver upon completion of service via cash or card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
