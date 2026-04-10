/**
 * Thin fetch helpers for `/api/admin/content/*` — no workflow logic; server remains source of truth.
 */

import { adminContentWorkflowApiPaths } from '@/lib/adminContentWorkflowApiPaths';

export type ContentWorkflowClientError = {
  success: false;
  status: number;
  error: string;
  message: string;
};

export type ContentVersionRow = {
  id: string;
  status: string;
  label: string | null;
  changeSummary: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  publishSequence: number | null;
  draftSlot: string | null;
  importId?: string | null;
  payload?: unknown;
};

export type LatestPublishedMeta = {
  id: string;
  publishSequence: number | null;
  publishedAt: string | null;
  label: string | null;
  changeSummary: string | null;
  importId: string | null;
};

/** Mirrors `getPublicLiveReadSummary()` from the server — what visitors actually read. */
export type PublicLiveReadSummaryDto = {
  visitorReadSource: 'db_published' | 'canonical_fallback';
  fallbackReason: 'none' | 'no_published' | 'invalid_published_payload' | 'db_unavailable';
  activePublishedVersionId: string | null;
  publishSequence: number | null;
  publishedAtIso: string | null;
  importId: string | null;
  label: string | null;
  changeSummary: string | null;
  failedPublishedVersionId: string | null;
};

const DEFAULT_AUTHORITY = 'db_first_canonical_fallback';
const DEFAULT_AUTHORITY_DETAIL =
  'The public site prefers the latest valid published DB snapshot; otherwise it uses validated in-repo canonical content.';

function parsePublicLiveRead(raw: unknown): PublicLiveReadSummaryDto | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const visitorReadSource = o.visitorReadSource === 'db_published' ? 'db_published' : 'canonical_fallback';
  const fr = o.fallbackReason;
  const fallbackReason =
    fr === 'none' || fr === 'no_published' || fr === 'invalid_published_payload' || fr === 'db_unavailable'
      ? fr
      : 'no_published';
  return {
    visitorReadSource,
    fallbackReason,
    activePublishedVersionId: typeof o.activePublishedVersionId === 'string' ? o.activePublishedVersionId : null,
    publishSequence: typeof o.publishSequence === 'number' ? o.publishSequence : null,
    publishedAtIso: typeof o.publishedAtIso === 'string' ? o.publishedAtIso : null,
    importId: typeof o.importId === 'string' ? o.importId : null,
    label: typeof o.label === 'string' ? o.label : null,
    changeSummary: typeof o.changeSummary === 'string' ? o.changeSummary : null,
    failedPublishedVersionId:
      typeof o.failedPublishedVersionId === 'string' ? o.failedPublishedVersionId : null,
  };
}

type OkBody = Record<string, unknown>;

async function parseJson(res: Response): Promise<OkBody> {
  try {
    return (await res.json()) as OkBody;
  } catch {
    return {};
  }
}

async function requestWorkflow(
  path: string,
  init: RequestInit = {},
): Promise<{ success: true; data: OkBody } | ContentWorkflowClientError> {
  const hasBody = typeof init.body === 'string' && init.body !== '';
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });
  const data = await parseJson(res);
  if (data.ok !== true) {
    return {
      success: false,
      status: res.status,
      error: String(data.error ?? 'UNKNOWN'),
      message: String(data.message ?? 'Request failed'),
    };
  }
  return { success: true, data };
}

export async function fetchContentDraft(): Promise<
  | {
      success: true;
      draft: ContentVersionRow | null;
      latestPublished: LatestPublishedMeta | null;
      publicLiveRead: PublicLiveReadSummaryDto | null;
      publicContentAuthority: string;
      publicContentAuthorityDetail: string;
    }
  | ContentWorkflowClientError
> {
  const r = await requestWorkflow(adminContentWorkflowApiPaths.draft);
  if (!r.success) {
    return r;
  }
  const draft = r.data.draft;
  if (draft === null || draft === undefined) {
    return {
      success: true,
      draft: null,
      latestPublished: (r.data.latestPublished as LatestPublishedMeta | null) ?? null,
      publicLiveRead: parsePublicLiveRead(r.data.publicLiveRead),
      publicContentAuthority: String(r.data.publicContentAuthority ?? DEFAULT_AUTHORITY),
      publicContentAuthorityDetail: String(r.data.publicContentAuthorityDetail ?? DEFAULT_AUTHORITY_DETAIL),
    };
  }
  if (typeof draft !== 'object') {
    return { success: false, status: 500, error: 'INTERNAL', message: 'Invalid draft shape' };
  }
  return {
    success: true,
    draft: draft as unknown as ContentVersionRow,
    latestPublished: (r.data.latestPublished as LatestPublishedMeta | null) ?? null,
    publicLiveRead: parsePublicLiveRead(r.data.publicLiveRead),
    publicContentAuthority: String(r.data.publicContentAuthority ?? DEFAULT_AUTHORITY),
    publicContentAuthorityDetail: String(r.data.publicContentAuthorityDetail ?? DEFAULT_AUTHORITY_DETAIL),
  };
}

export async function fetchContentVersions(take?: number): Promise<
  { success: true; versions: ContentVersionRow[]; publicLiveRead: PublicLiveReadSummaryDto | null } | ContentWorkflowClientError
> {
  const q = take !== undefined ? `?take=${encodeURIComponent(String(take))}` : '';
  const r = await requestWorkflow(`${adminContentWorkflowApiPaths.versions}${q}`);
  if (!r.success) {
    return r;
  }
  const raw = r.data.versions;
  if (!Array.isArray(raw)) {
    return { success: false, status: 500, error: 'INTERNAL', message: 'Invalid versions shape' };
  }
  return {
    success: true,
    versions: raw as unknown as ContentVersionRow[],
    publicLiveRead: parsePublicLiveRead(r.data.publicLiveRead),
  };
}

export async function postBootstrapDraft(body?: {
  label?: string;
  changeSummary?: string | null;
}): Promise<{ success: true; draft: ContentVersionRow } | ContentWorkflowClientError> {
  const r = await requestWorkflow(adminContentWorkflowApiPaths.draftBootstrap, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
  if (!r.success) {
    return r;
  }
  const draft = r.data.draft;
  if (typeof draft !== 'object' || draft === null) {
    return { success: false, status: 500, error: 'INTERNAL', message: 'Invalid draft response' };
  }
  return { success: true, draft: draft as unknown as ContentVersionRow };
}

export async function postPublishDraft(body?: {
  label?: string | null;
  changeSummary?: string | null;
}): Promise<{ success: true; version: ContentVersionRow } | ContentWorkflowClientError> {
  const r = await requestWorkflow(adminContentWorkflowApiPaths.publish, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
  if (!r.success) {
    return r;
  }
  const version = r.data.version;
  if (typeof version !== 'object' || version === null) {
    return { success: false, status: 500, error: 'INTERNAL', message: 'Invalid version response' };
  }
  return { success: true, version: version as unknown as ContentVersionRow };
}

export async function putSaveDraft(input: {
  payload: unknown;
  changeSummary?: string | null;
}): Promise<{ success: true; draft: ContentVersionRow } | ContentWorkflowClientError> {
  const r = await requestWorkflow(adminContentWorkflowApiPaths.draft, {
    method: 'PUT',
    body: JSON.stringify({
      payload: input.payload,
      changeSummary: input.changeSummary,
    }),
  });
  if (!r.success) {
    return r;
  }
  const draft = r.data.draft;
  if (typeof draft !== 'object' || draft === null) {
    return { success: false, status: 500, error: 'INTERNAL', message: 'Invalid draft response' };
  }
  return { success: true, draft: draft as unknown as ContentVersionRow };
}

export async function postRestoreVersion(
  versionId: string,
  body?: { label?: string | null; changeSummary?: string | null },
): Promise<{ success: true; draft: ContentVersionRow } | ContentWorkflowClientError> {
  const r = await requestWorkflow(adminContentWorkflowApiPaths.versionRestore(versionId), {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
  if (!r.success) {
    return r;
  }
  const draft = r.data.draft;
  if (typeof draft !== 'object' || draft === null) {
    return { success: false, status: 500, error: 'INTERNAL', message: 'Invalid draft response' };
  }
  return { success: true, draft: draft as unknown as ContentVersionRow };
}

export function formatWorkflowError(err: ContentWorkflowClientError): string {
  if (err.error === 'UNAUTHORIZED') {
    return 'Please log in again.';
  }
  if (err.error === 'DEVICE_REQUIRED') {
    return 'Register this device under Devices to use site content workflow.';
  }
  if (err.error === 'DRAFT_EXISTS') {
    return 'A working draft already exists. Publish it or use restore only when no draft is present.';
  }
  if (err.error === 'NO_DRAFT') {
    return 'No working draft — create one from canonical content before this action.';
  }
  if (err.error === 'INVALID_PAYLOAD') {
    return err.message || 'Content failed validation. Check required fields and try again.';
  }
  return err.message || err.error;
}
