# FastForward Shuttle - Production Deployment & Hosting Guide

This guide details step-by-step instructions for deploying the **FastForward Shuttle** booking platform to production environments, as well as migrating to a local database server (e.g., PostgreSQL).

---

## 🗄️ Database Setup Options

The project uses **Prisma ORM**, which supports seamless switching between database backends (SQLite for lightweight/local development vs. PostgreSQL for production/multi-node deployments).

### Option A: Local PostgreSQL Database Server (Recommended for Production / Concurrency)

#### Step 1: Install PostgreSQL or Run via Docker

**Using Docker (Fastest & Simplest):**
```bash
docker run --name fastforward-postgres \
  -e POSTGRES_USER=fastforward \
  -e POSTGRES_PASSWORD=MySecurePassword123 \
  -e POSTGRES_DB=fastforward_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Using Local PostgreSQL Service (Linux / Ubuntu):**
```bash
# Install PostgreSQL
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# Create database user and database
sudo -u postgres psql -c "CREATE USER fastforward WITH PASSWORD 'MySecurePassword123';"
sudo -u postgres psql -c "CREATE DATABASE fastforward_db OWNER fastforward;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fastforward_db TO fastforward;"
```

#### Step 2: Update `prisma/schema.prisma`

Change the `datasource db` block in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Step 3: Update `.env` File

Set your PostgreSQL connection string in `.env`:

```env
DATABASE_URL="postgresql://fastforward:MySecurePassword123@localhost:5432/fastforward_db?schema=public"
```

#### Step 4: Run Prisma Push & Seed

```bash
# Generate Prisma Client & Push Schema to PostgreSQL
npx prisma db push

# Seed initial locations, routes, and default published reviews
npm run seed
```

---

### Option B: Local SQLite Database (Default)

If you prefer SQLite for light single-server deployment without installing database daemons:

1. Keep `provider = "sqlite"` in `prisma/schema.prisma`.
2. Set `DATABASE_URL="file:./dev.db"` in `.env`.
3. Run `npx prisma db push && npm run seed`.

---

## ⚙️ Environment Variables Summary

Ensure your `.env` file contains all necessary production variables:

| Variable | Description | Production Example |
|---|---|---|
| `DATABASE_URL` | Prisma DB URI | `postgresql://fastforward:Pass@localhost:5432/fastforward_db` |
| `ADMIN_EMAIL` | Admin Login Email | `admin@fastforwardshuttle.com` |
| `ADMIN_PASSWORD` | Admin Login Password | `SecureAdminPass2026!` |
| `JWT_SECRET` | Admin Session JWT Key | `a_very_long_random_secret_hash_key_2026` |
| `SMTP_HOST` | Transactional Email Server | `smtp.gmail.com` or `smtp.mailgun.org` |
| `SMTP_PORT` | Email Port | `587` |
| `SMTP_SECURE` | Transport Security | `false` (for TLS port 587) |
| `SMTP_USER` | Email Dispatch Account | `dispatch@fastforwardshuttle.com` |
| `SMTP_PASS` | SMTP App Password | `your-smtp-app-password` |
| `ADMIN_DISPATCH_EMAIL` | Admin Alert Receiver | `admin@fastforwardshuttle.com` |

---

## 🚀 Server Deployment Options

### Option 1: VPS Deployment (Ubuntu / Debian + Nginx + PM2)

Recommended for deploying on your own Linux server (DigitalOcean, AWS EC2, Hetzner, Linode).

#### 1. Install Node.js 20 LTS, Nginx & PM2
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx
sudo npm install -g pm2
```

#### 2. Clone Project & Install Dependencies
```bash
cd /var/www
git clone <your-repo-url> fastforward-shuttle
cd fastforward-shuttle

npm install
```

#### 3. Setup Production Database & Seed
```bash
nano .env

# Push schema and seed production data
npx prisma db push
npm run seed

# Build Next.js Production Bundle
npm run build
```

#### 4. Start Server with PM2 Process Manager
```bash
pm2 start npm --name "fastforward-shuttle" -- start -- -p 3000

# Save process list for system reboot persistence
pm2 save
pm2 startup
```

#### 5. Configure Nginx Reverse Proxy & SSL
Create `/etc/nginx/sites-available/fastforwardshuttle.conf`:

```nginx
server {
    server_name fastforwardshuttle.com www.fastforwardshuttle.com;

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

Enable Nginx config and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/fastforwardshuttle.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue free SSL certificate via Let's Encrypt
sudo certbot --nginx -d fastforwardshuttle.com -d www.fastforwardshuttle.com
```

---

### Option 2: Deployment on Vercel

1. Push your repository to GitHub / GitLab.
2. Connect your repo in the [Vercel Dashboard](https://vercel.com).
3. Configure environment variables (`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, etc.).
4. Set Build Command: `npx prisma db push && npx prisma generate && next build`
5. Click **Deploy**.

---

## 🔒 Security & Maintenance Best Practices

1. **Credentials Management**: Always change `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` in `.env` before public launch.
2. **OWASP Auth Rules**: Login route (`/admin/login`) enforces 5-attempt rate-limiting per 15 mins and sanitized generic error reporting to prevent username enumeration attacks.
3. **Transactional SMTP**: Use dedicated application credentials for `SMTP_PASS` (e.g. Gmail App Password or Mailgun API Key) to guarantee email delivery for confirmations and admin alerts.
