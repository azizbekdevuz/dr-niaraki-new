'use client';

import Link from 'next/link';
import React from 'react';

import type { ContentVersionRow, PublicLiveReadSummaryDto } from '@/lib/adminContentWorkflowClient';

export type PublishedVersionsTableProps = {
  versions: readonly ContentVersionRow[];
  restoreNote: string;
  onRestoreNoteChange: (v: string) => void;
  onRestore: (versionId: string) => void;
  draft: ContentVersionRow | null;
  publicLiveRead: PublicLiveReadSummaryDto | null;
  blocked: boolean;
};

export function PublishedVersionsTable({
  versions,
  restoreNote,
  onRestoreNoteChange,
  onRestore,
  draft,
  publicLiveRead,
  blocked,
}: PublishedVersionsTableProps) {
  return (
    <section className="card mb-6 p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Published versions</h2>
      {versions.length > 0 ? (
        <label className="mb-4 block max-w-xl">
          <span className="mb-1 block text-xs text-muted">Restore note (optional)</span>
          <input
            value={restoreNote}
            onChange={(e) => onRestoreNoteChange(e.target.value)}
            disabled={blocked}
            placeholder="Recorded on the new draft when you restore"
            className="w-full rounded-lg border border-primary bg-surface-secondary px-3 py-2 text-sm text-foreground"
          />
        </label>
      ) : null}
      {versions.length === 0 ? (
        <p className="text-sm text-muted">No published versions yet. Publish a draft to build history.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-primary text-muted">
                <th className="w-16 py-2 pr-4 font-medium">Live</th>
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Id</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Published</th>
                <th className="py-2 pr-4 font-medium">Label / summary</th>
                <th className="py-2 pr-4 font-medium">Import</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => {
                const isServingLive =
                  publicLiveRead?.visitorReadSource === 'db_published' &&
                  publicLiveRead.activePublishedVersionId === v.id;
                return (
                  <tr key={v.id} className={`border-b border-primary/60 ${isServingLive ? 'bg-success/10' : ''}`}>
                    <td className="py-2 pr-4 text-xs">
                      {isServingLive ? (
                        <span className="font-medium text-success">Yes</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-foreground">{v.publishSequence ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <code className="rounded bg-surface-secondary px-1.5 py-0.5 text-xs">{v.id.slice(0, 12)}…</code>
                    </td>
                    <td className="py-2 pr-4">{v.status}</td>
                    <td className="py-2 pr-4 text-muted">
                      {v.publishedAt ? new Date(v.publishedAt).toLocaleString() : '—'}
                    </td>
                    <td
                      className="max-w-xs truncate py-2 pr-4 text-muted"
                      title={v.label ?? v.changeSummary ?? ''}
                    >
                      {v.label || v.changeSummary || '—'}
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {v.importId ? (
                        <Link href={`/admin/imports/${v.importId}`} className="text-accent-primary hover:underline">
                          {v.importId.slice(0, 8)}…
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {v.status === 'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() => void onRestore(v.id)}
                          disabled={blocked || !!draft}
                          className="text-xs text-accent-primary hover:underline disabled:no-underline disabled:opacity-40"
                          title={draft ? 'Publish or discard the current draft before restoring' : undefined}
                        >
                          Restore to draft
                        </button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {draft && versions.some((v) => v.status === 'PUBLISHED') ? (
        <p className="mt-4 text-xs text-muted">
          Restore is disabled while a working draft exists. Publish the draft first, or wait until no draft is present.
        </p>
      ) : null}
    </section>
  );
}
