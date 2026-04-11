/**
 * Admin import index: list imports; optional POST to attach a new import to an existing uploaded file row.
 *
 * Prefer the DOCX upload flow (`POST /api/admin/upload` multipart) for end-to-end file + parse + import
 * persistence. `POST` here remains for attaching another import to an existing `UploadedFile` (e.g. re-parse).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import { internalErrorResponse } from '@/server/admin/contentWorkflowHttp';
import { createImportForExistingUpload } from '@/server/imports/createImport';
import { listContentImportsForAdmin } from '@/server/imports/repository';
import { toImportSummary } from '@/server/imports/serialize';
import { ImportDomainError } from '@/server/imports/types';

const postBodySchema = z.object({
  uploadedFileId: z.string().min(1),
});

export async function GET() {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  try {
    const rows = await listContentImportsForAdmin(50);
    return NextResponse.json({ ok: true, imports: rows.map(toImportSummary) });
  } catch (e) {
    console.error(e);
    return internalErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: 'Invalid JSON body' },
      { status: 400 },
    );
  }
  const parsed = postBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: parsed.error.message },
      { status: 400 },
    );
  }
  try {
    const imp = await createImportForExistingUpload(parsed.data.uploadedFileId);
    return NextResponse.json({ ok: true, importId: imp.id }, { status: 201 });
  } catch (e) {
    if (e instanceof ImportDomainError && e.code === 'UPLOADED_FILE_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: 'NOT_FOUND', message: e.message },
        { status: 404 },
      );
    }
    console.error(e);
    return internalErrorResponse();
  }
}
