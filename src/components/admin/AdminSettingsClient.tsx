'use client';

import { useState, useTransition } from 'react';
import {
  adminSaveSettingsAction,
  adminTestGoogleApiAction,
  adminTestTripAdvisorAction,
  adminTestEmailAction,
} from '@/lib/actions/settings';
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

  // TripAdvisor Test State
  const [testingTrip, setTestingTrip] = useState(false);
  const [tripTestResult, setTripTestResult] = useState<any | null>(null);

  // SMTP Test State
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<any | null>(null);

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(null);
    setSaveError(null);
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
      const res = await adminSaveSettingsAction(settings);
      if (res.success) {
        setSaveSuccess('All API credentials & platform configurations successfully updated in database!');
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
                placeholder="AIzaSyAbKOFmzULGRBcEaqygSCIMjncsjrjL564"
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
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">Location ID</label>
            <input
              type="text"
              value={settings.TRIPADVISOR_LOCATION_ID || ''}
              onChange={(e) => handleInputChange('TRIPADVISOR_LOCATION_ID', e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">TripAdvisor URL</label>
            <input
              type="text"
              value={settings.TRIPADVISOR_URL || ''}
              onChange={(e) => handleInputChange('TRIPADVISOR_URL', e.target.value)}
              placeholder="https://www.tripadvisor.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>
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
      {/* 4. TRANSACTIONAL EMAIL (SMTP) */}
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
