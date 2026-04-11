import fs from 'fs/promises';
import path from 'path';

import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import { internalErrorResponse } from '@/server/admin/contentWorkflowHttp';
import { prisma } from '@/server/db/prisma';
import { pathnameFromResumeStoredPath } from '@/server/storage/resumeBlobStorage';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;

  try {
    const file = await prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    const blobPath = pathnameFromResumeStoredPath(file.storedPath);
    if (blobPath) {
      const res = await get(blobPath, { access: 'private', useCache: false });
      if (!res || res.statusCode !== 200 || res.stream === null) {
        return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
      }
      return new NextResponse(res.stream, {
        headers: {
          'Content-Type': file.mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        },
      });
    }

    const filename = path.basename(file.storedPath);
    const localPath = path.join(UPLOADS_DIR, filename);
    const buf = await fs.readFile(localPath);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      },
    });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }
    console.error('[uploaded-files] download failed', e);
    return internalErrorResponse();
  }
}
