import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import { FloatingWhatsApp } from '@/components/UI/FloatingWhatsApp';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const serifFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FRANCE GO | VIP Transfers & Tours | Paris & Disneyland Airport Private Shuttles',
  description:
    'Book door-to-door VIP private transfers from Paris Charles de Gaulle (CDG), Orly, and Beauvais airports to Disneyland Paris & city center. Guaranteed fixed rates, free child seats, pay on arrival.',
  metadataBase: new URL('https://francego.com'),
  icons: {
    icon: [
      { url: '/images/favicon.png', type: 'image/png' },
    ],
    shortcut: ['/images/favicon.png'],
    apple: [
      { url: '/images/favicon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${serifFont.variable} ${sansFont.variable}`}>
      <body className="min-h-screen bg-[#FBF9F5] text-slate-900 flex flex-col font-sans antialiased relative">
        <LanguageProvider>
          {children}
          <FloatingWhatsApp />
        </LanguageProvider>
      </body>
    </html>
  );
}
