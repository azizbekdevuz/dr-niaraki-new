/**
 * POST: clone a published version into a new working draft (non-destructive restore).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  contentVersionWithPayload,
  internalErrorResponse,
  nextResponseFromWorkflowError,
  restoreVersionBodySchema,
  versionIdParamSchema,
} from '@/server/admin/contentWorkflowHttp';
import { restoreVersionToDraft } from '@/server/content/versions';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
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
  const parsed = restoreVersionBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: parsed.error.message },
      { status: 400 },
    );
  }
  try {
    const draft = await restoreVersionToDraft(idParsed.data, {
      label: parsed.data.label,
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
