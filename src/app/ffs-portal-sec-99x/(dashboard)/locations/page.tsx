import { db } from '@/lib/db';
import { LocationManager } from '@/components/admin/LocationManager';

export const revalidate = 0;

export default async function LocationsPage() {
  const locations = await db.location.findMany({
    include: {
      originRoutes: { select: { id: true } },
      destinationRoutes: { select: { id: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <LocationManager locations={locations as any} />
    </div>
  );
}
