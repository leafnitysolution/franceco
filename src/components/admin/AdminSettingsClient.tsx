'use client';

import { useState } from 'react';
import { AppSettings } from '@/lib/settings';
import { saveSettingsAction } from '@/lib/actions/settings';
import {
  Key,
  MapPin,
  Star,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Save,
  Globe,
  Sparkles,
} from 'lucide-react';

interface AdminSettingsClientProps {
  initialSettings: AppSettings;
}

export function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyPartnerKey = () => {
    navigator.clipboard.writeText(settings.partnerApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await saveSettingsAction(settings);
      if (res.success && res.settings) {
        setSettings(res.settings);
        setMessage({
          type: 'success',
          text: 'Platform configuration and API keys saved successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: res.error || 'Failed to save configuration. Please try again.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Key className="w-3.5 h-3.5" />
            <span>INTEGRATIONS & CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 tracking-tight">
            API Keys & External Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your Google Maps, TripAdvisor, B2B Partner API keys, and chauffeur dispatch channels.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4 text-gold-400" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* FEEDBACK ALERT */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-bold animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: GOOGLE MAPS & PLACES API */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Google Maps & Places API
                </h2>
                <p className="text-xs text-slate-500">
                  Used for syncing Google Reviews score, ratings badge, and address autocomplete.
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                settings.googleMapsApiKey
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {settings.googleMapsApiKey ? 'CONFIGURED' : 'OPTIONAL'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Google Maps / Places API Key</span>
                <a
                  href="https://console.cloud.google.com/google/maps-apis"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                value={settings.googleMapsApiKey}
                onChange={(e) => setSettings({ ...settings, googleMapsApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
              <p className="text-[11px] text-slate-400">
                Requires the <strong>Places API</strong> and <strong>Maps JavaScript API</strong> enabled in your Google Cloud account.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Google Place ID</span>
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Find Place ID</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                value={settings.googlePlaceId}
                onChange={(e) => setSettings({ ...settings, googlePlaceId: e.target.value })}
                placeholder="ChIJ..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Google Business Profile / Reviews Link
              </label>
              <input
                type="url"
                value={settings.googleReviewsUrl}
                onChange={(e) => setSettings({ ...settings, googleReviewsUrl: e.target.value })}
                placeholder="https://maps.google.com/?cid=..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: TRIPADVISOR CONTENT API */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  TripAdvisor Content API
                </h2>
                <p className="text-xs text-slate-500">
                  Pulls real-time Travelers' Choice award badges, rating scores, and review count.
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                settings.tripAdvisorApiKey
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {settings.tripAdvisorApiKey ? 'CONFIGURED' : 'OPTIONAL'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>TripAdvisor Developer API Key</span>
                <a
                  href="https://tripadvisor-content-api.readme.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>TripAdvisor Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                value={settings.tripAdvisorApiKey}
                onChange={(e) => setSettings({ ...settings, tripAdvisorApiKey: e.target.value })}
                placeholder="YOUR_TRIPADVISOR_API_KEY"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                TripAdvisor Location ID
              </label>
              <input
                type="text"
                value={settings.tripAdvisorLocationId}
                onChange={(e) => setSettings({ ...settings, tripAdvisorLocationId: e.target.value })}
                placeholder="12345678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                TripAdvisor Official Listing URL
              </label>
              <input
                type="url"
                value={settings.tripAdvisorUrl}
                onChange={(e) => setSettings({ ...settings, tripAdvisorUrl: e.target.value })}
                placeholder="https://www.tripadvisor.com/Attraction_Review-..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: B2B PARTNER API KEY */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  B2B Partner API Channel Key
                </h2>
                <p className="text-xs text-slate-500">
                  Secret authentication key used by affiliate booking portals to submit reservations via <code>/api/v1/partner/bookings</code>.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              ACTIVE
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Partner Secret Key (X-API-Key)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.partnerApiKey}
                onChange={(e) => setSettings({ ...settings, partnerApiKey: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={handleCopyPartnerKey}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: CHAUFFEUR DISPATCH HOTLINE & CONTACT */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-700">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Dispatch Hotline & Contact Info
                </h2>
                <p className="text-xs text-slate-500">
                  Official numbers displayed in website headers, footers, email receipts, and floating WhatsApp buttons.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                24/7 Hotline & WhatsApp Number
              </label>
              <input
                type="text"
                value={settings.dispatchHotline}
                onChange={(e) => setSettings({ ...settings, dispatchHotline: e.target.value })}
                placeholder="+33 7 81 11 83 94"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Admin Dispatch Email
              </label>
              <input
                type="email"
                value={settings.dispatchEmail}
                onChange={(e) => setSettings({ ...settings, dispatchEmail: e.target.value })}
                placeholder="projet15df@outlook.fr"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-gold-950/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving Configuration...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
