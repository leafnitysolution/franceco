import { db } from '@/lib/db';
import { RouteForm } from '@/components/admin/RouteForm';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface EditRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRoutePage({ params }: EditRoutePageProps) {
  const { id } = await params;

  const route = await db.route.findUnique({
    where: { id },
    include: {
      origin: true,
      destination: true,
    },
  });

  if (!route) {
    notFound();
  }

  const locations = await db.location.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <RouteForm locations={locations} initialData={route as any} />
    </div>
  );
}
