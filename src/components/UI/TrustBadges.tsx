import React from 'react';
import Image from 'next/image';

/**
 * Official TripAdvisor Brand Lockup Logo (Owl + Registered Wordmark)
 */
export function TripAdvisorLockupLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <Image
      src="/images/tripadvisor_logo.svg"
      alt="Tripadvisor"
      width={120}
      height={26}
      className={`object-contain ${className}`}
    />
  );
}

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
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {/* Official French Marianne & Tricolor Emblem */}
        <div className="relative h-7 w-12 sm:h-8 sm:w-14 shrink-0 flex items-center justify-center">
          <Image
            src="/images/republique_francaise.png"
            alt="République Française"
            fill
            className="object-contain"
            priority
          />
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
      className={`p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5 ${className}`}
    >
      {/* Official French Marianne & Tricolor Emblem */}
      <div className="relative h-10 w-16 shrink-0 flex items-center justify-center">
        <Image
          src="/images/republique_francaise.png"
          alt="République Française"
          fill
          className="object-contain"
          priority
        />
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
 * Matches official Travellers' Choice 2025 badge with TripAdvisor green logo
 */
export function TripAdvisorTravellersChoiceCard({
  className = '',
  theme = 'dark',
  compact = false,
}: {
  className?: string;
  theme?: 'dark' | 'light';
  compact?: boolean;
}) {
  const isDark = theme === 'dark';
  return (
    <div
      className={`rounded-2xl ${
        compact ? 'p-2.5 sm:p-3 gap-3' : 'p-4 sm:p-5 gap-4 sm:gap-5'
      } flex items-center border backdrop-blur-md transition-all ${
        isDark
          ? 'bg-slate-900/80 border-white/15 text-white shadow-xl'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-md'
      } ${className}`}
    >
      {/* TripAdvisor Official Logo Icon Badge */}
      <div
        className={`relative shrink-0 ${
          compact ? 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl' : 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl'
        } overflow-hidden shadow-md border border-[#00AA6C]/30 bg-[#00AA6C] flex items-center justify-center`}
      >
        <Image
          src="/images/tripadvisor_icon.jpg"
          alt="TripAdvisor Official Award"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Text Info */}
      <div className="space-y-0.5 text-left min-w-0">
        <div
          className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          <span>TRIPADVISOR TRAVELLERS&apos; CHOICE</span>
          <span className="text-[9px] font-black bg-[#00AA6C] text-black px-1.5 py-0.5 rounded font-mono">2025</span>
        </div>
        <div className={`${compact ? 'text-xs sm:text-xs' : 'text-sm sm:text-base'} font-bold leading-snug`}>
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

