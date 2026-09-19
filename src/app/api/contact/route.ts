import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const submission = await db.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || 'General Transfer Inquiry',
        message,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Contact submission saved successfully.',
      submission,
    });
  } catch (error: any) {
    console.error('Error saving contact submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process inquiry: ' + (error?.message || 'Server error') },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const isReadParam = searchParams.get('isRead');

    const whereClause: any = {};

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
  } catch (error: any) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact submissions.' },
      { status: 500 }
    );
  }
}
