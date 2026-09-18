import { Header } from '@/components/UI/Header';
import { Footer } from '@/components/UI/Footer';
import { CheckoutModal } from '@/components/booking/CheckoutModal';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CheckoutModal />
    </>
  );
}
