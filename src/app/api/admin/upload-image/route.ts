import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid file format. Please upload JPG, PNG, WEBP, or SVG.' }, { status: 400 });
    }

    // Limit to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.jpg';
    const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
    const sanitizedBase = file.name
      .replace(cleanExt, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueName = `route_${sanitizedBase || 'custom'}_${Date.now()}${cleanExt}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'routes');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/routes/${uniqueName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return NextResponse.json({ error: err.message || 'Image upload failed.' }, { status: 500 });
  }
}
