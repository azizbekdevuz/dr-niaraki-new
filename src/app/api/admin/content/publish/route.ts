/**
 * POST: publish the current working draft as the next immutable published version.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  contentVersionWithPayload,
  internalErrorResponse,
  nextResponseFromWorkflowError,
  publishDraftBodySchema,
} from '@/server/admin/contentWorkflowHttp';
import { publishWorkingDraft } from '@/server/content/publish';

export async function POST(request: NextRequest) {
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
  const parsed = publishDraftBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: parsed.error.message },
      { status: 400 },
    );
  }
  try {
    const version = await publishWorkingDraft({
      label: parsed.data.label,
      changeSummary: parsed.data.changeSummary,
      createdBy: parsed.data.createdBy,
    });
    return NextResponse.json({ ok: true, version: contentVersionWithPayload(version) });
  } catch (e) {
    const w = nextResponseFromWorkflowError(e);
    if (w) {
      return w;
    }
    console.error(e);
    return internalErrorResponse();
  }
}
