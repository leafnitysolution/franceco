import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'pgt_admin_v2';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fastforwardshuttle.com';
const SECRET = process.env.JWT_SECRET || 'francego_shuttle_super_secret_key_2026';

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Edge-compatible HMAC-SHA256 verification with token expiration check
async function verifyToken(token: string): Promise<boolean> {
  try {
    if (!token || !token.includes('.')) return false;
    const [expiresAtStr, providedSig] = token.split('.');
    const expiresAt = Number(expiresAtStr);

    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      return false;
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const message = encoder.encode(`${ADMIN_EMAIL.toLowerCase()}:${expiresAt}`);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, message);
    const expectedSig = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return constantTimeEqual(providedSig, expectedSig);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const cookieValue = sessionCookie?.value ?? '';

  const isAuthenticated = cookieValue ? await verifyToken(cookieValue) : false;

  if (path.startsWith('/ffs-portal-sec-99x') && path !== '/ffs-portal-sec-99x/login' && !isAuthenticated) {
    const loginUrl = new URL('/ffs-portal-sec-99x/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (path === '/ffs-portal-sec-99x/login' && isAuthenticated) {
    const adminUrl = new URL('/ffs-portal-sec-99x', request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ffs-portal-sec-99x/:path*'],
};

