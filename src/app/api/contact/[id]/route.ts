import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await db.contactSubmission.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Contact message deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { isRead } = body;

    const updated = await db.contactSubmission.update({
      where: { id },
      data: {
        isRead: Boolean(isRead),
      },
    });

    return NextResponse.json({
      success: true,
      submission: updated,
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message.' },
      { status: 500 }
    );
  }
}

