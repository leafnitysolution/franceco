# FastForward Shuttle - API Reference & Integration Guide

This document details all supported external third-party APIs, B2B Partner API communication channels, internal REST API endpoints, environment variables, authentication specs, and integration usage examples for **FastForward Shuttle**.

---

## 📋 Table of Contents
1. [Overview & Supported APIs](#1-overview--supported-apis)
2. [Secure B2B Partner API Channel](#2-secure-b2b-partner-api-channel)
   - [Authentication Header](#authentication-header)
   - [`POST /api/v1/partner/bookings` (Create Booking)](#post-apiv1partnerbookings-create-booking)
   - [`GET /api/v1/partner/bookings/[bookingRef]` (Get Booking Status)](#get-apiv1partnerbookingsbookingref-get-booking-status)
3. [External Third-Party APIs](#3-external-third-party-apis)
   - [TripAdvisor Content API](#a-tripadvisor-content-api)
   - [Google Places API](#b-google-places-api)
   - [Transactional Mail SMTP API](#c-transactional-mail-smtp-api)
4. [Internal REST Endpoints](#4-internal-rest-endpoints)
   - [`GET /api/reviews/external`](#get-apireviewsexternal)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Code Integration Examples](#6-code-integration-examples)

---

## 1. Overview & Supported APIs

FastForward Shuttle provides a secure, enterprise B2B API gateway enabling 2nd-party partner websites, travel agencies, and affiliate portals to transmit transfer bookings directly into FastForward Shuttle's database and back-office admin suite.

| API Service | Integration Purpose | Status | Auth Method |
|---|---|---|---|
| **B2B Partner API** | Secure transfer reservation transmission & status tracking | Live | API Key (`X-API-Key`) |
| **TripAdvisor Content API** | Live customer reviews & official rating badge (e.g., 4.9/5.0 score) | Supported | API Key (`TRIPADVISOR_API_KEY`) |
| **Google Places API** | Google business profile ratings & reviews sync | Supported | API Key (`GOOGLE_PLACES_API_KEY`) |
| **Transactional Email API** | Passenger HTML receipts & Admin WhatsApp dispatch alerts | Supported | SMTP / App Password |
| **Internal Reviews Endpoint** | Unified ratings payload (`/api/reviews/external`) | Live | Public REST |

---

## 2. Secure B2B Partner API Channel

Partner platforms transmit reservation payloads to FastForward Shuttle. Bookings automatically populate the Admin Back-Office (`/ffs-portal-sec-99x/bookings`), trigger dual HTML email dispatch, and allow live status polling.

### Authentication Header
All B2B Partner requests MUST include the secret `X-API-Key` header:

```http
X-API-Key: ffs_partner_live_secret_key_2026
```
*(Or `Authorization: Bearer ffs_partner_live_secret_key_2026`)*

---

### `POST /api/v1/partner/bookings` (Create Booking)

Creates a new transfer reservation in the FastForward Shuttle database and dispatches confirmation receipts.

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

#### Response Payload (201 Created)
```json
{
  "success": true,
  "message": "Partner booking created and confirmation emails dispatched.",
  "bookingRef": "FFS-B2B-894102",
  "status": "PENDING",
  "totalFareEur": 90,
  "partnerReference": "PARTNER-REF-9921",
  "route": "Charles de Gaulle Airport (CDG) → Disneyland Paris (DLP)",
  "pickupDateTime": "2026-09-10T14:30:00.000Z",
  "adminPanelUrl": "/ffs-portal-sec-99x/bookings"
}
```

---

### `GET /api/v1/partner/bookings/[bookingRef]` (Get Booking Status)

Polls live reservation status from FastForward Shuttle database.

#### Request Headers
- `X-API-Key: ffs_partner_live_secret_key_2026`

#### Response Payload (200 OK)
```json
{
  "success": true,
  "bookingRef": "FFS-B2B-894102",
  "status": "PENDING",
  "customerName": "Robert Brown",
  "customerEmail": "robert@partner-agency.com",
  "customerPhone": "+33612345678",
  "origin": {
    "name": "Charles de Gaulle Airport",
    "shortCode": "CDG"
  },
  "destination": {
    "name": "Disneyland Paris",
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
- **Purpose**: Dynamically pulls live location rating score, total review count, and official web link.
- **Config Variables**:
  - `TRIPADVISOR_API_KEY`: Your official TripAdvisor developer API key.
  - `TRIPADVISOR_LOCATION_ID`: The unique location ID of your business on TripAdvisor.

---

### B. Google Places API
- **Endpoint**: `https://maps.googleapis.com/maps/api/place/details/json`
- **Config Variable**: `GOOGLE_PLACES_API_KEY`

---

### C. Transactional Mail SMTP API
- **Purpose**: Dispatches dual HTML email receipts (Passenger Receipt & Admin WhatsApp Dispatch Link).

---

## 4. Environment Variables Reference

```env
# Database Connection
DATABASE_URL="file:./dev.db"

# Admin Authentication & Security
ADMIN_EMAIL="admin@fastforwardshuttle.com"
ADMIN_PASSWORD="SecureProductionPassword2026!"
JWT_SECRET="YourLongJWTSecretKeyHere"

# B2B Partner API Secret Key
PARTNER_API_KEY="ffs_partner_live_secret_key_2026"

# TripAdvisor API Configuration (Optional)
TRIPADVISOR_API_KEY="your_tripadvisor_api_key_here"
TRIPADVISOR_LOCATION_ID="12345678"

# SMTP Email Dispatch
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="dispatch@fastforwardshuttle.com"
SMTP_PASS="your-app-password-here"
ADMIN_DISPATCH_EMAIL="admin@fastforwardshuttle.com"
```

---

## 5. Code Integration Examples

### Partner Website (JavaScript / TypeScript POST Integration)

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
    customerName: "Alice Walker",
    customerEmail: "alice@partnercompany.com",
    customerPhone: "+33699887766",
    partnerReference: "PARTNER-1029"
  };

  const response = await fetch("https://fastforwardshuttle.com/api/v1/partner/bookings", {
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
