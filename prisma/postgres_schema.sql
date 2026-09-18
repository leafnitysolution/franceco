-- =================================================================
-- FastForward Shuttle - Full PostgreSQL Database Schema & Seed Data
-- =================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Location_shortCode_key" ON "Location"("shortCode");

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

-- =================================================================
-- 2. Seed Data (Locations, Core Routes & Verified Customer Reviews)
-- =================================================================

-- Seed Hub Locations
INSERT INTO "Location" ("id", "name", "shortCode", "category") VALUES
('loc_cdg', 'Paris Charles de Gaulle Airport (CDG)', 'CDG', 'AIRPORT'),
('loc_ory', 'Paris Orly Airport (ORY)', 'ORY', 'AIRPORT'),
('loc_bva', 'Paris Beauvais Tillé Airport (BVA)', 'BVA', 'AIRPORT'),
('loc_dlp', 'Disneyland Paris Hotels & Parks', 'DLP', 'AMUSEMENT_PARK'),
('loc_par', 'Paris City Center (All Arrondissements)', 'PAR', 'CITY_CENTER'),
('loc_gdn', 'Gare du Nord & Paris Train Stations', 'GDN', 'TRAIN_STATION'),
('loc_vers', 'Château de Versailles & Hotels', 'VERS', 'PALACE')
ON CONFLICT ("shortCode") DO NOTHING;

-- Seed Core Routes
INSERT INTO "Route" (
    "id", "slug", "isActive", "isFeatured", "originId", "destinationId",
    "distanceKm", "estDurationMinutes", "sedanPriceEur", "economyVanPriceEur", "businessVanPriceEur", "minibusPriceEur",
    "h1Heading", "metaTitle", "metaDescription", "overviewText", "faqs"
) VALUES
('rt_1', 'cdg-to-disneyland-paris', true, true, 'loc_cdg', 'loc_dlp', 45.0, 45, 70, 90, 120, 180, 'Private Transfer from CDG Airport to Disneyland Paris', 'CDG Airport to Disneyland Paris Shuttle | Fixed Fares from 70€', 'Book door-to-door private transfers from Paris Charles de Gaulle (CDG) to Disneyland Paris. Free child seats, flight tracking, and pay-on-arrival.', 'Enjoy a stress-free private transfer directly from Charles de Gaulle Airport (CDG) to your Disneyland Paris hotel. Your personal chauffeur meets you at arrivals with a personalized name sign.', '[{"question":"Where will I meet my driver at CDG Airport?","answer":"Your driver will meet you directly inside the arrivals hall after baggage claim holding a sign with your name."}]'),
('rt_2', 'orly-to-disneyland-paris', true, true, 'loc_ory', 'loc_dlp', 48.0, 50, 90, 110, 140, 200, 'Private Transfer from Orly Airport to Disneyland Paris', 'Orly Airport (ORY) to Disneyland Paris Taxi & Shuttle from 90€', 'Direct private shuttle service from Paris Orly Airport to Disneyland hotels & resorts.', 'Travel hassle-free between Paris Orly Airport (ORY) and Disneyland Paris. Avoid crowded public transport and expensive meters.', '[]'),
('rt_3', 'beauvais-to-disneyland-paris', true, true, 'loc_bva', 'loc_dlp', 110.0, 80, 130, 160, 190, 260, 'Direct Private Shuttle Beauvais Airport to Disneyland Paris', 'Beauvais Airport (BVA) to Disneyland Paris Private Transfer', 'Comfortable private shuttle from Paris Beauvais Airport to Disneyland Paris.', 'Paris Beauvais Airport is located 110 km north of Disneyland Paris. Skip the long multi-step shuttle buses.', '[]'),
('rt_4', 'disneyland-to-cdg-airport', true, false, 'loc_dlp', 'loc_cdg', 45.0, 45, 70, 90, 120, 180, 'Private Transfer from Disneyland Paris to CDG Airport', 'Disneyland Paris to CDG Airport Shuttle | 70€ Fixed Rate', 'Direct hotel pickup from Disneyland Paris to CDG Airport. On-time guaranteed chauffeur.', 'Seamless departure pickup from your Disneyland hotel lobby directly to Charles de Gaulle Airport terminals.', '[]'),
('rt_5', 'disneyland-to-orly-airport', true, false, 'loc_dlp', 'loc_ory', 48.0, 50, 90, 110, 140, 200, 'Private Transfer from Disneyland Paris to Orly Airport', 'Disneyland Paris to Orly Airport (ORY) Shuttle', 'Punctual departure shuttle from Disneyland Paris hotels to Orly Terminals 1-4.', 'Direct departure transfer from Disneyland Paris to Paris Orly Airport.', '[]'),
('rt_6', 'cdg-to-paris-city', true, true, 'loc_cdg', 'loc_par', 30.0, 40, 65, 85, 110, 170, 'Private Airport Transfer CDG to Paris City Center', 'CDG Airport to Paris City Center Taxi & Chauffeur | 65€ Fixed', 'Book your private transfer from Paris CDG Airport to any address or hotel in central Paris.', 'Arrive in Paris in style. Our professional chauffeurs welcome you at Charles de Gaulle Airport.', '[]'),
('rt_7', 'paris-to-cdg-airport', true, false, 'loc_par', 'loc_cdg', 30.0, 40, 65, 85, 110, 170, 'Private Transfer from Paris City Center to CDG Airport', 'Paris City to CDG Airport Taxi & Chauffeur | 65€ Fixed', 'Hotel pickup in Paris to Charles de Gaulle Airport terminals.', 'Punctual hotel pickup in Paris for your flight departure at Charles de Gaulle Airport.', '[]'),
('rt_8', 'orly-to-paris-city', true, true, 'loc_ory', 'loc_par', 20.0, 30, 60, 80, 105, 160, 'Private Transfer Orly Airport to Paris City Center', 'Orly Airport (ORY) to Paris City Taxi | Fixed 60€', 'Private door-to-door transfer from Orly Airport to central Paris.', 'Fast and comfortable transfer from Paris Orly Airport to central Paris hotels.', '[]'),
('rt_9', 'paris-to-orly-airport', true, false, 'loc_par', 'loc_ory', 20.0, 30, 60, 80, 105, 160, 'Private Transfer Paris City Center to Orly Airport', 'Paris City to Orly Airport (ORY) Taxi | Fixed 60€', 'Reliable pickup from Paris hotels to Orly Airport.', 'Relax on your way to Orly Airport with our private hotel pickup service.', '[]'),
('rt_10', 'beauvais-to-paris-city', true, true, 'loc_bva', 'loc_par', 85.0, 75, 120, 150, 180, 250, 'Private Transfer Beauvais Airport to Paris City Center', 'Beauvais Airport (BVA) to Paris City Private Shuttle | 120€', 'Direct private transfer from Paris Beauvais Airport to central Paris.', 'Avoid crowded public shuttle buses from Beauvais Airport with a direct private chauffeur.', '[]'),
('rt_11', 'paris-to-disneyland', true, true, 'loc_par', 'loc_dlp', 40.0, 45, 70, 90, 120, 180, 'Private Transfer Paris City Center to Disneyland Paris', 'Paris City to Disneyland Paris Shuttle | 70€ Fixed Rate', 'Direct family shuttle from central Paris hotels to Disneyland Paris.', 'Comfortable day trip or hotel transfer from central Paris directly to Disneyland Paris.', '[]'),
('rt_12', 'versailles-to-paris', true, false, 'loc_vers', 'loc_par', 22.0, 35, 75, 95, 125, 190, 'Private Transfer Versailles to Paris City Center', 'Château de Versailles to Paris City Taxi | 75€ Fixed', 'Chauffeur pickup at Versailles Palace back to Paris hotels.', 'Return comfortably from Versailles Palace to your Paris hotel.', '[]'),
('rt_13', 'paris-to-chateau-de-versailles', true, false, 'loc_par', 'loc_vers', 22.0, 35, 75, 95, 125, 190, 'Private Chauffeur Transfer Paris to Château de Versailles', 'Paris to Palace of Versailles Private Taxi Transfer | 75€', 'Direct private transfer from Central Paris to Versailles Palace.', 'Visit the grand Palace of Versailles comfortably without navigating crowded commuter trains.', '[]'),
('rt_14', 'paris-train-stations-to-disneyland', true, false, 'loc_gdn', 'loc_dlp', 38.0, 45, 70, 90, 120, 180, 'Private Transfer Gare du Nord to Disneyland Paris', 'Gare du Nord to Disneyland Paris Shuttle | 70€ Fixed', 'Direct transfer from Eurostar Gare du Nord to Disneyland Paris.', 'Driver greets you at the station platform exit holding a name sign for immediate transfer to Disney.', '[]'),
('rt_15', 'paris-train-stations-to-paris', true, false, 'loc_gdn', 'loc_par', 10.0, 20, 45, 60, 80, 120, 'Private Transfer Paris Train Stations to Hotel', 'Paris Train Stations (Gare du Nord/Gare de Lyon) to Hotel', 'Platform meet and greet from Eurostar & TGV trains to Paris hotels.', 'Direct chauffeur pickup from Eurostar, Thalys, or TGV platforms to your hotel.', '[]')
ON CONFLICT ("slug") DO NOTHING;

-- Seed Verified Customer Reviews
INSERT INTO "Review" ("id", "authorName", "location", "routeText", "rating", "comment", "isPublished") VALUES
('rev_1', 'Sarah & Family', 'London, UK', 'CDG Airport → Disneyland Paris', 5, 'Outstanding service! Our chauffeur met us directly inside CDG Terminal 2F holding a sign with my name. He helped with all 4 of our heavy suitcases and had baby & booster seats already installed in the clean Mercedes van. Fantastic start to our Disney holiday!', true),
('rev_2', 'Michael R.', 'New York, USA', 'Orly Airport → Paris City Center', 5, 'Punctual, luxurious vehicle, and polite English-speaking driver. The fare was 100% fixed at 60€ with no meters or hidden fees. Paid the driver upon arrival at our hotel. Highly recommended!', true),
('rev_3', 'Elena & David', 'Madrid, Spain', 'Beauvais Airport → Disneyland Paris', 5, 'Beauvais Airport is quite far from Disney, but our driver made the trip smooth and comfortable. Free booster seats for our kids, smooth driving, and great recommendations for Paris sightseeing.', true),
('rev_4', 'Jean-Pierre M.', 'Montreal, Canada', 'Paris City → Château de Versailles', 5, 'Booked a private chauffeur for our family trip to Versailles Palace. The driver arrived 10 minutes early at our Paris hotel lobby and was waiting right on time for our return pickup. 10/10 service!', true)
ON CONFLICT ("id") DO NOTHING;
