# FranceGo - Manual PostgreSQL VPS Deployment Guide

This guide is for production deployments on a client's Linux VPS where **SQLite is NOT used**, **auto-database creation is disabled**, and the database is **manually initialized one time using `database_init.sql`**.

---

## 📋 Table of Contents
1. [Overview & Architecture Changes](#1-overview--architecture-changes)
2. [Step 1: Install PostgreSQL on the VPS](#step-1-install-postgresql-on-the-vps)
3. [Step 2: Create Database & User](#step-2-create-database--user)
4. [Step 3: Manually Import `database_init.sql`](#step-3-manually-import-database_initsql)
5. [Step 4: Configure Production `.env`](#step-4-configure-production-env)
6. [Step 5: Install, Build & Start Application](#step-5-install-build--start-application)
7. [Verification & Maintenance](#7-verification--maintenance)

---

## 1. Overview & Architecture Changes

In this branch (`production-postgres-manual`):
- **Database Engine**: Native **PostgreSQL** (`provider = "postgresql"` in `prisma/schema.prisma`).
- **No SQLite**: `dev.db` is completely removed from production.
- **No Automatic Schema Push on Build**: `"build": "next build"` (does NOT run `prisma db push`).
- **No Automatic Runtime Data Seeding**: Runtime auto-seeding is disabled. The application relies strictly on your manually imported database.
- **Single Manual Initialization File**: Everything (tables, indexes, foreign keys, 5 categories, 14 locations, 17 routes with prices, and sample reviews) is contained in a single file:
  ```plaintext
  database_init.sql
  ```

---

## Step 1: Install PostgreSQL on the VPS

On your client's Ubuntu / Debian VPS:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

---

## Step 2: Create Database & User

Log into the PostgreSQL prompt as the `postgres` system user:

```bash
sudo -u postgres psql
```

Run these SQL commands inside `psql` (replace `YourStrongPassword2026!` with your desired password):

```sql
CREATE USER francego_user WITH PASSWORD 'YourStrongPassword2026!';
CREATE DATABASE francego_db OWNER francego_user;
GRANT ALL PRIVILEGES ON DATABASE francego_db TO francego_user;
\q
```

---

## Step 3: Manually Import `database_init.sql`

This is the **one-time manual step** that creates all tables and populates all default locations, categories, and route prices.

From the project root folder on the VPS, execute:

```bash
psql -U francego_user -d francego_db -f database_init.sql
```
*(Enter your password when prompted).*

### What `database_init.sql` does:
1. Creates tables: `"LocationCategory"`, `"Location"`, `"Route"`, `"Booking"`, `"Review"`, `"ContactSubmission"`.
2. Creates unique indexes & foreign keys.
3. Inserts all 5 categories (`AIRPORT`, `AMUSEMENT_PARK`, `CITY_CENTER`, `TRAIN_STATION`, `PALACE`).
4. Inserts all 14 locations (`CDG`, `ORY`, `BVA`, `DLP`, `PAR`, `ASTX`, `GDN`, `VERS`, `GIV`, `FTB`, `CHMP`, `NORM`, `MSM`, `LOIRE`).
5. Inserts all 17 routes with prices for `SEDAN`, `ECONOMY_VAN`, `BUSINESS_VAN`, and `MINIBUS`.
6. Inserts initial verified customer reviews.

---

## Step 4: Configure Production `.env`

Create or edit your `.env` file in the project root:

```env
# Production PostgreSQL Connection URI
DATABASE_URL="postgresql://francego_user:YourStrongPassword2026!@localhost:5432/francego_db?schema=public"

# Admin Back-Office Credentials
ADMIN_EMAIL="admin@fastforwardshuttle.com"
ADMIN_PASSWORD="YourSecureAdminPassword2026!"
JWT_SECRET="generate_a_random_32_byte_secret_hash_2026"

# B2B Partner API Key
PARTNER_API_KEY="ffs_partner_live_secret_key_2026"

# Email SMTP Settings (For Confirmation & Dispatch Alerts)
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="projet15df@outlook.fr"
SMTP_PASS="your-email-app-password"
ADMIN_DISPATCH_EMAIL="projet15df@outlook.fr"
```

---

## Step 5: Install, Build & Start Application

```bash
# 1. Install Node dependencies (runs 'prisma generate' for PostgreSQL client)
npm install

# 2. Compile optimized production build (Notice: does NOT run prisma db push)
npm run build

# 3. Start production server via PM2
pm2 start npm --name "francego" -- start -- -p 3000
pm2 save
```

---

## 7. Verification & Maintenance

1. **Verify Database Content via psql**:
   ```bash
   psql -U francego_user -d francego_db -c "SELECT COUNT(*) FROM \"Location\";"
   psql -U francego_user -d francego_db -c "SELECT COUNT(*) FROM \"Route\";"
   ```
   *Expected output: 14 locations, 17 routes.*

2. **Verify Public Website**:
   Visit `http://localhost:3000` (or your domain). All 14 hubs, vehicle cards, and route pricing will load directly from PostgreSQL.

3. **Verify Admin Portal**:
   Visit `http://localhost:3000/ffs-portal-sec-99x/login` and log in with your credentials. Any route or price update you make in the Admin Panel is written directly to PostgreSQL.
