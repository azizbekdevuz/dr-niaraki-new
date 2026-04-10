/**
 * GET: list published/archived content versions (metadata only; no large payloads).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  contentVersionSummary,
  internalErrorResponse,
  listVersionsQuerySchema,
} from '@/server/admin/contentWorkflowHttp';
import { getPublicLiveReadSummary } from '@/server/content/publicSiteContent';
import { listContentVersions } from '@/server/content/versions';

export async function GET(request: NextRequest) {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  const q = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listVersionsQuerySchema.safeParse(q);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: parsed.error.message },
      { status: 400 },
    );
  }
  try {
    const take = parsed.data.take ?? 50;
    const [rows, publicLiveRead] = await Promise.all([listContentVersions(take), getPublicLiveReadSummary()]);
    return NextResponse.json({
      ok: true,
      versions: rows.map(contentVersionSummary),
      publicLiveRead,
    });
  } catch (e) {
    console.error(e);
    return internalErrorResponse();
  }
}
