import 'server-only';

import type { ContentVersion } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ContentWorkflowError } from '@/server/content/contentWorkflowCore';

export const bootstrapDraftBodySchema = z
  .object({
    label: z.string().max(500).optional(),
    changeSummary: z.string().max(2000).nullable().optional(),
    createdBy: z.string().max(200).nullable().optional(),
  })
  .strip();

export const saveDraftBodySchema = z
  .object({
    payload: z.unknown().optional(),
    changeSummary: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.prototype.hasOwnProperty.call(data, 'payload'), {
    message: 'payload is required',
    path: ['payload'],
  });

export const publishDraftBodySchema = z
  .object({
    label: z.string().max(500).nullable().optional(),
    changeSummary: z.string().max(2000).nullable().optional(),
    createdBy: z.string().max(200).nullable().optional(),
  })
  .strip();

export const restoreVersionBodySchema = z
  .object({
    label: z.string().max(500).nullable().optional(),
    changeSummary: z.string().max(2000).nullable().optional(),
  })
  .strip();

export const versionIdParamSchema = z.string().min(1).max(128);

export const listVersionsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export function contentVersionSummary(v: ContentVersion) {
  return {
    id: v.id,
    status: v.status,
    label: v.label,
    changeSummary: v.changeSummary,
    createdBy: v.createdBy,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    publishedAt: v.publishedAt?.toISOString() ?? null,
    publishSequence: v.publishSequence,
    draftSlot: v.draftSlot,
    /** Set when this version row was created or last updated from merge-to-draft of an import. */
    importId: v.importId ?? null,
  };
}

export function contentVersionWithPayload(v: ContentVersion) {
  return { ...contentVersionSummary(v), payload: v.payload };
}

function statusForWorkflowCode(code: ContentWorkflowError['code']): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404;
    case 'INVALID_PAYLOAD':
      return 422;
    case 'DRAFT_EXISTS':
    case 'IMMUTABLE_VERSION':
      return 409;
    case 'NO_DRAFT':
    case 'NOT_PUBLISHED':
      return 400;
    default:
      return 400;
  }
}

export function nextResponseFromWorkflowError(error: unknown): NextResponse | null {
  if (!(error instanceof ContentWorkflowError)) {
    return null;
  }
  return NextResponse.json(
    { ok: false, error: error.code, message: error.message },
    { status: statusForWorkflowCode(error.code) },
  );
}

export function internalErrorResponse(message = 'Internal server error'): NextResponse {
  return NextResponse.json({ ok: false, error: 'INTERNAL', message }, { status: 500 });
}
