'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocationItem, RouteWithLocations } from '@/types';
import { createRouteAction, updateRouteAction, createLocationAction } from '@/lib/actions/routes';
import {
  Save,
  Globe,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  Loader2,
  Search,
  Building2,
  CheckCircle2,
  X,
} from 'lucide-react';

interface RouteFormProps {
  initialData?: RouteWithLocations | null;
  locations: LocationItem[];
}

export function RouteForm({ initialData, locations }: RouteFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Location Hubs State
  const [locList, setLocList] = useState<LocationItem[]>(locations);
  const [showAddHubModal, setShowAddHubModal] = useState(false);
  const [targetSelect, setTargetSelect] = useState<'origin' | 'destination'>('origin');
  const [newHubName, setNewHubName] = useState('');
  const [newHubCode, setNewHubCode] = useState('');
  const [newHubType, setNewHubType] = useState('CUSTOM');
  const [isAddingHub, setIsAddingHub] = useState(false);
  const [addHubError, setAddHubError] = useState('');

  // Form State
  const [originId, setOriginId] = useState(initialData?.originId || locations[0]?.id || '');
  const [destinationId, setDestinationId] = useState(initialData?.destinationId || locations[1]?.id || '');
  const [slug, setSlug] = useState(initialData?.slug || 'cdg-to-disneyland-paris');
  const [distanceKm, setDistanceKm] = useState(initialData?.distanceKm || 45);
  const [estDurationMinutes, setEstDurationMinutes] = useState(initialData?.estDurationMinutes || 45);
  const [sedanPriceEur, setSedanPriceEur] = useState(initialData?.sedanPriceEur || 70);
  const [economyVanPriceEur, setEconomyVanPriceEur] = useState(initialData?.economyVanPriceEur || 90);
  const [businessVanPriceEur, setBusinessVanPriceEur] = useState(initialData?.businessVanPriceEur || 120);
  const [minibusPriceEur, setMinibusPriceEur] = useState(initialData?.minibusPriceEur || 180);
  const [h1Heading, setH1Heading] = useState(initialData?.h1Heading || 'Private Transfer from CDG to Disneyland Paris');
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || 'CDG Airport to Disneyland Paris Shuttle | Fixed Fares from 70€');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || 'Book door-to-door private transfers from Paris CDG Airport to Disneyland Paris. Free child seats, flight tracking, and pay-on-arrival.');
  const [overviewText, setOverviewText] = useState(initialData?.overviewText || 'Enjoy a stress-free private transfer directly from Charles de Gaulle Airport (CDG) to your Disneyland Paris hotel.');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

  // Dynamic FAQs State
  let parsedFaqs = [];
  try {
    parsedFaqs = initialData?.faqs ? (typeof initialData.faqs === 'string' ? JSON.parse(initialData.faqs) : initialData.faqs) : [];
  } catch (e) {
    parsedFaqs = [];
  }

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    parsedFaqs.length > 0
      ? parsedFaqs
      : [{ question: 'Where do I meet my driver?', answer: 'Your driver greets you inside the arrivals hall with a name sign.' }]
  );

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const next = [...faqs];
    next[index][field] = value;
    setFaqs(next);
  };

  const handleCreateHub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newHubName.trim() || !newHubCode.trim()) {
      setAddHubError('Please enter location name and short code (e.g. Parc Astérix, AST).');
      return;
    }
    setIsAddingHub(true);
    setAddHubError('');
    try {
      const res = await createLocationAction(newHubName.trim(), newHubCode.trim(), newHubType);
      if (res.success && res.location) {
        const createdLoc = res.location as LocationItem;
        const updated = [...locList, createdLoc].sort((a, b) => a.name.localeCompare(b.name));
        setLocList(updated);
        if (targetSelect === 'origin') {
          setOriginId(createdLoc.id);
        } else {
          setDestinationId(createdLoc.id);
        }
        setNewHubName('');
        setNewHubCode('');
        setShowAddHubModal(false);
      } else {
        setAddHubError(res.error || 'Failed to create location.');
      }
    } catch (err: any) {
      setAddHubError(err.message || 'Error creating location.');
    } finally {
      setIsAddingHub(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      originId,
      destinationId,
      slug,
      distanceKm: Number(distanceKm),
      estDurationMinutes: Number(estDurationMinutes),
      sedanPriceEur: Number(sedanPriceEur),
      economyVanPriceEur: Number(economyVanPriceEur),
      businessVanPriceEur: Number(businessVanPriceEur),
      minibusPriceEur: Number(minibusPriceEur),
      h1Heading,
      metaTitle,
      metaDescription,
      overviewText,
      faqs,
      isActive,
      isFeatured,
    };

    try {
      if (isEditing) {
        const res = await updateRouteAction(initialData.id, payload);
        if (res.success) {
          router.push('/ffs-portal-sec-99x/routes');
        } else {
          setErrorMsg(res.error || 'Failed to update route.');
        }
      } else {
        const res = await createRouteAction(payload);
        if (res.success) {
          router.push('/ffs-portal-sec-99x/routes');
        } else {
          setErrorMsg(res.error || 'Failed to create route.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Routes</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isEditing ? `Edit Route Fares & SEO (${initialData.slug})` : 'Create New Route Page'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B08B43] hover:brightness-105 text-white font-black text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>SAVE ROUTE CONFIGURATION</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FARES & SPECIFICATIONS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Origin & Destination */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Route Origin & Destination Hubs</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddHubModal(!showAddHubModal);
                  setAddHubError('');
                }}
                className="text-xs font-bold text-gold-800 bg-[#F7F2E7] hover:bg-[#EFE5D3] border border-[#E5D7BC] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 w-fit"
              >
                <Plus className="w-3.5 h-3.5 text-gold-600" />
                <span>+ Add New Location Hub</span>
              </button>
            </div>

            {/* Inline Form to Add New Location Hub */}
            {showAddHubModal && (
              <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Building2 className="w-4 h-4 text-gold-600" />
                    <span>Create New Location Hub</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddHubModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {addHubError && (
                  <div className="p-2.5 bg-red-100 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                    {addHubError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 block">Hub Location Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Parc Astérix Theme Park"
                      value={newHubName}
                      onChange={(e) => setNewHubName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Short Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. AST"
                      value={newHubCode}
                      onChange={(e) => setNewHubCode(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-gold-500 uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCreateHub()}
                    disabled={isAddingHub}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isAddingHub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Save & Select as {targetSelect === 'origin' ? 'Origin' : 'Destination'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Origin Hub</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSelect('origin');
                      setShowAddHubModal(true);
                    }}
                    className="text-[10px] font-bold text-gold-700 hover:underline"
                  >
                    + Add New
                  </button>
                </div>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                >
                  {locList.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Destination Hub</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSelect('destination');
                      setShowAddHubModal(true);
                    }}
                    className="text-[10px] font-bold text-gold-700 hover:underline"
                  >
                    + Add New
                  </button>
                </div>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                >
                  {locList.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.shortCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">URL Slug (/transfers/[slug])</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cdg-to-disneyland-paris"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Card 2: Metrics & 4-Tier Pricing */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Distance, Duration & Vehicle Tier Fares (€)</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Est. Duration (Mins)</label>
                <input
                  type="number"
                  required
                  value={estDurationMinutes}
                  onChange={(e) => setEstDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Berline Sedan (€)</label>
                <input
                  type="number"
                  required
                  value={sedanPriceEur}
                  onChange={(e) => setSedanPriceEur(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Economy Van (€)</label>
                <input
                  type="number"
                  required
                  value={economyVanPriceEur}
                  onChange={(e) => setEconomyVanPriceEur(Number(e.target.value))}
                  className="w-full bg-[#F7F2E7] border border-[#E5D7BC] rounded-xl px-3 py-2 text-xs text-gold-700 font-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">VIP Van (€)</label>
                <input
                  type="number"
                  required
                  value={businessVanPriceEur}
                  onChange={(e) => setBusinessVanPriceEur(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Minibus 16 (€)</label>
                <input
                  type="number"
                  required
                  value={minibusPriceEur}
                  onChange={(e) => setMinibusPriceEur(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-black"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Dynamic Route FAQs */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Dynamic Route FAQs</span>
              </h3>
              <button
                type="button"
                onClick={addFaq}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1 border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Question #{idx + 1}</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                      placeholder="e.g. Where will I meet my driver?"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Answer</label>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                      placeholder="e.g. Driver will wait inside the terminal arrivals gate."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SEO CONTENT & LIVE GOOGLE SERP PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 4: Live Google SERP Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Live Google Search SERP Preview</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                <span>https://fastforwardshuttle.com › transfers › {slug}</span>
              </div>
              <div className="text-base font-bold text-blue-700 hover:underline cursor-pointer line-clamp-1">
                {metaTitle || 'Meta Title Placeholder'}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                {metaDescription || 'Meta Description snippet preview will be rendered here.'}
              </div>
            </div>
          </div>

          {/* Card 5: SEO Content Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-4 h-4 text-brand-600" />
              <span>SEO Meta Tags & Page Content</span>
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">H1 Page Heading</label>
              <input
                type="text"
                required
                value={h1Heading}
                onChange={(e) => setH1Heading(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Meta Title</label>
              <input
                type="text"
                required
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Meta Description</label>
              <textarea
                rows={3}
                required
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Route Overview Text</label>
              <textarea
                rows={4}
                required
                value={overviewText}
                onChange={(e) => setOverviewText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium"
              ></textarea>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-slate-100 text-xs font-bold text-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Active Route</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Featured Homepage Route</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
