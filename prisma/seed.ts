import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for FastForward Shuttle (safe upsert mode — bookings preserved)...');

  // 1. Upsert Hub Locations (preserves existing locations and custom attributes)
  const cdg = await prisma.location.upsert({
    where: { shortCode: 'CDG' },
    update: {},
    create: {
      name: 'Paris Charles de Gaulle Airport (CDG)',
      shortCode: 'CDG',
      category: 'AIRPORT',
    },
  });

  const ory = await prisma.location.upsert({
    where: { shortCode: 'ORY' },
    update: {},
    create: {
      name: 'Paris Orly Airport (ORY)',
      shortCode: 'ORY',
      category: 'AIRPORT',
    },
  });

  const bva = await prisma.location.upsert({
    where: { shortCode: 'BVA' },
    update: {},
    create: {
      name: 'Paris Beauvais Tillé Airport (BVA)',
      shortCode: 'BVA',
      category: 'AIRPORT',
    },
  });

  const dlp = await prisma.location.upsert({
    where: { shortCode: 'DLP' },
    update: {},
    create: {
      name: 'Disneyland Paris Hotels & Parks',
      shortCode: 'DLP',
      category: 'AMUSEMENT_PARK',
    },
  });

  const par = await prisma.location.upsert({
    where: { shortCode: 'PAR' },
    update: {},
    create: {
      name: 'Paris City Center (All Arrondissements)',
      shortCode: 'PAR',
      category: 'CITY_CENTER',
    },
  });

  const gdn = await prisma.location.upsert({
    where: { shortCode: 'GDN' },
    update: {},
    create: {
      name: 'Gare du Nord & Paris Train Stations',
      shortCode: 'GDN',
      category: 'TRAIN_STATION',
    },
  });

  const vers = await prisma.location.upsert({
    where: { shortCode: 'VERS' },
    update: {},
    create: {
      name: 'Château de Versailles & Hotels',
      shortCode: 'VERS',
      category: 'PALACE',
    },
  });

  console.log('Locations upserted.');

  // 2. Create Core Routes (15 All-inclusive Routes) if they don't exist
  const routesData = [
    // --- AIRPORT TO DISNEYLAND ---
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
      metaDescription: 'Book door-to-door private transfers from Paris Charles de Gaulle (CDG) to Disneyland Paris. Free child seats, flight tracking, and pay-on-arrival.',
      overviewText: 'Enjoy a stress-free private transfer directly from Charles de Gaulle Airport (CDG) to your Disneyland Paris hotel. Your personal chauffeur meets you at arrivals with a personalized name sign.',
      faqs: JSON.stringify([
        { question: 'Where will I meet my driver at CDG Airport?', answer: 'Your driver will meet you directly inside the arrivals hall after baggage claim holding a sign with your name.' },
      ]),
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
      overviewText: 'Travel hassle-free between Paris Orly Airport (ORY) and Disneyland Paris. Avoid crowded public transport and expensive meters.',
      faqs: JSON.stringify([]),
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
      overviewText: 'Paris Beauvais Airport is located 110 km north of Disneyland Paris. Skip the long multi-step shuttle buses.',
      faqs: JSON.stringify([]),
    },

    // --- DISNEYLAND TO AIRPORT ---
    {
      slug: 'disneyland-to-cdg-airport',
      originId: dlp.id,
      destinationId: cdg.id,
      distanceKm: 45.0,
      estDurationMinutes: 45,
      sedanPriceEur: 70,
      economyVanPriceEur: 90,
      businessVanPriceEur: 120,
      minibusPriceEur: 180,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Transfer from Disneyland Paris to CDG Airport',
      metaTitle: 'Disneyland Paris to CDG Airport Shuttle | 70€ Fixed Rate',
      metaDescription: 'Direct hotel pickup from Disneyland Paris to CDG Airport. On-time guaranteed chauffeur.',
      overviewText: 'Seamless departure pickup from your Disneyland hotel lobby directly to Charles de Gaulle Airport terminals.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'disneyland-to-orly-airport',
      originId: dlp.id,
      destinationId: ory.id,
      distanceKm: 48.0,
      estDurationMinutes: 50,
      sedanPriceEur: 90,
      economyVanPriceEur: 110,
      businessVanPriceEur: 140,
      minibusPriceEur: 200,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Transfer from Disneyland Paris to Orly Airport',
      metaTitle: 'Disneyland Paris to Orly Airport (ORY) Shuttle',
      metaDescription: 'Punctual departure shuttle from Disneyland Paris hotels to Orly Terminals 1-4.',
      overviewText: 'Direct departure transfer from Disneyland Paris to Paris Orly Airport.',
      faqs: JSON.stringify([]),
    },

    // --- AIRPORT TO PARIS CITY ---
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
      overviewText: 'Arrive in Paris in style. Our professional chauffeurs welcome you at Charles de Gaulle Airport.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'paris-to-cdg-airport',
      originId: par.id,
      destinationId: cdg.id,
      distanceKm: 30.0,
      estDurationMinutes: 40,
      sedanPriceEur: 65,
      economyVanPriceEur: 85,
      businessVanPriceEur: 110,
      minibusPriceEur: 170,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Transfer from Paris City Center to CDG Airport',
      metaTitle: 'Paris City to CDG Airport Taxi & Chauffeur | 65€ Fixed',
      metaDescription: 'Hotel pickup in Paris to Charles de Gaulle Airport terminals.',
      overviewText: 'Punctual hotel pickup in Paris for your flight departure at Charles de Gaulle Airport.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'orly-to-paris-city',
      originId: ory.id,
      destinationId: par.id,
      distanceKm: 20.0,
      estDurationMinutes: 30,
      sedanPriceEur: 60,
      economyVanPriceEur: 80,
      businessVanPriceEur: 105,
      minibusPriceEur: 160,
      isActive: true,
      isFeatured: true,
      h1Heading: 'Private Transfer Orly Airport to Paris City Center',
      metaTitle: 'Orly Airport (ORY) to Paris City Taxi | Fixed 60€',
      metaDescription: 'Private door-to-door transfer from Orly Airport to central Paris.',
      overviewText: 'Fast and comfortable transfer from Paris Orly Airport to central Paris hotels.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'paris-to-orly-airport',
      originId: par.id,
      destinationId: ory.id,
      distanceKm: 20.0,
      estDurationMinutes: 30,
      sedanPriceEur: 60,
      economyVanPriceEur: 80,
      businessVanPriceEur: 105,
      minibusPriceEur: 160,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Transfer Paris City Center to Orly Airport',
      metaTitle: 'Paris City to Orly Airport (ORY) Taxi | Fixed 60€',
      metaDescription: 'Reliable pickup from Paris hotels to Orly Airport.',
      overviewText: 'Relax on your way to Orly Airport with our private hotel pickup service.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'beauvais-to-paris-city',
      originId: bva.id,
      destinationId: par.id,
      distanceKm: 85.0,
      estDurationMinutes: 75,
      sedanPriceEur: 120,
      economyVanPriceEur: 150,
      businessVanPriceEur: 180,
      minibusPriceEur: 250,
      isActive: true,
      isFeatured: true,
      h1Heading: 'Private Transfer Beauvais Airport to Paris City Center',
      metaTitle: 'Beauvais Airport (BVA) to Paris City Private Shuttle | 120€',
      metaDescription: 'Direct private transfer from Paris Beauvais Airport to central Paris.',
      overviewText: 'Avoid crowded public shuttle buses from Beauvais Airport with a direct private chauffeur.',
      faqs: JSON.stringify([]),
    },

    // --- PARIS & DISNEYLAND / VERSAILLES / STATIONS ---
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
      faqs: JSON.stringify([]),
    },
    {
      slug: 'versailles-to-paris',
      originId: vers.id,
      destinationId: par.id,
      distanceKm: 22.0,
      estDurationMinutes: 35,
      sedanPriceEur: 75,
      economyVanPriceEur: 95,
      businessVanPriceEur: 125,
      minibusPriceEur: 190,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Transfer Versailles to Paris City Center',
      metaTitle: 'Château de Versailles to Paris City Taxi | 75€ Fixed',
      metaDescription: 'Chauffeur pickup at Versailles Palace back to Paris hotels.',
      overviewText: 'Return comfortably from Versailles Palace to your Paris hotel.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'paris-to-chateau-de-versailles',
      originId: par.id,
      destinationId: vers.id,
      distanceKm: 22.0,
      estDurationMinutes: 35,
      sedanPriceEur: 75,
      economyVanPriceEur: 95,
      businessVanPriceEur: 125,
      minibusPriceEur: 190,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Chauffeur Transfer Paris to Château de Versailles',
      metaTitle: 'Paris to Palace of Versailles Private Taxi Transfer | 75€',
      metaDescription: 'Direct private transfer from Central Paris to Versailles Palace.',
      overviewText: 'Visit the grand Palace of Versailles comfortably without navigating crowded commuter trains.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'paris-train-stations-to-disneyland',
      originId: gdn.id,
      destinationId: dlp.id,
      distanceKm: 38.0,
      estDurationMinutes: 45,
      sedanPriceEur: 70,
      economyVanPriceEur: 90,
      businessVanPriceEur: 120,
      minibusPriceEur: 180,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Transfer Gare du Nord to Disneyland Paris',
      metaTitle: 'Gare du Nord to Disneyland Paris Shuttle | 70€ Fixed',
      metaDescription: 'Direct transfer from Eurostar Gare du Nord to Disneyland Paris.',
      overviewText: 'Driver greets you at the station platform exit holding a name sign for immediate transfer to Disney.',
      faqs: JSON.stringify([]),
    },
    {
      slug: 'paris-train-stations-to-paris',
      originId: gdn.id,
      destinationId: par.id,
      distanceKm: 10.0,
      estDurationMinutes: 20,
      sedanPriceEur: 45,
      economyVanPriceEur: 60,
      businessVanPriceEur: 80,
      minibusPriceEur: 120,
      isActive: true,
      isFeatured: false,
      h1Heading: 'Private Transfer Paris Train Stations to Hotel',
      metaTitle: 'Paris Train Stations (Gare du Nord/Gare de Lyon) to Hotel',
      metaDescription: 'Platform meet and greet from Eurostar & TGV trains to Paris hotels.',
      overviewText: 'Direct chauffeur pickup from Eurostar, Thalys, or TGV platforms to your hotel.',
      faqs: JSON.stringify([]),
    },
  ];

  for (const r of routesData) {
    await prisma.route.upsert({
      where: { slug: r.slug },
      update: {}, // Keep existing admin updates intact
      create: r,
    });
  }

  console.log('15 Core Routes upserted.');

  // 3. Create Sample Reviews only if review table is empty
  const reviewCount = await prisma.review.count();
  if (reviewCount === 0) {
    await prisma.review.createMany({
      data: [
        {
          authorName: 'Sarah & Family',
          location: 'London, UK',
          routeText: 'CDG Airport → Disneyland Paris',
          rating: 5,
          comment: 'Outstanding service! Our chauffeur met us directly inside CDG Terminal 2F holding a sign with my name. He helped with all 4 of our heavy suitcases and had baby & booster seats already installed in the clean Mercedes van. Fantastic start to our Disney holiday!',
        },
        {
          authorName: 'Michael R.',
          location: 'New York, USA',
          routeText: 'Orly Airport → Paris City Center',
          rating: 5,
          comment: 'Punctual, luxurious vehicle, and polite English-speaking driver. The fare was 100% fixed at 60€ with no meters or hidden fees. Paid the driver upon arrival at our hotel. Highly recommended!',
        },
        {
          authorName: 'Elena & David',
          location: 'Madrid, Spain',
          routeText: 'Beauvais Airport → Disneyland Paris',
          rating: 5,
          comment: 'Beauvais Airport is quite far from Disney, but our driver made the trip smooth and comfortable. Free booster seats for our kids, smooth driving, and great recommendations for Paris sightseeing.',
        },
        {
          authorName: 'Jean-Pierre M.',
          location: 'Montreal, Canada',
          routeText: 'Paris City → Château de Versailles',
          rating: 5,
          comment: 'Booked a private chauffeur for our family trip to Versailles Palace. The driver arrived 10 minutes early at our Paris hotel lobby and was waiting right on time for our return pickup. 10/10 service!',
        },
      ],
    });
    console.log('Sample reviews seeded.');
  }

  console.log('Seeding completed successfully! Bookings are preserved.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
