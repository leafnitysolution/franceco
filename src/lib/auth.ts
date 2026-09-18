import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fastforwardshuttle.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const SESSION_COOKIE_NAME = 'pgt_admin_v2';
const SECRET = process.env.JWT_SECRET || 'easygo_shuttle_super_secret_key_2026';

// Create HMAC-SHA256 token (Node.js crypto — used in Server Actions & Route Handlers)
async function createToken(email: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', SECRET).update(email).digest('hex');
}

// Verify HMAC-SHA256 token (Node.js crypto)
async function verifyToken(token: string): Promise<boolean> {
  const expected = await createToken(ADMIN_EMAIL);
  return token === expected;
}

export async function verifyAdminCredentials(email: string, pass: string): Promise<boolean> {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASSWORD;
}

export async function setAdminSessionCookie(email: string) {
  const cookieStore = await cookies();
  const token = await createToken(email);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return false;
    return verifyToken(sessionCookie.value);
  } catch {
    return false;
  }
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}
