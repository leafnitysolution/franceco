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
