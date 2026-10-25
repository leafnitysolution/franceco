-- =============================================================================
-- FranceGo (FastForward Shuttle) - PostgreSQL Production Initialization Script
-- =============================================================================
-- This file creates all database tables, constraints, foreign keys, and indexes,
-- and inserts default categories, locations, routes with 4-tier pricing, and reviews.
--
-- USAGE ON CLIENT VPS:
--   psql -U your_postgres_user -d your_database_name -f database_init.sql
-- =============================================================================

-- Ensure transaction safety
BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Table: LocationCategory
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "LocationCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LocationCategory_key_key" ON "LocationCategory"("key");

-- -----------------------------------------------------------------------------
-- 2. Table: Location
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'AIRPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Location_shortCode_key" ON "Location"("shortCode");

-- -----------------------------------------------------------------------------
-- 3. Table: Route
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Route" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "originId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "estDurationMinutes" INTEGER NOT NULL,
    "sedanPriceEur" DOUBLE PRECISION NOT NULL,
    "economyVanPriceEur" DOUBLE PRECISION NOT NULL,
    "businessVanPriceEur" DOUBLE PRECISION NOT NULL,
    "minibusPriceEur" DOUBLE PRECISION NOT NULL DEFAULT 180,
    "h1Heading" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "overviewText" TEXT NOT NULL,
    "faqs" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Route_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Route_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Route_slug_key" ON "Route"("slug");
CREATE INDEX IF NOT EXISTS "Route_originId_idx" ON "Route"("originId");
CREATE INDEX IF NOT EXISTS "Route_destinationId_idx" ON "Route"("destinationId");

-- -----------------------------------------------------------------------------
-- 4. Table: Booking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "bookingRef" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "originId" TEXT,
    "destinationId" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "flightOrTrainNumber" TEXT,
    "returnDateTime" TIMESTAMP(3),
    "returnFlightNumber" TEXT,
    "vehicleTier" TEXT NOT NULL,
    "passengers" INTEGER NOT NULL DEFAULT 1,
    "luggageCount" INTEGER NOT NULL DEFAULT 1,
    "babySeats" INTEGER NOT NULL DEFAULT 0,
    "boosterSeats" INTEGER NOT NULL DEFAULT 0,
    "totalFareEur" DOUBLE PRECISION NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Booking_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_bookingRef_key" ON "Booking"("bookingRef");
CREATE INDEX IF NOT EXISTS "Booking_originId_idx" ON "Booking"("originId");
CREATE INDEX IF NOT EXISTS "Booking_destinationId_idx" ON "Booking"("destinationId");
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");

-- -----------------------------------------------------------------------------
-- 5. Table: Review
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Paris, France',
    "routeText" TEXT NOT NULL DEFAULT 'Paris Airport Transfer',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 6. Table: ContactSubmission
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL DEFAULT 'General Transfer Inquiry',
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- DATA SEEDING (DEFAULT INITIAL DATA)
-- =============================================================================

-- 1. Insert Location Categories
INSERT INTO "LocationCategory" ("id", "key", "name", "sortOrder", "createdAt", "updatedAt")
VALUES
    ('cat_airport', 'AIRPORT', 'Paris Airports', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_disney', 'AMUSEMENT_PARK', 'Euro Disney & Theme Parks', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_city', 'CITY_CENTER', 'Paris City & Hotels', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_station', 'TRAIN_STATION', 'Paris Train Stations', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_palace', 'PALACE', 'Excursions & Historic Places', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- 2. Insert Hub Locations
INSERT INTO "Location" ("id", "shortCode", "name", "category", "createdAt", "updatedAt")
VALUES
    ('loc_cdg', 'CDG', 'Paris Charles de Gaulle Airport (CDG)', 'AIRPORT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_ory', 'ORY', 'Paris Orly Airport (ORY)', 'AIRPORT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_bva', 'BVA', 'Paris Beauvais Tillé Airport (BVA)', 'AIRPORT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_dlp', 'DLP', 'Disneyland Paris Hotels & Parks', 'AMUSEMENT_PARK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_astx', 'ASTX', 'Parc Astérix & Hotels', 'AMUSEMENT_PARK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_par', 'PAR', 'Paris City Center (All Arrondissements)', 'CITY_CENTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_gdn', 'GDN', 'Gare du Nord & Paris Train Stations', 'TRAIN_STATION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_vers', 'VERS', 'Château de Versailles & Hotels', 'PALACE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_giv', 'GIV', 'Fondation Claude Monet Giverny & Village', 'PALACE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_ftb', 'FTB', 'Château de Fontainebleau & Barbizon', 'PALACE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_chmp', 'CHMP', 'Champagne Region & Reims Cathedral', 'PALACE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_norm', 'NORM', 'Normandy D-Day Beaches & Caen', 'PALACE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_msm', 'MSM', 'Mont Saint-Michel Abbey & Bay', 'PALACE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc_loire', 'LOIRE', 'Loire Valley Châteaux & Amboise', 'PALACE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("shortCode") DO NOTHING;

-- 3. Insert Core Routes with Complete 4-Tier Pricing
INSERT INTO "Route" (
    "id", "slug", "isActive", "isFeatured", "originId", "destinationId",
    "distanceKm", "estDurationMinutes",
    "sedanPriceEur", "economyVanPriceEur", "businessVanPriceEur", "minibusPriceEur",
    "h1Heading", "metaTitle", "metaDescription", "overviewText", "faqs",
    "createdAt", "updatedAt"
)
VALUES
    (
        'route_cdg_dlp', 'cdg-to-disneyland-paris', true, true, 'loc_cdg', 'loc_dlp',
        45.0, 45, 70.0, 90.0, 120.0, 180.0,
        'Private Transfer from CDG Airport to Disneyland Paris',
        'CDG Airport to Disneyland Paris Shuttle | Fixed Fares from 70€',
        'Book door-to-door private transfers from Paris Charles de Gaulle (CDG) to Disneyland Paris.',
        'Enjoy a stress-free private transfer directly from Charles de Gaulle Airport (CDG) to your Disneyland Paris hotel.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_ory_dlp', 'orly-to-disneyland-paris', true, true, 'loc_ory', 'loc_dlp',
        48.0, 50, 90.0, 110.0, 140.0, 200.0,
        'Private Transfer from Orly Airport to Disneyland Paris',
        'Orly Airport (ORY) to Disneyland Paris Taxi & Shuttle from 90€',
        'Direct private shuttle service from Paris Orly Airport to Disneyland hotels & resorts.',
        'Travel hassle-free between Paris Orly Airport (ORY) and Disneyland Paris.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_bva_dlp', 'beauvais-to-disneyland-paris', true, true, 'loc_bva', 'loc_dlp',
        110.0, 80, 130.0, 160.0, 190.0, 260.0,
        'Direct Private Shuttle Beauvais Airport to Disneyland Paris',
        'Beauvais Airport (BVA) to Disneyland Paris Private Transfer',
        'Comfortable private shuttle from Paris Beauvais Airport to Disneyland Paris.',
        'Paris Beauvais Airport is located 110 km north of Disneyland Paris.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_cdg_par', 'cdg-to-paris-city', true, true, 'loc_cdg', 'loc_par',
        30.0, 40, 65.0, 85.0, 110.0, 170.0,
        'Private Airport Transfer CDG to Paris City Center',
        'CDG Airport to Paris City Center Taxi & Chauffeur | 65€ Fixed',
        'Book your private transfer from Paris CDG Airport to any address or hotel in central Paris.',
        'Arrive in Paris in style with door-to-door private transfers from CDG Airport.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_ory_par', 'orly-to-paris-city', true, true, 'loc_ory', 'loc_par',
        20.0, 30, 60.0, 80.0, 105.0, 160.0,
        'Private Transfer Orly Airport to Paris City Center',
        'Orly Airport (ORY) to Paris City Center Chauffeur | 60€ Fixed',
        'Direct private transfer service from Paris Orly Airport to Paris hotels.',
        'Fast and comfortable chauffeur transfers from Orly Airport to central Paris.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_bva_par', 'beauvais-to-paris-city', true, true, 'loc_bva', 'loc_par',
        85.0, 75, 120.0, 150.0, 180.0, 250.0,
        'Private Transfer Beauvais Airport to Paris City',
        'Beauvais Airport (BVA) to Paris City Center Shuttle',
        'Direct private transfer from Paris Beauvais Airport to Paris hotels.',
        'Relax in comfort on your journey from Beauvais Airport into Paris city center.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_dlp', 'paris-to-disneyland', true, true, 'loc_par', 'loc_dlp',
        40.0, 45, 70.0, 90.0, 120.0, 180.0,
        'Private Transfer Paris City Center to Disneyland Paris',
        'Paris City to Disneyland Paris Shuttle | 70€ Fixed Rate',
        'Direct family shuttle from central Paris hotels to Disneyland Paris.',
        'Comfortable day trip or hotel transfer from central Paris directly to Disneyland Paris.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_giv', 'paris-to-giverny', true, true, 'loc_par', 'loc_giv',
        75.0, 70, 120.0, 150.0, 180.0, 260.0,
        'Private Day Transfer Paris to Giverny (Monet Gardens)',
        'Paris to Giverny Monet Gardens Private Chauffeur | 120€ Fixed Rate',
        'Book private chauffeur transfers from Paris to Fondation Claude Monet in Giverny.',
        'Visit Claude Monet’s home and famous water lily gardens in Giverny with a dedicated private chauffeur.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_cdg_giv', 'cdg-to-giverny', true, false, 'loc_cdg', 'loc_giv',
        90.0, 80, 135.0, 165.0, 195.0, 280.0,
        'Private Transfer CDG Airport to Giverny Village',
        'CDG Airport to Giverny Private Shuttle | Fixed Rate',
        'Direct private transfer from Paris CDG Airport to Giverny hotels and gardens.',
        'Travel comfortably from CDG Airport directly to Normandy and Giverny village.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_vers', 'paris-to-versailles', true, true, 'loc_par', 'loc_vers',
        22.0, 35, 65.0, 85.0, 110.0, 160.0,
        'Private Transfer Paris to Château de Versailles',
        'Paris to Versailles Palace Private Shuttle | 65€ Fixed',
        'Direct private transfer from Paris hotels to Palace of Versailles.',
        'Enjoy a luxurious ride from central Paris to the historic Palace of Versailles.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_cdg_astx', 'cdg-to-parc-asterix', true, false, 'loc_cdg', 'loc_astx',
        25.0, 25, 60.0, 80.0, 110.0, 160.0,
        'Private Transfer CDG Airport to Parc Astérix',
        'CDG Airport to Parc Astérix Shuttle | Fixed Rate',
        'Direct shuttle from CDG Airport to Parc Astérix hotels & theme park.',
        'Fast and convenient transfer from CDG Airport directly to Parc Astérix.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_astx', 'paris-to-parc-asterix', true, false, 'loc_par', 'loc_astx',
        40.0, 45, 75.0, 95.0, 125.0, 185.0,
        'Private Transfer Paris to Parc Astérix',
        'Paris City to Parc Astérix Shuttle | Fixed Rate',
        'Direct private shuttle from central Paris hotels to Parc Astérix theme park.',
        'Enjoy a fun-filled family trip from Paris to Parc Astérix in a private van.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_ftb', 'paris-to-fontainebleau', true, false, 'loc_par', 'loc_ftb',
        65.0, 65, 120.0, 150.0, 180.0, 260.0,
        'Private Transfer Paris to Château de Fontainebleau',
        'Paris to Fontainebleau Private Transfer | Fixed Rate',
        'Chauffeur service from Paris to Fontainebleau Palace & Barbizon village.',
        'Discover the royal Palace of Fontainebleau with private round-trip transfers from Paris.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_chmp', 'paris-to-champagne', true, true, 'loc_par', 'loc_chmp',
        145.0, 100, 220.0, 270.0, 320.0, 440.0,
        'Private Day Excursion Paris to Champagne & Reims',
        'Paris to Champagne Region Private Transfer | Reims Chauffeur',
        'Luxury private chauffeur day trip from Paris to Reims and Champagne vineyards.',
        'Experience Champagne cellars and Reims Cathedral with your dedicated private driver.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_norm', 'paris-to-normandy', true, true, 'loc_par', 'loc_norm',
        240.0, 150, 290.0, 350.0, 420.0, 560.0,
        'Private Chauffeur Tour Paris to Normandy D-Day Beaches',
        'Paris to Normandy D-Day Beaches Private Transfer',
        'Custom private driver tour from Paris to Omaha Beach, Caen, and Normandy memorial sites.',
        'Explore Normandy’s historic WWII landing beaches and coastal towns.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_msm', 'paris-to-mont-saint-michel', true, true, 'loc_par', 'loc_msm',
        360.0, 210, 380.0, 450.0, 530.0, 700.0,
        'Private Day Excursion Paris to Mont Saint-Michel',
        'Paris to Mont Saint-Michel Private Chauffeur Transfer',
        'Exclusive door-to-door private driver service from Paris to Mont Saint-Michel island abbey.',
        'Visit the world-famous UNESCO World Heritage Mont Saint-Michel abbey.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'route_par_loire', 'paris-to-loire-valley', true, true, 'loc_par', 'loc_loire',
        210.0, 140, 320.0, 380.0, 450.0, 600.0,
        'Private Chauffeur Transfer Paris to Loire Valley Châteaux',
        'Paris to Loire Valley Castles Private Transfer | Fixed Fare',
        'Private chauffeur excursion from Paris to Chambord, Chenonceau, and Loire castles.',
        'Tour the grand Renaissance châteaux of the Loire Valley with your private driver.',
        '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
ON CONFLICT ("slug") DO NOTHING;

-- 4. Insert Initial Verified Reviews
INSERT INTO "Review" ("id", "authorName", "location", "routeText", "rating", "comment", "isPublished", "createdAt")
VALUES
    (
        'rev_1', 'Sarah & Family', 'London, UK', 'CDG Airport → Disneyland Paris', 5,
        'Outstanding service! Our chauffeur met us directly inside CDG Terminal 2F holding a sign with my name. Highly recommended!',
        true, CURRENT_TIMESTAMP
    ),
    (
        'rev_2', 'Michael R.', 'New York, USA', 'Orly Airport → Paris City Center', 5,
        'Punctual, luxurious vehicle, and polite English-speaking driver. The fare was 100% fixed at 60€ with no meters or hidden fees.',
        true, CURRENT_TIMESTAMP
    ),
    (
        'rev_3', 'Elena & David', 'Madrid, Spain', 'Paris → Giverny Monet Gardens', 5,
        'Wonderful day trip to Claude Monet gardens in Giverny. Our driver was extremely accommodating and professional!',
        true, CURRENT_TIMESTAMP
    )
ON CONFLICT ("id") DO NOTHING;

-- Commit transaction
COMMIT;
