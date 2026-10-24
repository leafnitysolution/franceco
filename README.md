# FranceGo (FastForward Shuttle) - Production Booking & Management Platform

A high-converting, production-ready Airport & Disneyland Paris VIP Transfer Booking Platform for **FranceGo** (`FastForward Shuttle`). Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Prisma ORM**, **Tailwind CSS**, **Zustand**, Multi-Language Localization, and Dual HTML Email Notifications.

---

## 🚀 Key Features

### 🛒 High-Converting Public Booking Engine
- **Split-Screen & Hero Reservation Widget**: Instant transfer calculation for One-Way and Round-Trip journeys.
- **Dynamic Hub & Address Selectors**: Locations and routes synced in real-time from the database. Default hubs include Paris Charles de Gaulle (CDG), Orly (ORY), Beauvais (BVA), Disneyland Paris, Paris City Center, Gare du Nord, Versailles, Giverny, Fontainebleau, Champagne, Normandy, and more.
- **4-Tier Vehicle Fleet**:
  - **Berline Sedan**: 1–3 Passengers, 3 Luggage items
  - **Economy Minivan**: 1–8 Passengers, 8 Luggage items
  - **VIP Business Van**: 1–7 Passengers, 7 Luggage items
  - **Executive Minibus**: 1–16 Passengers, 16 Luggage items
- **Multi-Language Engine**: Interactive header selector supporting 6 languages (English, French, Spanish, Italian, German, Portuguese).
- **Free Child Seats & Pay on Arrival**: Complimentary rear-facing infant seats, child seats, and booster cushions with zero upfront credit card deposit required.
- **Dynamic SEO Route Pages**: Dedicated dynamic landing pages (`/transfers/[slug]`) with route distances, travel durations, and localized pricing.

### 🔒 Hardened Back-Office Admin Suite (`/ffs-portal-sec-99x`)
- **OWASP-Compliant Authentication**: Obfuscated secret admin URL path (`/ffs-portal-sec-99x/login`), timing-safe password verification via `crypto.timingSafeEqual`, 15-minute expiring session cookies (`HttpOnly`, `SameSite=Lax`), and rate-limited login attempts.
- **Reservations Control Center (`/ffs-portal-sec-99x/bookings`)**: Manage incoming bookings, filter by status (`PENDING`, `CONFIRMED`, `DISPATCHED`, `COMPLETED`, `CANCELLED`), view flight radar numbers, and dispatch chauffeurs with 1-Click WhatsApp messaging.
- **Routes & Dynamic Pricing Manager (`/ffs-portal-sec-99x/routes`)**: Add or edit routes and customize prices for all 4 vehicle tiers. Updates immediately reflect on the website and B2B API without code changes.
- **Locations & Hubs Manager (`/ffs-portal-sec-99x/locations`)**: Create and organize transfer hubs across Airports, Amusement Parks, Train Stations, City Centers, and Palaces/Monuments.
- **Reviews Moderation Panel (`/ffs-portal-sec-99x/reviews`)**: Real-time customer feedback ratings, approval toggles, and deletion controls.
- **Contact Inquiries CRM (`/ffs-portal-sec-99x/inquiries`)**: Full inquiry tracking with status toggles (`UNREAD`, `READ`, `REPLIED`, `ARCHIVED`).
- **Global Settings (`/ffs-portal-sec-99x/settings`)**: Configurable business phone numbers, dispatch email addresses, and operational notices.

### 🔌 Secure B2B Partner API Gateway
- **Direct Partner Bookings**: External travel agencies, hotels, and partner portals can transmit bookings directly via `POST /api/v1/partner/bookings` using `X-API-Key` authentication.
- **Live Route & Rate Catalog**: `GET /api/v1/partner/routes` provides external systems with live locations, route pairs, and current prices.
- **Status Polling**: `GET /api/v1/partner/bookings/[bookingRef]` allows partners to poll real-time transfer fulfillment statuses.

### 📧 Dual HTML Email Dispatch System
- **Passenger Confirmation Voucher**: Automated HTML receipt sent to `customerEmail` with unique Booking Reference, trip specifications, driver meet & greet instructions, and payment instructions.
- **Admin Office Alert**: Instant dispatch email sent to `ADMIN_DISPATCH_EMAIL` with complete customer details and direct 1-click WhatsApp chauffeur dispatch link.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15.0 (App Router, Server Components, Route Handlers)
- **UI & State**: React 19, Tailwind CSS, Lucide React, Zustand
- **Database & ORM**: SQLite (`dev.db`) / PostgreSQL with Prisma ORM 5.20+
- **Security**: Node.js `crypto` (Timing-safe authentication, expiring JWT session tokens), custom HTTP security headers (CSP, HSTS, X-Frame-Options)
- **Email Delivery**: Nodemailer with SMTP transport (Outlook, Gmail, or transactional provider)
- **Validation**: Zod schema validation

---

## ⚙️ Environment Variables Reference (`.env`)

Create or update your `.env` file with the following variables:

```env
# Database Connection (SQLite default or PostgreSQL)
DATABASE_URL="file:./dev.db"

# Admin Access Credentials
ADMIN_EMAIL="admin@fastforwardshuttle.com"
ADMIN_PASSWORD="YourSecureAdminPassword2026!"
JWT_SECRET="your_long_random_32_byte_secret_key_here"

# B2B Partner API Key (Required for Partner Gateway)
PARTNER_API_KEY="ffs_partner_live_secret_key_2026"

# Email SMTP Settings (For Confirmation & Dispatch Alerts)
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="projet15df@outlook.fr"
SMTP_PASS="your-email-app-password"
ADMIN_DISPATCH_EMAIL="projet15df@outlook.fr"

# External Reviews API (Optional)
TRIPADVISOR_API_KEY="your-tripadvisor-key"
TRIPADVISOR_LOCATION_ID="12345678"
GOOGLE_PLACES_API_KEY="your-google-places-key"
```

---

## 💻 Local Setup & Development

```bash
# 1. Install Dependencies
npm install

# 2. Sync Database Schema & Seed Default Locations/Routes
npx prisma db push
npm run seed

# 3. Start Local Development Server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.  
The Admin Portal is accessible at [http://localhost:3000/ffs-portal-sec-99x/login](http://localhost:3000/ffs-portal-sec-99x/login).

---

## 🚀 Building for Production

```bash
# Compile and build Next.js optimized production bundle
npm run build

# Start production server
npm start
```

For complete cloud hosting and production instructions (including Hostinger Cloud/Node.js, Ubuntu VPS with Nginx/PM2, and PostgreSQL migrations), see [`DEPLOYMENT.md`](DEPLOYMENT.md).  
For third-party developer integration specifications, see [`Api.md`](Api.md).
