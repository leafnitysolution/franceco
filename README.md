# FastForward Shuttle - Production Booking & Management Platform

A high-converting, production-ready Airport & Disneyland Paris Transfer Booking Platform for **FastForward Shuttle**. Built with Next.js 15 App Router, TypeScript, Prisma ORM, Tailwind CSS, Zustand, Multi-language support, and Dual HTML Email Notifications.

---

## 🚀 Key Features

### 🛒 High-Converting Public Booking Engine
- **Split-Screen & Hero Reservation Widget**: Instant transfer calculation for One-Way and Round-Trip journeys.
- **Hub & Address Selectors**: Pre-configured for Charles de Gaulle (CDG), Orly (ORY), Beauvais (BVA), Disneyland Paris Hotels, Paris City Center, Gare du Nord, and Versailles.
- **4-Tier Vehicle Fleet**:
  - Berline Sedan (1–3 Pax, 3 Bags)
  - Economy Minivan (1–8 Pax, 8 Bags)
  - VIP Business Van (1–7 Pax, 7 Bags)
  - Executive Minibus (1–16 Pax, 16 Bags)
- **Multi-Language Engine**: Interactive header selector supporting 6 languages (English, French, Spanish, Italian, German, Portuguese).
- **Free Child Seats & Pay on Arrival**: Infant, baby car seats, and booster cushions free of charge with zero upfront deposit required.

### 🔒 Back-Office Admin Suite (`/admin`)
- **Secure OWASP-Compliant Auth**: OWASP-certified credentials check, email formatting validation, rate limiting (5 attempts / 15 mins), and HttpOnly cookie protection.
- **Reservations Control Center**: View incoming bookings, filter by status, track flight radar numbers, and dispatch chauffeurs via 1-Click WhatsApp messaging.
- **Reviews Moderation Panel**: Real-time stats, publish/unpublish approval toggles, and deletion controls.
- **Route & SEO Editor**: Dynamic route page management (distance, fares, H1 headings, meta titles, descriptions) with live Google SERP preview and dynamic FAQs editor.

### 📧 Dual HTML Email Dispatch System
- **Passenger Confirmation Email**: Automated HTML receipt sent to `customerEmail` with unique Booking Reference, trip specifications, driver meet & greet instructions, and payment instructions.
- **Admin Office Alert**: Instant dispatch email sent to `ADMIN_DISPATCH_EMAIL` with full customer details and direct WhatsApp chauffeur dispatch link.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 App Router (TypeScript, Server Components, Server Actions)
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Styling**: Tailwind CSS & Lucide React Icons
- **State Management**: Zustand
- **Validation**: Zod & React Hook Form
- **Emails**: Nodemailer with SMTP / Ethereal Transport

---

## ⚙️ Environment Variables Setup (`.env`)

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="file:./dev.db"

# Admin Access Credentials
ADMIN_EMAIL="admin@fastforwardshuttle.com"
ADMIN_PASSWORD="admin123456"
JWT_SECRET="fastforward_shuttle_super_secret_key_2026"

# Email SMTP Settings (For Live Dispatch)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="dispatch@fastforwardshuttle.com"
SMTP_PASS="your-app-password-here"
ADMIN_DISPATCH_EMAIL="admin@fastforwardshuttle.com"
```

---

## 🔄 How to Switch from SQLite to PostgreSQL

If you want to migrate from SQLite (`dev.db`) to PostgreSQL (e.g. Supabase, Neon, Hostinger PostgreSQL, AWS RDS, or local Docker PostgreSQL):

### Step 1: Update `prisma/schema.prisma`
Change `provider = "sqlite"` to `provider = "postgresql"`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update `DATABASE_URL` in `.env`
Replace the SQLite file URL with your PostgreSQL connection URI:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fastforward_db?schema=public"
```

### Step 3: Run Database Migration & Seed
Run these commands to apply the schema to PostgreSQL and seed initial locations, routes, and reviews:
```bash
npx prisma db push
npm run seed
```

---

## 💻 Local Setup & Running Commands

```bash
# 1. Install Dependencies
npm install

# 2. Sync Database Schema & Seed Locations/Routes
npx prisma db push
npm run seed

# 3. Build Production Bundle
npm run build

# 4. Start Production Server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
Admin Login is available at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
