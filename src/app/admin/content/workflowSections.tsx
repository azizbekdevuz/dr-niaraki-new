'use client';

import {
  AlertCircle,
  CheckCircle,
  History,
  Layers,
  Loader2,
  LogOut,
  Package,
  RefreshCw,
  Settings,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import type {
  ContentVersionRow,
  LatestPublishedMeta,
  PublicLiveReadSummaryDto,
} from '@/lib/adminContentWorkflowClient';

export type ContentWorkflowSectionsProps = {
  draft: ContentVersionRow | null;
  latestPublished: LatestPublishedMeta | null;
  publicLiveRead: PublicLiveReadSummaryDto | null;
  publicContentAuthority: string;
  publicContentAuthorityDetail: string;
  versions: ContentVersionRow[];
  syncing: boolean;
  mutating: boolean;
  error: string | null;
  success: string | null;
  publishLabel: string;
  publishSummary: string;
  restoreNote: string;
  onPublishLabelChange: (v: string) => void;
  onPublishSummaryChange: (v: string) => void;
  onRestoreNoteChange: (v: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onBootstrap: () => void;
  onPublish: () => void;
  onRestore: (versionId: string) => void;
  /** Draft editor (or null). Rendered after draft status, before publish. */
  editorPanel: React.ReactNode;
};

type PublicWorkflowLivePanelProps = {
  publicLiveRead: PublicLiveReadSummaryDto | null;
  publicContentAuthority: string;
  publicContentAuthorityDetail: string;
  latestPublished: LatestPublishedMeta | null;
  draft: ContentVersionRow | null;
};

function PublicWorkflowLivePanel({
  publicLiveRead,
  publicContentAuthority,
  publicContentAuthorityDetail,
  latestPublished,
  draft,
}: PublicWorkflowLivePanelProps) {
  return (
    <section className="card p-4 mb-6 border-primary/25 bg-surface-secondary/60">
      <h2 className="text-sm font-semibold text-foreground mb-2">What visitors see (live)</h2>
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
                  · version <code className="text-foreground">{publicLiveRead.activePublishedVersionId.slice(0, 10)}…</code>
                </>
              ) : null}
              {publicLiveRead.importId ? (
                <>
                  {' '}
                  · import{' '}
                  <Link href={`/admin/imports/${publicLiveRead.importId}`} className="text-accent-primary hover:underline">
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
                  · invalid row <code className="text-foreground">{publicLiveRead.failedPublishedVersionId.slice(0, 10)}…</code>
                </>
              ) : null}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted">Refresh to load live read summary.</p>
      )}
      <p className="text-xs text-muted leading-relaxed mt-3 pt-3 border-t border-primary/20">
        <span className="font-medium text-foreground">Model ({publicContentAuthority}):</span>{' '}
        {publicContentAuthorityDetail}
      </p>
      {latestPublished ? (
        <p className="text-xs text-muted mt-2">
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
        <p className="text-xs text-muted mt-2">No published DB version yet — publish a working draft to create one.</p>
      )}
      {draft && draft.status === 'DRAFT' && latestPublished ? (
        <p className="text-xs text-warning mt-2">
          Working draft may differ from what is live until you publish again. Restore is only available when no draft
          exists.
        </p>
      ) : null}
    </section>
  );
}

export function ContentWorkflowSections({
  draft,
  latestPublished,
  publicLiveRead,
  publicContentAuthority,
  publicContentAuthorityDetail,
  versions,
  syncing,
  mutating,
  error,
  success,
  publishLabel,
  publishSummary,
  restoreNote,
  onPublishLabelChange,
  onPublishSummaryChange,
  onRestoreNoteChange,
  onRefresh,
  onLogout,
  onBootstrap,
  onPublish,
  onRestore,
  editorPanel,
}: ContentWorkflowSectionsProps) {
  const blocked = syncing || mutating;
  return (
    <div className="min-h-[60vh] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Site content</h1>
              <p className="text-muted text-sm">Draft, publish, and restore versioned content</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/admin/upload"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </a>
            <Link
              href="/admin/imports"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm"
            >
              <Package className="w-4 h-4" />
              <span>Imports</span>
            </Link>
            <a
              href="/admin/history"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </a>
            <a
              href="/admin/devices"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Devices</span>
            </a>
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={syncing}
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {success ? (
          <div className="card p-4 mb-6 border-success bg-success/5">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="font-medium text-foreground">{success}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-2 text-error text-sm bg-error/10 px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <PublicWorkflowLivePanel
          publicLiveRead={publicLiveRead}
          publicContentAuthority={publicContentAuthority}
          publicContentAuthorityDetail={publicContentAuthorityDetail}
          latestPublished={latestPublished}
          draft={draft}
        />

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Working draft</h2>
          {draft ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted">Status:</span>{' '}
                <span className="font-medium text-foreground">{draft.status}</span>
              </p>
              <p>
                <span className="text-muted">Id:</span>{' '}
                <code className="text-xs bg-surface-secondary px-2 py-0.5 rounded">{draft.id}</code>
              </p>
              {draft.label ? (
                <p>
                  <span className="text-muted">Label:</span> {draft.label}
                </p>
              ) : null}
              {draft.changeSummary ? (
                <p>
                  <span className="text-muted">Summary:</span> {draft.changeSummary}
                </p>
              ) : null}
              {draft.importId ? (
                <p>
                  <span className="text-muted">Linked import:</span>{' '}
                  <Link href={`/admin/imports/${draft.importId}`} className="text-accent-primary hover:underline text-xs">
                    {draft.importId.slice(0, 10)}…
                  </Link>
                  <span className="text-muted text-xs"> (merge-to-draft provenance)</span>
                </p>
              ) : null}
              <p>
                <span className="text-muted">Updated:</span>{' '}
                {new Date(draft.updatedAt).toLocaleString()}
              </p>
              <p className="text-muted text-xs pt-2">
                Use the draft editor below for profile, professional summary, and contact fields. Publish when ready.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted text-sm">
                No working draft. Create one from the current in-repo canonical site content.
              </p>
              <button
                type="button"
                onClick={() => void onBootstrap()}
                disabled={blocked}
                className="btn-primary px-6 py-2 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {mutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>Create draft from canonical content</span>
              </button>
            </div>
          )}
        </section>

        {editorPanel}

        {draft ? (
          <section className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Publish</h2>
            <p className="text-muted text-sm mb-4">
              Publishes the current working draft as the next immutable version. Requires valid site content in the
              draft.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label htmlFor="pub-label" className="block text-sm font-medium text-secondary mb-1">
                  Label (optional)
                </label>
                <input
                  id="pub-label"
                  value={publishLabel}
                  onChange={(e) => onPublishLabelChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-primary text-foreground text-sm"
                  placeholder="e.g. Spring 2026 update"
                />
              </div>
              <div>
                <label htmlFor="pub-summary" className="block text-sm font-medium text-secondary mb-1">
                  Change summary (optional)
                </label>
                <input
                  id="pub-summary"
                  value={publishSummary}
                  onChange={(e) => onPublishSummaryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-primary text-foreground text-sm"
                  placeholder="Short note for history"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void onPublish()}
              disabled={blocked}
              className="btn-primary px-6 py-2 inline-flex items-center gap-2 disabled:opacity-50"
            >
              {mutating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Publish draft</span>
            </button>
          </section>
        ) : null}

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Published versions</h2>
          {versions.length > 0 ? (
            <label className="block max-w-xl mb-4">
              <span className="text-xs text-muted block mb-1">Restore note (optional)</span>
              <input
                value={restoreNote}
                onChange={(e) => onRestoreNoteChange(e.target.value)}
                disabled={blocked}
                placeholder="Recorded on the new draft when you restore"
                className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-primary text-foreground text-sm"
              />
            </label>
          ) : null}
          {versions.length === 0 ? (
            <p className="text-muted text-sm">No published versions yet. Publish a draft to build history.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-primary text-muted">
                    <th className="py-2 pr-4 font-medium w-16">Live</th>
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
                    <tr
                      key={v.id}
                      className={`border-b border-primary/60 ${isServingLive ? 'bg-success/10' : ''}`}
                    >
                      <td className="py-2 pr-4 text-xs">
                        {isServingLive ? (
                          <span className="text-success font-medium">Yes</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-foreground">{v.publishSequence ?? '—'}</td>
                      <td className="py-2 pr-4">
                        <code className="text-xs bg-surface-secondary px-1.5 py-0.5 rounded">{v.id.slice(0, 12)}…</code>
                      </td>
                      <td className="py-2 pr-4">{v.status}</td>
                      <td className="py-2 pr-4 text-muted">
                        {v.publishedAt ? new Date(v.publishedAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 pr-4 text-muted max-w-xs truncate" title={v.label ?? v.changeSummary ?? ''}>
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
                            className="text-accent-primary hover:underline text-xs disabled:opacity-40 disabled:no-underline"
                            title={draft ? 'Publish or discard the current draft before restoring' : undefined}
                          >
                            Restore to draft
                          </button>
                        ) : (
                          <span className="text-muted text-xs">—</span>
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
            <p className="text-muted text-xs mt-4">
              Restore is disabled while a working draft exists. Publish the draft first, or wait until no draft is
              present.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
