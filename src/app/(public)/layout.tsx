import { Header } from '@/components/UI/Header';
import { Footer } from '@/components/UI/Footer';
import { CheckoutModal } from '@/components/booking/CheckoutModal';
import { getPublicRoutes } from '@/lib/publicData';

export const revalidate = 0; // Revalidate dynamically on every request

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeRoutes = await getPublicRoutes();

  return (
    <>
      <Header routes={activeRoutes as any} />
      <main className="flex-1">{children}</main>
      <Footer routes={activeRoutes as any} />
      <CheckoutModal />
    </>
  );
}
