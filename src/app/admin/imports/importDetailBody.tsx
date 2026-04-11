'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { VERCEL_BLOB_STORED_PREFIX } from '@/lib/storagePathMarkers';

export type ImportDetailModel = {
  id: string;
  status: string;
  originalFileName: string;
  parserVersion: string | null;
  warnings: { message: string; code?: string }[];
  candidateSummary: {
    profileName: string | null;
    publicationCount: number;
    patentCount: number;
    rawHtmlTruncated: boolean;
  } | null;
};

export type ImportReviewProvenanceModel = {
  importId: string;
  originalFileName: string;
  storedPath: string;
  uploadedFileId: string;
};

export type ImportReviewBlockModel = {
  id: string;
  title: string;
  unchangedSummary: string | null;
  added: string[];
  removed: string[];
  changed: { label: string; lines: string[] }[];
};

export type ReviewPayloadModel = {
  baselineSource: string;
  blocks: ImportReviewBlockModel[];
  warnings: { message: string; code?: string }[];
  provenance: ImportReviewProvenanceModel | null;
  legacyUploadsMetaNote: string;
};

type Props = {
  imp: ImportDetailModel;
  review: ReviewPayloadModel | null;
  hasDraft: boolean;
  merging: boolean;
  mergeMsg: string | null;
  error: string | null;
  onMerge: (action: 'create' | 'replace') => void;
};

function ImportProvenanceCard({ provenance }: { provenance: ImportReviewProvenanceModel }) {
  const isBlob = provenance.storedPath.startsWith(VERCEL_BLOB_STORED_PREFIX);
  return (
    <div className="card p-4 space-y-1 text-sm">
      <p className="font-medium text-foreground">Import provenance</p>
      <ul className="text-xs text-muted list-none space-y-0.5">
        <li>Import id: {provenance.importId}</li>
        <li>Original file: {provenance.originalFileName}</li>
        <li className="break-all">Stored path: {provenance.storedPath}</li>
        {isBlob ? (
          <li className="text-foreground/90">
            File bytes live in private Vercel Blob; download from upload history uses an authenticated admin route.
          </li>
        ) : null}
        <li>UploadedFile id: {provenance.uploadedFileId}</li>
      </ul>
    </div>
  );
}

export function ImportDetailBody({ imp, review, hasDraft, merging, mergeMsg, error, onMerge }: Props) {
  return (
    <div className="min-h-[60vh] px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin/imports" className="text-accent-primary hover:underline">
            ← All imports
          </Link>
          <Link href="/admin/content" className="text-accent-primary hover:underline">
            Site content
          </Link>
        </div>

        {error && <div className="card p-4 border-error/40 bg-error/5 text-error text-sm">{error}</div>}
        {mergeMsg && (
          <div className="card p-4 border-success/40 bg-success/5 text-foreground text-sm">{mergeMsg}</div>
        )}

        {review?.legacyUploadsMetaNote && (
          <div className="card p-3 border-primary/20 bg-surface-secondary/80 text-xs text-muted">{review.legacyUploadsMetaNote}</div>
        )}

        {review?.provenance ? <ImportProvenanceCard provenance={review.provenance} /> : null}

        {imp.candidateSummary && (
          <div className="card p-4 space-y-1 text-sm">
            <p className="font-medium text-foreground">Candidate summary</p>
            <p className="text-muted">
              Profile name: {imp.candidateSummary.profileName ?? '—'} · Publications:{' '}
              {imp.candidateSummary.publicationCount} · Patents: {imp.candidateSummary.patentCount}
              {imp.candidateSummary.rawHtmlTruncated ? ' · rawHtml truncated in DB' : ''}
            </p>
          </div>
        )}

        {(review?.warnings.length ?? 0) > 0 && (
          <div className="card p-4 border-warning/40 bg-warning/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Warnings ({review!.warnings.length})</p>
                <ul className="mt-2 text-sm text-muted list-disc pl-4 space-y-1">
                  {review!.warnings.map((w, i) => (
                    <li key={i}>
                      {w.code ? `${w.code}: ` : ''}
                      {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="card p-4 space-y-3">
          <p className="font-medium text-foreground">Merge into working draft</p>
          <p className="text-xs text-muted">
            Creates or replaces the <strong>working draft</strong> only. Does not publish. Imports already merged
            cannot merge again. If a draft already exists, use <strong>Replace</strong> only when you intend to overwrite
            the whole draft payload.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={merging || hasDraft || imp.status === 'MERGED'}
              onClick={() => onMerge('create')}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
            >
              Create draft from import
            </button>
            <button
              type="button"
              disabled={merging || !hasDraft || imp.status === 'MERGED'}
              onClick={() => onMerge('replace')}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              Replace current draft
            </button>
          </div>
          {!hasDraft && <p className="text-xs text-muted">No working draft yet — use &quot;Create&quot; first.</p>}
          {hasDraft && (
            <p className="text-xs text-muted">
              A draft exists — &quot;Replace&quot; overwrites the working draft with the mapped import (still not
              published).
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Structured review</h2>
          <p className="text-xs text-muted">
            Baseline: <span className="text-foreground">{review?.baselineSource ?? '—'}</span>. Lists use stable{' '}
            <code className="text-foreground">id</code> to classify added, removed, and changed rows.
          </p>
          {(review?.blocks ?? []).map((block) => (
            <div key={block.id} className="card p-4 space-y-3">
              <p className="font-medium text-foreground">{block.title}</p>
              {block.unchangedSummary && <p className="text-xs text-muted">{block.unchangedSummary}</p>}
              {block.added.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-success mb-1">Added</p>
                  <ul className="text-xs text-foreground list-disc pl-4 space-y-1">
                    {block.added.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              {block.removed.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-error mb-1">Removed</p>
                  <ul className="text-xs text-foreground list-disc pl-4 space-y-1">
                    {block.removed.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              {block.changed.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Changed</p>
                  <ul className="space-y-2">
                    {block.changed.map((c, i) => (
                      <li key={i} className="text-xs bg-surface-secondary rounded p-2">
                        <p className="font-medium text-foreground mb-1">{c.label}</p>
                        <ul className="list-disc pl-4 text-muted space-y-0.5">
                          {c.lines.map((ln, j) => (
                            <li key={j}>{ln}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {block.added.length + block.removed.length + block.changed.length === 0 && !block.unchangedSummary && (
                <p className="text-xs text-muted">No differences surfaced in this block.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
