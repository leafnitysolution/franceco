import { getSetting, saveSettings } from './settings';

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
 * Fetch currently configured booking add-ons from SystemSetting or fallback to defaults.
 */
export async function getBookingAddons(): Promise<BookingAddon[]> {
  try {
    const raw = await getSetting('BOOKING_ADDONS');
    if (raw && raw.trim().length > 0) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          id: String(item.id || ''),
          title: String(item.title || ''),
          description: String(item.description || ''),
          priceEur: Math.max(0, Number(item.priceEur) || 0),
          icon: item.icon || 'sparkles',
          isActive: item.isActive !== false,
        }));
      }
    }
  } catch (err) {
    console.warn('Could not parse BOOKING_ADDONS setting, falling back to defaults:', err);
  }
  return DEFAULT_BOOKING_ADDONS;
}

/**
 * Save booking add-ons configuration to SystemSetting.
 */
export async function saveBookingAddons(addons: BookingAddon[]): Promise<void> {
  await saveSettings({
    BOOKING_ADDONS: JSON.stringify(addons),
  });
}

/**
 * Calculate total price of selected addons.
 */
export function calculateAddonsTotal(selectedIds: string[], addonsList: BookingAddon[]): number {
  if (!selectedIds || selectedIds.length === 0) return 0;
  const addonMap = new Map(addonsList.map((a) => [a.id, a.priceEur]));
  return selectedIds.reduce((sum, id) => sum + (addonMap.get(id) || 0), 0);
}
