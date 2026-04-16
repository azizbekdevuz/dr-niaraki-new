'use client';

import { AlertCircle, CheckCircle, Loader2, Layers } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import type {
  ContentVersionRow,
  LatestPublishedMeta,
  PublicLiveReadSummaryDto,
} from '@/lib/adminContentWorkflowClient';

import { ContentWorkflowToolbar } from './workflow/ContentWorkflowToolbar';
import { PublicWorkflowLivePanel } from './workflow/PublicWorkflowLivePanel';
import { PublishedVersionsTable } from './workflow/PublishedVersionsTable';

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
      <div className="mx-auto max-w-5xl">
        <ContentWorkflowToolbar syncing={syncing} onRefresh={onRefresh} onLogout={onLogout} />

        {success ? (
          <div className="card mb-6 border-success bg-success/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <p className="font-medium text-foreground">{success}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
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

        <section className="card mb-6 p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Working draft</h2>
          {draft ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted">Status:</span>{' '}
                <span className="font-medium text-foreground">{draft.status}</span>
              </p>
              <p>
                <span className="text-muted">Id:</span>{' '}
                <code className="rounded bg-surface-secondary px-2 py-0.5 text-xs">{draft.id}</code>
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
                  <Link href={`/admin/imports/${draft.importId}`} className="text-xs text-accent-primary hover:underline">
                    {draft.importId.slice(0, 10)}…
                  </Link>
                  <span className="text-xs text-muted"> (merge-to-draft provenance)</span>
                </p>
              ) : null}
              <p>
                <span className="text-muted">Updated:</span> {new Date(draft.updatedAt).toLocaleString()}
              </p>
              <p className="pt-2 text-xs text-muted">
                Use the draft editor below for profile, professional summary, and contact fields. Publish when ready.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                No working draft. Create one from the current in-repo canonical site content.
              </p>
              <button
                type="button"
                onClick={() => void onBootstrap()}
                disabled={blocked}
                className="btn-primary inline-flex items-center gap-2 px-6 py-2 disabled:opacity-50"
              >
                {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                <span>Create draft from canonical content</span>
              </button>
            </div>
          )}
        </section>

        {editorPanel}

        {draft ? (
          <section className="card mb-6 p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Publish</h2>
            <p className="mb-4 text-sm text-muted">
              Publishes the current working draft as the next immutable version. Requires valid site content in the
              draft.
            </p>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pub-label" className="mb-1 block text-sm font-medium text-secondary">
                  Label (optional)
                </label>
                <input
                  id="pub-label"
                  value={publishLabel}
                  onChange={(e) => onPublishLabelChange(e.target.value)}
                  className="w-full rounded-lg border border-primary bg-surface-secondary px-3 py-2 text-sm text-foreground"
                  placeholder="e.g. Spring 2026 update"
                />
              </div>
              <div>
                <label htmlFor="pub-summary" className="mb-1 block text-sm font-medium text-secondary">
                  Change summary (optional)
                </label>
                <input
                  id="pub-summary"
                  value={publishSummary}
                  onChange={(e) => onPublishSummaryChange(e.target.value)}
                  className="w-full rounded-lg border border-primary bg-surface-secondary px-3 py-2 text-sm text-foreground"
                  placeholder="Short note for history"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void onPublish()}
              disabled={blocked}
              className="btn-primary inline-flex items-center gap-2 px-6 py-2 disabled:opacity-50"
            >
              {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>Publish draft</span>
            </button>
          </section>
        ) : null}

        <PublishedVersionsTable
          versions={versions}
          restoreNote={restoreNote}
          onRestoreNoteChange={onRestoreNoteChange}
          onRestore={onRestore}
          draft={draft}
          publicLiveRead={publicLiveRead}
          blocked={blocked}
        />
      </div>
    </div>
  );
}
