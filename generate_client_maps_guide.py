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
<title>FranceGo - Google Maps Platform API Setup Guide for Clients</title>
<style>
@page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @top-right {
        content: "FranceGo VIP Transfers & Tours | Client Guide";
        font-size: 8pt;
        color: #94a3b8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    @bottom-left {
        content: "Google Maps API Setup Guide | Confidential";
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
.callout-danger {
    border-left: 4px solid #ef4444;
    background: #fef2f2;
}
.callout-danger .callout-title {
    color: #b91c1c;
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
    <div class="cover-title">Client Guide: Google Maps API Setup</div>
    <div class="cover-subtitle">Complete step-by-step instructions for business owners to set up Google Maps Platform, enable required Routes & Places APIs, and configure credentials for FranceGo.</div>
    
    <div class="badge-row">
        <span class="badge badge-navy">CLIENT SETUP MANUAL</span>
        <span class="badge badge-gold">GOOGLE MAPS PLATFORM</span>
        <span class="badge badge-green">STEP-BY-STEP</span>
    </div>

    <div class="cover-meta">
        <strong>Target Website:</strong> https://francegotransfers.io<br>
        <strong>Required APIs:</strong> Routes API, Places API (New), Geocoding API<br>
        <strong>Free Monthly Tier:</strong> Google provides $200 free monthly credit (covers thousands of transfers)<br>
        <strong>Dispatch & Tech Support:</strong> +33 7 81 11 83 94 | projet15df@outlook.fr<br>
        <strong>Date:</strong> October 2026
    </div>
</div>

<div class="page-break"></div>

<h1>Overview: Why FranceGo Needs a Google Maps Key</h1>
<p>The FranceGo VIP transfer platform utilizes Google Maps Platform for three essential features:</p>
<ol>
    <li><strong>Live France Address & Landmark Autocomplete:</strong> When passengers type hotels, airports, train stations, or tourist attractions (such as <em>ZooParc de Beauval</em>, <em>Eiffel Tower</em>, or <em>Disneyland Paris</em>), Google automatically autocompletes exact street addresses across France.</li>
    <li><strong>Point-to-Point Distance & Mileage Fare Calculation:</strong> Calculates exact driving distance (km) and travel duration to dynamically compute fixed rates (2.00 €/km for Sedan and 2.70 €/km for Minivan).</li>
    <li><strong>Google Business Profile Reviews Sync:</strong> Automatically pulls customer star ratings, review counts, and verified testimonials directly from your Google Business Profile onto the website.</li>
</ol>

<div class="callout">
    <div class="callout-title">Google $200 Free Monthly Credit</div>
    Google provides every Google Cloud account with <strong>$200 in free usage credits every single month</strong>. For a private chauffeur business, this easily covers tens of thousands of address searches and distance calculations at zero net cost.
</div>

<div class="page-break"></div>

<h1>Step-by-Step Setup Instructions</h1>

<h2><span class="step-number">1</span> Create or Log In to Google Cloud Console</h2>
<ol>
    <li>Open your web browser and navigate to: <a href="https://console.cloud.google.com/">https://console.cloud.google.com/</a></li>
    <li>Log in using your official business Google / Gmail account.</li>
    <li>At the top left, click the <strong>Project Dropdown</strong>, then click <strong>"NEW PROJECT"</strong>.</li>
    <li>Enter project name: <code>FranceGo Transfers</code> and click <strong>Create</strong>.</li>
</ol>

<h2><span class="step-number">2</span> Set Up Billing Account (Required by Google)</h2>
<ol>
    <li>Navigate to <strong>Billing</strong> in the left menu (or search "Billing" in the top search bar).</li>
    <li>Link a credit/debit card to activate your Google Cloud account.</li>
    <li><em>Note:</em> Google will not charge you unless your monthly usage exceeds the $200 free monthly allowance.</li>
</ol>

<h2><span class="step-number">3</span> Enable the Required Google Maps APIs</h2>
<p>Go to <strong>Google Maps Platform &gt; APIs &amp; Services</strong> (<a href="https://console.cloud.google.com/google/maps-apis/api-list">console.cloud.google.com/google/maps-apis/api-list</a>).</p>
<p>Locate and click <strong>ENABLE</strong> on the following 2 essential APIs:</p>

<table>
    <tr><th>API Name</th><th>Role in FranceGo</th><th>Importance</th></tr>
    <tr><td><strong>Routes API</strong></td><td>Computes driving kilometers, travel duration & dynamic vehicle fares (2.00€/km Car, 2.70€/km Van). Replaces legacy Directions and Distance Matrix APIs.</td><td><strong>CRITICAL</strong></td></tr>
    <tr><td><strong>Places API (New)</strong></td><td>Autocompletes French addresses, hotels, theme parks (ZooParc de Beauval, Disney), and pulls Google Reviews.</td><td><strong>CRITICAL</strong></td></tr>
    <tr><td><strong>Geocoding API</strong></td><td>Translates street addresses to geographical coordinates.</td><td>Recommended</td></tr>
</table>

<div class="page-break"></div>

<h2><span class="step-number">4</span> Generate the API Key</h2>
<ol>
    <li>On the left sidebar menu, click on <strong>Keys &amp; Credentials</strong> (or visit <a href="https://console.cloud.google.com/google/maps-apis/credentials">console.cloud.google.com/google/maps-apis/credentials</a>).</li>
    <li>Click <strong>"+ CREATE CREDENTIALS"</strong> at the top, then choose <strong>"API key"</strong>.</li>
    <li>Your new API key will be generated (starting with <code>AIzaSy...</code>). Copy this key.</li>
</ol>

<h2><span class="step-number">5</span> Configure Key Restrictions (CRITICAL STEP)</h2>
<p>Click on the newly generated API key (or click the <strong>pencil / edit icon</strong> next to it) to open its settings:</p>

<h3>A. Set Application Restriction: Select "NONE"</h3>
<div class="callout callout-danger">
    <div class="callout-title">CRITICAL SETTING: Set to "None"</div>
    Under <strong>"Set an application restriction"</strong>, select <strong>"None"</strong>.<br><br>
    <strong>Why?</strong> The FranceGo backend runs on a dedicated secure server (Node.js/Next.js) that talks directly to Google over private server-to-server channels. 
    Restricting by "IP address" will cause Google to block requests because the server connects via IPv6. 
    Restricting by "Websites / HTTP Referrer" will cause Google to block server-side requests.
    Since this key is kept strictly in the private server <code>.env</code> file and is never exposed in browser code, setting application restriction to <strong>"None"</strong> is completely secure.
</div>

<h3>B. Set API Restrictions: Select "Don't restrict key"</h3>
<p>Under <strong>"API restrictions"</strong>:</p>
<ul>
    <li>Select <strong>"Don't restrict key"</strong> (Recommended - ensures all route and address services work smoothly).</li>
    <li><em>OR</em>, if you prefer restricting, select <strong>"Restrict key"</strong> and check:
        <ul>
            <li>[x] <strong>Routes API</strong></li>
            <li>[x] <strong>Places API (New)</strong></li>
            <li>[x] <strong>Geocoding API</strong></li>
        </ul>
    </li>
</ul>

<p>Click the blue <strong>SAVE</strong> button at the bottom.</p>

<div class="page-break"></div>

<h1>Step-by-Step: Finding Your Google Place ID</h1>
<p>To display your business reviews and star ratings on FranceGo, we also need your <strong>Google Place ID</strong>:</p>

<ol>
    <li>Open the official Google Place ID Finder: <br>
    <a href="https://developers.google.com/maps/documentation/places/web-service/place-id">https://developers.google.com/maps/documentation/places/web-service/place-id</a></li>
    <li>In the map search bar, type your exact Google Business name: <br>
    <em>Example: <code>FranceGo VIP Transfer, Rue Scandicci, Pantin</code></em></li>
    <li>Click on your business pin on the map.</li>
    <li>Copy the displayed <strong>Place ID</strong> (e.g. <code>ChIJK_W2Fipt5kcRCOpTeqfLY6g</code>).</li>
</ol>

<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

<h1>What to Deliver to the Development Team</h1>
<p>Once you finish the steps above, please copy and email / WhatsApp the following 3 items to the tech team:</p>

<table>
    <tr><th>Parameter</th><th>Example Format</th><th>Where Found</th></tr>
    <tr>
        <td><strong>1. Google Maps API Key</strong></td>
        <td><code>AIzaSyDNgoZLJXN1yNrPkUWzdZ3DCjKGbPZPZ...</code></td>
        <td>Google Cloud Console &gt; Keys &amp; Credentials</td>
    </tr>
    <tr>
        <td><strong>2. Google Place ID</strong></td>
        <td><code>ChIJK_W2Fipt5kcRCOpTeqfLY6g</code></td>
        <td>Google Place ID Finder tool</td>
    </tr>
    <tr>
        <td><strong>3. Google Reviews Share Link</strong></td>
        <td><code>https://maps.app.goo.gl/DwYGzJ9yDqszXAPW7</code></td>
        <td>Google Maps &gt; Your Business &gt; Share profile</td>
    </tr>
</table>

<div class="callout">
    <div class="callout-title">Questions or Technical Assistance?</div>
    If you encounter any difficulty during setup, contact the FranceGo Technical Operations Desk:<br>
    <strong>Hotline &amp; WhatsApp:</strong> +33 7 81 11 83 94<br>
    <strong>Email:</strong> projet15df@outlook.fr<br>
    <strong>Target Production Website:</strong> https://francegotransfers.io
</div>

</body>
</html>
"""

temp_html = os.path.join(DOCS_DIR, "temp_guide.html")
pdf_path = os.path.join(DOCS_DIR, "FranceGo_Google_Maps_API_Client_Setup_Guide.pdf")

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
