import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message: ' + (error?.message || 'Server error') },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
  } catch (error: any) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message.' },
      { status: 500 }
    );
  }
}
