'use client';

import { useState, useRef, useEffect } from 'react';
import { LocationItem } from '@/types';
import {
  Search,
  Plane,
  Sparkles,
  Train,
  MapPin,
  Landmark,
  Building,
  Check,
} from 'lucide-react';

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  locations: LocationItem[];
  selectedLocationId?: string;
  onSelectLocation: (location: LocationItem) => void;
}

// Category Configuration mapping category enum to Label & Lucide Icon
const CATEGORY_MAP: Record<string, { label: string; icon: any; iconColor: string }> = {
  AIRPORT: { label: 'Paris Airports', icon: Plane, iconColor: 'text-sky-600' },
  AMUSEMENT_PARK: { label: 'Disneyland Paris & Resorts', icon: Sparkles, iconColor: 'text-amber-500' },
  TRAIN_STATION: { label: 'Paris Train Stations', icon: Train, iconColor: 'text-emerald-600' },
  CITY_CENTER: { label: 'Paris City & Hotels', icon: Building, iconColor: 'text-indigo-600' },
  PALACE: { label: 'Palaces & Historical Sites', icon: Landmark, iconColor: 'text-purple-600' },
};

export function LocationDropdown({
  isOpen,
  onClose,
  placeholder = 'Search location...',
  locations,
  selectedLocationId,
  onSelectLocation,
}: LocationDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  // Filter locations by search query
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

  // Category display order
  const categoryOrder = ['AIRPORT', 'AMUSEMENT_PARK', 'TRAIN_STATION', 'CITY_CENTER', 'PALACE'];
  const presentCategories = Object.keys(groupedLocations);
  
  const sortedCategories = presentCategories.sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div
      ref={dropdownRef}
      className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[340px] animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Compact Search Header */}
      <div className="p-2 bg-slate-900 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 text-xs font-semibold text-white rounded-lg border border-slate-700 focus:outline-none focus:border-gold-500 placeholder-slate-400"
            autoFocus
          />
        </div>
      </div>

      {/* Categorized Options List */}
      <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
        {sortedCategories.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs font-medium">
            No matching locations found
          </div>
        ) : (
          sortedCategories.map((catKey) => {
            const catConfig = CATEGORY_MAP[catKey] || {
              label: catKey.replace('_', ' '),
              icon: MapPin,
              iconColor: 'text-slate-600',
            };
            const CatIcon = catConfig.icon;
            const items = groupedLocations[catKey];

            return (
              <div key={catKey} className="bg-slate-50/50">
                {/* Distinct Category Header Bar */}
                <div className="sticky top-0 z-10 px-3 py-1.5 bg-slate-200/90 backdrop-blur-xs text-slate-800 text-[10px] font-black uppercase tracking-wider border-y border-slate-300/70 flex items-center gap-1.5 shadow-xs">
                  <CatIcon className={`w-3.5 h-3.5 ${catConfig.iconColor} shrink-0`} />
                  <span>{catConfig.label}</span>
                </div>

                {/* Indented Options List */}
                <div className="divide-y divide-slate-100 bg-white">
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
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-all group ${
                          isSelected
                            ? 'bg-slate-900 text-white font-bold'
                            : 'hover:bg-amber-50/70 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <CatIcon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isSelected
                                ? 'text-gold-400'
                                : `${catConfig.iconColor} group-hover:scale-110`
                            }`}
                          />
                          <span className="text-xs sm:text-sm font-bold truncate">
                            {loc.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-slate-800 text-gold-400'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-amber-100 group-hover:text-amber-900'
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
  );
}
