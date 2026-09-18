'use server';

import { verifyAdminCredentials, setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// In-memory brute-force protection (5 failed attempts per 15 minutes)
const loginAttemptMap = new Map<string, { count: number; firstAttemptTime: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkRateLimit(ip: string): { isLocked: boolean } {
  const now = Date.now();
  const entry = loginAttemptMap.get(ip);

  if (!entry) return { isLocked: false };

  // Reset window if 15 minutes have passed
  if (now - entry.firstAttemptTime > LOCKOUT_WINDOW_MS) {
    loginAttemptMap.delete(ip);
    return { isLocked: false };
  }

  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return { isLocked: true };
  }

  return { isLocked: false };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = loginAttemptMap.get(ip);

  if (!entry || now - entry.firstAttemptTime > LOCKOUT_WINDOW_MS) {
    loginAttemptMap.set(ip, { count: 1, firstAttemptTime: now });
  } else {
    entry.count += 1;
    loginAttemptMap.set(ip, entry);
  }
}

function clearFailedAttempts(ip: string) {
  loginAttemptMap.delete(ip);
}

export async function adminLoginAction(prevState: any, formData: FormData) {
  const headersList = await headers();
  const clientIp =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Check Brute-Force Rate Limiter
  const rateLimitStatus = checkRateLimit(clientIp);
  if (rateLimitStatus.isLocked) {
    return {
      error: 'Too many failed login attempts. Please try again in 15 minutes.',
    };
  }

  const email = (formData.get('email') as string || '').trim();
  const password = (formData.get('password') as string || '');

  if (!email || !password) {
    return { error: 'Please enter both email address and password.' };
  }

  // 2. Strict Email Format Validation
  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  // 3. Verify Admin Credentials
  const isValid = await verifyAdminCredentials(email, password);

  if (!isValid) {
    recordFailedAttempt(clientIp);
    const currentEntry = loginAttemptMap.get(clientIp);

    if (currentEntry && currentEntry.count >= MAX_FAILED_ATTEMPTS) {
      return {
        error: 'Too many failed login attempts. Please try again in 15 minutes.',
      };
    }

    return {
      error: 'Invalid email or password.',
    };
  }

  // Clear attempts on successful login
  clearFailedAttempts(clientIp);
  await setAdminSessionCookie(email);
  redirect('/ffs-portal-sec-99x');
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect('/ffs-portal-sec-99x/login');
}
