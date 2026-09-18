'use server';

import { db } from '@/lib/db';
import { routeSchema, RouteFormValues } from '@/lib/validators';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper to sanitize route slug for cache revalidation
function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/gi, '');
}

export async function createRouteAction(formData: any) {
  try {
    // 1. Strict Authentication & Privilege Guard (Defense-in-depth)
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    // 2. Strict Input Validation via Zod
    const validated = routeSchema.parse(formData);

    const faqsString = typeof validated.faqs === 'string' 
      ? validated.faqs 
      : JSON.stringify(validated.faqs);

    const route = await db.route.create({
      data: {
        originId: validated.originId,
        destinationId: validated.destinationId,
        slug: validated.slug,
        distanceKm: validated.distanceKm,
        estDurationMinutes: validated.estDurationMinutes,
        sedanPriceEur: validated.sedanPriceEur,
        economyVanPriceEur: validated.economyVanPriceEur,
        businessVanPriceEur: validated.businessVanPriceEur,
        minibusPriceEur: validated.minibusPriceEur,
        h1Heading: validated.h1Heading,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
        overviewText: validated.overviewText,
        faqs: faqsString,
        isActive: validated.isActive,
        isFeatured: validated.isFeatured,
      },
    });

    // 3. Sanitized Cache Revalidation
    const cleanSlug = sanitizeSlug(validated.slug);
    revalidatePath('/');
    revalidatePath('/ffs-portal-sec-99x/routes');
    revalidatePath(`/transfers/${cleanSlug}`);

    return { success: true, route };
  } catch (error: any) {
    console.error('Error creating route:', error?.message || error);
    return { success: false, error: 'Failed to create route. Please verify input data.' };
  }
}

export async function updateRouteAction(routeId: string, formData: any) {
  try {
    // 1. Strict Authentication Guard
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    // 2. Strict Input Validation via Zod
    const validated = routeSchema.parse(formData);

    const faqsString = typeof validated.faqs === 'string' 
      ? validated.faqs 
      : JSON.stringify(validated.faqs);

    const route = await db.route.update({
      where: { id: routeId },
      data: {
        originId: validated.originId,
        destinationId: validated.destinationId,
        slug: validated.slug,
        distanceKm: validated.distanceKm,
        estDurationMinutes: validated.estDurationMinutes,
        sedanPriceEur: validated.sedanPriceEur,
        economyVanPriceEur: validated.economyVanPriceEur,
        businessVanPriceEur: validated.businessVanPriceEur,
        minibusPriceEur: validated.minibusPriceEur,
        h1Heading: validated.h1Heading,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
        overviewText: validated.overviewText,
        faqs: faqsString,
        isActive: validated.isActive,
        isFeatured: validated.isFeatured,
      },
    });

    // 3. Sanitized Cache Revalidation
    const cleanSlug = sanitizeSlug(validated.slug);
    revalidatePath('/');
    revalidatePath('/ffs-portal-sec-99x/routes');
    revalidatePath(`/transfers/${cleanSlug}`);

    return { success: true, route };
  } catch (error: any) {
    console.error('Error updating route:', error?.message || error);
    return { success: false, error: 'Failed to update route. Please verify input data.' };
  }
}

export async function toggleRouteAction(routeId: string, field: 'isActive' | 'isFeatured', currentValue: boolean) {
  try {
    // 1. Strict Authentication Guard
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    const route = await db.route.update({
      where: { id: routeId },
      data: {
        [field]: !currentValue,
      },
    });

    const cleanSlug = sanitizeSlug(route.slug);
    revalidatePath('/');
    revalidatePath('/ffs-portal-sec-99x/routes');
    revalidatePath(`/transfers/${cleanSlug}`);

    return { success: true, route };
  } catch (error: any) {
    console.error('Error toggling route:', error?.message || error);
    return { success: false, error: 'Action failed. Admin authorization required.' };
  }
}

export async function deleteRouteAction(routeId: string) {
  try {
    // 1. Strict Authentication Guard
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    await db.route.delete({
      where: { id: routeId },
    });

    revalidatePath('/');
    revalidatePath('/ffs-portal-sec-99x/routes');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting route:', error?.message || error);
    return { success: false, error: 'Failed to delete route.' };
  }
}

export async function createLocationAction(name: string, shortCode: string, type?: string) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    if (!name || !shortCode) {
      return { success: false, error: 'Location name and short code are required.' };
    }

    const location = await db.location.create({
      data: {
        name: name.trim(),
        shortCode: shortCode.toUpperCase().trim(),
        category: type || 'CUSTOM',
      },
    });

    revalidatePath('/');
    revalidatePath('/ffs-portal-sec-99x/routes');
    revalidatePath('/ffs-portal-sec-99x/locations');
    return { success: true, location };
  } catch (error: any) {
    console.error('Error creating location:', error);
    return { success: false, error: 'Failed to create new location.' };
  }
}

export async function updateLocationAction(id: string, name: string, shortCode: string, category?: string) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    if (!id || !name || !shortCode) {
      return { success: false, error: 'Location ID, name, and short code are required.' };
    }

    const updated = await db.location.update({
      where: { id },
      data: {
        name: name.trim(),
        shortCode: shortCode.toUpperCase().trim(),
        category: category || 'CUSTOM',
      },
    });

    revalidatePath('/');
    revalidatePath('/ffs-portal-sec-99x/routes');
    revalidatePath('/ffs-portal-sec-99x/locations');
    return { success: true, location: updated };
  } catch (error: any) {
    console.error('Error updating location:', error);
    return { success: false, error: 'Failed to update location hub.' };
  }
}

export async function deleteLocationAction(id: string) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin authentication required.' };
    }

    const location = await db.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            originRoutes: true,
            destinationRoutes: true,
            originBookings: true,
            destinationBookings: true,
          },
        },
      },
    });

    if (!location) {
      return { success: false, error: 'Location not found.' };
    }

    const routeCount = (location._count.originRoutes || 0) + (location._count.destinationRoutes || 0);
    const bookingCount = (location._count.originBookings || 0) + (location._count.destinationBookings || 0);

    if (routeCount > 0 || bookingCount > 0) {
      return {
        success: false,
        error: `Cannot delete '${location.name}' because it is currently linked to ${routeCount} route(s) and ${bookingCount} booking(s). Please remove or reassign those first.`,
      };
    }

    await db.location.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/ffs-portal-sec-99x/routes');
    revalidatePath('/ffs-portal-sec-99x/locations');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting location:', error);
    return { success: false, error: 'Failed to delete location hub.' };
  }
}

