import type { MetadataRoute } from 'next';
import { getPublicRoutes } from '@/lib/publicData';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://francegotransfers.io').replace(/\/$/, '');

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/book`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/our-rates`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/reviews`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/faqs`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tours/paris-city-tour`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/tours/france-day-trips`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/tours/outside-paris-tours`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/terms-and-conditions`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cancellation-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let routeEntries: MetadataRoute.Sitemap = [];
  try {
    const routes = await getPublicRoutes();
    const seen = new Set<string>();
    routeEntries = routes
      .filter((r) => r?.slug && r.isActive !== false && !seen.has(r.slug) && (seen.add(r.slug), true))
      .map((r) => ({
        url: `${BASE_URL}/transfers/${r.slug}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: r.isFeatured ? 0.85 : 0.75,
      }));
  } catch (err) {
    console.warn('Sitemap route lookup failed:', err);
  }

  return [...staticPages, ...routeEntries];
}
