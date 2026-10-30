import { db } from './db';

// Lightweight memory cache with 30s TTL to prevent redundant database hits on high-frequency calls
const settingsCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL_MS = 30_000;

let isTableInitialized = false;

/**
 * Ensures the SystemSetting table exists in PostgreSQL.
 * Uses CREATE TABLE IF NOT EXISTS so it never throws on first run or migration delay.
 */
export async function ensureSettingsTable(): Promise<void> {
  if (isTableInitialized) return;
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL UNIQUE,
        "value" TEXT NOT NULL,
        "group" TEXT NOT NULL DEFAULT 'GENERAL',
        "label" TEXT,
        "isSecret" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");
    `);
    isTableInitialized = true;
  } catch (err) {
    console.warn('[SETTINGS NOTICE] SystemSetting table auto-ensure warning:', err);
  }
}

/**
 * Default fallback values for essential platform services.
 */
export const DEFAULT_SETTINGS: Record<string, string> = {
  // Google Maps Platform
  GOOGLE_MAPS_API_KEY: 'AIzaSyAbKOFmzULGRBcEaqygSCIMjncsjrjL564',
  GOOGLE_PLACE_ID: 'ChIJK_W2Fipt5kcRCOpTeqfLY6g',
  GOOGLE_REVIEWS_URL: 'https://maps.app.goo.gl/DwYGzJ9yDqszXAPW7',

  // TripAdvisor Content API
  TRIPADVISOR_API_KEY: '',
  TRIPADVISOR_LOCATION_ID: '',
  TRIPADVISOR_URL: 'https://www.tripadvisor.com',

  // B2B Partner API
  PARTNER_API_KEY: 'your_b2b_secret_partner_key_2026',

  // Transactional Email / SMTP
  SMTP_HOST: 'smtp-mail.outlook.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'projet15df@outlook.fr',
  SMTP_PASS: '',
  ADMIN_DISPATCH_EMAIL: 'projet15df@outlook.fr',
};

/**
 * Retrieves a single setting by key.
 * Hierarchy:
 * 1. In-memory cache (< 30s)
 * 2. Database `SystemSetting` table
 * 3. Environment variable `process.env[key]`
 * 4. Built-in default value
 */
export async function getSetting(key: string, fallback?: string): Promise<string> {
  // 1. Check in-memory cache
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  // 2. Query Database
  await ensureSettingsTable();

  try {
    const rows = await db.$queryRawUnsafe<Array<{ key: string; value: string }>>(
      `SELECT "key", "value" FROM "SystemSetting" WHERE "key" = $1 LIMIT 1`,
      key
    );

    if (rows && rows.length > 0 && rows[0]?.value !== undefined && rows[0]?.value !== null) {
      const dbVal = String(rows[0].value).trim();
      if (dbVal.length > 0) {
        settingsCache.set(key, { value: dbVal, timestamp: Date.now() });
        return dbVal;
      }
    }
  } catch (err) {
    // Silently fall back to process.env
  }

  // 3. Fallback to process.env
  const envVal = process.env[key];
  if (envVal && envVal.trim().length > 0) {
    const val = envVal.trim();
    settingsCache.set(key, { value: val, timestamp: Date.now() });
    return val;
  }

  // 4. Return provided fallback or DEFAULT_SETTINGS
  return fallback !== undefined ? fallback : (DEFAULT_SETTINGS[key] || '');
}

/**
 * Returns all system settings as a key-value dictionary.
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  await ensureSettingsTable();
  const all: Record<string, string> = {};

  // Populate defaults and env variables first
  for (const [k, defaultVal] of Object.entries(DEFAULT_SETTINGS)) {
    all[k] = (process.env[k] || defaultVal || '').trim();
  }

  // Override with Database records
  try {
    const rows = await db.$queryRawUnsafe<Array<{ key: string; value: string }>>(
      `SELECT "key", "value" FROM "SystemSetting"`
    );
    for (const r of rows) {
      if (r.key && r.value !== undefined && r.value !== null) {
        all[r.key] = r.value;
      }
    }
  } catch (err) {
    console.warn('[SETTINGS NOTICE] getAllSettings DB query warning:', err);
  }

  return all;
}

/**
 * Persists an array or dictionary of settings to PostgreSQL and invalidates the cache.
 */
export async function saveSettings(updates: Record<string, string>): Promise<void> {
  await ensureSettingsTable();

  for (const [key, value] of Object.entries(updates)) {
    const cleanVal = (value || '').trim();
    settingsCache.delete(key);

    await db.$executeRawUnsafe(
      `INSERT INTO "SystemSetting" ("id", "key", "value", "updatedAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT ("key") DO UPDATE 
       SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
      `setting_${key.toLowerCase()}`,
      key,
      cleanVal
    );
  }
}

/**
 * Explicitly clears the settings cache (useful after admin updates).
 */
export function invalidateSettingsCache(key?: string): void {
  if (key) {
    settingsCache.delete(key);
  } else {
    settingsCache.clear();
  }
}
