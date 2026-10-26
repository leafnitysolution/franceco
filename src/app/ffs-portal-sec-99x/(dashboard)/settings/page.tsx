import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAppSettings } from '@/lib/settings';
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient';

export const metadata = {
  title: 'API Keys & Platform Settings | FranceGo Admin',
  description: 'Manage Google Maps, TripAdvisor, and Partner API integrations.',
};

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    redirect('/ffs-portal-sec-99x/login');
  }

  const settings = getAppSettings();

  return <AdminSettingsClient initialSettings={settings} />;
}
