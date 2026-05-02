'use client';

import React from 'react';

import type { ReviewPayloadModel } from './importDetailTypes';
import { ImportReviewBlockDiffLists } from './ImportReviewBlockDiffLists';

export function ImportStructuredReviewBlocks({ review }: { review: ReviewPayloadModel }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Structured review</h2>
      <p className="text-xs text-muted">
        Baseline: <span className="text-foreground">{review.baselineSource ?? '—'}</span>. Lists use stable{' '}
        <code className="text-foreground">id</code> to classify added, removed, and changed rows. Open each group to
        scroll through the full list — nothing is clipped at the summary.
      </p>
      {(review.blocks ?? []).map((block) => (
        <article key={block.id} className="card p-4 space-y-3">
          <header>
            <p className="font-medium text-foreground">{block.title}</p>
            <p className="mt-1 text-[11px] text-muted">
              {block.added.length} added · {block.removed.length} removed · {block.changed.length} changed clusters
            </p>
          </header>
          <ImportReviewBlockDiffLists block={block} />
        </article>
      ))}
    </div>
  );
}
