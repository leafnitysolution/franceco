import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ folder: string; filename: string }> }
) {
  try {
    const { folder, filename } = await context.params;

    // Sanitize folder to prevent traversal
    const allowedFolders = ['reviews', 'routes', 'hero'];
    const cleanFolder = folder.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!allowedFolders.includes(cleanFolder)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Sanitize filename
    const cleanFilename = path.basename(filename);
    const ext = path.extname(cleanFilename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    // Check primary public directory
    const primaryPath = path.join(process.cwd(), 'public', 'uploads', cleanFolder, cleanFilename);
    const standalonePath = path.join(process.cwd(), '.next', 'standalone', 'public', 'uploads', cleanFolder, cleanFilename);

    let targetPath: string | null = null;
    if (existsSync(primaryPath)) {
      targetPath = primaryPath;
    } else if (existsSync(standalonePath)) {
      targetPath = standalonePath;
    }

    if (!targetPath) {
      return new NextResponse('Image Not Found', { status: 404 });
    }

    const fileBuffer = await readFile(targetPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Dynamic image serve error:', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
