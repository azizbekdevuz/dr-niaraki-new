'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

type Props = {
  warnings: string[];
};

export function CvParseWarningsCard({ warnings }: Props) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="card p-4 border-warning bg-warning/5">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Parser Warnings ({warnings.length})</p>
          <p className="text-muted text-sm">Review these warnings before committing</p>
        </div>
      </div>
      <ul className="list-disc list-inside text-sm text-muted space-y-1 ml-8">
        {warnings.slice(0, 10).map((w, i) => (
          <li key={i}>{w}</li>
        ))}
        {warnings.length > 10 ? (
          <li className="text-accent-primary">...and {warnings.length - 10} more</li>
        ) : null}
      </ul>
    </div>
  );
}
