import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'pgt_admin_v2';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fastforwardshuttle.com';
const SECRET = process.env.JWT_SECRET || 'easygo_shuttle_super_secret_key_2026';

// Edge-compatible HMAC-SHA256 verification using Web Crypto API
async function verifyToken(token: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const message = encoder.encode(ADMIN_EMAIL);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, message);
    const expectedToken = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return token === expectedToken;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const cookieValue = sessionCookie?.value ?? '';

  // Verify the token cryptographically — not just that the cookie exists
  const isAuthenticated = cookieValue ? await verifyToken(cookieValue) : false;

  // 1. Protect all /ffs-portal-sec-99x routes (except /ffs-portal-sec-99x/login)
  if (path.startsWith('/ffs-portal-sec-99x') && path !== '/ffs-portal-sec-99x/login' && !isAuthenticated) {
    const loginUrl = new URL('/ffs-portal-sec-99x/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in, visiting /ffs-portal-sec-99x/login → redirect to dashboard
  if (path === '/ffs-portal-sec-99x/login' && isAuthenticated) {
    const adminUrl = new URL('/ffs-portal-sec-99x', request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ffs-portal-sec-99x/:path*'],
};
