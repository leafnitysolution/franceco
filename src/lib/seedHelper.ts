import { db } from './db';

export async function ensureLocationsSeeded() {
  try {
    const count = await db.location.count();
    if (count > 0) return;

    console.log('No locations found in database. Auto-seeding default hubs and routes...');

    // 1. Hub Locations
    const cdg = await db.location.upsert({
      where: { shortCode: 'CDG' },
      update: {},
      create: { name: 'Paris Charles de Gaulle Airport (CDG)', shortCode: 'CDG', category: 'AIRPORT' },
    });

    const ory = await db.location.upsert({
      where: { shortCode: 'ORY' },
      update: {},
      create: { name: 'Paris Orly Airport (ORY)', shortCode: 'ORY', category: 'AIRPORT' },
    });

    const bva = await db.location.upsert({
      where: { shortCode: 'BVA' },
      update: {},
      create: { name: 'Paris Beauvais Tillé Airport (BVA)', shortCode: 'BVA', category: 'AIRPORT' },
    });

    const dlp = await db.location.upsert({
      where: { shortCode: 'DLP' },
      update: {},
      create: { name: 'Disneyland Paris Hotels & Parks', shortCode: 'DLP', category: 'AMUSEMENT_PARK' },
    });

    const par = await db.location.upsert({
      where: { shortCode: 'PAR' },
      update: {},
      create: { name: 'Paris City Center (All Arrondissements)', shortCode: 'PAR', category: 'CITY_CENTER' },
    });

    const gdn = await db.location.upsert({
      where: { shortCode: 'GDN' },
      update: {},
      create: { name: 'Gare du Nord & Paris Train Stations', shortCode: 'GDN', category: 'TRAIN_STATION' },
    });

    const vers = await db.location.upsert({
      where: { shortCode: 'VERS' },
      update: {},
      create: { name: 'Château de Versailles & Hotels', shortCode: 'VERS', category: 'PALACE' },
    });

    // 2. Core Routes
    const routesData = [
      {
        slug: 'cdg-to-disneyland-paris',
        originId: cdg.id,
        destinationId: dlp.id,
        distanceKm: 45.0,
        estDurationMinutes: 45,
        sedanPriceEur: 70,
        economyVanPriceEur: 90,
        businessVanPriceEur: 120,
        minibusPriceEur: 180,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Transfer from CDG Airport to Disneyland Paris',
        metaTitle: 'CDG Airport to Disneyland Paris Shuttle | Fixed Fares from 70€',
        metaDescription: 'Book door-to-door private transfers from Paris Charles de Gaulle (CDG) to Disneyland Paris.',
        overviewText: 'Enjoy a stress-free private transfer directly from Charles de Gaulle Airport (CDG) to your Disneyland Paris hotel.',
        faqs: '[]',
      },
      {
        slug: 'orly-to-disneyland-paris',
        originId: ory.id,
        destinationId: dlp.id,
        distanceKm: 48.0,
        estDurationMinutes: 50,
        sedanPriceEur: 90,
        economyVanPriceEur: 110,
        businessVanPriceEur: 140,
        minibusPriceEur: 200,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Transfer from Orly Airport to Disneyland Paris',
        metaTitle: 'Orly Airport (ORY) to Disneyland Paris Taxi & Shuttle from 90€',
        metaDescription: 'Direct private shuttle service from Paris Orly Airport to Disneyland hotels & resorts.',
        overviewText: 'Travel hassle-free between Paris Orly Airport (ORY) and Disneyland Paris.',
        faqs: '[]',
      },
      {
        slug: 'beauvais-to-disneyland-paris',
        originId: bva.id,
        destinationId: dlp.id,
        distanceKm: 110.0,
        estDurationMinutes: 80,
        sedanPriceEur: 130,
        economyVanPriceEur: 160,
        businessVanPriceEur: 190,
        minibusPriceEur: 260,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Direct Private Shuttle Beauvais Airport to Disneyland Paris',
        metaTitle: 'Beauvais Airport (BVA) to Disneyland Paris Private Transfer',
        metaDescription: 'Comfortable private shuttle from Paris Beauvais Airport to Disneyland Paris.',
        overviewText: 'Paris Beauvais Airport is located 110 km north of Disneyland Paris.',
        faqs: '[]',
      },
      {
        slug: 'cdg-to-paris-city',
        originId: cdg.id,
        destinationId: par.id,
        distanceKm: 30.0,
        estDurationMinutes: 40,
        sedanPriceEur: 65,
        economyVanPriceEur: 85,
        businessVanPriceEur: 110,
        minibusPriceEur: 170,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Airport Transfer CDG to Paris City Center',
        metaTitle: 'CDG Airport to Paris City Center Taxi & Chauffeur | 65€ Fixed',
        metaDescription: 'Book your private transfer from Paris CDG Airport to any address or hotel in central Paris.',
        overviewText: 'Arrive in Paris in style.',
        faqs: '[]',
      },
      {
        slug: 'paris-to-disneyland',
        originId: par.id,
        destinationId: dlp.id,
        distanceKm: 40.0,
        estDurationMinutes: 45,
        sedanPriceEur: 70,
        economyVanPriceEur: 90,
        businessVanPriceEur: 120,
        minibusPriceEur: 180,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Transfer Paris City Center to Disneyland Paris',
        metaTitle: 'Paris City to Disneyland Paris Shuttle | 70€ Fixed Rate',
        metaDescription: 'Direct family shuttle from central Paris hotels to Disneyland Paris.',
        overviewText: 'Comfortable day trip or hotel transfer from central Paris directly to Disneyland Paris.',
        faqs: '[]',
      },
    ];

    for (const r of routesData) {
      await db.route.upsert({
        where: { slug: r.slug },
        update: {},
        create: r,
      });
    }

    // 3. Sample Reviews if empty
    const reviewCount = await db.review.count();
    if (reviewCount === 0) {
      await db.review.createMany({
        data: [
          {
            authorName: 'Sarah & Family',
            location: 'London, UK',
            routeText: 'CDG Airport → Disneyland Paris',
            rating: 5,
            comment: 'Outstanding service! Our chauffeur met us directly inside CDG Terminal 2F holding a sign with my name. Highly recommended!',
          },
          {
            authorName: 'Michael R.',
            location: 'New York, USA',
            routeText: 'Orly Airport → Paris City Center',
            rating: 5,
            comment: 'Punctual, luxurious vehicle, and polite English-speaking driver. The fare was 100% fixed at 60€ with no meters or hidden fees.',
          },
          {
            authorName: 'Elena & David',
            location: 'Madrid, Spain',
            routeText: 'Beauvais Airport → Disneyland Paris',
            rating: 5,
            comment: 'Beauvais Airport transfer was smooth and comfortable. Free booster seats for our kids!',
          },
        ],
      });
    }
    console.log('Auto-seeding completed.');
  } catch (err) {
    console.error('Error auto-seeding default locations:', err);
  }
}
