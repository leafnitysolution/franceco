import fs from 'fs';
import path from 'path';

export interface AppSettings {
  googleMapsApiKey: string;
  googlePlaceId: string;
  googleReviewsUrl: string;
  tripAdvisorApiKey: string;
  tripAdvisorLocationId: string;
  tripAdvisorUrl: string;
  partnerApiKey: string;
  dispatchHotline: string;
  dispatchEmail: string;
}

const CONFIG_FILE_PATH = path.resolve(process.cwd(), 'config', 'settings.json');

export function getAppSettings(): AppSettings {
  let fileSettings: Partial<AppSettings> = {};

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      fileSettings = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading settings.json, falling back to process.env:', err);
  }

  return {
    googleMapsApiKey:
      fileSettings.googleMapsApiKey ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      '',
    googlePlaceId:
      fileSettings.googlePlaceId ||
      process.env.GOOGLE_PLACE_ID ||
      '',
    googleReviewsUrl:
      fileSettings.googleReviewsUrl ||
      process.env.GOOGLE_REVIEWS_URL ||
      'https://maps.google.com',
    tripAdvisorApiKey:
      fileSettings.tripAdvisorApiKey ||
      process.env.TRIPADVISOR_API_KEY ||
      '',
    tripAdvisorLocationId:
      fileSettings.tripAdvisorLocationId ||
      process.env.TRIPADVISOR_LOCATION_ID ||
      '',
    tripAdvisorUrl:
      fileSettings.tripAdvisorUrl ||
      process.env.TRIPADVISOR_URL ||
      'https://www.tripadvisor.com',
    partnerApiKey:
      fileSettings.partnerApiKey ||
      process.env.PARTNER_API_KEY ||
      'ffs_partner_live_secret_key_2026',
    dispatchHotline:
      fileSettings.dispatchHotline ||
      process.env.DISPATCH_HOTLINE ||
      '+33 7 81 11 83 94',
    dispatchEmail:
      fileSettings.dispatchEmail ||
      process.env.ADMIN_DISPATCH_EMAIL ||
      'projet15df@outlook.fr',
  };
}

export function saveAppSettings(newSettings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const merged: AppSettings = {
    ...current,
    ...newSettings,
  };

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save settings.json:', err);
    throw new Error('Failed to save configuration settings.');
  }

  return merged;
}
