'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import {
  HeroSlide,
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_INTERVAL_SECONDS,
} from '@/lib/heroSlides';

export type { HeroSlide };

interface HeroBackgroundSliderProps {
  slides?: HeroSlide[];
  intervalSeconds?: number;
}

export function HeroBackgroundSlider({ slides, intervalSeconds }: HeroBackgroundSliderProps) {
  const currentSlides = useMemo(() => {
    const list = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
    const filtered = list.filter((s) => s.isActive !== false);
    return filtered.length > 0 ? filtered : DEFAULT_HERO_SLIDES;
  }, [slides]);

  const slideIntervalMs = useMemo(() => {
    const seconds = intervalSeconds || DEFAULT_HERO_INTERVAL_SECONDS;
    return Math.max(2000, Math.round(seconds * 1000));
  }, [intervalSeconds]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Staged loading: enable rotation after initial paint so LCP is instant
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Safe clamp in case slide count changes dynamically
  useEffect(() => {
    if (activeIndex >= currentSlides.length) {
      setActiveIndex(0);
    }
  }, [currentSlides.length, activeIndex]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % currentSlides.length);
  }, [currentSlides.length]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!hasHydrated || isPaused || currentSlides.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, slideIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasHydrated, isPaused, nextSlide, slideIntervalMs, currentSlides.length]);

  const currentSlide = currentSlides[activeIndex] || currentSlides[0];

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* RENDER ALL SLIDES WITH SMOOTH CROSS-FADE */}
      {currentSlides.map((slide, index) => {
        const isActive = index === activeIndex;
        // Priority only on first slide to guarantee instantaneous initial page load
        const isPriority = index === 0;

        return (
          <div
            key={slide.id || `slide_${index}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt || slide.title || 'FranceGo Luxury Chauffeur Transfer'}
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
      {currentSlides.length > 1 && (
        <div className="absolute bottom-4 left-4 sm:left-8 z-20 hidden sm:flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-xl">
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/20 text-gold-300 text-[11px] font-bold">
            <MapPin className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span className="truncate max-w-[150px]">{currentSlide.title}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentSlides.map((slide, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={slide.id || `pill_${idx}`}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to ${slide.title}`}
                  className={`group relative h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'w-8 bg-gradient-to-r from-gold-400 to-amber-500 shadow-sm'
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                >
                  <span className="sr-only">{slide.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MOBILE MINI DOTS */}
      {currentSlides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex sm:hidden items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
          {currentSlides.map((slide, idx) => (
            <button
              key={slide.id || `mob_pill_${idx}`}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to ${slide.title}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-6 bg-gold-400' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
