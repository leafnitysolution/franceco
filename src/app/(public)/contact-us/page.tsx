import type { Metadata } from 'next';
import { ContactUsClient } from '@/components/contact/ContactUsClient';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact our 24/7 Paris dispatch desk for airport transfer assistance, Disneyland Paris shuttles, WhatsApp concierge support, and custom group quotes.',
  alternates: {
    canonical: '/contact-us',
  },
};

export default function ContactUsPage() {
  return <ContactUsClient />;
}
