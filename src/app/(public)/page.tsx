import { db } from '@/lib/db';
import { HomePageClient } from '@/components/home/HomePageClient';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

export const revalidate = 60;

export default async function HomePage() {
  await ensureLocationsSeeded();

  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  const featuredRoutes = await db.route.findMany({
    where: {
      isActive: true,
    },
    include: {
      origin: true,
      destination: true,
    },
    orderBy: {
      isFeatured: 'desc',
    },
  });

  const defaultFaqs = [
    {
      question: 'What transfer services do you operate in France?',
      answer: 'We provide private door-to-door airport transfers (CDG, Orly, Beauvais), direct Disneyland Paris shuttles, private van excursions across France (Versailles, Normandy, Loire Valley), and 16-seater minibus group transfers.',
    },
    {
      question: 'Do I need to pay in advance when making a reservation?',
      answer: 'No upfront payment or credit card deposit is required to reserve your transfer. You can pay your chauffeur upon arrival at your hotel in cash or card.',
    },
    {
      question: 'What happens if our flight to Paris CDG or Orly is delayed?',
      answer: 'We track all incoming flights in real-time using live radar. If your flight is delayed, your driver adjusts pickup time automatically without charging any delay fees.',
    },
    {
      question: 'Are child safety seats really free of charge?',
      answer: 'Yes! We provide rear-facing infant seats, child car seats, and booster cushions free of charge upon request.',
    },
    {
      question: 'Is API integration available for external booking engine partners?',
      answer: 'Yes! Our system includes a ready API integration gateway allowing seamless reservation syncing with external partner websites.',
    },
  ];

  return (
    <HomePageClient
      locations={locations}
      featuredRoutes={featuredRoutes}
      defaultFaqs={defaultFaqs}
    />
  );
}
