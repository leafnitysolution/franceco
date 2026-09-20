import { db } from '@/lib/db';
import { Header } from '@/components/UI/Header';
import { Footer } from '@/components/UI/Footer';
import { CheckoutModal } from '@/components/booking/CheckoutModal';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

export const revalidate = 0; // Revalidate dynamically on every request

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureLocationsSeeded();

  const activeRoutes = await db.route.findMany({
    where: { isActive: true },
    include: {
      origin: true,
      destination: true,
    },
    orderBy: { slug: 'asc' },
  });

  return (
    <>
      <Header routes={activeRoutes as any} />
      <main className="flex-1">{children}</main>
      <Footer routes={activeRoutes as any} />
      <CheckoutModal />
    </>
  );
}

