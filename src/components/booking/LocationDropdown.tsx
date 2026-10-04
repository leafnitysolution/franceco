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
} from 'lucide-react';

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
  CITY_CENTER: 'Paris',
  TRAIN_STATION: 'Paris Train Stations',
  PALACE: 'Other',
};

export function LocationDropdown({
  isOpen,
  onClose,
  title = 'Please select pickup location',
  placeholder = 'Type location name or code...',
  locations,
  categories,
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

  // Pre-defined category order
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

  // Helper to pick a subtle clean grey icon for each item
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

  return (
    <div
      ref={dropdownRef}
      className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[360px] animate-in fade-in duration-150"
    >
      {/* Top Header Bar */}
      <div className="bg-black text-white px-3.5 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          {title}
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
            className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 placeholder-slate-400 font-medium"
            autoFocus
          />
        </div>
      </div>

      {/* Clean Light Categorized List */}
      <div className="overflow-y-auto flex-1">
        {sortedCategories.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-medium">
            No matching locations found
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
                {/* Simple Light Grey Category Header */}
                <div className="px-4 py-2 bg-[#f3f4f6] text-slate-800 text-xs font-bold tracking-tight border-b border-slate-100">
                  {categoryTitle}
                </div>

                {/* Clean Location Items */}
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
