'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { MapPin, Sparkles } from 'lucide-react';

export interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  title: string;
  badge: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'paris',
    src: '/images/france_transfer_hero.jpg',
    alt: 'Paris Airport & City Center Luxury Chauffeur Transfer',
    title: 'Paris Airports & City Center',
    badge: 'CDG • Orly • City Hotels',
  },
  {
    id: 'disney',
    src: '/images/destinations/disneyland_paris.jpg',
    alt: 'Disneyland Paris Family Shuttle Transfer',
    title: 'Disneyland Paris Direct Transfers',
    badge: 'All Disney Hotels & Parks',
  },
  {
    id: 'meet-greet',
    src: '/images/meet_greet_driver.jpg',
    alt: 'VIP Airport Meet and Greet Chauffeur at Arrival Gate',
    title: 'Terminal VIP Meet & Greet',
    badge: 'Flight Tracking • Name Board',
  },
  {
    id: 'versailles',
    src: '/images/destinations/versailles_palace.jpg',
    alt: 'Palace of Versailles and Excursion Transfers',
    title: 'Versailles & Day Excursions',
    badge: 'Private Tours & Historic Castles',
  },
];

const SLIDE_INTERVAL_MS = 5500;

export function HeroBackgroundSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Staged loading: enable rotation after initial paint so LCP is instant
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!hasHydrated || isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasHydrated, isPaused, nextSlide]);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* RENDER ALL SLIDES WITH SMOOTH CROSS-FADE */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === activeIndex;
        // Priority only on first slide to guarantee instantaneous initial page load
        const isPriority = index === 0;

        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={isPriority}
              loading={isPriority ? 'eager' : 'lazy'}
              sizes="100vw"
              quality={85}
              className={`object-cover object-center transition-transform duration-[7000ms] ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        );
      })}

      {/* DUAL GRADIENT OVERLAYS FOR OPTIMAL TEXT READABILITY */}
      <div className="absolute inset-0 z-2 bg-gradient-to-r from-[#071324]/80 via-[#0B192C]/55 to-[#071324]/35 pointer-events-none" />
      <div className="absolute inset-0 z-2 bg-gradient-to-t from-[#0B192C]/90 via-transparent to-black/30 pointer-events-none" />

      {/* DYNAMIC SCENE INDICATOR PILLS (DESKTOP / TABLET) */}
      <div className="absolute bottom-4 left-4 sm:left-8 z-20 hidden sm:flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-xl">
        <div className="flex items-center gap-1.5 pr-2 border-r border-white/20 text-gold-300 text-[11px] font-bold">
          <MapPin className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
          <span className="truncate max-w-[150px]">{HERO_SLIDES[activeIndex].title}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {HERO_SLIDES.map((slide, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to ${slide.title}`}
                className={`group relative h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isCurrent ? 'w-8 bg-gradient-to-r from-gold-400 to-amber-500 shadow-sm' : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
              >
                <span className="sr-only">{slide.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE MINI DOTS */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex sm:hidden items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goToSlide(idx)}
            aria-label={`Go to ${slide.title}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'w-6 bg-gold-400' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
