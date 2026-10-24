# FranceGo (FastForward Shuttle) - Production Deployment & Hosting Guide

This guide details step-by-step instructions for deploying **FranceGo** (`FastForward Shuttle`) to production hosting platforms—including **Hostinger Cloud / Node.js**, **Linux VPS (Ubuntu/Debian + Nginx + PM2)**, and **Vercel**—as well as migrating from SQLite to PostgreSQL.

---

## 📋 Table of Contents
1. [Hostinger Cloud / Node.js Web App Deployment (Live Setup)](#1-hostinger-cloud--nodejs-web-app-deployment-live-setup)
2. [Linux VPS Deployment (Ubuntu + Nginx + PM2)](#2-linux-vps-deployment-ubuntu--nginx--pm2)
3. [Vercel Deployment](#3-vercel-deployment)
4. [Database Options: SQLite vs PostgreSQL](#4-database-options-sqlite-vs-postgresql)
5. [Complete Environment Variables Reference](#5-complete-environment-variables-reference)
6. [Post-Deployment Verification Checklist](#6-post-deployment-verification-checklist)

---

## 1. Hostinger Cloud / Node.js Web App Deployment (Live Setup)

Hostinger provides managed Node.js web application hosting with built-in Git integration and automatic builds.

### Step 1: Create or Configure the Node.js Application in Hostinger hPanel
1. Log in to your **Hostinger hPanel**.
2. Navigate to **Websites** → Select your domain/subdomain → **Node.js** (or **Web Application**).
3. Configure the application runtime:
   - **Node.js Version**: `20.x` or `22.x` (LTS recommended)
   - **Application Type**: `Next.js`
   - **Package Manager**: `npm`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Entry File**: None (managed by Next.js standalone server)

### Step 2: Connect Git Repository
1. In hPanel, link your GitHub repository:
   - **Repository**: `github.com/<your-account>/franceco`
   - **Branch**: `main`
2. Enable **Automatic Deployments** (auto-deploy on push to `main`).

### Step 3: Configure Environment Variables in Hostinger
In the **Environment Variables** section of hPanel, add the following key-value pairs:

```env
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL="admin@fastforwardshuttle.com"
ADMIN_PASSWORD="YourSecureAdminPassword2026!"
JWT_SECRET="fastforward_shuttle_super_secret_key_2026"
PARTNER_API_KEY="ffs_partner_live_secret_key_2026"

SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="projet15df@outlook.fr"
SMTP_PASS="your-email-app-password"
ADMIN_DISPATCH_EMAIL="projet15df@outlook.fr"

# Optional External APIs
TRIPADVISOR_API_KEY=""
TRIPADVISOR_LOCATION_ID=""
GOOGLE_PLACES_API_KEY=""
```

### Step 4: Build & Lifecycle Verification
During deployment, Hostinger runs:
1. `npm install`: Automatically triggers `postinstall: "prisma generate"` to generate the Prisma Client.
2. `npm run build`: Executes `prisma db push && next build`.
   - `prisma db push` creates/updates the database schema in `dev.db` automatically.
   - `next build` produces an optimized standalone production build in `.next`.
3. The server starts and serves traffic on the configured port.

---

## 2. Linux VPS Deployment (Ubuntu + Nginx + PM2)

Recommended for unmanaged virtual private servers (AWS EC2, DigitalOcean Droplets, Hetzner, Linode, OVH).

### Step 1: Install Node.js 20 LTS, Nginx, and PM2
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx
sudo npm install -g pm2
```

### Step 2: Clone Project & Install Dependencies
```bash
cd /var/www
git clone https://github.com/<your-account>/franceco.git francego
cd francego

npm install
```

### Step 3: Configure `.env` & Build
```bash
cp .env.example .env
nano .env

# Push schema and seed initial data
npx prisma db push
npm run seed

# Build Next.js production bundle
npm run build
```

### Step 4: Start Process with PM2
```bash
pm2 start npm --name "francego" -- start -- -p 3000

# Save process list for system reboot persistence
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### Step 5: Configure Nginx Reverse Proxy & SSL
Create `/etc/nginx/sites-available/francego.conf`:

```nginx
server {
    server_name francego.com www.francego.com;

    location / {
        proxy_pass http://localhost:3000;
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

Enable configuration and issue free SSL:
```bash
sudo ln -s /etc/nginx/sites-available/francego.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL
sudo certbot --nginx -d francego.com -d www.francego.com
```

---

## 3. Vercel Deployment

1. Push your code to GitHub.
2. Import the repository in [Vercel Dashboard](https://vercel.com).
3. Set Environment Variables:
   - For PostgreSQL (e.g. Supabase or Neon): Set `DATABASE_URL` to your pooled Postgres URI.
   - Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `PARTNER_API_KEY`, etc.
4. Set Build Command: `prisma db push && next build`
5. Click **Deploy**.

---

## 4. Database Options: SQLite vs PostgreSQL

### Default: SQLite (`dev.db`)
- **Best For**: Single-node VPS or Hostinger deployments with low operational complexity.
- **Config**: `DATABASE_URL="file:./dev.db"`
- Zero external database installation required.

### Scalable Production: PostgreSQL
For multi-instance clustering or managed database services (AWS RDS, Neon, Supabase, Hostinger PostgreSQL):

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@hostname:5432/francego_db?schema=public"
   ```
3. Run schema push and seed:
   ```bash
   npx prisma db push
   npm run seed
   ```

---

## 5. Complete Environment Variables Reference

| Variable | Description | Required? | Example |
|---|---|---|---|
| `DATABASE_URL` | Prisma Database URI (SQLite or PostgreSQL) | **Yes** | `file:./dev.db` |
| `ADMIN_EMAIL` | Admin Portal Login Username | **Yes** | `admin@fastforwardshuttle.com` |
| `ADMIN_PASSWORD` | Admin Portal Login Password | **Yes** | `SecurePass2026!` |
| `JWT_SECRET` | 32-Byte Secret for Signed Session Cookies | **Yes** | `fastforward_shuttle_super_secret_key_2026` |
| `PARTNER_API_KEY` | B2B Partner API Authentication Key | **Yes** | `ffs_partner_live_secret_key_2026` |
| `SMTP_HOST` | Outbound Email SMTP Server | Optional | `smtp-mail.outlook.com` |
| `SMTP_PORT` | SMTP Port (`587` for TLS / STARTTLS) | Optional | `587` |
| `SMTP_SECURE` | Secure Connection Flag | Optional | `false` |
| `SMTP_USER` | SMTP Username / Dispatch Email | Optional | `projet15df@outlook.fr` |
| `SMTP_PASS` | SMTP Password / App Password | Optional | `your-app-password` |
| `ADMIN_DISPATCH_EMAIL` | Internal Notification Target Email | Optional | `projet15df@outlook.fr` |
| `TRIPADVISOR_API_KEY` | Official TripAdvisor Content API Key | Optional | `your_tripadvisor_api_key` |
| `TRIPADVISOR_LOCATION_ID` | TripAdvisor Business Location Identifier | Optional | `12345678` |
| `GOOGLE_PLACES_API_KEY` | Google Places API Key for ratings | Optional | `AIzaSy...` |

---

## 6. Post-Deployment Verification Checklist

Once deployed, perform this 5-point verification:

1. **Public Site Health**: Visit `/` to verify the homepage hero, vehicle fleet cards, customer reviews, and dynamic navigation dropdowns load correctly.
2. **Booking Flow**: Test a reservation through the Hero Booking Widget or `/book` page to verify the confirmation page (`/booking-confirmation/[bookingRef]`) renders.
3. **Admin Portal**: Log in at `/ffs-portal-sec-99x/login` using your configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Confirm the dashboard, routes, and bookings list load.
4. **Dynamic Price Update**: Change a price in `/ffs-portal-sec-99x/routes`, reload `/book`, and verify the updated fare is shown immediately.
5. **Partner API Check**: Run a quick cURL check to ensure the Partner API is responding:
   ```bash
   curl -I -H "X-API-Key: ffs_partner_live_secret_key_2026" https://<your-domain>/api/v1/partner/routes
   ```
   Expected response: `HTTP/1.1 200 OK`.
