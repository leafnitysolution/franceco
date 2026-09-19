'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358' },
];

interface CountryCodePhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

export function CountryCodePhoneInput({
  value,
  onChange,
  required = false,
  placeholder = '7700 900077',
  className = '',
  hasError = false,
}: CountryCodePhoneInputProps) {
  // Parse initial country dial code if present
  const findInitialCountry = () => {
    if (!value) return COUNTRY_CODES[0]; // France +33 default
    const matched = COUNTRY_CODES.find((c) => value.startsWith(c.dialCode));
    return matched || COUNTRY_CODES[0];
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(findInitialCountry);
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    if (!value) return '';
    const initial = findInitialCountry();
    return value.startsWith(initial.dialCode)
      ? value.replace(initial.dialCode, '').trim()
      : value;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (!value) {
      setPhoneNumber('');
      return;
    }
    const country = COUNTRY_CODES.find((c) => value.startsWith(c.dialCode));
    if (country) {
      setSelectedCountry(country);
      setPhoneNumber(value.replace(country.dialCode, '').trim());
    } else {
      setPhoneNumber(value);
    }
  }, [value]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');
    const full = `${country.dialCode} ${phoneNumber}`.trim();
    onChange(full);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value;
    setPhoneNumber(num);
    const full = `${selectedCountry.dialCode} ${num}`.trim();
    onChange(full);
  };

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dialCode.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative flex items-center ${className}`} ref={dropdownRef}>
      {/* Country Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2.5 border border-r-0 rounded-l-xl text-xs font-bold text-slate-800 hover:bg-slate-200/80 transition-all shrink-0 focus:outline-none ${
          hasError
            ? 'bg-red-50 border-red-500 text-red-900 ring-1 ring-red-300'
            : 'bg-slate-100/90 border-slate-300'
        }`}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-extrabold text-slate-900">{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Phone Number Input */}
      <input
        type="tel"
        required={required}
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        className={`w-full border rounded-r-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none ${
          hasError
            ? 'bg-red-50/50 border-red-500 ring-2 ring-red-100'
            : 'bg-slate-50 border-slate-300 focus:border-gold-500'
        }`}
      />

      {/* Scrollable Country Selector Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search country or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
            />
          </div>

          <div className="overflow-y-auto max-h-48 p-1 divide-y divide-slate-50">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                      isSelected
                        ? 'bg-[#F7F2E7] text-gold-800 font-bold border border-[#E5D7BC]'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-slate-500 font-bold">{c.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-gold-600" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
