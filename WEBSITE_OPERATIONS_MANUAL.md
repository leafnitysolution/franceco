# FranceGo (FastForward Shuttle) - Complete Website Working & Architecture Manual

This comprehensive guide details the complete end-to-end architecture, user journeys, automated dispatch pipelines, dynamic admin management engine, B2B partner gateway, and security infrastructure for **FranceGo** (`FastForward Shuttle`).

---

## 📋 Table of Contents
1. [System Overview & High-Level Architecture](#1-system-overview--high-level-architecture)
2. [Public User Journey & Booking Engine](#2-public-user-journey--booking-engine)
3. [Dynamic Admin Panel Sync System](#3-dynamic-admin-panel-sync-system)
4. [Automated Booking, Confirmation & Email Pipeline](#4-automated-booking-confirmation--email-pipeline)
5. [Back-Office Admin Suite (`/ffs-portal-sec-99x`)](#5-back-office-admin-suite-ffs-portal-sec-99x)
6. [B2B Partner API Gateway](#6-b2b-partner-api-gateway)
7. [External Third-Party Integrations](#7-external-third-party-integrations)
8. [Database Schema & Entity Relationships](#8-database-schema--entity-relationships)
9. [Enterprise Security Architecture (OWASP Compliance)](#9-enterprise-security-architecture-owasp-compliance)
10. [Operations, Troubleshooting & Maintenance Playbook](#10-operations-troubleshooting--maintenance-playbook)

---

## 1. System Overview & High-Level Architecture

FranceGo is built on a modern full-stack TypeScript architecture using **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, and **Tailwind CSS**. It serves two primary audiences:
1. **Public Travelers & Tourists**: Searching routes, viewing upfront vehicle tier prices, and booking transfers with zero deposit.
2. **Fleet Operations & Dispatch Admins**: Managing reservations, updating routes and pricing in real time, assigning chauffeurs, and monitoring customer reviews.
3. **B2B Travel Partners & Affiliates**: Integrating external travel portals directly into FranceGo via a secure API channel.

### System Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["Clients & Ingestion Channels"]
        WebUser["Public Website Visitor<br>(Mobile / Desktop Web)"]
        PartnerAPI["B2B Travel Partners<br>(Agencies / Portals)"]
        AdminUser["Operations Admin<br>(/ffs-portal-sec-99x)"]
    end

    subgraph SecurityLayer["Edge & Security Layer (Middleware)"]
        SecHeaders["HTTP Security Headers<br>(CSP, HSTS, X-Frame-Options)"]
        AuthGuard["Admin Session Guard<br>(HttpOnly Cookie + Expiring JWT)"]
        APIKeyGuard["Timing-Safe API Key Guard<br>(X-API-Key Validator)"]
    end

    subgraph AppRouter["Next.js 15 App Router"]
        subgraph PublicRoutes["Public Pages & Booking Engine"]
        Home["Homepage (/)"]
        BookPage["Dedicated Booking (/book)"]
        DynamicRoutes["Route Landing Pages (/transfers/[slug])"]
        Contact["Contact & Inquiries (/contact-us)"]
        Widget["BookingWidget Component"]
        end

        subgraph APIRoutes["REST API Endpoints"]
        APIBooking["POST /api/bookings<br>(Public Booking)"]
        APIPartnerBook["POST /api/v1/partner/bookings<br>(B2B Booking)"]
        APIPartnerRoutes["GET /api/v1/partner/routes<br>(Live Rates Catalog)"]
        APIPartnerStatus["GET /api/v1/partner/bookings/[ref]<br>(Status Polling)"]
        APIReviews["GET /api/reviews/external<br>(TripAdvisor/Google Sync)"]
        APIContact["POST /api/contact<br>(Inquiry Submissions)"]
        end

        subgraph AdminSuite["Admin Portal (/ffs-portal-sec-99x)"]
        AdminDash["Dashboard & KPIs"]
        AdminBookings["Bookings & 1-Click WhatsApp"]
        AdminRoutes["Routes & Dynamic Pricing"]
        AdminLocs["Locations & Hubs"]
        AdminReviews["Review Moderation"]
        AdminCRM["Contact Inquiries CRM"]
        end
    end

    subgraph Services["Core Services & External Providers"]
        DB[(Prisma ORM<br>SQLite / PostgreSQL)]
        Nodemailer["Transactional Mailer<br>(Passenger Voucher & Admin Alert)"]
        WhatsApp["WhatsApp Dispatch Link Generator"]
        TripAdvisorAPI["TripAdvisor Content API"]
    end

    %% Flow Connections
    WebUser --> SecHeaders --> PublicRoutes
    PartnerAPI --> APIKeyGuard --> APIRoutes
    AdminUser --> AuthGuard --> AdminSuite

    PublicRoutes --> Widget --> APIBooking
    APIBooking --> DB
    APIBooking --> Nodemailer
    APIPartnerBook --> DB
    APIPartnerBook --> Nodemailer

    AdminRoutes --> DB
    AdminLocs --> DB
    AdminBookings --> DB
    AdminBookings --> WhatsApp

    DB -.-> Widget
    DB -.-> DynamicRoutes
    DB -.-> APIPartnerRoutes
```

---

## 2. Public User Journey & Booking Engine

The public booking system is designed for high conversion with transparent fixed pricing and zero upfront payment.

### Step 1: Destination & Transfer Selection
Travelers can initiate bookings via three points of entry:
1. **Hero Booking Widget** on the homepage (`/`).
2. **Full-Page Dedicated Booking Portal** (`/book`).
3. **SEO Route Landing Pages** (`/transfers/[slug]`).

The passenger specifies:
- **Trip Type**: `One-Way` or `Round-Trip`.
- **Pickup Location** (Origin): Selected from dynamic database hubs (e.g., `CDG Airport`, `Orly`, `Disneyland Paris`, `Paris City Center`).
- **Drop-off Location** (Destination): Populates paired destination options.
- **Pickup Date & Time**: Clean dropdown pickers with blank placeholder prompts.
- **Return Date & Time**: Appears dynamically when `Round-Trip` is selected.
- **Passengers & Luggage**: Defaults to `1 passenger` and `1 luggage` item with numeric steppers.
- **Child Safety Accessories**: Free checkboxes/steppers for Infant Seats (0–12 mo), Child Car Seats (1–4 yrs), and Booster Seats (4–10 yrs).

### Step 2: Real-Time Dynamic Pricing Calculation
As soon as the traveler selects an Origin and Destination:
1. The client queries the live database routes (or falls back to standard tier baselines).
2. The pricing algorithm computes exact fares for all **4 Vehicle Tiers**:
   - **Berline Sedan**: 1–3 Passengers, 3 Bags (e.g., CDG to DLP: €70)
   - **Economy Minivan**: 1–8 Passengers, 8 Bags (e.g., CDG to DLP: €90)
   - **VIP Business Van**: 1–7 Passengers, 7 Bags (e.g., CDG to DLP: €120)
   - **Executive Minibus**: 1–16 Passengers, 16 Bags (e.g., CDG to DLP: €180)
3. For **Round-Trip** selections, return pricing is automatically calculated and displayed upfront.

### Step 3: Passenger Details & Meet-and-Greet Instructions
The traveler enters:
- **Full Name**, **Email Address**, and **Mobile Phone Number** (using a 235-country searchable phone dial code selector).
- **Exact Pickup & Drop-off Addresses**: Hotel names, terminal numbers, or apartment street addresses.
- **Flight or Train Number**: Enables the dispatch team to monitor incoming flight radar and track arrival delays.
- **Special Notes**: VIP meet-and-greet preferences or extra luggage requirements.

### Step 4: Submission & Instant Confirmation
When the user clicks **Confirm Reservation**:
1. Payload is sent to `POST /api/bookings`.
2. A unique booking reference is generated (`FGO-XXXXXX`).
3. The booking is stored in the database with status `PENDING`.
4. The traveler is redirected to the branded confirmation screen: `/booking-confirmation/[bookingRef]`.
5. Confirmation emails are dispatched in the background.

---

## 3. Dynamic Admin Panel Sync System

A primary architectural strength of FranceGo is **Real-Time Dynamic Synchronization**:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Operations Admin
    participant AdminUI as Admin Panel (/ffs-portal-sec-99x)
    participant DB as Prisma Database (db.route / db.location)
    participant PublicUI as Public Booking Widget (/book)
    participant PartnerAPI as B2B Partner API (/api/v1/partner/routes)

    Admin->>AdminUI: Updates Route Price: CDG → Disneyland Sedan = €75 (was €70)
    AdminUI->>DB: UPDATE Route SET sedanPriceEur = 75
    Note over DB: Immediate commit to SQLite / PostgreSQL

    PublicUI->>DB: Next passenger opens /book (queries active routes)
    DB-->>PublicUI: Returns updated €75 rate
    Note over PublicUI: Traveler sees new €75 rate instantly!

    PartnerAPI->>DB: Travel agency requests GET /api/v1/partner/routes
    DB-->>PartnerAPI: Returns updated €75 rate
    Note over PartnerAPI: External partner sees new €75 rate instantly!
```

- **Zero Redeployments Needed**: Adding a new route, changing a price, or adding a location in `/ffs-portal-sec-99x` instantly updates the live public site, the header and footer navigation menus, and the B2B Partner API.

---

## 4. Automated Booking, Confirmation & Email Pipeline

Every reservation triggers an automated notification and dispatch pipeline handled by `src/lib/email.ts`:

### 1. Dual Email Dispatch System
- **Passenger Confirmation Voucher**:
  - Sent immediately to the customer's email address.
  - Contains Booking Reference, flight details, pickup/dropoff addresses, vehicle specifications, and driver meetup guidelines (e.g., driver holding name board at arrival gate).
  - Highlights the **"Zero Deposit / Pay Chauffeur on Arrival"** policy.
- **Admin Office Alert**:
  - Sent immediately to `ADMIN_DISPATCH_EMAIL`.
  - Displays full trip specs, flight details, passenger telephone, and calculated fare.
  - Includes a direct **1-Click WhatsApp Driver Dispatch Link**.

### 2. Security & Sanitization in Emails
All dynamic passenger inputs (name, phone, flight numbers, notes) pass through an HTML entity escaping filter (`escapeHtml`) before email template injection, neutralizing any potential email client injection attacks.

---

## 5. Back-Office Admin Suite (`/ffs-portal-sec-99x`)

The operations portal is located at the hardened URL:
`https://<your-domain>/ffs-portal-sec-99x`

### Sub-Modules Breakdown:

| Module | URL Path | Functionality |
|---|---|---|
| **Dashboard** | `/ffs-portal-sec-99x` | High-level metrics: Total Bookings, Active Routes, Verified Reviews, Inquiry count, quick action links. |
| **Bookings Manager** | `/ffs-portal-sec-99x/bookings` | Filter by status (`PENDING`, `CONFIRMED`, `DISPATCHED`, `COMPLETED`, `CANCELLED`), search by customer name/email, view flight radar numbers, and trigger 1-Click WhatsApp chauffeur assignments. |
| **Routes & Dynamic Pricing** | `/ffs-portal-sec-99x/routes` | Add new routes, toggle active status, adjust prices for Sedan, Economy Van, Business Van, and Minibus, edit travel distance/time, and configure SEO metadata (H1, meta title, meta description, route FAQs). |
| **Locations & Categories** | `/ffs-portal-sec-99x/locations` | Manage transfer hubs across categories: Airports (`CDG`, `ORY`, `BVA`), Amusement Parks (`DLP`, `AST`), Train Stations (`GDN`), City Centers (`PAR`), and Châteaux/Palaces (`VERS`, `GIV`, `FON`, `CHA`, `NOR`, `MSM`, `LOI`). |
| **Reviews Moderation** | `/ffs-portal-sec-99x/reviews` | View submitted traveler reviews, toggle publication status (live on homepage vs hidden), and inspect rating distributions. |
| **Contact Inquiries CRM** | `/ffs-portal-sec-99x/inquiries` | Review incoming customer inquiries from `/contact-us`, toggle status (`UNREAD`, `READ`, `REPLIED`, `ARCHIVED`), and reply to quotes. |
| **Global Settings** | `/ffs-portal-sec-99x/settings` | Configure global business phone, WhatsApp dispatch number, and operational email targets. |

---

## 6. B2B Partner API Gateway

FranceGo includes a production-ready enterprise B2B gateway for external travel agencies and affiliates.

### Authentication
All requests must include the secret partner header:
```http
X-API-Key: ffs_partner_live_secret_key_2026
```

### Endpoints
1. `GET /api/v1/partner/routes`
   - Returns all active locations and live route pricing.
2. `POST /api/v1/partner/bookings`
   - Creates a new booking in the database, sends confirmation emails, and tags the booking in the Admin Panel as `[B2B Partner Booking | Ref: ...]`.
3. `GET /api/v1/partner/bookings/[bookingRef]`
   - Polls the live fulfillment status (`PENDING`, `CONFIRMED`, `DISPATCHED`, `COMPLETED`, `CANCELLED`).

*(For full code examples in JavaScript, PHP, Python, and cURL, refer to [`Api.md`](Api.md).)*

---

## 7. External Third-Party Integrations

1. **TripAdvisor Content API**:
   - Syncs verified 5-star traveler review counts and Travellers' Choice awards directly to the homepage badge via `/api/reviews/external`.
   - Results are cached for 1 hour to prevent API rate-limit exhaustion.
2. **Google Places API**:
   - Supports Google Business Profile ratings and review sync.
3. **Transactional Mail SMTP Transport**:
   - Connects to Microsoft 365 / Outlook (`smtp-mail.outlook.com:587`), Gmail, or any SMTP service.
   - Non-blocking design: if SMTP credentials are temporarily unavailable, bookings are still safely committed to the database.

---

## 8. Database Schema & Entity Relationships

The database is managed via Prisma ORM (`prisma/schema.prisma`):

```mermaid
erDiagram
    LOCATION ||--o{ ROUTE : "originates"
    LOCATION ||--o{ ROUTE : "terminates"
    LOCATION ||--o{ BOOKING : "pickup origin"
    LOCATION ||--o{ BOOKING : "dropoff destination"

    LOCATION {
        string id PK
        string shortCode UK
        string name
        string category
        datetime createdAt
        datetime updatedAt
    }

    ROUTE {
        string id PK
        string slug UK
        string originId FK
        string destinationId FK
        int distanceKm
        int estDurationMinutes
        int sedanPriceEur
        int economyVanPriceEur
        int businessVanPriceEur
        int minibusPriceEur
        boolean isActive
        boolean isFeatured
        string h1Heading
        string metaTitle
        string metaDescription
        string overviewText
        string faqs
        datetime createdAt
        datetime updatedAt
    }

    BOOKING {
        string id PK
        string bookingRef UK
        string status
        string originId FK
        string destinationId FK
        string pickupAddress
        string dropoffAddress
        datetime pickupDateTime
        datetime returnDateTime
        string vehicleTier
        int passengers
        int luggageCount
        int babySeats
        int boosterSeats
        int totalFareEur
        string customerName
        string customerEmail
        string customerPhone
        string flightOrTrainNumber
        string notes
        datetime createdAt
        datetime updatedAt
    }

    REVIEW {
        string id PK
        string authorName
        string authorLocation
        int rating
        string comment
        string routeTag
        boolean isPublished
        datetime createdAt
    }

    ADMIN {
        string id PK
        string email UK
        string passwordHash
        datetime createdAt
    }

    CONTACT_INQUIRY {
        string id PK
        string name
        string email
        string phone
        string subject
        string message
        string status
        datetime createdAt
    }

    SETTINGS {
        string id PK
        string key UK
        string value
    }
```

---

## 9. Enterprise Security Architecture (OWASP Compliance)

FranceGo has undergone rigorous OWASP security hardening:

1. **Obfuscated Admin Path**: The admin portal is shielded behind `/ffs-portal-sec-99x`, eliminating automated scans against standard `/admin` or `/wp-admin` URLs.
2. **Timing-Attack Resistance**: Authentication uses `crypto.timingSafeEqual` for both password verification and `X-API-Key` checks, protecting against micro-timing analysis.
3. **Expiring Signed Session Tokens**: Admin logins generate 15-minute expiring signed tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
4. **Parameterized SQL Queries**: All database operations use Prisma ORM's parameterized engine, providing full defense against SQL Injection.
5. **XSS & Output Sanitization**: React 19 inherently escapes JSX output, and email templates sanitize all dynamic strings through `escapeHtml`.
6. **HTTP Security Headers**: Enforced across every route in `next.config.js`:
   - `Content-Security-Policy`: Restricts unauthorized script injection.
   - `Strict-Transport-Security`: Forces TLS encryption for 2 years (`max-age=63072000`).
   - `X-Frame-Options: DENY`: Prevents clickjacking attacks.
   - `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `poweredByHeader: false`: Strips `X-Powered-By: Next.js` headers to conceal technology versions.

---

## 10. Operations, Troubleshooting & Maintenance Playbook

### A. How Flight Delays are Handled
Chauffeurs do not rely solely on scheduled pickup times. Chauffeurs check live flight radar using the customer's provided `flightOrTrainNumber`. If a flight is delayed 2 hours, the chauffeur adjusts their arrival time accordingly. No delay fees are charged.

### B. Updating Chauffeur Dispatch Numbers
To change the dispatch WhatsApp phone number:
1. Log in to `/ffs-portal-sec-99x/settings`.
2. Update the phone field and save.
3. The change propagates to all 1-click dispatch buttons and the public floating WhatsApp widget.

### C. Resetting Admin Credentials
If admin credentials are lost:
1. Update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your production environment variables (e.g., in Hostinger hPanel).
2. The authentication engine automatically syncs with the updated environment variables.

### D. Database Backup (SQLite)
When running on SQLite:
- The database file is located at `./dev.db`.
- To create a point-in-time backup, simply copy `dev.db` to a secure backup directory or S3 bucket:
  ```bash
  cp dev.db "dev_backup_$(date +%Y%m%d_%H%M%S).db"
  ```
