'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES, LanguageCode } from '@/lib/LanguageContext';
import { ChevronDown, Check } from 'lucide-react';

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className="font-extrabold text-slate-900 tracking-wide">{currentLanguage.displayCode}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown matching Screenshot */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#F7F2E7] text-gold-700 border border-[#E5D7BC] shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="font-semibold">{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
