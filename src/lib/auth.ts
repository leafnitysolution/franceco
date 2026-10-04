import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fastforwardshuttle.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const SESSION_COOKIE_NAME = 'pgt_admin_v2';
const SECRET = process.env.JWT_SECRET || 'francego_shuttle_super_secret_key_2026';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

async function createToken(email: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${email.toLowerCase()}:${expiresAt}`;
  const signature = signPayload(payload);
  return `${expiresAt}.${signature}`;
}

async function verifyToken(token: string): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [expiresAtStr, signature] = token.split('.');
  const expiresAt = Number(expiresAtStr);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expectedPayload = `${ADMIN_EMAIL.toLowerCase()}:${expiresAt}`;
  const expectedSig = signPayload(expectedPayload);
  return timingSafeHexEqual(signature, expectedSig);
}

export async function verifyAdminCredentials(email: string, pass: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const expectedEmail = ADMIN_EMAIL.trim().toLowerCase();
  const emailMatch =
    cleanEmail.length === expectedEmail.length &&
    crypto.timingSafeEqual(Buffer.from(cleanEmail), Buffer.from(expectedEmail));
  const passMatch =
    pass.length === ADMIN_PASSWORD.length &&
    crypto.timingSafeEqual(Buffer.from(pass), Buffer.from(ADMIN_PASSWORD));
  return emailMatch && passMatch;
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

