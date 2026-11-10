import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

export const revalidate = 0;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect('/ffs-portal-sec-99x/login');
  }

  await ensureLocationsSeeded();

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-navy-900 flex flex-col font-sans">
      <AdminNavbar />

      {/* Main Back-Office Body */}
      <main className="flex-1 min-w-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-clip">
        {children}
      </main>
    </div>
  );
}

