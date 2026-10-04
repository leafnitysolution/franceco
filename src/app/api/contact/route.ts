import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

const contactRateLimitMap = new Map<string, number[]>();
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_CONTACT_PER_HOUR = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = contactRateLimitMap.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < CONTACT_WINDOW_MS);

  if (valid.length >= MAX_CONTACT_PER_HOUR) {
    return true;
  }

  valid.push(now);
  contactRateLimitMap.set(ip, valid);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (isContactRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Too many inquiries submitted. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 150) : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim().slice(0, 40) : null;
    const subject =
      typeof body?.subject === 'string' && body.subject.trim()
        ? body.subject.trim().slice(0, 150)
        : 'General Transfer Inquiry';
    const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 2000) : '';

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const submission = await db.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Contact submission saved successfully.',
      submission: {
        id: submission.id,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving contact submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process inquiry. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim().slice(0, 100);
    const isReadParam = searchParams.get('isRead');

    const whereClause: Record<string, unknown> = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
      ];
    }

    if (isReadParam !== null && isReadParam !== undefined && isReadParam !== '') {
      whereClause.isRead = isReadParam === 'true';
    }

    const submissions = await db.contactSubmission.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact submissions.' },
      { status: 500 }
    );
  }
}

