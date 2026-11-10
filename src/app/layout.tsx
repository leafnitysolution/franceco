import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import { FloatingWhatsApp } from '@/components/UI/FloatingWhatsApp';
import { GoogleTranslateBridge } from '@/components/UI/GoogleTranslateBridge';
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://francegotransfers.io';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A1128',
};

export const metadata: Metadata = {
  title: {
    default: 'FranceGo | VIP Paris & Disneyland Private Transfers',
    template: '%s | FranceGo',
  },
  description:
    'Book door-to-door VIP private transfers from Paris Charles de Gaulle (CDG), Orly, and Beauvais airports to Disneyland Paris & city center. Guaranteed fixed rates, free child seats, pay on arrival.',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'FranceGo VIP Transfers & Tours',
    title: 'FranceGo | VIP Paris & Disneyland Private Transfers',
    description:
      'Private door-to-door airport transfers across Paris, CDG, Orly, Beauvais, Disneyland Paris & Versailles. Fixed rates, Mercedes fleet, free child seats, pay on arrival.',
    images: [
      {
        url: '/images/destinations/eiffel_tower.jpg',
        width: 1200,
        height: 630,
        alt: 'FranceGo VIP Chauffeur Transfers in Paris',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FranceGo | VIP Paris & Disneyland Private Transfers',
    description:
      'Private door-to-door airport transfers across Paris, CDG, Orly, Beauvais & Disneyland Paris with fixed rates and pay on arrival.',
    images: ['/images/destinations/eiffel_tower.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/images/favicon.png', type: 'image/png', sizes: '128x128' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth overflow-x-clip ${serifFont.variable} ${sansFont.variable}`}>
      <body className="min-h-screen w-full overflow-x-clip bg-[#FBF9F5] text-slate-900 flex flex-col font-sans antialiased relative">
        <LanguageProvider>
          {children}
          <FloatingWhatsApp />
          <GoogleTranslateBridge />
        </LanguageProvider>
      </body>
    </html>
  );
}
