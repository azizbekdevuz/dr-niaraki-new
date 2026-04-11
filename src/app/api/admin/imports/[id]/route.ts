/**
 * Single import detail for admin diagnostics / future review UI.
 */

import { NextResponse } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import { internalErrorResponse } from '@/server/admin/contentWorkflowHttp';
import { getContentImportDetail } from '@/server/imports/repository';
import { toImportDetail } from '@/server/imports/serialize';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'BAD_REQUEST', message: 'Missing id' }, { status: 400 });
  }
  try {
    const row = await getContentImportDetail(id);
    if (!row) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Import not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, import: toImportDetail(row) });
  } catch (e) {
    console.error(e);
    return internalErrorResponse();
  }
}
