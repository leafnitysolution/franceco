import { HomePageClient } from '@/components/home/HomePageClient';
import { getPublicLocations, getPublicCategories, getPublicRoutes } from '@/lib/publicData';

export const revalidate = 60;

export default async function HomePage() {
  const [locations, categories, allRoutes] = await Promise.all([
    getPublicLocations(),
    getPublicCategories(),
    getPublicRoutes(),
  ]);

  const featuredRoutes = allRoutes.filter((r) => r.isActive !== false);

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
      categories={categories as any}
      featuredRoutes={featuredRoutes}
      defaultFaqs={defaultFaqs}
    />
  );
}
