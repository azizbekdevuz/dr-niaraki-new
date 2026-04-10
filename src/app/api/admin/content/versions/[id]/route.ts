/**
 * GET: single content version including payload (admin-only).
 */

import { NextResponse } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  contentVersionWithPayload,
  internalErrorResponse,
  versionIdParamSchema,
} from '@/server/admin/contentWorkflowHttp';
import { getContentVersionById } from '@/server/content/versions';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  const { id: rawId } = await context.params;
  const idParsed = versionIdParamSchema.safeParse(rawId);
  if (!idParsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: 'Invalid version id' },
      { status: 400 },
    );
  }
  try {
    const version = await getContentVersionById(idParsed.data);
    if (!version) {
      return NextResponse.json(
        { ok: false, error: 'NOT_FOUND', message: 'Version not found' },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, version: contentVersionWithPayload(version) });
  } catch (e) {
    console.error(e);
    return internalErrorResponse();
  }
}
