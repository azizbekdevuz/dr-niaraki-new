'use client';

import Link from 'next/link';
import React from 'react';

import type {
  ContentVersionRow,
  LatestPublishedMeta,
  PublicLiveReadSummaryDto,
} from '@/lib/adminContentWorkflowClient';

export type PublicWorkflowLivePanelProps = {
  publicLiveRead: PublicLiveReadSummaryDto | null;
  publicContentAuthority: string;
  publicContentAuthorityDetail: string;
  latestPublished: LatestPublishedMeta | null;
  draft: ContentVersionRow | null;
};

export function PublicWorkflowLivePanel({
  publicLiveRead,
  publicContentAuthority,
  publicContentAuthorityDetail,
  latestPublished,
  draft,
}: PublicWorkflowLivePanelProps) {
  return (
    <section className="card mb-6 border-primary/25 bg-surface-secondary/60 p-4">
      <h2 className="mb-2 text-sm font-semibold text-foreground">What visitors see (live)</h2>
      {publicLiveRead ? (
        <div className="space-y-2 text-xs text-muted">
          {publicLiveRead.visitorReadSource === 'db_published' ? (
            <p>
              <span className="font-medium text-success">Live:</span> published DB snapshot{' '}
              <code className="text-foreground">#{publicLiveRead.publishSequence ?? '?'}</code>
              {publicLiveRead.publishedAtIso
                ? ` · ${new Date(publicLiveRead.publishedAtIso).toLocaleString()}`
                : null}
              {publicLiveRead.activePublishedVersionId ? (
                <>
                  {' '}
                  · version{' '}
                  <code className="text-foreground">{publicLiveRead.activePublishedVersionId.slice(0, 10)}…</code>
                </>
              ) : null}
              {publicLiveRead.importId ? (
                <>
                  {' '}
                  · import{' '}
                  <Link
                    href={`/admin/imports/${publicLiveRead.importId}`}
                    className="text-accent-primary hover:underline"
                  >
                    {publicLiveRead.importId.slice(0, 8)}…
                  </Link>
                </>
              ) : null}
            </p>
          ) : (
            <p>
              <span className="font-medium text-warning">Live:</span> canonical in-repo fallback (no valid published
              read). Reason: <span className="text-foreground">{publicLiveRead.fallbackReason}</span>
              {publicLiveRead.failedPublishedVersionId ? (
                <>
                  {' '}
                  · invalid row{' '}
                  <code className="text-foreground">{publicLiveRead.failedPublishedVersionId.slice(0, 10)}…</code>
                </>
              ) : null}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted">Refresh to load live read summary.</p>
      )}
      <p className="mt-3 border-t border-primary/20 pt-3 text-xs leading-relaxed text-muted">
        <span className="font-medium text-foreground">Model ({publicContentAuthority}):</span>{' '}
        {publicContentAuthorityDetail}
      </p>
      {latestPublished ? (
        <p className="mt-2 text-xs text-muted">
          <span className="font-medium text-foreground">Latest published row (DB):</span> #
          {latestPublished.publishSequence ?? '?'} ·{' '}
          {latestPublished.publishedAt
            ? new Date(latestPublished.publishedAt).toLocaleString()
            : '— no date'}{' '}
          · id <code className="text-foreground">{latestPublished.id.slice(0, 10)}…</code>
          {latestPublished.importId ? (
            <>
              {' '}
              · import{' '}
              <Link href={`/admin/imports/${latestPublished.importId}`} className="text-accent-primary hover:underline">
                {latestPublished.importId.slice(0, 8)}…
              </Link>
            </>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">No published DB version yet — publish a working draft to create one.</p>
      )}
      {draft && draft.status === 'DRAFT' && latestPublished ? (
        <p className="mt-2 text-xs text-warning">
          Working draft may differ from what is live until you publish again. Restore is only available when no draft
          exists.
        </p>
      ) : null}
    </section>
  );
}
