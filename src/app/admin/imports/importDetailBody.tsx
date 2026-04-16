'use client';

import Link from 'next/link';
import React from 'react';

import { ImportCandidateSummaryCard } from './ImportCandidateSummaryCard';
import type { ImportDetailModel, ReviewPayloadModel } from './importDetailTypes';
import { ImportMergeDraftCard } from './ImportMergeDraftCard';
import { ImportProvenanceCard } from './ImportProvenanceCard';
import { ImportReviewWarningsPanel } from './ImportReviewWarningsPanel';
import { ImportStructuredReviewBlocks } from './ImportStructuredReviewBlocks';

type Props = {
  imp: ImportDetailModel;
  review: ReviewPayloadModel | null;
  hasDraft: boolean;
  merging: boolean;
  mergeMsg: string | null;
  error: string | null;
  onMerge: (action: 'create' | 'replace') => void;
};

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

        {error ? <div className="card p-4 border-error/40 bg-error/5 text-error text-sm">{error}</div> : null}
        {mergeMsg ? (
          <div className="card p-4 border-success/40 bg-success/5 text-foreground text-sm">{mergeMsg}</div>
        ) : null}

        {review?.legacyUploadsMetaNote ? (
          <div className="card p-3 border-primary/20 bg-surface-secondary/80 text-xs text-muted">
            {review.legacyUploadsMetaNote}
          </div>
        ) : null}

        {review?.provenance ? <ImportProvenanceCard provenance={review.provenance} /> : null}

        <ImportCandidateSummaryCard imp={imp} />

        {review ? <ImportReviewWarningsPanel review={review} /> : null}

        <ImportMergeDraftCard imp={imp} hasDraft={hasDraft} merging={merging} onMerge={onMerge} />

        {review ? <ImportStructuredReviewBlocks review={review} /> : null}
      </div>
    </div>
  );
}

export type {
  ImportDetailModel,
  ImportReviewBlockModel,
  ImportReviewProvenanceModel,
  ReviewPayloadModel,
} from './importDetailTypes';
