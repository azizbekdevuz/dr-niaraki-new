/**
 * POST: create working draft from validated canonical site content (in-repo source).
 */

import { NextResponse } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  bootstrapDraftBodySchema,
  contentVersionWithPayload,
  internalErrorResponse,
  nextResponseFromWorkflowError,
} from '@/server/admin/contentWorkflowHttp';
import { createWorkingDraftFromCanonicalSiteContent } from '@/server/content/drafts';

export async function POST(request: Request) {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  let body: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text) as unknown;
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: 'Invalid JSON body' },
      { status: 400 },
    );
  }
  const parsed = bootstrapDraftBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: parsed.error.message },
      { status: 400 },
    );
  }
  try {
    const draft = await createWorkingDraftFromCanonicalSiteContent({
      label: parsed.data.label,
      changeSummary: parsed.data.changeSummary,
      createdBy: parsed.data.createdBy,
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
