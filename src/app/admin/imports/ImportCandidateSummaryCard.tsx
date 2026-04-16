'use client';

import React from 'react';

import type { ImportDetailModel } from './importDetailTypes';

export function ImportCandidateSummaryCard({ imp }: { imp: ImportDetailModel }) {
  if (!imp.candidateSummary) {
    return null;
  }

  const s = imp.candidateSummary;

  return (
    <div className="card p-4 space-y-1 text-sm">
      <p className="font-medium text-foreground">Candidate summary</p>
      <p className="text-muted">
        Profile name: {s.profileName ?? '—'} · Publications: {s.publicationCount} · Patents: {s.patentCount}
        {s.rawHtmlTruncated ? ' · rawHtml truncated in DB' : ''}
      </p>
    </div>
  );
}
