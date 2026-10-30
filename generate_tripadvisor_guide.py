import os
import subprocess
import shutil

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DOCS_DIR = os.path.abspath("docs")
os.makedirs(DOCS_DIR, exist_ok=True)

HTML_CONTENT = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FranceGo - TripAdvisor Content API Integration & Setup Guide</title>
<style>
@page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @top-right {
        content: "FranceGo VIP Transfers & Tours | TripAdvisor Setup Guide";
        font-size: 8pt;
        color: #94a3b8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    @bottom-left {
        content: "TripAdvisor Content API Integration Manual | Client Reference";
        font-size: 8pt;
        color: #94a3b8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    @bottom-right {
        content: "Page " counter(page);
        font-size: 8pt;
        color: #64748b;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
}
* { box-sizing: border-box; }
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 11pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
}
.page-break { page-break-before: always; }
.avoid-break { page-break-inside: avoid; }
.cover-page {
    text-align: center;
    padding-top: 60px;
    padding-bottom: 40px;
}
.cover-brand {
    font-family: Georgia, serif;
    font-size: 16pt;
    color: #c5a059;
    font-weight: bold;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 12px;
}
.cover-title {
    font-family: Georgia, serif;
    font-size: 24pt;
    color: #0b192c;
    font-weight: 800;
    line-height: 1.25;
    margin-bottom: 14px;
}
.cover-subtitle {
    font-size: 12.5pt;
    color: #475569;
    max-width: 580px;
    margin: 0 auto 25px auto;
    line-height: 1.5;
}
.badge-row { margin: 15px 0 30px 0; }
.badge {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 9999px;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 4px;
}
.badge-navy { background: #0b192c; color: #f8fafc; }
.badge-gold { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.badge-green { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.cover-meta {
    margin-top: 40px;
    border-top: 1px solid #e2e8f0;
    padding-top: 20px;
    font-size: 9.5pt;
    color: #475569;
    line-height: 1.8;
}
h1, h2, h3 {
    color: #0b192c;
    font-family: Georgia, serif;
    page-break-after: avoid;
}
h1 {
    font-size: 18pt;
    border-bottom: 2px solid #c5a059;
    padding-bottom: 5px;
    margin-top: 0;
}
h2 {
    font-size: 14pt;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 1.1em;
}
h3 {
    font-size: 11.5pt;
    color: #1e293b;
    margin-top: 0.9em;
}
p { margin: 0.4em 0 0.7em 0; }
ol, ul { margin: 0.4em 0 0.8em 1.2em; padding: 0; }
li { margin-bottom: 0.35em; }
table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 15px 0;
    page-break-inside: avoid;
}
th, td {
    padding: 7px 10px;
    border: 1px solid #cbd5e1;
    text-align: left;
    font-size: 9.5pt;
}
th {
    background-color: #0b192c;
    color: #ffffff;
    font-weight: 700;
}
tr:nth-child(even) td { background-color: #f8fafc; }
code {
    background: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 9pt;
    font-family: Consolas, monospace;
    border: 1px solid #e2e8f0;
}
pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 9pt;
    line-height: 1.4;
    overflow-x: auto;
    page-break-inside: avoid;
    font-family: Consolas, monospace;
}
.callout {
    border-left: 4px solid #c5a059;
    background: #fdfbf7;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
    font-size: 9.5pt;
}
.callout-title {
    font-weight: 700;
    color: #9e7b3b;
    margin-bottom: 4px;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.step-number {
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #0b192c;
    color: #ffffff;
    border-radius: 50%;
    text-align: center;
    line-height: 24px;
    font-weight: bold;
    font-size: 9pt;
    margin-right: 6px;
}
</style>
</head>
<body>

<div class="cover-page">
    <div class="cover-brand">FranceGo VIP Transfers & Tours</div>
    <div class="cover-title">TripAdvisor Content API Setup & Integration Guide</div>
    <div class="cover-subtitle">Complete developer & client reference for synchronizing official TripAdvisor star ratings, review counts, traveler testimonials, and ranking badges on FranceGo.</div>
    
    <div class="badge-row">
        <span class="badge badge-navy">TRIPADVISOR CONTENT API</span>
        <span class="badge badge-gold">5,000 FREE CALLS/MONTH</span>
        <span class="badge badge-green">LIVE VERIFIED REVIEWS</span>
    </div>

    <div class="cover-meta">
        <strong>Target Website:</strong> https://francegotransfers.io<br>
        <strong>API Version:</strong> TripAdvisor Content API v1<br>
        <strong>Admin Back-Office Path:</strong> <code>/ffs-portal-sec-99x/settings</code><br>
        <strong>Chauffeur & Dispatch Hotline:</strong> +33 7 81 11 83 94 | projet15df@outlook.fr<br>
        <strong>Publication Date:</strong> October 2026
    </div>
</div>

<div class="page-break"></div>

<h1>1. How TripAdvisor Works on FranceGo</h1>
<p>FranceGo uses the official <strong>TripAdvisor Content API</strong> to provide undeniable social proof and trust for international travelers arriving in Paris:</p>

<ol>
    <li><strong>Official Star Rating & Badge:</strong> Displays your live TripAdvisor average score (e.g. <code>4.9 / 5.0</code>) and total review count directly on the homepage, booking widget, and footer trust seals.</li>
    <li><strong>Verified Guest Reviews:</strong> Automatically pulls recent customer feedback, traveler names, countries of origin, and dates of travel directly onto <code>https://francegotransfers.io/reviews</code>.</li>
    <li><strong>Ranking Badge:</strong> Synchronizes your official TripAdvisor ranking (e.g. <em>"#1 of 128 Transportation Services in Paris"</em>).</li>
    <li><strong>Zero Downtime Fallback:</strong> If the TripAdvisor API key is not configured, or if the monthly quota is reached, FranceGo automatically displays verified reviews stored in your local PostgreSQL database. The website never displays broken widgets or blank reviews.</li>
</ol>

<div class="callout">
    <div class="callout-title">TripAdvisor Free Quota</div>
    TripAdvisor provides approved accounts with <strong>5,000 free API calls every month</strong>. Because FranceGo caches TripAdvisor results on the server for 1 hour (<code>next: { revalidate: 3600 }</code>), the website consumes only ~720 calls per month, meaning your TripAdvisor API usage is <strong>100% free</strong>.
</div>

<div class="page-break"></div>

<h1>2. Step-by-Step Setup: Getting Your TripAdvisor API Key</h1>

<h2><span class="step-number">1</span> Register on the TripAdvisor Developer Portal</h2>
<ol>
    <li>Open your browser and navigate to: <br>
    <a href="https://developer-tripadvisor.com/content-api/">https://developer-tripadvisor.com/content-api/</a></li>
    <li>Click <strong>"Request API Key"</strong> or <strong>"Sign Up / Log In"</strong>.</li>
    <li>Create your developer profile using your business email address.</li>
</ol>

<h2><span class="step-number">2</span> Request a Content API Key</h2>
<ol>
    <li>Navigate to <strong>My Applications / API Keys</strong>.</li>
    <li>Click <strong>"Create New Application"</strong>.</li>
    <li>Fill in application details:
        <ul>
            <li><strong>Application Name:</strong> <code>FranceGo VIP Transfers</code></li>
            <li><strong>Website URL:</strong> <code>https://francegotransfers.io</code></li>
            <li><strong>Use Case:</strong> Select <em>"Displaying TripAdvisor reviews & ratings on our official website"</em>.</li>
        </ul>
    </li>
    <li>Submit the request. TripAdvisor provides an API key (a 32-character hexadecimal key).</li>
</ol>

<h2><span class="step-number">3</span> Find Your Business "Location ID"</h2>
<p>Every business on TripAdvisor has a unique numerical <strong>Location ID</strong>. You can find yours in seconds:</p>

<h3>Method A: From Your TripAdvisor Page URL (Fastest)</h3>
<ol>
    <li>Open TripAdvisor in your browser and search for your business.</li>
    <li>Look at the URL in your browser's address bar. For example: <br>
    <code>https://www.tripadvisor.com/Attraction_Review-g187147-<b>d12345678</b>-Reviews-FranceGo_Transfers-Paris.html</code></li>
    <li>The numbers following the <code>-d</code> is your <strong>Location ID</strong>:
        <br>👉 In the example above, the Location ID is <code>12345678</code>.</li>
</ol>

<h3>Method B: Using the FranceGo Admin Search Tool</h3>
<ol>
    <li>Log in to your FranceGo Admin Panel: <br>
    <code>https://francegotransfers.io/ffs-portal-sec-99x/settings</code></li>
    <li>In the <strong>TripAdvisor Content API</strong> section, enter your API key and type your business name in the <strong>"Search TripAdvisor Listing"</strong> tool.</li>
    <li>Click <strong>Search</strong>, and click <strong>"Select"</strong> on your business to automatically fill the Location ID!</li>
</ol>

<div class="page-break"></div>

<h1>3. Entering Credentials in FranceGo Admin Panel</h1>
<p>You can configure and test your TripAdvisor connection directly in the Back-Office without editing any files on the server:</p>

<ol>
    <li>Log in to the Admin Dashboard at: <br>
    <strong><code>https://francegotransfers.io/ffs-portal-sec-99x</code></strong></li>
    <li>Click on <strong>"API & Settings"</strong> in the top navigation bar.</li>
    <li>Scroll down to the <strong>"TripAdvisor Content API"</strong> card:
        <ul>
            <li><strong>TripAdvisor API Key:</strong> Paste your developer API key.</li>
            <li><strong>Location ID:</strong> Paste your numerical location ID (e.g. <code>12345678</code>).</li>
            <li><strong>TripAdvisor URL:</strong> Paste your full TripAdvisor profile URL.</li>
        </ul>
    </li>
    <li>Click the <strong>"Test TripAdvisor API"</strong> button. A live query will execute immediately, verifying the connection and displaying your business name, live rating, and review count with a green checkmark!</li>
    <li>Click <strong>"Save All Settings"</strong> at the bottom. The changes are saved to PostgreSQL and take effect immediately on the live website.</li>
</ol>

<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

<h1>Summary of Settings Parameters</h1>
<table>
    <tr><th>Parameter</th><th>Where to Find</th><th>Role on Website</th></tr>
    <tr>
        <td><code>TRIPADVISOR_API_KEY</code></td>
        <td>TripAdvisor Developer Portal &gt; My Apps</td>
        <td>Authenticates requests to TripAdvisor's API servers.</td>
    </tr>
    <tr>
        <td><code>TRIPADVISOR_LOCATION_ID</code></td>
        <td>URL after <code>-d</code> (e.g. <code>12345678</code>)</td>
        <td>Targets your specific business profile.</td>
    </tr>
    <tr>
        <td><code>TRIPADVISOR_URL</code></td>
        <td>Direct link to your TripAdvisor page</td>
        <td>Opens official review page when guests click "Review on TripAdvisor".</td>
    </tr>
</table>

<div class="callout">
    <div class="callout-title">24/7 Technical Operations Desk</div>
    <strong>Hotline & WhatsApp:</strong> +33 7 81 11 83 94<br>
    <strong>Support Email:</strong> projet15df@outlook.fr<br>
    <strong>Web Domain:</strong> https://francegotransfers.io
</div>

</body>
</html>
"""

temp_html = os.path.join(DOCS_DIR, "temp_trip.html")
pdf_path = os.path.join(DOCS_DIR, "FranceGo_TripAdvisor_API_Setup_Guide.pdf")

with open(temp_html, "w", encoding="utf-8") as f:
    f.write(HTML_CONTENT)

cmd = [
    CHROME_PATH,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    temp_html
]

res = subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(temp_html):
    os.remove(temp_html)

if os.path.exists(pdf_path):
    print(f"Generated: {pdf_path} ({os.path.getsize(pdf_path):,} bytes)")
    shutil.copyfile(pdf_path, os.path.basename(pdf_path))
else:
    print("Failed to generate PDF:", res.stderr)
