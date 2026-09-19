'use client';

import { useState } from 'react';
import { LocationItem } from '@/types';
import {
  X,
  Search,
  Plane,
  Sparkles,
  Train,
  MapPin,
  Landmark,
  Check,
  Building,
} from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  locations: LocationItem[];
  selectedLocationId?: string;
  onSelectLocation: (location: LocationItem) => void;
}

// Category Configuration mapping category enum to Header text & Lucide Icon
const CATEGORY_MAP: Record<string, { label: string; icon: any }> = {
  AIRPORT: { label: 'Paris Airports', icon: Plane },
  AMUSEMENT_PARK: { label: 'Euro Disney / Disneyland Paris', icon: Sparkles },
  TRAIN_STATION: { label: 'Paris Train Stations', icon: Train },
  CITY_CENTER: { label: 'Paris City & Arrondissements', icon: Building },
  PALACE: { label: 'Palaces & Historical Landmarks', icon: Landmark },
};

export function LocationPickerModal({
  isOpen,
  onClose,
  title,
  locations,
  selectedLocationId,
  onSelectLocation,
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter locations by search query (matches name or shortCode)
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

  // Pre-defined category order
  const categoryOrder = ['AIRPORT', 'AMUSEMENT_PARK', 'TRAIN_STATION', 'CITY_CENTER', 'PALACE'];
  const presentCategories = Object.keys(groupedLocations);
  
  // Sort present categories based on order, putting remaining at the end
  const sortedCategories = presentCategories.sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-150">
        {/* Dark Top Header Bar (Matching EasyGoShuttle style) */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <h3 className="text-sm sm:text-base font-extrabold tracking-wide">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pickup or destination location..."
              className="w-full pl-9 pr-3 py-2 bg-white text-xs sm:text-sm font-medium text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder-slate-400"
              autoFocus
            />
          </div>
        </div>

        {/* Location Lists by Categories */}
        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 p-1">
          {sortedCategories.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              No matching locations found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            sortedCategories.map((catKey) => {
              const catConfig = CATEGORY_MAP[catKey] || {
                label: catKey.replace('_', ' '),
                icon: MapPin,
              };
              const CatIcon = catConfig.icon;
              const items = groupedLocations[catKey];

              return (
                <div key={catKey} className="py-1">
                  {/* Category Header Bar */}
                  <div className="px-3 py-1.5 bg-slate-100/90 text-slate-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 rounded-md mx-1 my-0.5">
                    <CatIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{catConfig.label}</span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-0.5 mt-0.5">
                    {items.map((loc) => {
                      const isSelected = selectedLocationId === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            onSelectLocation(loc);
                            onClose();
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-all group ${
                            isSelected
                              ? 'bg-slate-900 text-white font-bold'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <CatIcon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isSelected
                                  ? 'text-gold-400'
                                  : 'text-slate-400 group-hover:text-slate-700'
                              }`}
                            />
                            <span className="text-xs sm:text-sm font-bold truncate">
                              {loc.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-slate-800 text-gold-400'
                                  : 'bg-slate-200/70 text-slate-600 group-hover:bg-slate-200'
                              }`}
                            >
                              {loc.shortCode}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-gold-400" />}
                          </div>
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
    </div>
  );
}
