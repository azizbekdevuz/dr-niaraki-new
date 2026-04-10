import 'server-only';

import { cache } from 'react';

import type { SiteContent } from '@/content/schema';
import {
  getCanonicalSiteContent,
  getLatestPublishedOrCanonicalSiteContent,
  getLatestPublishedSiteContent,
} from '@/server/content/publishedSiteContent';

export type PublicSiteContentResult =
  | {
      data: SiteContent;
      chosenSource: 'db_published';
      versionId: string;
      publishSequence: number | null;
      publishedAt: Date | null;
      importId: string | null;
    }
  | {
      data: SiteContent;
      chosenSource: 'canonical';
      fallbackReason: 'no_published' | 'invalid_published_payload' | 'db_unavailable';
      failedVersionId?: string;
    };

async function loadPublicSiteContent(): Promise<PublicSiteContentResult> {
  try {
    const r = await getLatestPublishedOrCanonicalSiteContent();
    if (r.chosenSource === 'db_published') {
      return {
        data: r.data,
        chosenSource: 'db_published',
        versionId: r.versionId,
        publishSequence: r.publishSequence,
        publishedAt: r.publishedAt,
        importId: r.importId,
      };
    }
    return {
      data: r.data,
      chosenSource: 'canonical',
      fallbackReason: r.fallbackReason,
      failedVersionId: r.failedVersionId,
    };
  } catch (e) {
    const code =
      e && typeof e === 'object' && 'code' in e && typeof (e as { code: unknown }).code === 'string'
        ? (e as { code: string }).code
        : null;
    const quietDb =
      code === 'P2021' || code === 'P1001' || code === 'P1017' || code === 'P1000';
    if (quietDb) {
      console.warn(
        `[publicSiteContent] DB not usable for published read (${code}); using canonical in-repo content.`,
      );
    } else {
      console.error('[publicSiteContent] Failed to resolve published/canonical content; using canonical.', e);
    }
    return {
      data: getCanonicalSiteContent(),
      chosenSource: 'canonical',
      fallbackReason: 'db_unavailable',
    };
  }
}

/**
 * Per-request cached resolution: latest valid published DB snapshot, else canonical.
 * Used by the root layout and metadata so public routes share one resolution per navigation.
 */
export const getPublicSiteContent = cache(loadPublicSiteContent);

/** For tests or diagnostics where React `cache` must not hide repeated behavior. */
export async function getPublicSiteContentUncached(): Promise<PublicSiteContentResult> {
  return loadPublicSiteContent();
}

/** Admin / diagnostics: which snapshot the public site would read (without loading full merged payload twice). */
export type PublicLiveReadSummary = {
  visitorReadSource: 'db_published' | 'canonical_fallback';
  fallbackReason: 'none' | 'no_published' | 'invalid_published_payload' | 'db_unavailable';
  activePublishedVersionId: string | null;
  publishSequence: number | null;
  publishedAtIso: string | null;
  importId: string | null;
  label: string | null;
  changeSummary: string | null;
  /** When fallback is due to invalid payload, the failing published row id (if known). */
  failedPublishedVersionId: string | null;
};

export async function getPublicLiveReadSummary(): Promise<PublicLiveReadSummary> {
  const empty = (): PublicLiveReadSummary => ({
    visitorReadSource: 'canonical_fallback',
    fallbackReason: 'db_unavailable',
    activePublishedVersionId: null,
    publishSequence: null,
    publishedAtIso: null,
    importId: null,
    label: null,
    changeSummary: null,
    failedPublishedVersionId: null,
  });

  try {
    const pub = await getLatestPublishedSiteContent();
    if (pub.source === 'db_published') {
      return {
        visitorReadSource: 'db_published',
        fallbackReason: 'none',
        activePublishedVersionId: pub.versionId,
        publishSequence: pub.publishSequence,
        publishedAtIso: pub.publishedAt?.toISOString() ?? null,
        importId: pub.importId,
        label: pub.label,
        changeSummary: pub.changeSummary,
        failedPublishedVersionId: null,
      };
    }
    if (pub.reason === 'invalid_published_payload') {
      return {
        visitorReadSource: 'canonical_fallback',
        fallbackReason: 'invalid_published_payload',
        activePublishedVersionId: null,
        publishSequence: null,
        publishedAtIso: null,
        importId: null,
        label: null,
        changeSummary: null,
        failedPublishedVersionId: pub.versionId ?? null,
      };
    }
    return {
      visitorReadSource: 'canonical_fallback',
      fallbackReason: 'no_published',
      activePublishedVersionId: null,
      publishSequence: null,
      publishedAtIso: null,
      importId: null,
      label: null,
      changeSummary: null,
      failedPublishedVersionId: null,
    };
  } catch (e) {
    const code =
      e && typeof e === 'object' && 'code' in e && typeof (e as { code: unknown }).code === 'string'
        ? (e as { code: string }).code
        : null;
    const quietDb =
      code === 'P2021' || code === 'P1001' || code === 'P1017' || code === 'P1000';
    if (quietDb) {
      console.warn(`[getPublicLiveReadSummary] DB unavailable (${code}); public site uses canonical fallback.`);
    } else {
      console.error('[getPublicLiveReadSummary] Unexpected error; assuming canonical fallback.', e);
    }
    return {
      ...empty(),
      fallbackReason: 'db_unavailable',
    };
  }
}
