import { db } from '@/lib/db';
import { LocationManager } from '@/components/admin/LocationManager';
import { ensureLocationCategoriesSeeded } from '@/lib/seedHelper';

export const revalidate = 0;

export default async function LocationsPage() {
  await ensureLocationCategoriesSeeded();

  const locations = await db.location.findMany({
    include: {
      originRoutes: { select: { id: true } },
      destinationRoutes: { select: { id: true } },
    },
    orderBy: { name: 'asc' },
  });

  const categories = await db.locationCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <LocationManager locations={locations as any} initialCategories={categories as any} />
    </div>
  );
}
