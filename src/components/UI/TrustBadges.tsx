import React from 'react';

/**
 * Official TripAdvisor Owl Vector Emblem
 */
export function TripAdvisorLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TripAdvisor"
    >
      {/* Outer Owl Ears / Head Contour */}
      <path
        d="M12 4.5C8.8 4.5 6.2 6.5 5.2 9.3C4.2 9 3.2 9.2 2.5 9.8C1.5 10.7 1.2 12.1 1.7 13.3C2.3 14.7 3.7 15.6 5.3 15.5C6.7 17.6 9.2 19 12 19C14.8 19 17.3 17.6 18.7 15.5C20.3 15.6 21.7 14.7 22.3 13.3C22.8 12.1 22.5 10.7 21.5 9.8C20.8 9.2 19.8 9 18.8 9.3C17.8 6.5 15.2 4.5 12 4.5Z"
        fill="#00AF87"
      />
      {/* Left Eye White Circle */}
      <circle cx="7.5" cy="12.5" r="3.2" fill="#FFFFFF" />
      {/* Right Eye White Circle */}
      <circle cx="16.5" cy="12.5" r="3.2" fill="#FFFFFF" />
      {/* Left Eye Inner Green/Black */}
      <circle cx="7.5" cy="12.5" r="2" fill="#000000" />
      <circle cx="7.5" cy="12.5" r="1.1" fill="#00AF87" />
      <circle cx="7.2" cy="12.2" r="0.4" fill="#FFFFFF" />
      {/* Right Eye Inner Green/Black */}
      <circle cx="16.5" cy="12.5" r="2" fill="#000000" />
      <circle cx="16.5" cy="12.5" r="1.1" fill="#00AF87" />
      <circle cx="16.2" cy="12.2" r="0.4" fill="#FFFFFF" />
      {/* Center Beak */}
      <polygon points="12,12 10.8,14.5 13.2,14.5" fill="#000000" />
    </svg>
  );
}

/**
 * Official French Republic / République Française Transport License Seal
 * With Marianne Silhouette & French Tricolor
 */
export function RepubliqueFrancaiseBadge({
  variant = 'compact',
  className = '',
}: {
  variant?: 'compact' | 'full';
  className?: string;
}) {
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {/* French Tricolor Flag Block with Marianne silhouette */}
        <div className="relative w-7 h-5 rounded-[3px] overflow-hidden shadow-xs border border-slate-300 shrink-0 flex">
          <div className="w-1/3 h-full bg-[#002395]" />
          <div className="w-1/3 h-full bg-[#FFFFFF] flex items-center justify-center">
            {/* Minimal Marianne Profile Silhouette */}
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-[#002395] fill-current">
              <path d="M5 1C3.5 1 2.8 2.2 2.8 3.5C2.8 4.2 3.1 4.8 3.5 5.2C3.2 5.8 2.5 6.5 1.5 7C2.5 7.2 3.8 6.8 4.5 6.2C5 6.8 5.8 7 6.8 6.8C8 6.5 8.5 5.2 8.5 4C8.5 2.5 7 1 5 1Z" />
            </svg>
          </div>
          <div className="w-1/3 h-full bg-[#ED2939]" />
        </div>

        <div className="text-left leading-tight">
          <div className="text-[10px] font-black text-slate-900 tracking-tight flex items-center gap-1">
            <span>RÉPUBLIQUE FRANÇAISE</span>
          </div>
          <div className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">
            Licensed VTC Operator
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 ${className}`}
    >
      {/* Official Government Tricolor Block */}
      <div className="relative w-12 h-9 rounded-md overflow-hidden shadow-xs border border-slate-300 shrink-0 flex">
        <div className="w-1/3 h-full bg-[#002395]" />
        <div className="w-1/3 h-full bg-[#FFFFFF] flex items-center justify-center">
          <svg viewBox="0 0 12 12" className="w-4 h-4 text-[#002395] fill-current">
            <path d="M6 1C4 1 3.2 2.5 3.2 4C3.2 4.9 3.6 5.6 4.1 6.1C3.8 6.8 3 7.6 1.8 8.2C3 8.4 4.5 8 5.4 7.2C6 7.9 7 8.2 8.2 7.9C9.6 7.6 10.2 6.1 10.2 4.6C10.2 2.9 8.4 1 6 1Z" />
          </svg>
        </div>
        <div className="w-1/3 h-full bg-[#ED2939]" />
      </div>

      <div className="text-left leading-tight">
        <div className="text-[11px] font-black text-slate-900 tracking-tight">
          RÉPUBLIQUE FRANÇAISE
        </div>
        <div className="text-[9px] font-semibold text-slate-600">
          Entreprise de Transport Agréée • VTC Officiel
        </div>
        <div className="text-[8px] font-medium text-slate-400">
          Liberté • Égalité • Fraternité
        </div>
      </div>
    </div>
  );
}

/**
 * TripAdvisor Travellers' Choice 2025 Award Card
 * Matches official Travellers' Choice 2025 badge with laurel wreath and verified text
 */
export function TripAdvisorTravellersChoiceCard({
  className = '',
  theme = 'dark',
}: {
  className?: string;
  theme?: 'dark' | 'light';
}) {
  const isDark = theme === 'dark';
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 border backdrop-blur-md transition-all ${
        isDark
          ? 'bg-slate-900/80 border-white/15 text-white shadow-xl'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-md'
      } ${className}`}
    >
      {/* Travellers Choice Green Shield Badge */}
      <div className="shrink-0 w-16 h-20 sm:w-18 sm:h-22 rounded-2xl bg-[#00AF87] text-black flex flex-col items-center justify-between py-2 px-1 shadow-md select-none">
        {/* Owl + Laurel Wreath */}
        <div className="relative flex items-center justify-center pt-0.5">
          {/* Laurel Wreath */}
          <svg viewBox="0 0 48 32" className="w-12 h-8 text-black fill-current">
            <path d="M12 24c-2.5-2.2-4.2-5.4-4.8-8.8 1.4.6 3 .9 4.8.8-1.8-1.5-3.1-3.6-3.8-5.8 1.5.4 3.1.5 4.7.2C11 8.8 9.9 7 9.4 5c1.4.3 2.9.4 4.3.2C13 3.6 12.3 2 12 0c2 .8 3.8 2 5.2 3.6 1.4-1.6 3.2-2.8 5.2-3.6-.3 2-1 3.6-1.7 5.2 1.4.2 2.9.1 4.3-.2-.5 2-1.6 3.8-3.5 5.4 1.6.3 3.2.2 4.7-.2-.7 2.2-2 4.3-3.8 5.8 1.8.1 3.4-.2 4.8-.8-.6 3.4-2.3 6.6-4.8 8.8-1.5-1.5-2.6-3.4-3.2-5.5-1.2 2.2-3 4-5.2 5.2-.6-2.1-1.7-4-3.2-5.5-.6 2.1-1.7 4-3.2 5.5z" />
          </svg>
          {/* Owl inside wreath */}
          <div className="absolute inset-0 flex items-center justify-center">
            <TripAdvisorLogo className="w-5 h-5 text-black" />
          </div>
        </div>
        {/* Year */}
        <span className="text-base sm:text-lg font-black tracking-tighter text-black leading-none">
          2025
        </span>
      </div>

      {/* Text Info */}
      <div className="space-y-1 text-left min-w-0">
        <div
          className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          TRIPADVISOR TRAVELLERS&apos; CHOICE
        </div>
        <div className="text-sm sm:text-base font-bold leading-snug">
          Awarded for consistent great reviews from global travellers.
        </div>
        <div
          className={`text-xs sm:text-[13px] leading-relaxed line-clamp-2 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          FranceGo is trusted by thousands of families, executives, and travel advisors every year.
        </div>
      </div>
    </div>
  );
}

