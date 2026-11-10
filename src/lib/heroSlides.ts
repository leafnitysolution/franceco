import { getSetting, saveSettings } from './settings';
import {
  HeroSlide,
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_INTERVAL_SECONDS,
} from './heroSlidesShared';

export type { HeroSlide };
export { DEFAULT_HERO_SLIDES, DEFAULT_HERO_INTERVAL_SECONDS };

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const raw = await getSetting('HOMEPAGE_HERO_SLIDES');
    if (raw && raw.trim().length > 0) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, index) => ({
          id: String(item.id || `slide_${index + 1}`),
          src: String(item.src || '/images/france_transfer_hero.jpg'),
          alt: String(item.alt || item.title || 'FranceGo Luxury Transfer'),
          title: String(item.title || 'France Transfer'),
          badge: String(item.badge || ''),
          isActive: item.isActive !== false,
        }));
      }
    }
  } catch (err) {
    console.warn('Could not parse HOMEPAGE_HERO_SLIDES, falling back to defaults:', err);
  }
  return DEFAULT_HERO_SLIDES;
}

export async function getHeroIntervalSeconds(): Promise<number> {
  try {
    const raw = await getSetting('HOMEPAGE_HERO_INTERVAL', String(DEFAULT_HERO_INTERVAL_SECONDS));
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 2 && num <= 30) {
      return num;
    }
  } catch {}
  return DEFAULT_HERO_INTERVAL_SECONDS;
}

export async function saveHeroSlides(
  slides: HeroSlide[],
  intervalSeconds = DEFAULT_HERO_INTERVAL_SECONDS
): Promise<void> {
  await saveSettings({
    HOMEPAGE_HERO_SLIDES: JSON.stringify(slides),
    HOMEPAGE_HERO_INTERVAL: String(intervalSeconds),
  });
}
