import { db } from '@/lib/db';
import { RouteForm } from '@/components/admin/RouteForm';

export default async function NewRoutePage() {
  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <RouteForm locations={locations} />
    </div>
  );
}
