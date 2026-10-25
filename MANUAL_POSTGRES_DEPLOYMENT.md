# FranceGo - Production VPS Deployment Guide (PostgreSQL & Nginx)

This guide provides end-to-end instructions for deploying the **FranceGo (FastForward Shuttle)** platform on your Linux VPS (`francegotransfers.io`) using **Native PostgreSQL**, **Nginx reverse proxy**, **Let's Encrypt SSL**, and **PM2 process manager**.

> **Architecture Features in this branch (`production-postgres-manual`)**:
> - **Zero SQLite in Production**: `prisma/dev.db` is entirely removed from production runtime.
> - **No Automatic Schema Push**: `"npm run build"` compiles cleanly without touching database tables.
> - **No Runtime Auto-Seeding**: The application strictly reads your manually imported database.
> - **Complete 25-Route Initializer**: Everything (DDL, indexes, 5 categories, 14 hubs, all 25 header & footer dropdown routes, and reviews) is initialized via a single SQL script: [`database_init.sql`](./database_init.sql).

---

## 📋 Table of Contents
1. [DNS Configuration (Domain A Record)](#1-dns-configuration-domain-a-record)
2. [Step 1: Install PostgreSQL on the VPS](#step-1-install-postgresql-on-the-vps)
3. [Step 2: Create Database & User](#step-2-create-database--user)
4. [Step 3: Manually Import `database_init.sql`](#step-3-manually-import-database_initsql)
5. [Step 4: Configure Production `.env`](#step-4-configure-production-env)
6. [Step 5: Pull Code, Generate Prisma & Build](#step-5-pull-code-generate-prisma--build)
7. [Step 6: PM2 Process Management](#step-6-pm2-process-management)
8. [Step 7: Nginx Reverse Proxy Setup](#step-7-nginx-reverse-proxy-setup)
9. [Step 8: Free SSL via Let's Encrypt Certbot](#step-8-free-ssl-via-lets-encrypt-certbot)
10. [Step 9: Verification Checklist](#step-9-verification-checklist)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. DNS Configuration (Domain A Record)

Before generating SSL certificates, point your domain to your VPS public IP:

| Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or leave blank) | `141.136.36.40` (Your VPS IP) | Automatic / 300s |
| **A** | `www` | `141.136.36.40` (Your VPS IP) | Automatic / 300s |

Verify DNS propagation on your machine:
```bash
ping francegotransfers.io
```
It should resolve to your VPS IP (`141.136.36.40`).

---

## Step 1: Install PostgreSQL on the VPS

On Ubuntu / Debian:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Verify PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

---

## Step 2: Create Database & User

Log into PostgreSQL as the administrative `postgres` user:

```bash
sudo -u postgres psql
```

Execute the following commands (replace `YourSecurePassword2026!` with your desired database password):

```sql
CREATE USER francego_user WITH PASSWORD 'YourSecurePassword2026!';
CREATE DATABASE francego_db OWNER francego_user;
GRANT ALL PRIVILEGES ON DATABASE francego_db TO francego_user;
\q
```

---

## Step 3: Manually Import `database_init.sql`

This single manual step initializes the database schema, all constraints, 5 categories, 14 hubs, 25 routes with 4-tier vehicle pricing, and sample customer reviews.

From the project root on the VPS (`/var/www/francego`):

```bash
psql -U francego_user -d francego_db -f database_init.sql
```
*(Enter your database password when prompted).*

### What `database_init.sql` sets up:
1. **6 Production Tables**: `"LocationCategory"`, `"Location"`, `"Route"`, `"Booking"`, `"Review"`, `"ContactSubmission"`.
2. **5 Categories**: `AIRPORT`, `AMUSEMENT_PARK`, `CITY_CENTER`, `TRAIN_STATION`, `PALACE`.
3. **14 Hubs**: CDG, Orly, Beauvais, Disneyland Paris, Paris City, Parc Astérix, Gare du Nord, Versailles, Giverny, Fontainebleau, Champagne/Reims, Normandy, Mont Saint-Michel, Loire Valley.
4. **All 25 Header & Footer Dropdown Routes**: Every route with fixed pricing across Sedan (3 pax), Economy Van (6 pax), Business Van (7 pax), and Minibus (8 pax).
5. **Initial Verified Reviews**: 5-star traveler testimonials.

---

## Step 4: Configure Production `.env`

Create or edit your `/var/www/francego/.env` file:

```bash
nano /var/www/francego/.env
```

Paste your production environment variables:

```env
# Database (Local PostgreSQL connection)
DATABASE_URL="postgresql://francego_user:YourSecurePassword2026!@127.0.0.1:5432/francego_db?schema=public"

# Admin Authentication
ADMIN_EMAIL="brian.arangala@outlook.com"
ADMIN_PASSWORD="YourSecureAdminPassword2026!"
JWT_SECRET="8e30d232bfe7d16e9e4c1c3206268063d9cfdb2ea2ff8a31"

# B2B Partner API Key
PARTNER_API_KEY="your_b2b_secret_partner_key_2026"

# Outbound Email SMTP
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="projet15df@outlook.fr"
SMTP_PASS="your-email-app-password"
ADMIN_DISPATCH_EMAIL="projet15df@outlook.fr"
```

> [!WARNING]
> Ensure there is **no space** in email addresses (e.g. `brian.arangala@outlook.com`, not `outlook com`).

---

## Step 5: Pull Code, Generate Prisma & Build

Run the following commands in sequence:

```bash
cd /var/www/francego

# 1. Switch / Pull the production postgres manual branch
git checkout production-postgres-manual
git pull origin production-postgres-manual

# 2. Install dependencies (if you haven't already)
npm install

# 3. Generate Prisma client compiled specifically for PostgreSQL
npx prisma generate

# 4. Build Next.js optimized production bundle
npm run build
```

---

## Step 6: PM2 Process Management

Start or restart your Next.js application on port 3000:

```bash
# If starting for the first time:
pm2 start npm --name "francego" -- start -- -p 3000

# If already created, simply restart:
pm2 restart francego

# Persist across VPS reboots:
pm2 save
pm2 startup
```

Check live logs to verify clean startup:
```bash
pm2 logs francego --lines 25 --nostream
```

---

## Step 7: Nginx Reverse Proxy Setup

Install Nginx:
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

Create an Nginx server configuration:
```bash
sudo nano /etc/nginx/sites-available/francego
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name francegotransfers.io www.francegotransfers.io;

    # Client upload size for route images / attachments
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/francego /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 8: Free SSL via Let's Encrypt Certbot

Obtain and configure free auto-renewing SSL certificates:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d francegotransfers.io -d www.francegotransfers.io
```

Follow the prompts:
- Enter your email address for renewal notices.
- Agree to terms of service.
- Certbot will automatically rewrite the Nginx configuration to force HTTPS (`https://francegotransfers.io`).

Test certificate auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## Step 9: Verification Checklist

1. **Verify Database Records**:
   ```bash
   psql -U francego_user -d francego_db -c "SELECT count(*) FROM \"Location\";"
   # Output: 14

   psql -U francego_user -d francego_db -c "SELECT count(*) FROM \"Route\";"
   # Output: 25
   ```

2. **Verify Public Website**:
   - Open `https://francegotransfers.io` in your browser.
   - Test Header dropdowns ("Paris Airport Transfers", "Disneyland Transfers", "Tours").
   - Test Booking widget route selection and pricing calculations.
   - Verify Floating WhatsApp widget (+33 7 81 11 83 94).

3. **Verify Admin Portal**:
   - Visit `https://francegotransfers.io/ffs-portal-sec-99x/login`.
   - Log in using your `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
   - Check routes, bookings, and pricing management.

---

## Troubleshooting Guide

### 1. `PrismaClientInitializationError: Error validating datasource 'db': the URL must start with the protocol postgresql:// or postgres://`
- **Cause**: Earlier versions had a hardcoded SQLite file path in `src/lib/db.ts`.
- **Solution**:
  ```bash
  cd /var/www/francego
  git pull origin production-postgres-manual
  npx prisma generate
  npm run build
  pm2 restart francego
  ```

### 2. `ECONNREFUSED 127.0.0.1:5432`
- **Cause**: PostgreSQL service is stopped or listening on different interface.
- **Solution**:
  ```bash
  sudo systemctl restart postgresql
  sudo systemctl status postgresql
  ```

### 3. Nginx 502 Bad Gateway
- **Cause**: Next.js app is stopped or crashing on port 3000.
- **Solution**: Check PM2 logs:
  ```bash
  pm2 logs francego --lines 40 --nostream
  ```
  Ensure `.env` variables are correctly formatted and restart:
  ```bash
  pm2 restart francego
  ```

---

## 📞 Support & Contacts
- **Hotline & WhatsApp Dispatch**: `+33 7 81 11 83 94`
- **Email**: `projet15df@outlook.fr`
