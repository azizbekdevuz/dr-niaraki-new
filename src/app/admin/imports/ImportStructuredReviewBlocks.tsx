'use client';

import React from 'react';

import type { ReviewPayloadModel } from './importDetailTypes';

export function ImportStructuredReviewBlocks({ review }: { review: ReviewPayloadModel }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Structured review</h2>
      <p className="text-xs text-muted">
        Baseline: <span className="text-foreground">{review.baselineSource ?? '—'}</span>. Lists use stable{' '}
        <code className="text-foreground">id</code> to classify added, removed, and changed rows.
      </p>
      {(review.blocks ?? []).map((block) => (
        <div key={block.id} className="card p-4 space-y-3">
          <p className="font-medium text-foreground">{block.title}</p>
          {block.unchangedSummary ? <p className="text-xs text-muted">{block.unchangedSummary}</p> : null}
          {block.added.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-success mb-1">Added</p>
              <ul className="text-xs text-foreground list-disc pl-4 space-y-1">
                {block.added.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {block.removed.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-error mb-1">Removed</p>
              <ul className="text-xs text-foreground list-disc pl-4 space-y-1">
                {block.removed.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {block.changed.length > 0 ? (
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
          ) : null}
          {block.added.length + block.removed.length + block.changed.length === 0 && !block.unchangedSummary ? (
            <p className="text-xs text-muted">No differences surfaced in this block.</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
