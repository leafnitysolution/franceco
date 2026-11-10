export interface BookingAddon {
  id: string;
  title: string;
  description: string;
  priceEur: number;
  icon?: 'tv' | 'paw' | 'wine' | 'clock' | 'sparkles' | 'wifi' | 'coffee' | 'shield';
  isActive: boolean;
}

export const DEFAULT_BOOKING_ADDONS: BookingAddon[] = [
  {
    id: 'tv_on_board',
    title: 'TV on Board',
    description: 'In-vehicle high-definition display with streaming entertainment & YouTube during your journey.',
    priceEur: 20,
    icon: 'tv',
    isActive: true,
  },
  {
    id: 'pet_friendly',
    title: 'Pet on Board',
    description: 'Pet-friendly transfer with vehicle sanitized and prepared for your furry companion.',
    priceEur: 20,
    icon: 'paw',
    isActive: true,
  },
  {
    id: 'champagne_bottle',
    title: 'Chilled Champagne & Refreshments',
    description: 'Bottle of premium French champagne served chilled with glassware and cold mineral waters.',
    priceEur: 45,
    icon: 'wine',
    isActive: true,
  },
  {
    id: 'extra_wait_time',
    title: 'Extra Waiting Time (Up to 1 hr)',
    description: 'Additional 60 minutes of flexible chauffeur standby beyond the standard 60-minute airport grace period.',
    priceEur: 30,
    icon: 'clock',
    isActive: true,
  },
  {
    id: 'vip_meet_greet',
    title: 'VIP Chauffeur Meet & Luggage Porter',
    description: 'Personal chauffeur meets you inside the terminal with an iPad name board and assists with all heavy bags.',
    priceEur: 15,
    icon: 'sparkles',
    isActive: true,
  },
];

/**
 * Calculate total price of selected addons.
 */
export function calculateAddonsTotal(selectedIds: string[], addonsList: BookingAddon[]): number {
  if (!selectedIds || selectedIds.length === 0) return 0;
  const addonMap = new Map(addonsList.map((a) => [a.id, a.priceEur]));
  return selectedIds.reduce((sum, id) => sum + (addonMap.get(id) || 0), 0);
}
