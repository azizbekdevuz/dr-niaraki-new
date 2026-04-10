/**
 * GET: current working draft (or null). PUT: save draft payload.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  contentVersionWithPayload,
  internalErrorResponse,
  nextResponseFromWorkflowError,
  saveDraftBodySchema,
} from '@/server/admin/contentWorkflowHttp';
import { getWorkingDraft, saveWorkingDraft } from '@/server/content/drafts';
import { getPublicLiveReadSummary } from '@/server/content/publicSiteContent';
import { getLatestPublishedVersionMeta } from '@/server/content/publishedSiteContent';

export async function GET() {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  try {
    const draft = await getWorkingDraft();
    const latestPublished = await getLatestPublishedVersionMeta();
    const publicLiveRead = await getPublicLiveReadSummary();
    return NextResponse.json({
      ok: true,
      draft: draft ? contentVersionWithPayload(draft) : null,
      latestPublished,
      publicLiveRead,
      publicContentAuthority: 'db_first_canonical_fallback' as const,
      publicContentAuthorityDetail:
        'The public site prefers the latest valid published `ContentVersion` payload from the database. If none exists, the payload is invalid, or the DB is unavailable, it falls back to validated in-repo canonical content (`src/content/*`). Drafts and import candidates never serve visitors until published.',
    });
  } catch (e) {
    const w = nextResponseFromWorkflowError(e);
    if (w) {
      return w;
    }
    console.error(e);
    return internalErrorResponse();
  }
}

export async function PUT(request: NextRequest) {
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
  const parsed = saveDraftBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: parsed.error.message },
      { status: 400 },
    );
  }
  try {
    const draft = await saveWorkingDraft({
      payload: parsed.data.payload,
      changeSummary: parsed.data.changeSummary,
    });
    return NextResponse.json({ ok: true, draft: contentVersionWithPayload(draft) });
  } catch (e) {
    const w = nextResponseFromWorkflowError(e);
    if (w) {
      return w;
    }
    console.error(e);
    return internalErrorResponse();
  }
}
