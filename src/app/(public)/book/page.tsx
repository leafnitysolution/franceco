import { db } from '@/lib/db';
import { FullPageBookingClient } from '@/components/booking/FullPageBookingClient';
import { ensureLocationsSeeded } from '@/lib/seedHelper';

export const revalidate = 0;

export const metadata = {
  title: 'Book your Transfer | FastForward Shuttle',
  description:
    'Complete your private transfer reservation in France with fixed rates, free child seats, zero deposit, and payment on arrival.',
};

export default async function BookPage() {
  await ensureLocationsSeeded();

  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  const categories = await db.locationCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <FullPageBookingClient
      locations={locations as any}
      categories={categories as any}
    />
  );
}
