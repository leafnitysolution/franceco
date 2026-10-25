import os
import subprocess
import time

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

COMMON_CSS = """
@page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
        content: counter(page);
        font-size: 10px;
        color: #64748b;
    }
}
* {
    box-sizing: border-box;
}
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 13px;
    margin: 0;
    padding: 0;
    background: #ffffff;
}
.page-break {
    page-break-before: always;
}
.avoid-break {
    page-break-inside: avoid;
}
h1, h2, h3, h4 {
    color: #0b192c;
    font-family: Georgia, serif;
    page-break-after: avoid;
    margin-top: 1.4em;
    margin-bottom: 0.5em;
}
h1 {
    font-size: 26px;
    border-bottom: 2px solid #c5a059;
    padding-bottom: 8px;
    margin-top: 0;
}
h2 {
    font-size: 19px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    color: #0b192c;
}
h3 {
    font-size: 15px;
    color: #1e293b;
}
h4 {
    font-size: 13px;
    color: #334155;
}
p {
    margin: 0.5em 0 0.8em 0;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    page-break-inside: avoid;
}
th, td {
    padding: 8px 11px;
    border: 1px solid #cbd5e1;
    text-align: left;
    font-size: 11.5px;
}
th {
    background-color: #0b192c;
    color: #ffffff;
    font-weight: 700;
}
tr:nth-child(even) td {
    background-color: #f8fafc;
}
code {
    background: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 11px;
    font-family: Consolas, "Courier New", monospace;
    border: 1px solid #e2e8f0;
}
pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 10.5px;
    line-height: 1.45;
    overflow-x: auto;
    page-break-inside: avoid;
    font-family: Consolas, "Courier New", monospace;
    border: 1px solid #1e293b;
}
.badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 9999px;
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.badge-gold {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
}
.badge-green {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}
.badge-blue {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
}
.badge-navy {
    background: #0b192c;
    color: #f8fafc;
}
.callout {
    border-left: 4px solid #c5a059;
    background: #fdfbf7;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 0 8px 8px 0;
    page-break-inside: avoid;
}
.callout-title {
    font-weight: 700;
    color: #9e7b3b;
    margin-bottom: 3px;
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.cover-page {
    text-align: center;
    padding-top: 80px;
    padding-bottom: 60px;
}
.cover-title {
    font-size: 32px;
    color: #0b192c;
    margin-bottom: 12px;
    font-weight: 900;
    line-height: 1.2;
}
.cover-subtitle {
    font-size: 16px;
    color: #64748b;
    max-width: 500px;
    margin: 0 auto 30px auto;
    line-height: 1.5;
}
.cover-meta {
    margin-top: 60px;
    border-top: 1px solid #e2e8f0;
    padding-top: 25px;
    font-size: 12px;
    color: #475569;
}
"""

def generate_pdf(html_content, output_pdf):
    temp_html = output_pdf.replace(".pdf", ".temp.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)

    abs_html = os.path.abspath(temp_html)
    abs_pdf = os.path.abspath(output_pdf)

    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={abs_pdf}",
        abs_html
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)

    if os.path.exists(abs_pdf):
        print(f"Generated: {abs_pdf} ({os.path.getsize(abs_pdf):,} bytes)")
        return True
    else:
        print(f"Failed to generate: {abs_pdf}. Error: {res.stderr}")
        return False

# ==========================================
# 1. API DOCUMENTATION PDF
# ==========================================
api_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FranceGo - REST & B2B Partner API Documentation</title>
<style>{COMMON_CSS}</style>
</head>
<body>

<div class="cover-page">
    <div style="font-family: Georgia, serif; font-size: 18px; color: #c5a059; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">FRANCEGO VIP TRANSFERS & TOURS</div>
    <div class="cover-title">REST & B2B Partner API Documentation</div>
    <div class="cover-subtitle">Technical integration manual and complete endpoint reference for B2B travel partners, agencies, and affiliates.</div>
    <div style="margin: 20px 0;">
        <span class="badge badge-navy">VERSION 1.2.0</span>
        <span class="badge badge-green">PRODUCTION READY</span>
        <span class="badge badge-gold">JSON REST API</span>
    </div>
    <div class="cover-meta">
        <strong>Target Host:</strong> https://francegotransfers.io<br>
        <strong>API Base Path:</strong> /api/v1/partner<br>
        <strong>Documentation Date:</strong> October 2026<br>
        <strong>Support Hotline & WhatsApp:</strong> +33 7 81 11 83 94 | projet15df@outlook.fr
    </div>
</div>

<div class="page-break"></div>

<h1>1. Overview & Authentication</h1>
<p>The FranceGo B2B Partner API enables travel management companies, booking affiliates, luxury hotels, and concierge desks to programmatically query route pricing and submit real-time, door-to-door private chauffeur reservations.</p>

<div class="callout">
    <div class="callout-title">Authentication Header</div>
    All Partner endpoints require an authorized API key provided via the <code>X-API-Key</code> request header.
    <br><br>
    <code>X-API-Key: your_b2b_secret_partner_key_2026</code>
</div>

<h3>Standard HTTP Status Codes</h3>
<table>
    <tr><th>Status Code</th><th>Meaning</th><th>Description</th></tr>
    <tr><td><code>200 OK</code></td><td>Success</td><td>The request was successful and data is returned.</td></tr>
    <tr><td><code>201 Created</code></td><td>Resource Created</td><td>The booking was successfully validated and scheduled.</td></tr>
    <tr><td><code>400 Bad Request</code></td><td>Validation Error</td><td>Missing or invalid payload fields (e.g. invalid vehicleTier).</td></tr>
    <tr><td><code>401 Unauthorized</code></td><td>Authentication Failure</td><td>Missing or incorrect <code>X-API-Key</code> header.</td></tr>
    <tr><td><code>404 Not Found</code></td><td>Not Found</td><td>The requested route or booking reference does not exist.</td></tr>
    <tr><td><code>429 Too Many Requests</code></td><td>Rate Limit Exceeded</td><td>Too many requests submitted within the throttling window.</td></tr>
    <tr><td><code>500 Internal Error</code></td><td>Server Error</td><td>Internal error. Please contact dispatch support.</td></tr>
</table>

<h2>Vehicle Tiers & Luggage Specifications</h2>
<table>
    <tr><th>Tier Code</th><th>Vehicle Class</th><th>Max Pax</th><th>Max Bags</th><th>Ideal For</th></tr>
    <tr><td><code>SEDAN</code></td><td>Berline Sedan (Peugeot 508, VW Passat)</td><td>3</td><td>3</td><td>Couples & Business Executives</td></tr>
    <tr><td><code>ECONOMY_VAN</code></td><td>Economy Van (Mercedes Vito, Trafic)</td><td>8</td><td>8</td><td>Disney Families & Small Groups</td></tr>
    <tr><td><code>BUSINESS_VAN</code></td><td>VIP Business Van (Mercedes V-Class)</td><td>7</td><td>7</td><td>Luxury Travel & VIP Concierge</td></tr>
    <tr><td><code>MINIBUS</code></td><td>Executive Minibus (Mercedes Sprinter)</td><td>16</td><td>16</td><td>Large Tour Groups & Events</td></tr>
</table>

<div class="page-break"></div>

<h1>2. Partner Endpoints Reference</h1>

<h2>Endpoint 1: Create B2B Partner Booking</h2>
<p><span class="badge badge-green">POST</span> <code>/api/v1/partner/bookings</code></p>
<p>Submits a confirmed reservation into FranceGo's dispatch system. Triggers automated passenger email vouchers and sends notifications to the 24/7 chauffeur operations team.</p>

<h3>Request Headers</h3>
<pre>Content-Type: application/json
X-API-Key: your_b2b_secret_partner_key_2026</pre>

<h3>Request Body (JSON)</h3>
<pre>{{
  "originCode": "CDG",
  "destinationCode": "DLP",
  "pickupAddress": "Terminal 2E, Charles de Gaulle Airport",
  "dropoffAddress": "Disney's Newport Bay Club, Disneyland Paris",
  "pickupDateTime": "2026-11-15T10:30:00Z",
  "returnDateTime": null,
  "vehicleTier": "ECONOMY_VAN",
  "passengers": 4,
  "luggageCount": 4,
  "babySeats": 1,
  "boosterSeats": 1,
  "flightNumber": "AF1234",
  "customerName": "Sarah Jenkins",
  "customerEmail": "sarah.jenkins@example.com",
  "customerPhone": "+447911123456",
  "notes": "Flight arriving from London Heathrow Terminal 4",
  "partnerReference": "TRV-2026-9981"
}}</pre>

<h3>Response (<code>201 Created</code>)</h3>
<pre>{{
  "success": true,
  "message": "Booking confirmed successfully",
  "booking": {{
    "bookingRef": "FG-847291",
    "partnerReference": "TRV-2026-9981",
    "status": "CONFIRMED",
    "route": {{
      "origin": "Paris Charles de Gaulle Airport (CDG)",
      "destination": "Disneyland Paris Hotels & Parks",
      "distanceKm": 45,
      "estDurationMinutes": 45
    }},
    "pickupDateTime": "2026-11-15T10:30:00.000Z",
    "vehicleTier": "ECONOMY_VAN",
    "passengers": 4,
    "babySeats": 1,
    "boosterSeats": 1,
    "totalFareEur": 90,
    "paymentMethod": "CASH_OR_CARD_ON_ARRIVAL"
  }}
}}</pre>

<div class="page-break"></div>

<h2>Endpoint 2: Retrieve Booking by Reference</h2>
<p><span class="badge badge-blue">GET</span> <code>/api/v1/partner/bookings/{{bookingRef}}</code></p>
<p>Fetches real-time status, assigned details, and driver dispatch notes for any booking reference.</p>

<h3>cURL Example</h3>
<pre>curl -X GET "https://francegotransfers.io/api/v1/partner/bookings/FG-847291" \\
     -H "X-API-Key: your_b2b_secret_partner_key_2026"</pre>

<h3>Response (<code>200 OK</code>)</h3>
<pre>{{
  "success": true,
  "booking": {{
    "bookingRef": "FG-847291",
    "status": "CONFIRMED",
    "origin": "CDG",
    "destination": "DLP",
    "pickupAddress": "Terminal 2E, Charles de Gaulle Airport",
    "dropoffAddress": "Disney's Newport Bay Club, Disneyland Paris",
    "pickupDateTime": "2026-11-15T10:30:00.000Z",
    "vehicleTier": "ECONOMY_VAN",
    "totalFareEur": 90,
    "customerName": "Sarah Jenkins",
    "customerPhone": "+447911123456"
  }}
}}</pre>

<h2>Endpoint 3: Update or Cancel Booking</h2>
<p><span class="badge badge-gold">PATCH</span> <code>/api/v1/partner/bookings/{{bookingRef}}</code></p>
<p>Allows partners to cancel or adjust reservation notes prior to chauffeur dispatch.</p>

<h3>Request Body (JSON)</h3>
<pre>{{
  "status": "CANCELLED",
  "notes": "Flight cancelled by airline; full refund/no fee applied"
}}</pre>

<h2>Endpoint 4: Query Available Routes & Fixed Fares</h2>
<p><span class="badge badge-blue">GET</span> <code>/api/v1/partner/routes</code></p>
<p>Returns the full catalogue of all 25 official routes with current 4-tier fixed vehicle pricing.</p>

<h3>Response Snippet</h3>
<pre>{{
  "success": true,
  "updatedAt": "2026-10-26T02:00:00.000Z",
  "totalRoutes": 25,
  "routes": [
    {{
      "slug": "cdg-to-disneyland-paris",
      "origin": {{ "code": "CDG", "name": "Paris Charles de Gaulle Airport" }},
      "destination": {{ "code": "DLP", "name": "Disneyland Paris Hotels & Parks" }},
      "distanceKm": 45,
      "estDurationMinutes": 45,
      "pricing": {{
        "sedanPriceEur": 70,
        "economyVanPriceEur": 90,
        "businessVanPriceEur": 120,
        "minibusPriceEur": 180
      }}
    }}
  ]
}}</pre>

</body>
</html>
"""

# ==========================================
# 2. VPS DEPLOYMENT & SECURITY GUIDE PDF
# ==========================================
deploy_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FranceGo - VPS Server Security & Production Deployment Guide</title>
<style>{COMMON_CSS}</style>
</head>
<body>

<div class="cover-page">
    <div style="font-family: Georgia, serif; font-size: 18px; color: #c5a059; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">FRANCEGO VIP TRANSFERS & TOURS</div>
    <div class="cover-title">VPS Server Security & Production Deployment Guide</div>
    <div class="cover-subtitle">Complete systems manual for deploying on dedicated Linux VPS (Ubuntu/Debian) with PostgreSQL, Nginx, Let's Encrypt SSL, and server-end security hardening.</div>
    <div style="margin: 20px 0;">
        <span class="badge badge-navy">LINUX SYSADMIN MANUAL</span>
        <span class="badge badge-green">CIS HARDENING COMPLIANT</span>
        <span class="badge badge-gold">POSTGRESQL NATIVE</span>
    </div>
    <div class="cover-meta">
        <strong>Server Hostname:</strong> srv2088392<br>
        <strong>Target Domain:</strong> francegotransfers.io<br>
        <strong>Primary Chauffeur Dispatch:</strong> +33 7 81 11 83 94 | projet15df@outlook.fr<br>
        <strong>Publication Date:</strong> October 2026
    </div>
</div>

<div class="page-break"></div>

<h1>1. Server-End Security & Sudoer Hardening</h1>

<p>Granting <code>sudo</code> permissions to a dedicated non-root user (e.g. <code>francegotransfers</code>) is standard industry best practice. However, running applications as root or leaving server ports exposed creates significant security hazards. Follow this checklist to ensure complete server security.</p>

<h2>Security Architecture Principles</h2>
<table>
    <tr><th>Security Domain</th><th>Standard Best Practice</th><th>Vulnerable Pattern to Avoid</th></tr>
    <tr><td><strong>Application Runtime</strong></td><td>Run PM2 and Node.js strictly under <code>francegotransfers</code></td><td>Running <code>pm2 start</code> as <code>root</code></td></tr>
    <tr><td><strong>Sudo Configuration</strong></td><td>Enforce password prompt for all <code>sudo</code> actions</td><td>Using <code>NOPASSWD: ALL</code> in <code>/etc/sudoers</code></td></tr>
    <tr><td><strong>Secret Storage</strong></td><td>Lock down <code>.env</code> file permissions to <code>600</code></td><td>Leaving <code>.env</code> world-readable (<code>644</code> or <code>777</code>)</td></tr>
    <tr><td><strong>Database Access</strong></td><td>Bind PostgreSQL solely to <code>127.0.0.1</code></td><td>Exposing port <code>5432</code> to <code>0.0.0.0/0</code></td></tr>
    <tr><td><strong>Firewall (UFW)</strong></td><td>Only open Ports 22 (SSH), 80 (HTTP), 443 (HTTPS)</td><td>Exposing Next.js port <code>3000</code> publicly</td></tr>
    <tr><td><strong>SSH Authentication</strong></td><td>Disable root SSH login (<code>PermitRootLogin no</code>)</td><td>Permitting direct SSH logins as root</td></tr>
</table>

<h2>Server Hardening Commands</h2>

<h3>1. Restrict Secret File Permissions</h3>
<pre>chmod 600 /var/www/francego/.env</pre>

<h3>2. Configure Linux Directory & File Permissions</h3>
<pre># Ensure correct user ownership
sudo chown -R francegotransfers:francegotransfers /var/www/francego

# Directory permissions: 755 (drwxr-xr-x)
sudo find /var/www/francego -type d -exec chmod 755 {{}} \\;

# File permissions: 644 (-rw-r--r--)
sudo find /var/www/francego -type f -exec chmod 644 {{}} \\;

# Re-lock .env
sudo chmod 600 /var/www/francego/.env</pre>

<h3>3. Configure UFW Firewall</h3>
<pre>sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Nginx)
sudo ufw allow 443/tcp   # HTTPS (Nginx SSL)
sudo ufw enable</pre>

<h3>4. Disable Direct Root SSH Login</h3>
<p>Edit <code>/etc/ssh/sshd_config</code> and verify:</p>
<pre>PermitRootLogin no
MaxAuthTries 4</pre>
<pre>sudo systemctl restart ssh</pre>

<h3>5. Install Fail2ban (Anti-Brute Force)</h3>
<pre>sudo apt install -y fail2ban
sudo systemctl enable fail2ban && sudo systemctl start fail2ban</pre>

<div class="page-break"></div>

<h1>2. Step-by-Step VPS Production Deployment</h1>

<h2>Step 1: Domain DNS A Record Setup</h2>
<p>Point your domain's DNS A records to your VPS IP address (<code>141.136.36.40</code>):</p>
<table>
    <tr><th>Type</th><th>Host</th><th>Value (VPS IP)</th><th>TTL</th></tr>
    <tr><td><code>A</code></td><td><code>@</code></td><td><code>141.136.36.40</code></td><td>Automatic / 300s</td></tr>
    <tr><td><code>A</code></td><td><code>www</code></td><td><code>141.136.36.40</code></td><td>Automatic / 300s</td></tr>
</table>

<h2>Step 2: PostgreSQL Installation & Database Creation</h2>
<pre>sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql && sudo systemctl start postgresql

# Create Database User and Schema
sudo -u postgres psql</pre>
<p>Inside PostgreSQL:</p>
<pre>CREATE USER francego_user WITH PASSWORD 'YourSecurePassword2026!';
CREATE DATABASE francego_db OWNER francego_user;
GRANT ALL PRIVILEGES ON DATABASE francego_db TO francego_user;
\\q</pre>

<h2>Step 3: Import <code>database_init.sql</code></h2>
<p>Import the master SQL script containing all 6 tables, constraints, 5 categories, 14 hubs, and 25 routes:</p>
<pre>cd /var/www/francego
psql -U francego_user -d francego_db -f database_init.sql</pre>

<h2>Step 4: Configure Production <code>.env</code></h2>
<pre>DATABASE_URL="postgresql://francego_user:YourSecurePassword2026!@127.0.0.1:5432/francego_db?schema=public"
ADMIN_EMAIL="brian.arangala@outlook.com"
ADMIN_PASSWORD="YourSecureAdminPassword2026!"
JWT_SECRET="8e30d232bfe7d16e9e4c1c3206268063d9cfdb2ea2ff8a31"
PARTNER_API_KEY="your_b2b_secret_partner_key_2026"
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="projet15df@outlook.fr"
SMTP_PASS="your-email-app-password"
ADMIN_DISPATCH_EMAIL="projet15df@outlook.fr"</pre>

<h2>Step 5: Build & Run Next.js Application</h2>
<pre>cd /var/www/francego
git pull origin production-postgres-manual
npx prisma generate
npm run build

# Start via PM2
pm2 start npm --name "francego" -- start -- -p 3000
pm2 save && pm2 startup</pre>

<h2>Step 6: Nginx Reverse Proxy & Free Let's Encrypt SSL</h2>
<pre>sudo nano /etc/nginx/sites-available/francego</pre>
<pre>server {{
    listen 80;
    server_name francegotransfers.io www.francegotransfers.io;
    client_max_body_size 20M;

    location / {{
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
}}</pre>
<pre>sudo ln -s /etc/nginx/sites-available/francego /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Install SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d francegotransfers.io -d www.francegotransfers.io</pre>

</body>
</html>
"""

# ==========================================
# 3. COMPREHENSIVE MASTER DOCUMENTATION PDF
# ==========================================
master_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FranceGo VIP Transfers - Complete Platform Technical Manual</title>
<style>{COMMON_CSS}</style>
</head>
<body>

<div class="cover-page">
    <div style="font-family: Georgia, serif; font-size: 18px; color: #c5a059; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">FRANCEGO VIP TRANSFERS & TOURS</div>
    <div class="cover-title">Complete Platform Technical Manual & Reference</div>
    <div class="cover-subtitle">Enterprise architectural reference manual covering VPS server hardening, PostgreSQL manual deployment, REST & B2B Partner APIs, database schemas, and multi-language translation.</div>
    <div style="margin: 20px 0;">
        <span class="badge badge-navy">ENTERPRISE EDITION</span>
        <span class="badge badge-green">POSTGRESQL 16 NATIVE</span>
        <span class="badge badge-gold">HYBRID I18N SYSTEM</span>
    </div>
    <div class="cover-meta">
        <strong>Domain:</strong> https://francegotransfers.io<br>
        <strong>Host Server:</strong> srv2088392 (141.136.36.40)<br>
        <strong>24/7 Dispatch Hotline & WhatsApp:</strong> +33 7 81 11 83 94<br>
        <strong>Author:</strong> Antigravity Architecture Desk | October 2026
    </div>
</div>

<div class="page-break"></div>

<h1>1. Architectural Overview & System Modules</h1>
<p>FranceGo VIP Transfers is a high-availability chauffeur reservation platform optimized for Paris airport transfers (CDG, Orly, Beauvais), Disneyland Paris shuttles, and curated day trips across France.</p>

<h2>Core Architectural Modules</h2>
<table>
    <tr><th>Module</th><th>Technology Stack</th><th>Role in System</th></tr>
    <tr><td><strong>Front-End UI</strong></td><td>Next.js 15, TailwindCSS, Lucide Icons</td><td>High-converting, responsive booking engine, route showcases, and fleet details.</td></tr>
    <tr><td><strong>Back-Office Portal</strong></td><td>React Server Components, JWT Auth</td><td>Secure dispatch dashboard for booking tracking, CSV export, and price management.</td></tr>
    <tr><td><strong>Database Layer</strong></td><td>Native PostgreSQL 16 via Prisma ORM</td><td>Zero SQLite in production; pre-seeded with 25 routes, 14 hubs, and customer reviews.</td></tr>
    <tr><td><strong>Partner API</strong></td><td>REST Endpoints, Timing-Safe API Keys</td><td>B2B integrations for third-party travel agencies, hotels, and affiliates.</td></tr>
    <tr><td><strong>Hybrid i18n</strong></td><td>React Context + Google Translate Bridge</td><td>Instant native translations across 6 languages + dynamic database auto-translation.</td></tr>
    <tr><td><strong>Reverse Proxy & SSL</strong></td><td>Nginx, Let's Encrypt Certbot</td><td>TLS 1.3 termination, HTTP/2 multiplexing, and reverse proxying to port 3000.</td></tr>
</table>

<h2>Hubs & Airport Coverage</h2>
<table>
    <tr><th>Hub Code</th><th>Hub Name</th><th>Category</th><th>Key Operating Features</th></tr>
    <tr><td><code>CDG</code></td><td>Paris Charles de Gaulle Airport</td><td>AIRPORT</td><td>Terminals 1, 2A-2G, 3; Flight tracking & Meet-and-Greet included.</td></tr>
    <tr><td><code>ORY</code></td><td>Paris Orly Airport</td><td>AIRPORT</td><td>Terminals 1-4; Fast express routes to central Paris & Disney.</td></tr>
    <tr><td><code>BVA</code></td><td>Paris Beauvais Tillé Airport</td><td>AIRPORT</td><td>Low-cost carrier gateway; Long-distance fixed shuttle rates.</td></tr>
    <tr><td><code>DLP</code></td><td>Disneyland Paris Hotels & Parks</td><td>AMUSEMENT_PARK</td><td>Marne-la-Vallée, Val d'Europe, Disney partner hotels.</td></tr>
    <tr><td><code>PAR</code></td><td>Paris City Center</td><td>CITY_CENTER</td><td>All 20 arrondissements door-to-door hotel & residence service.</td></tr>
    <tr><td><code>GDN</code></td><td>Gare du Nord & Paris Train Stations</td><td>TRAIN_STATION</td><td>Eurostar, Thalys, Gare de Lyon, Gare Montparnasse.</td></tr>
    <tr><td><code>VERS</code></td><td>Château de Versailles</td><td>PALACE</td><td>Palace excursions, private chauffeur wait-and-return options.</td></tr>
</table>

<div class="page-break"></div>

<h1>2. Server-End Security & Sudoer Hardening</h1>

<h2>Sudoer Hardening Guidelines</h2>
<p>Running server processes under <code>root</code> creates substantial risks if any package dependency contains a vulnerability. By isolating the application under user <code>francegotransfers</code> with password-enforced <code>sudo</code>, any exploit is contained within the restricted user sandbox.</p>

<div class="callout">
    <div class="callout-title">Security Golden Rules</div>
    1. Never run <code>pm2 start</code> as <code>root</code>.<br>
    2. Never use <code>NOPASSWD: ALL</code> in <code>/etc/sudoers</code>.<br>
    3. Keep <code>.env</code> permissions set strictly to <code>chmod 600</code>.<br>
    4. Keep PostgreSQL port <code>5432</code> and Next.js port <code>3000</code> blocked by UFW.
</div>

<h3>Server Hardening Script</h3>
<pre># 1. Lock down environment variables
chmod 600 /var/www/francego/.env

# 2. Assign project directory ownership to deploy user
sudo chown -R francegotransfers:francegotransfers /var/www/francego
sudo find /var/www/francego -type d -exec chmod 755 {{}} \\;
sudo find /var/www/francego -type f -exec chmod 644 {{}} \\;
sudo chmod 600 /var/www/francego/.env

# 3. Configure UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 4. Disable Root SSH Login in /etc/ssh/sshd_config
# PermitRootLogin no
sudo systemctl restart ssh

# 5. Enable Fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban && sudo systemctl start fail2ban</pre>

<div class="page-break"></div>

<h1>3. REST API & B2B Partner Reference</h1>

<h2>Authentication</h2>
<p>Partner API endpoints authenticate via the <code>X-API-Key</code> HTTP header.</p>

<h2>Endpoints Summary</h2>
<table>
    <tr><th>HTTP Method</th><th>Endpoint Path</th><th>Purpose</th><th>Access Level</th></tr>
    <tr><td><span class="badge badge-green">POST</span></td><td><code>/api/v1/partner/bookings</code></td><td>Create new private transfer reservation</td><td>Partner API Key</td></tr>
    <tr><td><span class="badge badge-blue">GET</span></td><td><code>/api/v1/partner/bookings/{{ref}}</code></td><td>Get real-time booking details & status</td><td>Partner API Key</td></tr>
    <tr><td><span class="badge badge-gold">PATCH</span></td><td><code>/api/v1/partner/bookings/{{ref}}</code></td><td>Update notes or cancel a booking</td><td>Partner API Key</td></tr>
    <tr><td><span class="badge badge-blue">GET</span></td><td><code>/api/v1/partner/routes</code></td><td>Query all 25 routes with fixed pricing</td><td>Partner API Key</td></tr>
    <tr><td><span class="badge badge-green">POST</span></td><td><code>/api/contact</code></td><td>Submit customer contact inquiries</td><td>Public (Rate-limited)</td></tr>
    <tr><td><span class="badge badge-blue">GET</span></td><td><code>/api/reviews/external</code></td><td>TripAdvisor & Google aggregate reviews</td><td>Public</td></tr>
</table>

<h3>Partner Booking Creation Example (cURL)</h3>
<pre>curl -X POST "https://francegotransfers.io/api/v1/partner/bookings" \\
     -H "Content-Type: application/json" \\
     -H "X-API-Key: your_b2b_secret_partner_key_2026" \\
     -d '{{
       "originCode": "CDG",
       "destinationCode": "DLP",
       "pickupAddress": "Terminal 2F, Paris CDG",
       "dropoffAddress": "Disneyland Hotel, Paris",
       "pickupDateTime": "2026-11-20T14:00:00Z",
       "vehicleTier": "ECONOMY_VAN",
       "passengers": 5,
       "babySeats": 1,
       "customerName": "Robert Brown",
       "customerEmail": "robert.b@example.com",
       "customerPhone": "+447911987654"
     }}'</pre>

<div class="page-break"></div>

<h1>4. Database Schema & Multi-Language System</h1>

<h2>Database Entity Structure</h2>
<table>
    <tr><th>Table Name</th><th>Record Count</th><th>Description</th></tr>
    <tr><td><code>LocationCategory</code></td><td>5 Categories</td><td>AIRPORT, AMUSEMENT_PARK, CITY_CENTER, TRAIN_STATION, PALACE.</td></tr>
    <tr><td><code>Location</code></td><td>14 Locations</td><td>CDG, ORY, BVA, DLP, PAR, ASTX, GDN, VERS, GIV, FTB, CHMP, NORM, MSM, LOIRE.</td></tr>
    <tr><td><code>Route</code></td><td>25 Routes</td><td>Header & footer routes with fixed 4-tier pricing (Sedan, Eco Van, VIP Van, Minibus).</td></tr>
    <tr><td><code>Booking</code></td><td>Dynamic</td><td>Customer reservations, flight numbers, child seats, status tracking.</td></tr>
    <tr><td><code>Review</code></td><td>Dynamic</td><td>Verified customer testimonials & ratings.</td></tr>
    <tr><td><code>ContactSubmission</code></td><td>Dynamic</td><td>Lead tracking from the public contact desk.</td></tr>
</table>

<h2>Multi-Language Hybrid System</h2>
<p>The platform employs an automated two-tier translation system:</p>
<ol>
    <li><strong>Native React Dictionaries (Layer 1):</strong> High-converting, human-translated terminology for all UI navigation, buttons, badges, forms, and fleet specifications across <strong>English (EN)</strong>, <strong>French (FR)</strong>, <strong>Spanish (ES)</strong>, <strong>Italian (IT)</strong>, <strong>German (DE)</strong>, and <strong>Portuguese (PT)</strong>.</li>
    <li><strong>Google Translate DOM Bridge (Layer 2):</strong> A silent background client bridge that synchronizes with the user's selected language cookie (<code>googtrans=/en/code</code>) to dynamically translate database content (e.g., dynamic route titles, descriptions, and FAQs) across the entire DOM.</li>
</ol>

<div class="callout">
    <div class="callout-title">Official Dispatch Contact</div>
    <strong>24/7 Hotline & WhatsApp:</strong> +33 7 81 11 83 94<br>
    <strong>Dispatch Email:</strong> projet15df@outlook.fr<br>
    <strong>Web Domain:</strong> https://francegotransfers.io
</div>

</body>
</html>
"""

# ==========================================
# EXECUTE GENERATION
# ==========================================
os.makedirs("docs", exist_ok=True)
print("Starting PDF generation...")

generate_pdf(api_html, "docs/FranceGo_API_Documentation.pdf")
generate_pdf(deploy_html, "docs/FranceGo_VPS_Deployment_and_Security_Guide.pdf")
generate_pdf(master_html, "docs/FranceGo_Comprehensive_System_Documentation.pdf")

print("All PDFs successfully created.")
