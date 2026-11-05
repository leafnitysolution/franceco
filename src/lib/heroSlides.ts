import { getSetting, saveSettings } from './settings';

export interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  title: string;
  badge: string;
  isActive?: boolean;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'paris',
    src: '/images/france_transfer_hero.jpg',
    alt: 'Paris Airport & City Center Luxury Chauffeur Transfer',
    title: 'Paris Airports & City Center',
    badge: 'CDG • Orly • City Hotels',
    isActive: true,
  },
  {
    id: 'disney',
    src: '/images/destinations/disneyland_paris.jpg',
    alt: 'Disneyland Paris Family Shuttle Transfer',
    title: 'Disneyland Paris Direct Transfers',
    badge: 'All Disney Hotels & Parks',
    isActive: true,
  },
  {
    id: 'meet-greet',
    src: '/images/meet_greet_driver.jpg',
    alt: 'VIP Airport Meet and Greet Chauffeur at Arrival Gate',
    title: 'Terminal VIP Meet & Greet',
    badge: 'Flight Tracking • Name Board',
    isActive: true,
  },
  {
    id: 'versailles',
    src: '/images/destinations/versailles_palace.jpg',
    alt: 'Palace of Versailles and Excursion Transfers',
    title: 'Versailles & Day Excursions',
    badge: 'Private Tours & Historic Castles',
    isActive: true,
  },
];

export const DEFAULT_HERO_INTERVAL_SECONDS = 5.5;

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
