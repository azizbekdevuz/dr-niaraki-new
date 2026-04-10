import 'server-only';

import type { ContentVersion, Prisma } from '@prisma/client';

import { SITE_CONTENT_RAW } from '@/content/defaults';
import { validateSiteContent } from '@/content/validators';
import { prisma } from '@/server/db/prisma';

import { recordContentEvent } from './contentEvents';

/** Single working draft slot enforced via unique constraint on `ContentVersion.draftSlot`. */
export const WORKING_DRAFT_SLOT = 'main' as const;

export class ContentWorkflowError extends Error {
  constructor(
    public readonly code:
      | 'DRAFT_EXISTS'
      | 'NO_DRAFT'
      | 'INVALID_PAYLOAD'
      | 'NOT_FOUND'
      | 'NOT_PUBLISHED'
      | 'IMMUTABLE_VERSION',
    message: string,
  ) {
    super(message);
    this.name = 'ContentWorkflowError';
  }
}

function toJsonPayload(data: Prisma.JsonValue): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
}

export async function getWorkingDraft(): Promise<ContentVersion | null> {
  return prisma.contentVersion.findUnique({
    where: { draftSlot: WORKING_DRAFT_SLOT },
  });
}

export async function getContentVersionById(id: string): Promise<ContentVersion | null> {
  return prisma.contentVersion.findUnique({ where: { id } });
}

export async function getLatestPublishedVersion(): Promise<ContentVersion | null> {
  return prisma.contentVersion.findFirst({
    where: { status: 'PUBLISHED', publishSequence: { not: null } },
    orderBy: { publishSequence: 'desc' },
  });
}

export async function listContentVersions(take = 50): Promise<ContentVersion[]> {
  return prisma.contentVersion.findMany({
    where: { status: { in: ['PUBLISHED', 'ARCHIVED'] } },
    orderBy: [{ publishSequence: 'desc' }, { createdAt: 'desc' }],
    take,
  });
}

export async function createWorkingDraftFromCanonicalSiteContent(input?: {
  label?: string;
  changeSummary?: string | null;
  createdBy?: string | null;
}): Promise<ContentVersion> {
  const existing = await getWorkingDraft();
  if (existing) {
    throw new ContentWorkflowError(
      'DRAFT_EXISTS',
      'A working draft already exists. Publish or discard it before creating another.',
    );
  }
  const parsed = validateSiteContent(SITE_CONTENT_RAW);
  if (!parsed.success) {
    throw new ContentWorkflowError('INVALID_PAYLOAD', 'Canonical SITE_CONTENT_RAW failed validation.');
  }
  const row = await prisma.contentVersion.create({
    data: {
      status: 'DRAFT',
      draftSlot: WORKING_DRAFT_SLOT,
      payload: toJsonPayload(parsed.data as unknown as Prisma.JsonValue),
      label: input?.label ?? 'Draft from canonical site content',
      changeSummary: input?.changeSummary ?? null,
      createdBy: input?.createdBy ?? null,
    },
  });
  await recordContentEvent({
    eventType: 'WORKING_DRAFT_CREATED',
    versionId: row.id,
    payload: { label: row.label, source: 'canonical_site_content' },
  });
  return row;
}

export async function saveWorkingDraft(input: {
  payload: unknown;
  changeSummary?: string | null;
}): Promise<ContentVersion> {
  const draft = await getWorkingDraft();
  if (!draft) {
    throw new ContentWorkflowError('NO_DRAFT', 'No working draft exists.');
  }
  if (draft.status !== 'DRAFT' || draft.draftSlot !== WORKING_DRAFT_SLOT) {
    throw new ContentWorkflowError('IMMUTABLE_VERSION', 'Only the active working draft can be updated.');
  }
  const parsed = validateSiteContent(input.payload);
  if (!parsed.success) {
    throw new ContentWorkflowError('INVALID_PAYLOAD', 'Payload is not valid SiteContent.');
  }
  const row = await prisma.contentVersion.update({
    where: { id: draft.id },
    data: {
      payload: toJsonPayload(parsed.data as unknown as Prisma.JsonValue),
      changeSummary: input.changeSummary ?? draft.changeSummary,
    },
  });
  await recordContentEvent({
    eventType: 'WORKING_DRAFT_UPDATED',
    versionId: row.id,
    payload: { changeSummary: row.changeSummary, importId: row.importId ?? null },
  });
  return row;
}

export async function publishWorkingDraft(input?: {
  label?: string | null;
  changeSummary?: string | null;
  createdBy?: string | null;
}): Promise<ContentVersion> {
  const draft = await getWorkingDraft();
  if (!draft) {
    throw new ContentWorkflowError('NO_DRAFT', 'No working draft to publish.');
  }
  if (draft.status !== 'DRAFT') {
    throw new ContentWorkflowError('NO_DRAFT', 'Working row is not in DRAFT status.');
  }
  const parsed = validateSiteContent(draft.payload);
  if (!parsed.success) {
    throw new ContentWorkflowError('INVALID_PAYLOAD', 'Draft payload is invalid; refuse to publish.');
  }
  const agg = await prisma.contentVersion.aggregate({
    where: { publishSequence: { not: null } },
    _max: { publishSequence: true },
  });
  const nextSeq = (agg._max.publishSequence ?? 0) + 1;
  const previousLatest = await getLatestPublishedVersion();
  const row = await prisma.contentVersion.update({
    where: { id: draft.id },
    data: {
      status: 'PUBLISHED',
      draftSlot: null,
      publishedAt: new Date(),
      publishSequence: nextSeq,
      label: input?.label ?? draft.label,
      changeSummary: input?.changeSummary ?? draft.changeSummary,
      createdBy: input?.createdBy ?? draft.createdBy,
    },
  });
  await recordContentEvent({
    eventType: 'CONTENT_PUBLISHED',
    versionId: row.id,
    payload: {
      publishSequence: nextSeq,
      label: row.label,
      changeSummary: row.changeSummary,
      importId: draft.importId ?? null,
      /** Same row id before/after publish — explicit for admin/history tools. */
      publishedVersionId: row.id,
      supersededPublishedVersionId: previousLatest?.id ?? null,
      supersededPublishSequence: previousLatest?.publishSequence ?? null,
    },
  });
  return row;
}

export async function restoreVersionToDraft(
  versionId: string,
  input?: { changeSummary?: string | null; label?: string | null },
): Promise<ContentVersion> {
  const source = await prisma.contentVersion.findUnique({ where: { id: versionId } });
  if (!source) {
    throw new ContentWorkflowError('NOT_FOUND', `ContentVersion not found: ${versionId}`);
  }
  if (source.status !== 'PUBLISHED') {
    throw new ContentWorkflowError('NOT_PUBLISHED', 'Only a published version can be restored to a draft.');
  }
  const existingDraft = await getWorkingDraft();
  if (existingDraft) {
    throw new ContentWorkflowError(
      'DRAFT_EXISTS',
      'A working draft already exists. Publish or remove it before restoring.',
    );
  }
  const parsed = validateSiteContent(source.payload);
  if (!parsed.success) {
    throw new ContentWorkflowError('INVALID_PAYLOAD', 'Source version payload is invalid.');
  }
  const row = await prisma.contentVersion.create({
    data: {
      status: 'DRAFT',
      draftSlot: WORKING_DRAFT_SLOT,
      payload: toJsonPayload(parsed.data as unknown as Prisma.JsonValue),
      label:
        input?.label ??
        `Draft restored from published #${source.publishSequence ?? '?'} (${source.id.slice(0, 8)}…)`,
      changeSummary: input?.changeSummary ?? null,
    },
  });
  await recordContentEvent({
    eventType: 'CONTENT_RESTORED_TO_DRAFT',
    versionId: row.id,
    payload: {
      fromVersionId: source.id,
      fromPublishSequence: source.publishSequence,
      /** Import that produced the published snapshot (if any), not a new import for the draft. */
      sourcePublishedImportId: source.importId ?? null,
    },
  });
  return row;
}
