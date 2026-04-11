/**
 * POST: merge import candidate into working draft (create or replace). Never publishes.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { requireFullAdminAccessForContent } from '@/server/admin/contentWorkflowAccess';
import {
  contentVersionSummary,
  internalErrorResponse,
  nextResponseFromWorkflowError,
} from '@/server/admin/contentWorkflowHttp';
import { ImportMergeError, mergeImportCandidateToWorkingDraft } from '@/server/imports/mergeImportToDraft';

const bodySchema = z
  .object({
    action: z.enum(['create', 'replace']),
    changeSummary: z.string().max(2000).nullable().optional(),
  })
  .strict();

type RouteContext = { params: Promise<{ id: string }> };

function mergeErrorResponse(e: ImportMergeError): NextResponse {
  let status = 400;
  if (e.code === 'IMPORT_NOT_FOUND') {
    status = 404;
  } else if (e.code === 'MERGE_VALIDATION_FAILED' || e.code === 'INVALID_CANDIDATE') {
    status = 422;
  }
  return NextResponse.json({ ok: false, error: e.code, message: e.message }, { status });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const denied = await requireFullAdminAccessForContent();
  if (denied) {
    return denied;
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'BAD_REQUEST', message: 'Missing id' }, { status: 400 });
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
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: parsed.error.message },
      { status: 400 },
    );
  }
  try {
    const row = await mergeImportCandidateToWorkingDraft({
      importId: id,
      action: parsed.data.action,
      changeSummary: parsed.data.changeSummary,
    });
    return NextResponse.json({
      ok: true,
      draft: contentVersionSummary(row),
    });
  } catch (e) {
    const w = nextResponseFromWorkflowError(e);
    if (w) {
      return w;
    }
    if (e instanceof ImportMergeError) {
      return mergeErrorResponse(e);
    }
    console.error(e);
    return internalErrorResponse();
  }
}
