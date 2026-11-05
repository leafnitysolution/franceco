import { FullPageBookingClient } from '@/components/booking/FullPageBookingClient';
import { getPublicLocations, getPublicCategories, getPublicRoutes } from '@/lib/publicData';
import { getBookingAddons } from '@/lib/addons';

export const revalidate = 0;

export const metadata = {
  title: 'Book your Transfer | FranceGo',
  description:
    'Complete your private transfer reservation in France with fixed rates, free child seats, zero deposit, and payment on arrival.',
};

export default async function BookPage() {
  const [locations, categories, routes, addons] = await Promise.all([
    getPublicLocations(),
    getPublicCategories(),
    getPublicRoutes(),
    getBookingAddons(),
  ]);

  return (
    <FullPageBookingClient
      locations={locations as any}
      categories={categories as any}
      routes={routes as any}
      addons={addons}
    />
  );
}
