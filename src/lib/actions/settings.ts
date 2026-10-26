'use server';

import { getAdminSession } from '@/lib/auth';
import { getAppSettings, saveAppSettings, AppSettings } from '@/lib/settings';
import { revalidatePath } from 'next/cache';

export async function fetchSettingsAction(): Promise<{ success: boolean; settings?: AppSettings; error?: string }> {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    const settings = getAppSettings();
    return { success: true, settings };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch settings.' };
  }
}

export async function saveSettingsAction(
  newSettings: Partial<AppSettings>
): Promise<{ success: boolean; settings?: AppSettings; error?: string }> {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    const updated = saveAppSettings(newSettings);
    revalidatePath('/ffs-portal-sec-99x/settings');
    revalidatePath('/api/reviews/external');
    return { success: true, settings: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save settings.' };
  }
}
