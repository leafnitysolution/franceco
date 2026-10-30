'use server';

import { getAdminSession } from '@/lib/auth';
import { getAllSettings, saveSettings, getSetting } from '@/lib/settings';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function adminGetSettingsAction() {
  const auth = await getAdminSession();
  if (!auth) {
    return { success: false, error: 'Unauthorized: Admin session required' };
  }

  try {
    const settings = await getAllSettings();
    return { success: true, settings };
  } catch (err: any) {
    console.error('adminGetSettingsAction error:', err);
    return { success: false, error: err?.message || 'Failed to fetch settings' };
  }
}

export async function adminSaveSettingsAction(formData: Record<string, string>) {
  const auth = await getAdminSession();
  if (!auth) {
    return { success: false, error: 'Unauthorized: Admin session required' };
  }

  try {
    await saveSettings(formData);

    revalidatePath('/ffs-portal-sec-99x/settings');
    revalidatePath('/ffs-portal-sec-99x');
    revalidatePath('/api/reviews/external');
    revalidatePath('/our-rates');
    revalidatePath('/');

    return { success: true, message: 'All API keys and configurations successfully saved.' };
  } catch (err: any) {
    console.error('adminSaveSettingsAction error:', err);
    return { success: false, error: err?.message || 'Failed to update system settings' };
  }
}

export async function adminTestGoogleApiAction(customKey?: string, customPlaceId?: string) {
  const auth = await getAdminSession();
  if (!auth) {
    return { success: false, error: 'Unauthorized' };
  }

  const apiKey = (customKey || (await getSetting('GOOGLE_MAPS_API_KEY')) || '').trim();
  const placeId = (customPlaceId || (await getSetting('GOOGLE_PLACE_ID')) || 'ChIJK_W2Fipt5kcRCOpTeqfLY6g').trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'Google Maps API Key is empty. Please enter a valid API key starting with AIzaSy...',
    };
  }

  const results: {
    autocomplete: { success: boolean; message: string; sample?: string };
    routes: { success: boolean; message: string; distanceKm?: number; durationMinutes?: number };
    placeDetails?: { success: boolean; message: string; rating?: number; reviewCount?: number; name?: string };
  } = {
    autocomplete: { success: false, message: 'Not tested' },
    routes: { success: false, message: 'Not tested' },
  };

  // 1. Test Places Autocomplete (New)
  try {
    const autoRes = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: 'ZooParc de Beauval',
        includedRegionCodes: ['FR'],
        languageCode: 'en',
      }),
    });

    if (autoRes.ok) {
      const autoData = await autoRes.json();
      const suggestions = autoData.suggestions || [];
      if (suggestions.length > 0) {
        const top = suggestions[0]?.placePrediction?.text?.text || 'ZooParc de Beauval';
        results.autocomplete = {
          success: true,
          message: `OK: Found ${suggestions.length} suggestion(s)`,
          sample: top,
        };
      } else {
        results.autocomplete = {
          success: true,
          message: 'OK: API connected, but 0 suggestions returned for query.',
        };
      }
    } else {
      const errText = await autoRes.text();
      let parsedMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        parsedMsg = parsed.error?.message || errText;
      } catch {}
      results.autocomplete = {
        success: false,
        message: `HTTP ${autoRes.status}: ${parsedMsg}`,
      };
    }
  } catch (err: any) {
    results.autocomplete = {
      success: false,
      message: `Network error: ${err.message}`,
    };
  }

  // 2. Test Routes API v2
  try {
    const routesRes = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
      },
      body: JSON.stringify({
        origin: { address: 'Paris Charles de Gaulle Airport, France' },
        destination: { address: 'Disneyland Paris, France' },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
      }),
    });

    if (routesRes.ok) {
      const routesData = await routesRes.json();
      const firstRoute = routesData.routes?.[0];
      if (firstRoute) {
        const distKm = Math.round(((firstRoute.distanceMeters || 45000) / 1000) * 10) / 10;
        const durSec = parseInt(firstRoute.duration?.replace('s', '') || '2400', 10);
        const durMin = Math.ceil(durSec / 60);
        results.routes = {
          success: true,
          message: `OK: Computed CDG to Disneyland route`,
          distanceKm: distKm,
          durationMinutes: durMin,
        };
      } else {
        results.routes = {
          success: true,
          message: 'OK: API connected, no route found for standard points',
        };
      }
    } else {
      const errText = await routesRes.text();
      let parsedMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        parsedMsg = parsed.error?.message || errText;
      } catch {}
      results.routes = {
        success: false,
        message: `HTTP ${routesRes.status}: ${parsedMsg}`,
      };
    }
  } catch (err: any) {
    results.routes = {
      success: false,
      message: `Network error: ${err.message}`,
    };
  }

  // 3. Test Place Details / Reviews (if Place ID provided)
  if (placeId) {
    try {
      const placeRes = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews',
        },
      });

      if (placeRes.ok) {
        const placeData = await placeRes.json();
        results.placeDetails = {
          success: true,
          message: `OK: Business profile verified`,
          name: placeData.displayName?.text || 'Business Profile',
          rating: placeData.rating || 5.0,
          reviewCount: placeData.userRatingCount || 0,
        };
      } else {
        const errText = await placeRes.text();
        results.placeDetails = {
          success: false,
          message: `HTTP ${placeRes.status}: Place ID lookup failed (${errText.slice(0, 100)})`,
        };
      }
    } catch (err: any) {
      results.placeDetails = {
        success: false,
        message: `Network error: ${err.message}`,
      };
    }
  }

  const overallSuccess = results.autocomplete.success && results.routes.success;

  return {
    success: overallSuccess,
    results,
    message: overallSuccess
      ? 'Google Maps Platform connected successfully! Address search & distance calculation are active.'
      : 'Google Maps verification encountered errors. Please review the details below.',
  };
}

export async function adminTestTripAdvisorAction(customKey?: string, customLocationId?: string) {
  const auth = await getAdminSession();
  if (!auth) {
    return { success: false, error: 'Unauthorized' };
  }

  const apiKey = (customKey || (await getSetting('TRIPADVISOR_API_KEY')) || '').trim();
  const locationId = (customLocationId || (await getSetting('TRIPADVISOR_LOCATION_ID')) || '').trim();

  if (!apiKey || !locationId) {
    return {
      success: false,
      error: 'TripAdvisor API Key or Location ID is missing. Both are required for testing.',
    };
  }

  try {
    const res = await fetch(
      `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(locationId)}/details?key=${encodeURIComponent(
        apiKey
      )}&language=en`,
      { headers: { accept: 'application/json' } }
    );

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        name: data.name || 'TripAdvisor Location',
        rating: parseFloat(data.rating || '5.0'),
        reviewCount: parseInt(data.num_reviews || '0', 10),
        rankingString: data.ranking_data?.ranking_string || 'Top Rated',
        message: `TripAdvisor Connected: "${data.name}" (${data.rating} ★, ${data.num_reviews} reviews)`,
      };
    } else {
      const errText = await res.text();
      return {
        success: false,
        error: `HTTP ${res.status}: ${errText.slice(0, 200)}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Network error: ${err.message}`,
    };
  }
}


export async function adminSearchTripAdvisorAction(query: string, customKey?: string) {
  const auth = await getAdminSession();
  if (!auth) {
    return { success: false, error: 'Unauthorized' };
  }

  const apiKey = (customKey || (await getSetting('TRIPADVISOR_API_KEY')) || '').trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'TripAdvisor API Key is required to search for locations.',
    };
  }

  if (!query || query.trim().length < 2) {
    return {
      success: false,
      error: 'Search query must be at least 2 characters.',
    };
  }

  try {
    const res = await fetch(
      https://api.content.tripadvisor.com/api/v1/location/search?searchQuery=&key=&language=en,
      { headers: { accept: 'application/json' } }
    );

    if (res.ok) {
      const data = await res.json();
      const locations = (data.data || []).map((loc: any) => ({
        locationId: loc.location_id,
        name: loc.name,
        address: loc.address_obj?.address_string || '',
      }));
      return {
        success: true,
        locations,
        message: Found  matching TripAdvisor listing(s),
      };
    } else {
      const errText = await res.text();
      return {
        success: false,
        error: HTTP : ,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: Network error: ,
    };
  }
}

export async function adminTestEmailAction(recipientEmail?: string) {
  const auth = await getAdminSession();
  if (!auth) {
    return { success: false, error: 'Unauthorized' };
  }

  const smtpHost = (await getSetting('SMTP_HOST')) || 'smtp-mail.outlook.com';
  const smtpPort = Number((await getSetting('SMTP_PORT')) || '587');
  const smtpSecure = (await getSetting('SMTP_SECURE')) === 'true';
  const smtpUser = (await getSetting('SMTP_USER')) || '';
  const smtpPass = (await getSetting('SMTP_PASS')) || '';
  const adminEmail = recipientEmail || (await getSetting('ADMIN_DISPATCH_EMAIL')) || smtpUser;

  if (!smtpUser || !smtpPass) {
    return {
      success: false,
      error: 'SMTP User or Password is not configured in settings. Please provide credentials first.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"FranceGo System Check" <${smtpUser}>`,
      to: adminEmail,
      subject: `✅ FranceGo SMTP Connection Verified (${new Date().toLocaleTimeString('en-GB')})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0B192C; margin-top: 0;">FranceGo SMTP Test Successful!</h2>
          <p>Your transactional email setup is working properly. Booking vouchers and driver notifications will be delivered without delay.</p>
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;">
          <p style="font-size: 12px; color: #64748b;">
            Host: ${smtpHost}:${smtpPort} | User: ${smtpUser} | Delivered to: ${adminEmail}
          </p>
        </div>
      `,
    });

    return {
      success: true,
      messageId: info.messageId,
      message: `Test email sent successfully to ${adminEmail}!`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `SMTP error: ${err.message}`,
    };
  }
}
