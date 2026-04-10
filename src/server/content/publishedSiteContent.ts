import 'server-only';

import { SITE_CONTENT_RAW } from '@/content/defaults';
import type { SiteContent } from '@/content/schema';
import { assertSiteContent, validateSiteContent } from '@/content/validators';

import { getLatestPublishedVersion } from './contentWorkflowCore';

export type LatestPublishedSiteContentOk = {
  source: 'db_published';
  versionId: string;
  publishSequence: number | null;
  publishedAt: Date | null;
  importId: string | null;
  label: string | null;
  changeSummary: string | null;
  data: SiteContent;
};

export type LatestPublishedSiteContentErr = {
  source: 'none';
  reason: 'no_published' | 'invalid_published_payload';
  versionId?: string;
};

/**
 * Latest **published** row from DB with a validated `SiteContent` payload.
 * Does not fall back to canonical — callers use this when DB truth is required.
 */
export async function getLatestPublishedSiteContent(): Promise<
  LatestPublishedSiteContentOk | LatestPublishedSiteContentErr
> {
  const row = await getLatestPublishedVersion();
  if (!row) {
    return { source: 'none', reason: 'no_published' };
  }
  const parsed = validateSiteContent(row.payload);
  if (!parsed.success || !parsed.data) {
    return { source: 'none', reason: 'invalid_published_payload', versionId: row.id };
  }
  return {
    source: 'db_published',
    versionId: row.id,
    publishSequence: row.publishSequence,
    publishedAt: row.publishedAt,
    importId: row.importId,
    label: row.label,
    changeSummary: row.changeSummary,
    data: parsed.data,
  };
}

/**
 * Validated in-repo canonical snapshot (what public pages use today).
 */
export function getCanonicalSiteContent(): SiteContent {
  return assertSiteContent(SITE_CONTENT_RAW);
}

export type PublishedOrCanonicalOk =
  | (LatestPublishedSiteContentOk & { chosenSource: 'db_published' })
  | {
      chosenSource: 'canonical';
      data: SiteContent;
      fallbackReason: 'no_published' | 'invalid_published_payload';
      /** Present when fallback was due to invalid DB payload. */
      failedVersionId?: string;
    };

/**
 * Prefer latest published DB snapshot when valid; otherwise validated canonical.
 * Used by `publicSiteContent` for public pages and metadata.
 */
export async function getLatestPublishedOrCanonicalSiteContent(): Promise<PublishedOrCanonicalOk> {
  const latest = await getLatestPublishedSiteContent();
  if (latest.source === 'db_published') {
    return { ...latest, chosenSource: 'db_published' };
  }
  const data = getCanonicalSiteContent();
  if (latest.reason === 'invalid_published_payload') {
    return {
      chosenSource: 'canonical',
      data,
      fallbackReason: 'invalid_published_payload',
      failedVersionId: latest.versionId,
    };
  }
  return {
    chosenSource: 'canonical',
    data,
    fallbackReason: 'no_published',
  };
}

/**
 * Lightweight read for admin/workflow: latest published row metadata only (no payload).
 */
export async function getLatestPublishedVersionMeta() {
  const row = await getLatestPublishedVersion();
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    publishSequence: row.publishSequence,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    label: row.label,
    changeSummary: row.changeSummary,
    importId: row.importId,
  };
}
