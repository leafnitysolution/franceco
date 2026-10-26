'use client';

import { useState, useRef, useEffect } from 'react';
import { LocationItem, CategoryItem } from '@/types';
import {
  Search,
  Plane,
  MapPin,
  X,
  Check,
  Building,
  Train,
  Landmark,
  Loader2,
  Compass,
} from 'lucide-react';

interface GooglePlacePrediction {
  placeId: string;
  title: string;
  subtitle: string;
  fullText: string;
}

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  placeholder?: string;
  locations: LocationItem[];
  categories?: CategoryItem[];
  selectedLocationId?: string;
  onSelectLocation: (location: LocationItem) => void;
}

// Fallback Category Header Display Names
const FALLBACK_CATEGORY_NAMES: Record<string, string> = {
  AIRPORT: 'Paris Airports',
  AMUSEMENT_PARK: 'Euro Disney Paris',
  CITY_CENTER: 'Paris City Center',
  TRAIN_STATION: 'Paris Train Stations',
  PALACE: 'Other Attractions',
};

export function LocationDropdown({
  isOpen,
  onClose,
  title = 'Please select pickup location',
  placeholder = 'Type airport, hotel, or address...',
  locations,
  categories,
  selectedLocationId,
  onSelectLocation,
}: LocationDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [googlePredictions, setGooglePredictions] = useState<GooglePlacePrediction[]>([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const sessionTokenRef = useRef<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize or reset session token when dropdown opens
  useEffect(() => {
    if (isOpen) {
      sessionTokenRef.current =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `session-${Date.now()}`;
      setSearchQuery('');
      setGooglePredictions([]);
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Debounced Google Places Autocomplete search (350ms delay, min 3 chars)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!isOpen || q.length < 3) {
      setGooglePredictions([]);
      setIsLoadingGoogle(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingGoogle(true);
      try {
        const res = await fetch(
          `/api/maps/autocomplete?input=${encodeURIComponent(q)}&sessionToken=${encodeURIComponent(
            sessionTokenRef.current
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setGooglePredictions(data.predictions || []);
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed:', err);
      } finally {
        setIsLoadingGoogle(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  // Filter local predefined locations by search query
  const filteredLocations = locations.filter((loc) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.shortCode.toLowerCase().includes(q)
    );
  });

  // Group locations by category
  const groupedLocations = filteredLocations.reduce<Record<string, LocationItem[]>>((acc, loc) => {
    const cat = loc.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(loc);
    return acc;
  }, {});

  const categoryOrder = ['AIRPORT', 'AMUSEMENT_PARK', 'CITY_CENTER', 'TRAIN_STATION', 'PALACE'];
  const presentCategories = Object.keys(groupedLocations);

  const sortedCategories = presentCategories.sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'AIRPORT':
        return Plane;
      case 'TRAIN_STATION':
        return Train;
      case 'CITY_CENTER':
        return Building;
      case 'PALACE':
        return Landmark;
      default:
        return MapPin;
    }
  };

  const handleSelectGooglePrediction = (pred: GooglePlacePrediction) => {
    const fullLocName = pred.fullText || (pred.subtitle ? `${pred.title}, ${pred.subtitle}` : pred.title);
    onSelectLocation({
      id: pred.placeId || `custom-place-${Date.now()}`,
      name: fullLocName,
      shortCode: 'MAPS',
      category: 'CUSTOM_ADDRESS',
    });
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[380px] animate-in fade-in duration-150"
    >
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-gold-400" />
          <span>{title}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Light Search Bar Box */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-8 pr-8 py-1.5 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 placeholder-slate-400 font-medium"
            autoFocus
          />
          {isLoadingGoogle && (
            <Loader2 className="w-3.5 h-3.5 text-gold-600 animate-spin absolute right-3 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Scrollable Results */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
        {/* 1. Live Google Places Suggestions (Addresses, Hotels, Streets) */}
        {googlePredictions.length > 0 && (
          <div className="bg-gold-50/20">
            <div className="px-4 py-2 bg-gold-100/60 text-gold-950 text-xs font-black tracking-tight border-b border-gold-200/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold-700" />
                <span>Live Address & Hotel Search (France)</span>
              </span>
              <span className="text-[10px] text-gold-800 font-semibold">Google Maps</span>
            </div>
            {googlePredictions.map((pred) => (
              <button
                key={pred.placeId || pred.title}
                type="button"
                onClick={() => handleSelectGooglePrediction(pred)}
                className="w-full px-4 py-2.5 text-left flex items-start gap-2.5 transition-colors bg-white hover:bg-gold-50/50 border-b border-slate-100/60 last:border-0"
              >
                <MapPin className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {pred.title}
                  </div>
                  {pred.subtitle && (
                    <div className="text-[11px] text-slate-500 truncate">
                      {pred.subtitle}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 2. Categorized Predefined Hubs (Airports, Disney, Stations, etc.) */}
        {sortedCategories.length === 0 && googlePredictions.length === 0 && !isLoadingGoogle ? (
          <div className="p-6 text-center text-slate-400 text-xs font-medium space-y-1">
            <p>No matching locations found.</p>
            <p className="text-[11px] text-slate-400">
              Type at least 3 letters to search any address or hotel across France.
            </p>
          </div>
        ) : (
          sortedCategories.map((catKey) => {
            const matchedCat = categories?.find((c) => c.key === catKey);
            const categoryTitle = matchedCat
              ? matchedCat.name
              : FALLBACK_CATEGORY_NAMES[catKey] || catKey.replace(/_/g, ' ');
            const items = groupedLocations[catKey];

            return (
              <div key={catKey}>
                <div className="px-4 py-2 bg-[#f3f4f6] text-slate-800 text-xs font-bold tracking-tight border-b border-slate-100">
                  {categoryTitle}
                </div>

                <div>
                  {items.map((loc) => {
                    const isSelected = selectedLocationId === loc.id;
                    const ItemIcon = getItemIcon(loc.category);

                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors border-b border-slate-100/80 last:border-0 ${
                          isSelected
                            ? 'bg-slate-50 text-slate-900 font-semibold'
                            : 'bg-white hover:bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ItemIcon className="w-4 h-4 text-slate-600 shrink-0 stroke-[1.8]" />
                          <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {loc.name}
                          </span>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-slate-900 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
