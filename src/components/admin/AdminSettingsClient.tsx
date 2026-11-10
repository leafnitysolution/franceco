'use client';

import { useState, useTransition } from 'react';
import {
  adminSaveSettingsAction,
  adminTestGoogleApiAction,
  adminTestTripAdvisorAction,
  adminSearchTripAdvisorAction,
  adminTestEmailAction,
} from '@/lib/actions/settings';
import { BookingAddon, DEFAULT_BOOKING_ADDONS } from '@/lib/addonsShared';
import {
  HeroSlide,
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_INTERVAL_SECONDS,
} from '@/lib/heroSlidesShared';
import {
  Key,
  MapPin,
  Compass,
  Mail,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Send,
  Sliders,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Tv,
  PawPrint,
  Wine,
  Clock,
  Wifi,
  Trash2,
  Plus,
  RotateCcw,
  Upload,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  Layers,
  Calculator,
  Car,
  DollarSign,
  Coins,
  ShieldAlert,
} from 'lucide-react';

interface AdminSettingsClientProps {
  initialSettings: Record<string, string>;
}

export function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [isPending, startTransition] = useTransition();

  // Show/Hide Password fields
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showPartnerKey, setShowPartnerKey] = useState(false);
  const [showTripKey, setShowTripKey] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // Copied indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Google Test State
  const [testingGoogle, setTestingGoogle] = useState(false);
  const [googleTestResult, setGoogleTestResult] = useState<any | null>(null);

  // TripAdvisor Test & Search State
  const [testingTrip, setTestingTrip] = useState(false);
  const [tripTestResult, setTripTestResult] = useState<any | null>(null);
  const [showTripGuide, setShowTripGuide] = useState(false);
  const [tripSearchQuery, setTripSearchQuery] = useState('');
  const [searchingTrip, setSearchingTrip] = useState(false);
  const [tripSearchResults, setTripSearchResults] = useState<Array<{ locationId: string; name: string; address: string }> | null>(null);
  const [tripSearchError, setTripSearchError] = useState<string | null>(null);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);

  // SMTP Test State
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<any | null>(null);

  // Dynamic Auto-Rate & Minimum Pricing Engine Simulator State
  const [simDistanceKm, setSimDistanceKm] = useState<number>(12);
  const [simIsParis, setSimIsParis] = useState<boolean>(false);

  const getSimulatedPricing = () => {
    const minSedan = Math.max(20, parseFloat(settings.MIN_FARE_SEDAN) || 60);
    const minEcoVan = Math.max(30, parseFloat(settings.MIN_FARE_ECONOMY_VAN) || 80);
    const minBizVan = Math.max(40, parseFloat(settings.MIN_FARE_BUSINESS_VAN) || 110);
    const minMinibus = Math.max(60, parseFloat(settings.MIN_FARE_MINIBUS) || 160);

    const rateSedan = Math.max(1.0, parseFloat(settings.RATE_PER_KM_SEDAN) || 2.2);
    const rateEcoVan = Math.max(1.2, parseFloat(settings.RATE_PER_KM_ECONOMY_VAN) || 2.9);
    const rateBizVan = Math.max(1.5, parseFloat(settings.RATE_PER_KM_BUSINESS_VAN) || 3.8);
    const rateMinibus = Math.max(2.0, parseFloat(settings.RATE_PER_KM_MINIBUS) || 5.0);

    const baseFee = Math.max(0, parseFloat(settings.BASE_BOOKING_FEE) || 0);
    const parisMin = Math.max(30, parseFloat(settings.PARIS_INTRAMUROS_MIN_FARE) || 65);

    const calcSedanDist = Math.round(baseFee + simDistanceKm * rateSedan);
    const calcEcoVanDist = Math.round(baseFee + simDistanceKm * rateEcoVan);
    const calcBizVanDist = Math.round(baseFee + simDistanceKm * rateBizVan);
    const calcMinibusDist = Math.round(baseFee + simDistanceKm * rateMinibus);

    let finalSedan = Math.max(minSedan, calcSedanDist);
    let finalEcoVan = Math.max(minEcoVan, calcEcoVanDist);
    let finalBizVan = Math.max(minBizVan, calcBizVanDist);
    let finalMinibus = Math.max(minMinibus, calcMinibusDist);

    let sedanFloorApplied = finalSedan === minSedan && calcSedanDist < minSedan;
    let ecoFloorApplied = finalEcoVan === minEcoVan && calcEcoVanDist < minEcoVan;
    let isParisApplied = false;

    if (simIsParis && parisMin > 0) {
      if (parisMin > finalSedan) {
        finalSedan = parisMin;
        isParisApplied = true;
      }
      const parisEco = Math.round(parisMin * 1.25);
      if (parisEco > finalEcoVan) {
        finalEcoVan = parisEco;
        isParisApplied = true;
      }
      finalBizVan = Math.max(Math.round(parisMin * 1.65), finalBizVan);
      finalMinibus = Math.max(Math.round(parisMin * 2.3), finalMinibus);
    }

    return {
      sedan: finalSedan,
      ecoVan: finalEcoVan,
      bizVan: finalBizVan,
      minibus: finalMinibus,
      sedanFloorApplied,
      ecoFloorApplied,
      isParisApplied,
      calcSedanDist,
      calcEcoVanDist,
    };
  };

  const applyPricingPreset = (preset: 'standard' | 'premium' | 'high_season') => {
    if (preset === 'standard') {
      handleInputChange('MIN_FARE_SEDAN', '60');
      handleInputChange('MIN_FARE_ECONOMY_VAN', '80');
      handleInputChange('MIN_FARE_BUSINESS_VAN', '110');
      handleInputChange('MIN_FARE_MINIBUS', '160');
      handleInputChange('RATE_PER_KM_SEDAN', '2.2');
      handleInputChange('RATE_PER_KM_ECONOMY_VAN', '2.9');
      handleInputChange('RATE_PER_KM_BUSINESS_VAN', '3.8');
      handleInputChange('RATE_PER_KM_MINIBUS', '5.0');
      handleInputChange('BASE_BOOKING_FEE', '0');
      handleInputChange('PARIS_INTRAMUROS_MIN_FARE', '65');
    } else if (preset === 'premium') {
      handleInputChange('MIN_FARE_SEDAN', '70');
      handleInputChange('MIN_FARE_ECONOMY_VAN', '95');
      handleInputChange('MIN_FARE_BUSINESS_VAN', '130');
      handleInputChange('MIN_FARE_MINIBUS', '180');
      handleInputChange('RATE_PER_KM_SEDAN', '2.5');
      handleInputChange('RATE_PER_KM_ECONOMY_VAN', '3.3');
      handleInputChange('RATE_PER_KM_BUSINESS_VAN', '4.2');
      handleInputChange('RATE_PER_KM_MINIBUS', '5.5');
      handleInputChange('BASE_BOOKING_FEE', '5');
      handleInputChange('PARIS_INTRAMUROS_MIN_FARE', '75');
    } else if (preset === 'high_season') {
      // +15% surge
      const bump = (val: string, fallback: number) => {
        const num = parseFloat(val) || fallback;
        return (Math.round(num * 1.15 * 10) / 10).toString();
      };
      handleInputChange('MIN_FARE_SEDAN', bump(settings.MIN_FARE_SEDAN, 60));
      handleInputChange('MIN_FARE_ECONOMY_VAN', bump(settings.MIN_FARE_ECONOMY_VAN, 80));
      handleInputChange('MIN_FARE_BUSINESS_VAN', bump(settings.MIN_FARE_BUSINESS_VAN, 110));
      handleInputChange('MIN_FARE_MINIBUS', bump(settings.MIN_FARE_MINIBUS, 160));
      handleInputChange('RATE_PER_KM_SEDAN', bump(settings.RATE_PER_KM_SEDAN, 2.2));
      handleInputChange('RATE_PER_KM_ECONOMY_VAN', bump(settings.RATE_PER_KM_ECONOMY_VAN, 2.9));
      handleInputChange('RATE_PER_KM_BUSINESS_VAN', bump(settings.RATE_PER_KM_BUSINESS_VAN, 3.8));
      handleInputChange('RATE_PER_KM_MINIBUS', bump(settings.RATE_PER_KM_MINIBUS, 5.0));
      handleInputChange('PARIS_INTRAMUROS_MIN_FARE', bump(settings.PARIS_INTRAMUROS_MIN_FARE, 65));
    }
  };

  // Booking Add-ons / Extras State
  const parseInitialAddons = (): BookingAddon[] => {
    try {
      if (initialSettings.BOOKING_ADDONS && initialSettings.BOOKING_ADDONS.trim().length > 0) {
        const parsed = JSON.parse(initialSettings.BOOKING_ADDONS);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_BOOKING_ADDONS;
  };

  const [addons, setAddons] = useState<BookingAddon[]>(parseInitialAddons);

  const updateAddon = (index: number, patch: Partial<BookingAddon>) => {
    setAddons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      handleInputChange('BOOKING_ADDONS', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleAddonActive = (index: number) => {
    setAddons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isActive: !updated[index].isActive };
      handleInputChange('BOOKING_ADDONS', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAddon = (index: number) => {
    setAddons((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      handleInputChange('BOOKING_ADDONS', JSON.stringify(updated));
      return updated;
    });
  };

  const addNewAddon = () => {
    const newId = `addon_${Date.now()}`;
    const newItem: BookingAddon = {
      id: newId,
      title: 'New Custom Add-on',
      description: 'Describe this optional amenity or feature for passengers.',
      priceEur: 20,
      icon: 'sparkles',
      isActive: true,
    };
    setAddons((prev) => {
      const updated = [...prev, newItem];
      handleInputChange('BOOKING_ADDONS', JSON.stringify(updated));
      return updated;
    });
  };

  const resetAddonsToDefaults = () => {
    setAddons(DEFAULT_BOOKING_ADDONS);
    handleInputChange('BOOKING_ADDONS', JSON.stringify(DEFAULT_BOOKING_ADDONS));
  };

  // Homepage Hero Slideshow State
  const parseInitialHeroSlides = (): HeroSlide[] => {
    try {
      if (initialSettings.HOMEPAGE_HERO_SLIDES && initialSettings.HOMEPAGE_HERO_SLIDES.trim().length > 0) {
        const parsed = JSON.parse(initialSettings.HOMEPAGE_HERO_SLIDES);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_HERO_SLIDES;
  };

  const parseInitialHeroInterval = (): number => {
    const val = parseFloat(initialSettings.HOMEPAGE_HERO_INTERVAL || '');
    if (!isNaN(val) && val >= 2 && val <= 30) {
      return val;
    }
    return DEFAULT_HERO_INTERVAL_SECONDS;
  };

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(parseInitialHeroSlides);
  const [heroInterval, setHeroInterval] = useState<number>(parseInitialHeroInterval);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null);
  const [slideUploadError, setSlideUploadError] = useState<string | null>(null);

  const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
    setHeroSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      handleInputChange('HOMEPAGE_HERO_SLIDES', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSlideActive = (index: number) => {
    setHeroSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isActive: updated[index].isActive === false };
      handleInputChange('HOMEPAGE_HERO_SLIDES', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert('You must keep at least 1 hero slide.');
      return;
    }
    setHeroSlides((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      handleInputChange('HOMEPAGE_HERO_SLIDES', JSON.stringify(updated));
      return updated;
    });
  };

  const moveSlide = (index: number, direction: 'UP' | 'DOWN') => {
    setHeroSlides((prev) => {
      const targetIndex = direction === 'UP' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      handleInputChange('HOMEPAGE_HERO_SLIDES', JSON.stringify(copy));
      return copy;
    });
  };

  const addNewSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero_${Date.now()}`,
      src: '/images/france_transfer_hero.jpg',
      alt: 'Luxury Chauffeur Transfer in France',
      title: 'New Destination / Tour',
      badge: 'Fixed Rates • 24/7 Service',
      isActive: true,
    };
    setHeroSlides((prev) => {
      const updated = [...prev, newSlide];
      handleInputChange('HOMEPAGE_HERO_SLIDES', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSlidesToDefaults = () => {
    setHeroSlides(DEFAULT_HERO_SLIDES);
    setHeroInterval(DEFAULT_HERO_INTERVAL_SECONDS);
    handleInputChange('HOMEPAGE_HERO_SLIDES', JSON.stringify(DEFAULT_HERO_SLIDES));
    handleInputChange('HOMEPAGE_HERO_INTERVAL', String(DEFAULT_HERO_INTERVAL_SECONDS));
  };

  const handleSlideImageUpload = async (index: number, file: File) => {
    setUploadingSlideIndex(index);
    setSlideUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'hero');

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        updateSlide(index, { src: data.url });
      } else {
        setSlideUploadError(data.error || 'Failed to upload hero image.');
      }
    } catch (err: any) {
      setSlideUploadError(err.message || 'Image upload error.');
    } finally {
      setUploadingSlideIndex(null);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(null);
    setSaveError(null);

    // Auto-detect TripAdvisor Location ID from URL
    if (key === 'TRIPADVISOR_URL' && value) {
      const match = value.match(/-d(\d+)[-_.]/) || value.match(/[?&]locationId=(\d+)/) || value.match(/-d(\d+)$/);
      if (match && match[1]) {
        const detectedId = match[1];
        setSettings((prev) => ({ ...prev, TRIPADVISOR_LOCATION_ID: detectedId }));
        setExtractedNotice(`Location ID ${detectedId} automatically extracted from your TripAdvisor URL!`);
        setTimeout(() => setExtractedNotice(null), 4000);
      }
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);

    startTransition(async () => {
      const payload = {
        ...settings,
        BOOKING_ADDONS: JSON.stringify(addons),
        HOMEPAGE_HERO_SLIDES: JSON.stringify(heroSlides),
        HOMEPAGE_HERO_INTERVAL: String(heroInterval),
      };
      const res = await adminSaveSettingsAction(payload);
      if (res.success) {
        setSaveSuccess('All API credentials, add-ons & hero slideshow settings successfully updated!');
      } else {
        setSaveError(res.error || 'Failed to save settings.');
      }
    });
  };

  const handleTestGoogle = async () => {
    setTestingGoogle(true);
    setGoogleTestResult(null);
    try {
      const res = await adminTestGoogleApiAction(
        settings.GOOGLE_MAPS_API_KEY,
        settings.GOOGLE_PLACE_ID
      );
      setGoogleTestResult(res);
    } catch (e: any) {
      setGoogleTestResult({
        success: false,
        message: e?.message || 'Error executing Google test',
      });
    } finally {
      setTestingGoogle(false);
    }
  };

  const handleTestTripAdvisor = async () => {
    setTestingTrip(true);
    setTripTestResult(null);
    try {
      const res = await adminTestTripAdvisorAction(
        settings.TRIPADVISOR_API_KEY,
        settings.TRIPADVISOR_LOCATION_ID
      );
      setTripTestResult(res);
    } catch (e: any) {
      setTripTestResult({
        success: false,
        error: e?.message || 'Error executing TripAdvisor test',
      });
    } finally {
      setTestingTrip(false);
    }
  };

  const handleSearchTripAdvisor = async () => {
    if (!tripSearchQuery.trim()) return;
    setSearchingTrip(true);
    setTripSearchError(null);
    setTripSearchResults(null);

    try {
      const res = await adminSearchTripAdvisorAction(tripSearchQuery, settings.TRIPADVISOR_API_KEY);
      if (res.success && res.locations) {
        setTripSearchResults(res.locations);
      } else {
        setTripSearchError(res.error || 'No matching locations found.');
      }
    } catch (err: any) {
      setTripSearchError(err?.message || 'Search failed');
    } finally {
      setSearchingTrip(false);
    }
  };

  const handleSelectTripLocation = (loc: { locationId: string; name: string }) => {
    handleInputChange('TRIPADVISOR_LOCATION_ID', loc.locationId);
    setTripSearchResults(null);
    setExtractedNotice(`Selected: "${loc.name}" (ID: ${loc.locationId})`);
    setTimeout(() => setExtractedNotice(null), 4000);
  };

  const handleTestEmail = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await adminTestEmailAction(settings.ADMIN_DISPATCH_EMAIL);
      setSmtpTestResult(res);
    } catch (e: any) {
      setSmtpTestResult({
        success: false,
        error: e?.message || 'Error executing SMTP test',
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleGeneratePartnerKey = () => {
    const chars = 'abcdef0123456789';
    let rand = 'ffs_live_';
    for (let i = 0; i < 32; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    handleInputChange('PARTNER_API_KEY', rand);
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#C5A059]" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              API Keys & Platform Integrations
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure Google Maps, TripAdvisor reviews, B2B Partner gateway, and email dispatch credentials directly from your back-office.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isPending ? 'Saving to Database...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. GOOGLE MAPS PLATFORM */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Google Maps Platform</h2>
              <p className="text-xs text-slate-500 font-medium">
                Powers real-time France address autocomplete, distance calculation (km), and Google Reviews sync.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestGoogle}
            disabled={testingGoogle}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingGoogle ? 'animate-spin text-blue-600' : ''}`} />
            <span>{testingGoogle ? 'Testing Connection...' : 'Test Google API'}</span>
          </button>
        </div>

        {/* Live Test Diagnostic Output */}
        {googleTestResult && (
          <div
            className={`p-4 rounded-2xl text-xs space-y-2 border ${
              googleTestResult.success
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/70 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm">
              {googleTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>{googleTestResult.message}</span>
            </div>

            {googleTestResult.results && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] font-semibold">
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 font-bold mb-1">Places Autocomplete:</div>
                  <div className={googleTestResult.results.autocomplete.success ? 'text-emerald-700' : 'text-red-700'}>
                    {googleTestResult.results.autocomplete.message}
                  </div>
                  {googleTestResult.results.autocomplete.sample && (
                    <div className="text-slate-600 text-[10px] mt-1 font-mono truncate">
                      Sample: {googleTestResult.results.autocomplete.sample}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 font-bold mb-1">Routes & Mileage API:</div>
                  <div className={googleTestResult.results.routes.success ? 'text-emerald-700' : 'text-red-700'}>
                    {googleTestResult.results.routes.message}
                  </div>
                  {googleTestResult.results.routes.distanceKm && (
                    <div className="text-slate-600 text-[10px] mt-1 font-mono">
                      CDG to Disney: {googleTestResult.results.routes.distanceKm} km (~{googleTestResult.results.routes.durationMinutes} mins)
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 font-bold mb-1">Google Reviews Profile:</div>
                  <div className={googleTestResult.results.placeDetails?.success ? 'text-emerald-700' : 'text-amber-700'}>
                    {googleTestResult.results.placeDetails?.message || 'Place ID not verified'}
                  </div>
                  {googleTestResult.results.placeDetails?.rating && (
                    <div className="text-slate-600 text-[10px] mt-1 font-mono">
                      Rating: {googleTestResult.results.placeDetails.rating} ★ ({googleTestResult.results.placeDetails.reviewCount} reviews)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Key */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>Google Maps API Key (Starts with AIzaSy...)</span>
              <span className="text-[10px] text-emerald-600 font-bold">● Active on Production</span>
            </label>
            <div className="relative">
              <input
                type={showGoogleKey ? 'text' : 'password'}
                value={settings.GOOGLE_MAPS_API_KEY || ''}
                onChange={(e) => handleInputChange('GOOGLE_MAPS_API_KEY', e.target.value)}
                placeholder=""
                className="w-full px-4 py-2.5 pr-20 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowGoogleKey(!showGoogleKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showGoogleKey ? 'Hide key' : 'Show key'}
                >
                  {showGoogleKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.GOOGLE_MAPS_API_KEY || '', 'google')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Copy key"
                >
                  {copiedKey === 'google' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Requires <strong>Routes API</strong> and <strong>Places API (New)</strong> enabled in Google Cloud Console with Application Restriction set to &quot;None&quot;.
            </p>
          </div>

          {/* Place ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>Google Place ID</span>
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Find Place ID</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <input
              type="text"
              value={settings.GOOGLE_PLACE_ID || ''}
              onChange={(e) => handleInputChange('GOOGLE_PLACE_ID', e.target.value)}
              placeholder="ChIJK_W2Fipt5kcRCOpTeqfLY6g"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            <p className="text-[11px] text-slate-400">
              Identifies your Google Business Profile to sync your official star rating and reviews.
            </p>
          </div>

          {/* Reviews Public URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              Google Maps Reviews Share Link
            </label>
            <input
              type="text"
              value={settings.GOOGLE_REVIEWS_URL || ''}
              onChange={(e) => handleInputChange('GOOGLE_REVIEWS_URL', e.target.value)}
              placeholder="https://maps.app.goo.gl/DwYGzJ9yDqszXAPW7"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            <p className="text-[11px] text-slate-400">
              Destination link when passengers click &quot;Read on Google&quot; on the website.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTO-RATE & MINIMUM PRICING ENGINE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Auto-Rate & Minimum Pricing Engine</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Live Automatic Protection
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Guarantees profitable fares by enforcing minimum floor prices for short trips (e.g. Paris intra-muros or short rides) and customizable per-kilometer rates for custom addresses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Presets:</span>
            <button
              type="button"
              onClick={() => applyPricingPreset('standard')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => applyPricingPreset('premium')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-all cursor-pointer"
            >
              VIP Premium
            </button>
            <button
              type="button"
              onClick={() => applyPricingPreset('high_season')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200 transition-all cursor-pointer"
            >
              +15% Surge
            </button>
          </div>
        </div>

        {/* 1. Minimum Floor Fares */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>1. Minimum Floor Fares (€) — Guaranteed Lowest Charge for Any Ride</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Stops trips from being too cheap on short distances
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Sedan Min Fare</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="1"
                  min="20"
                  value={settings.MIN_FARE_SEDAN || '60'}
                  onChange={(e) => handleInputChange('MIN_FARE_SEDAN', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Default: €60 floor</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Economy Van Min</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="1"
                  min="30"
                  value={settings.MIN_FARE_ECONOMY_VAN || '80'}
                  onChange={(e) => handleInputChange('MIN_FARE_ECONOMY_VAN', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Default: €80 floor</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Business Van Min</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="1"
                  min="40"
                  value={settings.MIN_FARE_BUSINESS_VAN || '110'}
                  onChange={(e) => handleInputChange('MIN_FARE_BUSINESS_VAN', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Default: €110 floor</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Minibus Min Fare</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="1"
                  min="60"
                  value={settings.MIN_FARE_MINIBUS || '160'}
                  onChange={(e) => handleInputChange('MIN_FARE_MINIBUS', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Default: €160 floor</span>
            </div>
          </div>
        </div>

        {/* 2. Per-Kilometer Distance Rates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span>2. Distance Pricing Rates (€ / km) — Applied when ride distance exceeds floor</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Sedan Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  value={settings.RATE_PER_KM_SEDAN || '2.2'}
                  onChange={(e) => handleInputChange('RATE_PER_KM_SEDAN', e.target.value)}
                  className="w-full pl-7 pr-10 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">/km</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Default: €2.20 / km</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Economy Van Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  value={settings.RATE_PER_KM_ECONOMY_VAN || '2.9'}
                  onChange={(e) => handleInputChange('RATE_PER_KM_ECONOMY_VAN', e.target.value)}
                  className="w-full pl-7 pr-10 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">/km</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Default: €2.90 / km</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Business Van Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  value={settings.RATE_PER_KM_BUSINESS_VAN || '3.8'}
                  onChange={(e) => handleInputChange('RATE_PER_KM_BUSINESS_VAN', e.target.value)}
                  className="w-full pl-7 pr-10 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">/km</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Default: €3.80 / km</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Minibus Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  value={settings.RATE_PER_KM_MINIBUS || '5.0'}
                  onChange={(e) => handleInputChange('RATE_PER_KM_MINIBUS', e.target.value)}
                  className="w-full pl-7 pr-10 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">/km</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Default: €5.00 / km</span>
            </div>
          </div>
        </div>

        {/* 3. Paris Intra-Muros & Base Dispatch Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>🗼 Paris Intra-Muros Minimum Fare</span>
              </label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="1"
                  min="30"
                  value={settings.PARIS_INTRAMUROS_MIN_FARE || '65'}
                  onChange={(e) => handleInputChange('PARIS_INTRAMUROS_MIN_FARE', e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Applied automatically whenever both pickup and drop-off are inside Paris City Center (all 20 arrondissements). Guarantees you never do a city transfer for cheap.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>🏁 Base Dispatch Fee (Optional)</span>
              </label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={settings.BASE_BOOKING_FEE || '0'}
                  onChange={(e) => handleInputChange('BASE_BOOKING_FEE', e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Fixed initial booking fee added to the per-km calculation (e.g. €0 or €10) before minimum floor evaluation.
            </p>
          </div>
        </div>

        {/* 4. Interactive Live Simulator */}
        {(() => {
          const sim = getSimulatedPricing();
          return (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-4 shadow-lg border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Pricing Simulator
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Test Distance:</span>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={simDistanceKm}
                      onChange={(e) => setSimDistanceKm(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-white text-center"
                    />
                    <span className="text-slate-400 text-[11px]">km</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={simIsParis}
                      onChange={(e) => setSimIsParis(e.target.checked)}
                      className="rounded accent-amber-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-amber-300 font-bold">Inside Paris City?</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">SEDAN</div>
                  <div className="text-2xl font-black text-amber-400">€{sim.sedan}</div>
                  <div className="text-[10px] font-bold text-slate-300">
                    {sim.isParisApplied ? (
                      <span className="text-amber-300">● Paris Floor</span>
                    ) : sim.sedanFloorApplied ? (
                      <span className="text-emerald-400">● Floor (€{settings.MIN_FARE_SEDAN || 60})</span>
                    ) : (
                      <span className="text-blue-400">● Rate ({simDistanceKm}km x €{settings.RATE_PER_KM_SEDAN || '2.2'})</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">ECONOMY VAN</div>
                  <div className="text-2xl font-black text-amber-400">€{sim.ecoVan}</div>
                  <div className="text-[10px] font-bold text-slate-300">
                    {sim.isParisApplied ? (
                      <span className="text-amber-300">● Paris Floor</span>
                    ) : sim.ecoFloorApplied ? (
                      <span className="text-emerald-400">● Floor (€{settings.MIN_FARE_ECONOMY_VAN || 80})</span>
                    ) : (
                      <span className="text-blue-400">● Rate ({simDistanceKm}km x €{settings.RATE_PER_KM_ECONOMY_VAN || '2.9'})</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">BUSINESS VAN</div>
                  <div className="text-2xl font-black text-amber-400">€{sim.bizVan}</div>
                  <div className="text-[10px] font-bold text-slate-400">Executive Class</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">MINIBUS</div>
                  <div className="text-2xl font-black text-amber-400">€{sim.minibus}</div>
                  <div className="text-[10px] font-bold text-slate-400">Up to 16 Pax</div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* 2. TRIPADVISOR CONTENT API */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">TripAdvisor Content API</h2>
              <p className="text-xs text-slate-500 font-medium">
                Syncs live TripAdvisor location rating score, total review count, and official rating badge.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTripGuide(!showTripGuide)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>{showTripGuide ? 'Hide Setup Guide' : 'Setup Guide'}</span>
              {showTripGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={handleTestTripAdvisor}
              disabled={testingTrip || !settings.TRIPADVISOR_API_KEY}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingTrip ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{testingTrip ? 'Testing...' : 'Test TripAdvisor API'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Quick Setup Guide */}
        {showTripGuide && (
          <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#C5A059]/30 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B192C] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C5A059]" />
                How to get your TripAdvisor API Key & Location ID
              </span>
              <a
                href="https://developer-tripadvisor.com/content-api/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>TripAdvisor Developer Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 leading-relaxed font-medium">
              <li>
                Visit <strong>developer-tripadvisor.com/content-api</strong> and register for a free account.
              </li>
              <li>
                Create an Application with use case <em>&quot;Website review badge & guest testimonials&quot;</em> to receive your <strong>API Key</strong> (5,000 monthly calls free).
              </li>
              <li>
                Find your <strong>Location ID</strong> by looking at your TripAdvisor URL: <br />
                <code className="text-[10px] text-emerald-900 bg-emerald-100/70 px-1 py-0.5 rounded">
                  tripadvisor.com/Attraction_Review-g187147-<strong>d12345678</strong>-Reviews-...
                </code>
                <br />
                The digits after <strong>-d</strong> (e.g. <code>12345678</code>) is your Location ID!
              </li>
              <li>
                <em>Tip:</em> Simply paste your full TripAdvisor URL into the <strong>TripAdvisor URL</strong> field below — our system will automatically extract and fill the Location ID for you!
              </li>
            </ol>
          </div>
        )}

        {/* Extracted Notice */}
        {extractedNotice && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{extractedNotice}</span>
          </div>
        )}

        {/* Live Test Diagnostic Output */}
        {tripTestResult && (
          <div
            className={`p-4 rounded-2xl text-xs space-y-1 border ${
              tripTestResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {tripTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{tripTestResult.message || tripTestResult.error}</span>
            </div>
            {tripTestResult.rankingString && (
              <div className="text-[11px] text-slate-600 font-semibold pl-6">
                Official Ranking: {tripTestResult.rankingString}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">TripAdvisor API Key</label>
            <div className="relative">
              <input
                type={showTripKey ? 'text' : 'password'}
                value={settings.TRIPADVISOR_API_KEY || ''}
                onChange={(e) => handleInputChange('TRIPADVISOR_API_KEY', e.target.value)}
                placeholder="your_tripadvisor_api_key_here"
                className="w-full px-4 py-2.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <button
                type="button"
                onClick={() => setShowTripKey(!showTripKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showTripKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Available from TripAdvisor Developer Portal.</p>
          </div>

          {/* Location ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>Location ID</span>
              <span className="text-[10px] text-slate-400">e.g. 12345678</span>
            </label>
            <input
              type="text"
              value={settings.TRIPADVISOR_LOCATION_ID || ''}
              onChange={(e) => handleInputChange('TRIPADVISOR_LOCATION_ID', e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            <p className="text-[11px] text-slate-400">Digits after &quot;-d&quot; in your TripAdvisor URL.</p>
          </div>

          {/* Public TripAdvisor URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">TripAdvisor Profile URL</label>
            <input
              type="text"
              value={settings.TRIPADVISOR_URL || ''}
              onChange={(e) => handleInputChange('TRIPADVISOR_URL', e.target.value)}
              placeholder="https://www.tripadvisor.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            <p className="text-[11px] text-slate-400">Pasting your URL auto-detects the Location ID above.</p>
          </div>
        </div>

        {/* In-App TripAdvisor Search Tool */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search TripAdvisor For Your Business (Auto-Find Location ID)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tripSearchQuery}
              onChange={(e) => setTripSearchQuery(e.target.value)}
              placeholder="Type business name e.g. FranceGo Transfers or Paris Airport Shuttle"
              className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            <button
              type="button"
              onClick={handleSearchTripAdvisor}
              disabled={searchingTrip || !tripSearchQuery.trim() || !settings.TRIPADVISOR_API_KEY}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Search className={`w-3.5 h-3.5 ${searchingTrip ? 'animate-spin' : ''}`} />
              <span>{searchingTrip ? 'Searching...' : 'Find ID'}</span>
            </button>
          </div>

          {tripSearchError && (
            <div className="text-[11px] text-red-600 font-semibold">{tripSearchError}</div>
          )}

          {tripSearchResults && tripSearchResults.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-500">Matching Listings Found:</div>
              <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto">
                {tripSearchResults.map((loc) => (
                  <div key={loc.locationId} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{loc.name}</div>
                      <div className="text-[10px] text-slate-500">{loc.address || 'Location ID: ' + loc.locationId}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTripLocation(loc)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-all shrink-0"
                    >
                      Select ID: {loc.locationId}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. B2B PARTNER API GATEWAY */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">B2B Partner API Gateway</h2>
              <p className="text-xs text-slate-500 font-medium">
                Secret authentication token for 2nd-party travel agencies, hotels, and booking affiliates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGeneratePartnerKey}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate Random Secure Key</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>Partner Secret API Key (`X-API-Key` Header)</span>
              <span className="text-[10px] text-slate-400">Timing-Safe Constant Comparison</span>
            </label>
            <div className="relative">
              <input
                type={showPartnerKey ? 'text' : 'password'}
                value={settings.PARTNER_API_KEY || ''}
                onChange={(e) => handleInputChange('PARTNER_API_KEY', e.target.value)}
                placeholder="your_b2b_secret_partner_key_2026"
                className="w-full px-4 py-2.5 pr-20 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPartnerKey(!showPartnerKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPartnerKey ? 'Hide key' : 'Show key'}
                >
                  {showPartnerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.PARTNER_API_KEY || '', 'partner')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Copy key"
                >
                  {copiedKey === 'partner' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Partners transmit reservations using header: <code>X-API-Key: {settings.PARTNER_API_KEY || 'your_key'}</code> to <code>POST /api/v1/partner/bookings</code>.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOOKING ADD-ONS & EXTRA FEATURES (TV, PET, CUSTOM OPTIONS) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C5A059]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Booking Add-ons &amp; Optional Features
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configure extras available during booking (TV on board, Pet Friendly, Champagne, Extra Waiting Time). Set prices and toggle availability.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={resetAddonsToDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all add-ons back to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={addNewAddon}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Add-on</span>
            </button>
          </div>
        </div>

        {/* Add-ons List */}
        <div className="space-y-4">
          {addons.map((addon, index) => (
            <div
              key={addon.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                addon.isActive
                  ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  : 'border-slate-200/60 bg-slate-100/50 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Active Toggle & Icon & Basic info */}
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAddonActive(index)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                      addon.isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {addon.isActive ? 'Active' : 'Disabled'}
                  </button>

                  {/* Icon Selector */}
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      {addon.icon === 'tv' && <Tv className="w-4 h-4" />}
                      {addon.icon === 'paw' && <PawPrint className="w-4 h-4" />}
                      {addon.icon === 'wine' && <Wine className="w-4 h-4" />}
                      {addon.icon === 'clock' && <Clock className="w-4 h-4" />}
                      {addon.icon === 'wifi' && <Wifi className="w-4 h-4" />}
                      {(!addon.icon || addon.icon === 'sparkles') && <Sparkles className="w-4 h-4 text-[#C5A059]" />}
                    </div>

                    <select
                      value={addon.icon || 'sparkles'}
                      onChange={(e) => updateAddon(index, { icon: e.target.value as any })}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C5A059] cursor-pointer"
                    >
                      <option value="tv">TV / Entertainment</option>
                      <option value="paw">Pet / Paw</option>
                      <option value="wine">Champagne / Drinks</option>
                      <option value="clock">Waiting Time / Clock</option>
                      <option value="wifi">High-speed Wi-Fi</option>
                      <option value="sparkles">VIP / Sparkles</option>
                    </select>
                  </div>
                </div>

                {/* Price in € */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#C5A059]">
                    <span className="text-xs font-black text-slate-500 mr-1.5">€</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={addon.priceEur}
                      onChange={(e) => updateAddon(index, { priceEur: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-20 text-xs font-black text-slate-900 bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-slate-400">EUR</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteAddon(index)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors cursor-pointer"
                    title="Remove this add-on"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Description inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-slate-200/60">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Add-on Title
                  </label>
                  <input
                    type="text"
                    value={addon.title}
                    onChange={(e) => updateAddon(index, { title: e.target.value })}
                    placeholder="e.g. TV on Board"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Description for Passenger
                  </label>
                  <input
                    type="text"
                    value={addon.description}
                    onChange={(e) => updateAddon(index, { description: e.target.value })}
                    placeholder="e.g. In-vehicle high-definition entertainment"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Selected add-ons are included in the customer&apos;s total price, confirmed in their booking email, and forwarded to chauffeur WhatsApp dispatches. Remember to click <strong>&quot;Save All Settings&quot;</strong> below to apply changes.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. HOMEPAGE HERO SLIDESHOW MANAGER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Homepage Hero Slideshow Manager
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Upload new photos, edit destination titles, sub-badges, and configure slide transition intervals without touching code.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            {/* Rotation Interval Setting */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Interval:</span>
              <input
                type="number"
                step="0.5"
                min="2"
                max="30"
                value={heroInterval}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 5.5;
                  setHeroInterval(val);
                  handleInputChange('HOMEPAGE_HERO_INTERVAL', String(val));
                }}
                className="w-12 text-center bg-white border border-slate-200 rounded px-1 py-0.5 text-xs font-black text-slate-900"
              />
              <span className="text-[10px] text-slate-400">sec</span>
            </div>

            <button
              type="button"
              onClick={resetSlidesToDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all slides back to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={addNewSlide}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-105 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Slide</span>
            </button>
          </div>
        </div>

        {slideUploadError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{slideUploadError}</span>
          </div>
        )}

        {/* Slides List */}
        <div className="space-y-5">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id || `slide_${index}`}
              className={`p-5 rounded-2xl border transition-all ${
                slide.isActive !== false
                  ? 'border-slate-200 bg-slate-50/40 hover:bg-slate-50/80'
                  : 'border-slate-200/60 bg-slate-100/50 opacity-60'
              }`}
            >
              {/* Card Header Controls */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0B192C] text-[#D4AF37] font-black text-xs font-mono">
                    Slide #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSlideActive(index)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      slide.isActive !== false
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {slide.isActive !== false ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSlide(index, 'UP')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move slide earlier in rotation"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(index, 'DOWN')}
                    disabled={index === heroSlides.length - 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move slide later in rotation"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSlide(index)}
                    disabled={heroSlides.length <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition-colors ml-1"
                    title="Delete this slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Body: Thumbnail & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Thumbnail Preview & Upload Action */}
                <div className="md:col-span-4 space-y-2.5">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
                    <img
                      src={slide.src}
                      alt={slide.title || 'Slide Preview'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/france_transfer_hero.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                      <span className="text-[11px] font-bold text-white drop-shadow">
                        {slide.title}
                      </span>
                    </div>
                  </div>

                  <label className="w-full px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs">
                    {uploadingSlideIndex === index ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span>Uploading Photo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload New Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSlideImageUpload(index, file);
                      }}
                      disabled={uploadingSlideIndex === index}
                    />
                  </label>
                </div>

                {/* Text Fields */}
                <div className="md:col-span-8 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Image Path or URL
                    </label>
                    <input
                      type="text"
                      value={slide.src}
                      onChange={(e) => updateSlide(index, { src: e.target.value })}
                      placeholder="/images/france_transfer_hero.jpg or /uploads/hero/..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">
                        Slide Title (Floating Pill Badge)
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateSlide(index, { title: e.target.value })}
                        placeholder="e.g. Disneyland Paris Direct Transfers"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">
                        Sub-Badge Text
                      </label>
                      <input
                        type="text"
                        value={slide.badge}
                        onChange={(e) => updateSlide(index, { badge: e.target.value })}
                        placeholder="e.g. All Disney Hotels & Parks"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Image Alt Text (SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      value={slide.alt}
                      onChange={(e) => updateSlide(index, { alt: e.target.value })}
                      placeholder="e.g. Private chauffeur transfer to Disneyland Paris"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Slide #1 is automatically optimized for instant Core Web Vitals (LCP) performance. The rest load smoothly in the background. Remember to click <strong>&quot;Save All Settings&quot;</strong> below to publish changes to the homepage.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. TRANSACTIONAL EMAIL (SMTP) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Transactional Email (SMTP)</h2>
              <p className="text-xs text-slate-500 font-medium">
                Dispatches passenger HTML booking vouchers and alerts the 24/7 chauffeur dispatch team.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestEmail}
            disabled={testingSmtp || !settings.SMTP_USER || !settings.SMTP_PASS}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${testingSmtp ? 'animate-spin text-purple-600' : ''}`} />
            <span>{testingSmtp ? 'Sending...' : 'Send Test Email'}</span>
          </button>
        </div>

        {smtpTestResult && (
          <div
            className={`p-4 rounded-2xl text-xs space-y-1 border ${
              smtpTestResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {smtpTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{smtpTestResult.message || smtpTestResult.error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">SMTP Host</label>
            <input
              type="text"
              value={settings.SMTP_HOST || ''}
              onChange={(e) => handleInputChange('SMTP_HOST', e.target.value)}
              placeholder="smtp-mail.outlook.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">SMTP Port</label>
            <input
              type="text"
              value={settings.SMTP_PORT || ''}
              onChange={(e) => handleInputChange('SMTP_PORT', e.target.value)}
              placeholder="587"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">Secure (SSL/TLS)</label>
            <select
              value={settings.SMTP_SECURE || 'false'}
              onChange={(e) => handleInputChange('SMTP_SECURE', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            >
              <option value="false">STARTTLS (Port 587 - Standard)</option>
              <option value="true">Direct SSL (Port 465)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">SMTP Username (Email Address)</label>
            <input
              type="text"
              value={settings.SMTP_USER || ''}
              onChange={(e) => handleInputChange('SMTP_USER', e.target.value)}
              placeholder="projet15df@outlook.fr"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">SMTP Password / App Password</label>
            <div className="relative">
              <input
                type={showSmtpPass ? 'text' : 'password'}
                value={settings.SMTP_PASS || ''}
                onChange={(e) => handleInputChange('SMTP_PASS', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPass(!showSmtpPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showSmtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">Admin Dispatch Notification Email</label>
            <input
              type="text"
              value={settings.ADMIN_DISPATCH_EMAIL || ''}
              onChange={(e) => handleInputChange('ADMIN_DISPATCH_EMAIL', e.target.value)}
              placeholder="projet15df@outlook.fr"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isPending ? 'Saving Configurations...' : 'Save All Settings'}</span>
        </button>
      </div>
    </form>
  );
}
