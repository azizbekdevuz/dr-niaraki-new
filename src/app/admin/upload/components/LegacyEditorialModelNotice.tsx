'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function LegacyEditorialModelNotice({ uploadMetaNote }: { uploadMetaNote: string | null }) {
  return (
    <div className="card p-4 mb-6 border-warning/40 bg-warning/5">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted space-y-2">
          <p>
            <span className="font-medium text-foreground">Legacy:</span> “Commit” on this page targets the old{' '}
            <strong>GitHub / JSON</strong> path (details dataset), not Prisma drafts. The public site reads{' '}
            <strong>published DB</strong> first, then canonical fallback — wire content through{' '}
            <Link href="/admin/imports" className="text-accent-primary hover:underline">
              Imports
            </Link>{' '}
            and{' '}
            <Link href="/admin/content" className="text-accent-primary hover:underline">
              Site content
            </Link>
            .
          </p>
          {uploadMetaNote ? <p>{uploadMetaNote}</p> : null}
        </div>
      </div>
    </div>
  );
}
