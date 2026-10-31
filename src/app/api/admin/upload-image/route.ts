import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
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
    const requestedFolder = ((formData.get('folder') as string) || 'routes').toLowerCase();
    const folder = requestedFolder === 'reviews' ? 'reviews' : 'routes';

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
    const uniqueName = `${folder}_${sanitizedBase || 'custom'}_${Date.now()}${cleanExt}`;

    // 1. Primary write to persistent public uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // 2. If Next.js standalone folder exists, also mirror write so it serves immediately
    const standaloneUploadDir = path.join(process.cwd(), '.next', 'standalone', 'public', 'uploads', folder);
    if (existsSync(path.join(process.cwd(), '.next', 'standalone'))) {
      try {
        await mkdir(standaloneUploadDir, { recursive: true });
        await writeFile(path.join(standaloneUploadDir, uniqueName), buffer);
      } catch (mirrorErr) {
        // Non-critical mirror write
        console.warn('Standalone mirror write warning:', mirrorErr);
      }
    }

    const publicUrl = `/uploads/${folder}/${uniqueName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return NextResponse.json({ error: err.message || 'Image upload failed.' }, { status: 500 });
  }
}
