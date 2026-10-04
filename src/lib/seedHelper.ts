import { db } from './db';

export async function ensureLocationCategoriesSeeded() {
  try {
    const defaultCats = [
      { key: 'AIRPORT', name: 'Paris Airports', sortOrder: 1 },
      { key: 'AMUSEMENT_PARK', name: 'Euro Disney & Theme Parks', sortOrder: 2 },
      { key: 'CITY_CENTER', name: 'Paris City & Hotels', sortOrder: 3 },
      { key: 'TRAIN_STATION', name: 'Paris Train Stations', sortOrder: 4 },
      { key: 'PALACE', name: 'Excursions & Historic Places', sortOrder: 5 },
    ];

    for (const cat of defaultCats) {
      await db.locationCategory.upsert({
        where: { key: cat.key },
        update: { name: cat.name, sortOrder: cat.sortOrder },
        create: cat,
      });
    }
  } catch (err) {
    console.error('Error auto-seeding categories:', err);
  }
}

let hasVerifiedSeed = false;

export async function ensureLocationsSeeded() {
  if (hasVerifiedSeed) return;
  try {
    const existingLocationCount = await db.location.count();
    const existingRouteCount = await db.route.count();
    if (existingLocationCount >= 14 && existingRouteCount >= 14) {
      hasVerifiedSeed = true;
      return;
    }

    await ensureLocationCategoriesSeeded();

    // 1. Hub Locations (Airports, Theme Parks, City, Stations, Excursions)
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

    const astx = await db.location.upsert({
      where: { shortCode: 'ASTX' },
      update: {},
      create: { name: 'Parc Astérix & Hotels', shortCode: 'ASTX', category: 'AMUSEMENT_PARK' },
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

    const giv = await db.location.upsert({
      where: { shortCode: 'GIV' },
      update: {},
      create: { name: 'Fondation Claude Monet Giverny & Village', shortCode: 'GIV', category: 'PALACE' },
    });

    const ftb = await db.location.upsert({
      where: { shortCode: 'FTB' },
      update: {},
      create: { name: 'Château de Fontainebleau & Barbizon', shortCode: 'FTB', category: 'PALACE' },
    });

    const chmp = await db.location.upsert({
      where: { shortCode: 'CHMP' },
      update: {},
      create: { name: 'Champagne Region & Reims Cathedral', shortCode: 'CHMP', category: 'PALACE' },
    });

    const norm = await db.location.upsert({
      where: { shortCode: 'NORM' },
      update: {},
      create: { name: 'Normandy D-Day Beaches & Caen', shortCode: 'NORM', category: 'PALACE' },
    });

    const msm = await db.location.upsert({
      where: { shortCode: 'MSM' },
      update: {},
      create: { name: 'Mont Saint-Michel Abbey & Bay', shortCode: 'MSM', category: 'PALACE' },
    });

    const loire = await db.location.upsert({
      where: { shortCode: 'LOIRE' },
      update: {},
      create: { name: 'Loire Valley Châteaux & Amboise', shortCode: 'LOIRE', category: 'PALACE' },
    });

    // 2. Default Routes Data
    const routesData = [
      // Airport to Disneyland
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

      // Airport to Paris City
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
        overviewText: 'Arrive in Paris in style with door-to-door private transfers from CDG Airport.',
        faqs: '[]',
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
        metaTitle: 'Orly Airport (ORY) to Paris City Center Chauffeur | 60€ Fixed',
        metaDescription: 'Direct private transfer service from Paris Orly Airport to Paris hotels.',
        overviewText: 'Fast and comfortable chauffeur transfers from Orly Airport to central Paris.',
        faqs: '[]',
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
        h1Heading: 'Private Transfer Beauvais Airport to Paris City',
        metaTitle: 'Beauvais Airport (BVA) to Paris City Center Shuttle',
        metaDescription: 'Direct private transfer from Paris Beauvais Airport to Paris hotels.',
        overviewText: 'Relax in comfort on your journey from Beauvais Airport into Paris city center.',
        faqs: '[]',
      },

      // Paris City to Disneyland
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

      // Giverny Monet Gardens Excursions
      {
        slug: 'paris-to-giverny',
        originId: par.id,
        destinationId: giv.id,
        distanceKm: 75.0,
        estDurationMinutes: 70,
        sedanPriceEur: 120,
        economyVanPriceEur: 150,
        businessVanPriceEur: 180,
        minibusPriceEur: 260,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Day Transfer Paris to Giverny (Monet Gardens)',
        metaTitle: 'Paris to Giverny Monet Gardens Private Chauffeur | 120€ Fixed Rate',
        metaDescription: 'Book private chauffeur transfers from Paris to Fondation Claude Monet in Giverny.',
        overviewText: 'Visit Claude Monet’s home and famous water lily gardens in Giverny with a dedicated private chauffeur.',
        faqs: '[]',
      },
      {
        slug: 'cdg-to-giverny',
        originId: cdg.id,
        destinationId: giv.id,
        distanceKm: 90.0,
        estDurationMinutes: 80,
        sedanPriceEur: 135,
        economyVanPriceEur: 165,
        businessVanPriceEur: 195,
        minibusPriceEur: 280,
        isActive: true,
        isFeatured: false,
        h1Heading: 'Private Transfer CDG Airport to Giverny Village',
        metaTitle: 'CDG Airport to Giverny Private Shuttle | Fixed Rate',
        metaDescription: 'Direct private transfer from Paris CDG Airport to Giverny hotels and gardens.',
        overviewText: 'Travel comfortably from CDG Airport directly to Normandy and Giverny village.',
        faqs: '[]',
      },

      // Versailles Excursions
      {
        slug: 'paris-to-versailles',
        originId: par.id,
        destinationId: vers.id,
        distanceKm: 22.0,
        estDurationMinutes: 35,
        sedanPriceEur: 65,
        economyVanPriceEur: 85,
        businessVanPriceEur: 110,
        minibusPriceEur: 160,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Transfer Paris to Château de Versailles',
        metaTitle: 'Paris to Versailles Palace Private Shuttle | 65€ Fixed',
        metaDescription: 'Direct private transfer from Paris hotels to Palace of Versailles.',
        overviewText: 'Enjoy a luxurious ride from central Paris to the historic Palace of Versailles.',
        faqs: '[]',
      },

      // Parc Astérix Excursions
      {
        slug: 'cdg-to-parc-asterix',
        originId: cdg.id,
        destinationId: astx.id,
        distanceKm: 25.0,
        estDurationMinutes: 25,
        sedanPriceEur: 60,
        economyVanPriceEur: 80,
        businessVanPriceEur: 110,
        minibusPriceEur: 160,
        isActive: true,
        isFeatured: false,
        h1Heading: 'Private Transfer CDG Airport to Parc Astérix',
        metaTitle: 'CDG Airport to Parc Astérix Shuttle | Fixed Rate',
        metaDescription: 'Direct shuttle from CDG Airport to Parc Astérix hotels & theme park.',
        overviewText: 'Fast and convenient transfer from CDG Airport directly to Parc Astérix.',
        faqs: '[]',
      },
      {
        slug: 'paris-to-parc-asterix',
        originId: par.id,
        destinationId: astx.id,
        distanceKm: 40.0,
        estDurationMinutes: 45,
        sedanPriceEur: 75,
        economyVanPriceEur: 95,
        businessVanPriceEur: 125,
        minibusPriceEur: 185,
        isActive: true,
        isFeatured: false,
        h1Heading: 'Private Transfer Paris to Parc Astérix',
        metaTitle: 'Paris City to Parc Astérix Shuttle | Fixed Rate',
        metaDescription: 'Direct private shuttle from central Paris hotels to Parc Astérix theme park.',
        overviewText: 'Enjoy a fun-filled family trip from Paris to Parc Astérix in a private van.',
        faqs: '[]',
      },

      // Fontainebleau Excursions
      {
        slug: 'paris-to-fontainebleau',
        originId: par.id,
        destinationId: ftb.id,
        distanceKm: 65.0,
        estDurationMinutes: 65,
        sedanPriceEur: 120,
        economyVanPriceEur: 150,
        businessVanPriceEur: 180,
        minibusPriceEur: 260,
        isActive: true,
        isFeatured: false,
        h1Heading: 'Private Transfer Paris to Château de Fontainebleau',
        metaTitle: 'Paris to Fontainebleau Private Transfer | Fixed Rate',
        metaDescription: 'Chauffeur service from Paris to Fontainebleau Palace & Barbizon village.',
        overviewText: 'Discover the royal Palace of Fontainebleau with private round-trip transfers from Paris.',
        faqs: '[]',
      },

      // Champagne Region Excursions
      {
        slug: 'paris-to-champagne',
        originId: par.id,
        destinationId: chmp.id,
        distanceKm: 145.0,
        estDurationMinutes: 100,
        sedanPriceEur: 220,
        economyVanPriceEur: 270,
        businessVanPriceEur: 320,
        minibusPriceEur: 440,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Day Excursion Paris to Champagne & Reims',
        metaTitle: 'Paris to Champagne Region Private Transfer | Reims Chauffeur',
        metaDescription: 'Luxury private chauffeur day trip from Paris to Reims and Champagne vineyards.',
        overviewText: 'Experience Champagne cellars and Reims Cathedral with your dedicated private driver.',
        faqs: '[]',
      },

      // Normandy Beaches Excursions
      {
        slug: 'paris-to-normandy',
        originId: par.id,
        destinationId: norm.id,
        distanceKm: 240.0,
        estDurationMinutes: 150,
        sedanPriceEur: 290,
        economyVanPriceEur: 350,
        businessVanPriceEur: 420,
        minibusPriceEur: 560,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Chauffeur Tour Paris to Normandy D-Day Beaches',
        metaTitle: 'Paris to Normandy D-Day Beaches Private Transfer',
        metaDescription: 'Custom private driver tour from Paris to Omaha Beach, Caen, and Normandy memorial sites.',
        overviewText: 'Explore Normandy’s historic WWII landing beaches and coastal towns.',
        faqs: '[]',
      },

      // Mont Saint-Michel Excursions
      {
        slug: 'paris-to-mont-saint-michel',
        originId: par.id,
        destinationId: msm.id,
        distanceKm: 360.0,
        estDurationMinutes: 210,
        sedanPriceEur: 380,
        economyVanPriceEur: 450,
        businessVanPriceEur: 530,
        minibusPriceEur: 700,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Day Excursion Paris to Mont Saint-Michel',
        metaTitle: 'Paris to Mont Saint-Michel Private Chauffeur Transfer',
        metaDescription: 'Exclusive door-to-door private driver service from Paris to Mont Saint-Michel island abbey.',
        overviewText: 'Visit the world-famous UNESCO World Heritage Mont Saint-Michel abbey.',
        faqs: '[]',
      },

      // Loire Valley Châteaux Excursions
      {
        slug: 'paris-to-loire-valley',
        originId: par.id,
        destinationId: loire.id,
        distanceKm: 210.0,
        estDurationMinutes: 140,
        sedanPriceEur: 320,
        economyVanPriceEur: 380,
        businessVanPriceEur: 450,
        minibusPriceEur: 600,
        isActive: true,
        isFeatured: true,
        h1Heading: 'Private Chauffeur Transfer Paris to Loire Valley Châteaux',
        metaTitle: 'Paris to Loire Valley Castles Private Transfer | Fixed Fare',
        metaDescription: 'Private chauffeur excursion from Paris to Chambord, Chenonceau, and Loire castles.',
        overviewText: 'Tour the grand Renaissance châteaux of the Loire Valley with your private driver.',
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
            routeText: 'Paris → Giverny Monet Gardens',
            rating: 5,
            comment: 'Wonderful day trip to Claude Monet gardens in Giverny. Our driver was extremely accommodating and professional!',
          },
        ],
      });
    }
    hasVerifiedSeed = true;
  } catch (err) {
    console.error('Error auto-seeding default locations:', err);
  }
}


