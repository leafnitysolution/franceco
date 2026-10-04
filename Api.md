# FranceGo (FastForward Shuttle) - API Reference & Integration Guide

This document details all supported external third-party APIs, B2B Partner API communication channels, internal REST API endpoints, environment variables, authentication specs, and integration usage examples for **FranceGo** (`FastForward Shuttle`).

---

## 📋 Table of Contents
1. [Overview & Supported APIs](#1-overview--supported-apis)
2. [Secure B2B Partner API Channel](#2-secure-b2b-partner-api-channel)
   - [Authentication Header](#authentication-header)
   - [Supported Location Codes & Vehicle Tiers](#supported-location-codes--vehicle-tiers)
   - [`GET /api/v1/partner/routes` (Fetch Live Locations, Routes & Prices)](#get-apiv1partnerroutes-fetch-live-locations-routes--prices)
   - [`POST /api/v1/partner/bookings` (Create Booking)](#post-apiv1partnerbookings-create-booking)
   - [`GET /api/v1/partner/bookings/[bookingRef]` (Get Booking Status)](#get-apiv1partnerbookingsbookingref-get-booking-status)
3. [External Third-Party APIs](#3-external-third-party-apis)
   - [TripAdvisor Content API](#a-tripadvisor-content-api)
   - [Google Places API](#b-google-places-api)
   - [Transactional Mail SMTP API](#c-transactional-mail-smtp-api)
4. [Internal REST Endpoints](#4-internal-rest-endpoints)
   - [`GET /api/reviews/external` (Live TripAdvisor Rating Sync)](#get-apireviewsexternal)
   - [`POST /api/contact` (Submit Customer Inquiry)](#post-apicontact)
   - [`GET /api/contact` (List Inquiries - Admin Only)](#get-apicontact)
   - [`PATCH /api/contact/[id]` & `DELETE /api/contact/[id]` (Manage Inquiry - Admin Only)](#patch--delete-apicontactid)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Code Integration Examples](#6-code-integration-examples)
   - [Create Partner Booking (POST)](#a-partner-website-javascript--typescript-post-integration)
   - [Poll Partner Booking Status (GET)](#b-partner-website-booking-status-polling-get-integration)
   - [cURL Quick Test](#c-curl-quick-test)

---

## 1. Overview & Supported APIs

FranceGo provides a secure, enterprise B2B API gateway enabling 2nd-party partner websites, travel agencies, and affiliate portals to transmit transfer bookings directly into the database and back-office admin suite.

| API Service | Integration Purpose | Status | Auth Method |
|---|---|---|---|
| **B2B Partner API** | Live route/pricing catalog, reservation transmission & status tracking | Live | API Key (`X-API-Key` or `Bearer`) |
| **TripAdvisor Content API** | Live customer reviews & official rating badge (e.g., 4.9/5.0 score) | Supported | API Key (`TRIPADVISOR_API_KEY`) |
| **Google Places API** | Google business profile ratings & reviews sync | Supported | API Key (`GOOGLE_PLACES_API_KEY`) |
| **Transactional Email API** | Passenger HTML receipts & Admin WhatsApp dispatch alerts | Live | SMTP / App Password |
| **Internal Reviews Endpoint** | Unified ratings payload (`/api/reviews/external`) | Live | Public REST |
| **Contact Inquiry API** | Customer contact submissions (`/api/contact`) & Admin CRM | Live | Public `POST` / Admin Session (`GET`/`PATCH`/`DELETE`) |

---

## 2. Secure B2B Partner API Channel

Partner platforms transmit reservation payloads to FranceGo. Bookings automatically populate the Admin Back-Office (`/ffs-portal-sec-99x/bookings`), calculate route fares dynamically from the database, trigger dual HTML email dispatch (Passenger Voucher + Admin Dispatch Alert), and allow live status polling.

> **Live Admin Panel Sync:** Whenever an administrator creates, edits, or updates locations (`/ffs-portal-sec-99x/locations`), categories, or route prices (`/ffs-portal-sec-99x/routes`) in the Admin Panel, those changes are immediately stored in Prisma (`db.location` and `db.route`). Both the Website Booking Engine and the Partner API read directly from this live database—no redeployment or code changes required.

### Authentication Header
All B2B Partner requests MUST include the secret `X-API-Key` header (validated using constant-time `crypto.timingSafeEqual` comparison):

```http
X-API-Key: ffs_partner_live_secret_key_2026
```
*(Or `Authorization: Bearer ffs_partner_live_secret_key_2026`)*

### Supported Location Codes & Vehicle Tiers

#### Default `originCode` / `destinationCode` Short Codes:
| Short Code | Location Name | Category |
|---|---|---|
| `CDG` | Paris Charles de Gaulle Airport | `AIRPORT` |
| `ORY` | Paris Orly Airport | `AIRPORT` |
| `BVA` | Paris Beauvais Tillé Airport | `AIRPORT` |
| `DLP` | Disneyland Paris Hotels & Parks | `AMUSEMENT_PARK` |
| `AST` | Parc Astérix Resort & Theme Park | `AMUSEMENT_PARK` |
| `PAR` | Paris City Center (All Arrondissements) | `CITY_CENTER` |
| `GDN` | Gare du Nord & Paris Train Stations | `TRAIN_STATION` |
| `VERS` | Château de Versailles & Hotels | `PALACE` |
| `GIV` | Fondation Claude Monet Giverny & Village | `PALACE` |
| `FON` | Château de Fontainebleau & Barbizon | `PALACE` |
| `CHA` | Champagne Region & Reims Cathedral | `PALACE` |
| `NOR` | Normandy D-Day Beaches & Caen | `PALACE` |
| `MSM` | Mont Saint-Michel Abbey & Bay | `PALACE` |
| `LOI` | Loire Valley Châteaux & Amboise | `PALACE` |

*(Plus any custom locations created by an administrator in `/ffs-portal-sec-99x/locations`.)*

#### Supported `vehicleTier` Values:
- `SEDAN` — Berline Sedan (1–3 Passengers, 3 Bags)
- `ECONOMY_VAN` — Economy Minivan (1–8 Passengers, 8 Bags)
- `BUSINESS_VAN` — VIP Business Van (1–7 Passengers, 7 Bags)
- `MINIBUS` — Executive Group Minibus (1–16 Passengers, 16 Bags)

---

### `GET /api/v1/partner/routes` (Fetch Live Locations, Routes & Prices)

Returns all active locations, categories, and routes with their live admin-configured prices (`SEDAN`, `ECONOMY_VAN`, `BUSINESS_VAN`, `MINIBUS`) directly from the database.

#### Request Headers
- `X-API-Key: ffs_partner_live_secret_key_2026`

#### Response Payload (`200 OK`)
```json
{
  "success": true,
  "updatedAt": "2026-10-05T00:55:00.000Z",
  "categories": [
    { "key": "AIRPORT", "name": "Paris Airports", "sortOrder": 1 }
  ],
  "locations": [
    {
      "id": "clx...",
      "shortCode": "CDG",
      "name": "Paris Charles de Gaulle Airport",
      "category": "AIRPORT"
    }
  ],
  "routes": [
    {
      "id": "clx...",
      "slug": "cdg-to-disneyland-paris",
      "originCode": "CDG",
      "originName": "Paris Charles de Gaulle Airport",
      "destinationCode": "DLP",
      "destinationName": "Disneyland Paris Hotels & Parks",
      "distanceKm": 45,
      "estDurationMinutes": 45,
      "pricingEur": {
        "SEDAN": 70,
        "ECONOMY_VAN": 90,
        "BUSINESS_VAN": 120,
        "MINIBUS": 180
      }
    }
  ]
}
```

---

### `POST /api/v1/partner/bookings` (Create Booking)

Creates a new transfer reservation in the database and dispatches confirmation receipts to both the passenger and the admin dispatch team.

#### Request Headers
- `Content-Type: application/json`
- `X-API-Key: ffs_partner_live_secret_key_2026`

#### Request Payload
```json
{
  "originCode": "CDG",
  "destinationCode": "DLP",
  "pickupAddress": "CDG Terminal 2F Arrival Gate",
  "dropoffAddress": "Disneyland Sequoia Lodge Hotel",
  "pickupDateTime": "2026-09-10T14:30:00Z",
  "returnDateTime": null,
  "vehicleTier": "ECONOMY_VAN",
  "passengers": 4,
  "luggageCount": 4,
  "babySeats": 1,
  "boosterSeats": 0,
  "flightNumber": "AF1234",
  "customerName": "Robert Brown",
  "customerEmail": "robert@partner-agency.com",
  "customerPhone": "+33612345678",
  "notes": "VIP Meet & Greet required",
  "partnerReference": "PARTNER-REF-9921"
}
```

#### Response Payload (`201 Created`)
```json
{
  "success": true,
  "message": "Partner booking created and confirmation emails dispatched.",
  "bookingRef": "FGO-B2B-894102",
  "status": "PENDING",
  "totalFareEur": 90,
  "partnerReference": "PARTNER-REF-9921",
  "route": "Paris Charles de Gaulle Airport (CDG) → Disneyland Paris Hotels & Parks (DLP)",
  "pickupDateTime": "2026-09-10T14:30:00.000Z",
  "adminPanelUrl": "/ffs-portal-sec-99x/bookings"
}
```

---

### `GET /api/v1/partner/bookings/[bookingRef]` (Get Booking Status)

Polls live reservation status (`PENDING`, `CONFIRMED`, `DISPATCHED`, `COMPLETED`, `CANCELLED`) from the database.

#### Request Headers
- `X-API-Key: ffs_partner_live_secret_key_2026`

#### Response Payload (`200 OK`)
```json
{
  "success": true,
  "bookingRef": "FGO-B2B-894102",
  "status": "PENDING",
  "customerName": "Robert Brown",
  "customerEmail": "robert@partner-agency.com",
  "customerPhone": "+33612345678",
  "origin": {
    "name": "Paris Charles de Gaulle Airport",
    "shortCode": "CDG"
  },
  "destination": {
    "name": "Disneyland Paris Hotels & Parks",
    "shortCode": "DLP"
  },
  "pickupAddress": "CDG Terminal 2F Arrival Gate",
  "dropoffAddress": "Disneyland Sequoia Lodge Hotel",
  "pickupDateTime": "2026-09-10T14:30:00.000Z",
  "vehicleTier": "ECONOMY_VAN",
  "passengers": 4,
  "totalFareEur": 90,
  "flightOrTrainNumber": "AF1234",
  "notes": "[B2B Partner Booking | Ref: PARTNER-REF-9921] VIP Meet & Greet required",
  "createdAt": "2026-09-06T17:12:30.000Z",
  "updatedAt": "2026-09-06T17:12:30.000Z"
}
```

---

## 3. External Third-Party APIs

### A. TripAdvisor Content API
- **Endpoint**: `https://api.content.tripadvisor.com/api/v1/location/{locationId}/details`
- **Purpose**: Dynamically pulls live location rating score, total review count, and official web link (cached for 1 hour via Next.js `revalidate: 3600`).
- **Config Variables**:
  - `TRIPADVISOR_API_KEY`: Your official TripAdvisor developer API key.
  - `TRIPADVISOR_LOCATION_ID`: The unique location ID of your business on TripAdvisor.

### B. Google Places API
- **Endpoint**: `https://maps.googleapis.com/maps/api/place/details/json`
- **Config Variable**: `GOOGLE_PLACES_API_KEY`

### C. Transactional Mail SMTP API
- **Implementation**: `src/lib/email.ts` using `nodemailer`
- **Purpose**: Dispatches dual HTML email receipts (Passenger Confirmation Voucher & Admin Dispatch Alert with all HTML entities sanitized via `escapeHtml()`).
- **Fallback Behavior**: If `SMTP_USER` or `SMTP_PASS` are not set, the booking still succeeds in the database without failing the request.

---

## 4. Internal REST Endpoints

### `GET /api/reviews/external`
Returns unified external ratings and review counts (live from TripAdvisor Content API when `TRIPADVISOR_API_KEY` and `TRIPADVISOR_LOCATION_ID` are configured, or verified fallback metrics otherwise).

```json
{
  "source": "TripAdvisor Live API",
  "rating": 4.9,
  "numReviews": 1420,
  "rankingString": "#1 of 128 Transportation Services in Paris",
  "webUrl": "https://www.tripadvisor.com"
}
```

### `POST /api/contact`
Public endpoint for submitting customer contact inquiries from `/contact-us`.
- **Security**: Rate-limited to `5 requests / hour` per IP address, validates email syntax and field lengths.
- **Body**: `{ "name": "Jane Doe", "email": "jane@example.com", "phone": "+33600000000", "subject": "Custom Quote", "message": "Need a transfer for 6 guests." }`

### `GET /api/contact`
Protected admin endpoint returning all customer contact inquiries ordered by `createdAt DESC`.
- **Auth**: Requires valid `ffs_admin_session` HTTP-only signed session cookie.

### `PATCH / DELETE /api/contact/[id]`
Protected admin endpoints to update an inquiry's status (`UNREAD`, `READ`, `REPLIED`, `ARCHIVED`) or permanently delete an inquiry.
- **Auth**: Requires valid `ffs_admin_session` HTTP-only signed session cookie.

---

## 5. Environment Variables Reference

```env
# Database Connection
DATABASE_URL="file:./dev.db"

# Admin Authentication & Security
ADMIN_EMAIL="admin@francego.com"
ADMIN_PASSWORD="SecureProductionPassword2026!"
JWT_SECRET="YourLongRandom32ByteHexSecretKeyHere"

# B2B Partner API Secret Key
PARTNER_API_KEY="ffs_partner_live_secret_key_2026"

# TripAdvisor API Configuration (Optional)
TRIPADVISOR_API_KEY="your_tripadvisor_api_key_here"
TRIPADVISOR_LOCATION_ID="12345678"

# SMTP Email Dispatch
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="projet15df@outlook.fr"
SMTP_PASS="your-app-password-here"
ADMIN_DISPATCH_EMAIL="projet15df@outlook.fr"
```

---

## 6. Code Integration Examples

### A. Partner Website (JavaScript / TypeScript POST Integration)

```typescript
async function createPartnerBooking() {
  const payload = {
    originCode: "CDG",
    destinationCode: "DLP",
    pickupAddress: "CDG Terminal 2F",
    dropoffAddress: "Disneyland Hotel",
    pickupDateTime: "2026-09-15T10:00:00Z",
    vehicleTier: "BUSINESS_VAN",
    passengers: 5,
    luggageCount: 5,
    babySeats: 1,
    boosterSeats: 0,
    flightNumber: "AF1234",
    customerName: "Alice Walker",
    customerEmail: "alice@partnercompany.com",
    customerPhone: "+33699887766",
    notes: "Please bring 1 rear-facing infant seat",
    partnerReference: "PARTNER-1029"
  };

  const response = await fetch("https://your-domain.com/api/v1/partner/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "ffs_partner_live_secret_key_2026"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log("Partner Booking Reference:", result.bookingRef);
}
```

### B. Partner Website Booking Status Polling (GET Integration)

```typescript
async function getPartnerBookingStatus(bookingRef: string) {
  const response = await fetch(
    `https://your-domain.com/api/v1/partner/bookings/${encodeURIComponent(bookingRef)}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": "ffs_partner_live_secret_key_2026"
      }
    }
  );

  const statusData = await response.json();
  console.log("Current Status:", statusData.status);
  return statusData;
}
```

### C. cURL Quick Test

```bash
curl -X POST https://your-domain.com/api/v1/partner/bookings \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ffs_partner_live_secret_key_2026" \
  -d '{
    "originCode": "CDG",
    "destinationCode": "DLP",
    "pickupAddress": "CDG Terminal 2E",
    "dropoffAddress": "Disney Hotel New York",
    "pickupDateTime": "2026-10-15T12:00:00Z",
    "vehicleTier": "SEDAN",
    "passengers": 2,
    "luggageCount": 2,
    "customerName": "Jean Dupont",
    "customerEmail": "jean@example.com",
    "customerPhone": "+33612345678",
    "partnerReference": "TEST-001"
  }'
```
