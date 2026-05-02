'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { ReviewableStringList } from '@/components/shared/ReviewableStringList';

type Props = {
  warnings: string[];
};

export function CvParseWarningsCard({ warnings }: Props) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="card border-warning bg-warning/5 p-4">
      <div className="mb-3 flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="font-medium text-foreground">Parser warnings</p>
          <p className="text-sm text-muted">Expand to review every message before committing.</p>
        </div>
      </div>
      <ReviewableStringList title="All parser warnings" items={warnings} itemLabel="warnings" />
    </div>
  );
}
