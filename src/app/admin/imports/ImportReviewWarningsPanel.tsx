'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

import type { ReviewPayloadModel } from './importDetailTypes';

export function ImportReviewWarningsPanel({ review }: { review: ReviewPayloadModel }) {
  if (review.warnings.length === 0) {
    return null;
  }

  return (
    <div className="card p-4 border-warning/40 bg-warning/5">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Warnings ({review.warnings.length})</p>
          <ul className="mt-2 text-sm text-muted list-disc pl-4 space-y-1">
            {review.warnings.map((w, i) => (
              <li key={i}>
                {w.code ? `${w.code}: ` : ''}
                {w.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
