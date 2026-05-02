'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { ReviewableStringList } from '@/components/shared/ReviewableStringList';

import type { ReviewPayloadModel } from './importDetailTypes';

export function ImportReviewWarningsPanel({ review }: { review: ReviewPayloadModel }) {
  if (review.warnings.length === 0) {
    return null;
  }

  const items = review.warnings.map((w) => (w.code ? `${w.code}: ${w.message}` : w.message));

  return (
    <div className="card border-warning/40 bg-warning/5 p-4">
      <div className="mb-3 flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="font-medium text-foreground">Import review warnings</p>
          <p className="text-xs text-muted">Structured list from the import review payload.</p>
        </div>
      </div>
      <ReviewableStringList title="All warnings" items={items} itemLabel="warnings" />
    </div>
  );
}
