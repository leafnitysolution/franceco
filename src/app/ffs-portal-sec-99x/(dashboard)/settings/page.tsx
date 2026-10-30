import { getAllSettings } from '@/lib/settings';
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-8">
      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}
