import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Back-Office Portal | FranceGo Admin',
    template: '%s | FranceGo Admin',
  },
  description: 'FranceGo VIP Transfers & Tours private administration and dispatch portal.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
