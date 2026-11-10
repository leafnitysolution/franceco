import { getSetting, saveSettings } from './settings';
import {
  BookingAddon,
  DEFAULT_BOOKING_ADDONS,
  calculateAddonsTotal,
} from './addonsShared';

export type { BookingAddon };
export { DEFAULT_BOOKING_ADDONS, calculateAddonsTotal };

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
