'use client';

import { CheckCircle } from 'lucide-react';
import React from 'react';

type Props = {
  message: string;
  commitDomainNote: string | null;
  commitSha: string | null;
  commitUrl: string | null;
};

export function CvUploadSuccessBanner({ message, commitDomainNote, commitSha, commitUrl }: Props) {
  return (
    <div className="card p-4 mb-6 border-success bg-success/5">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">{message}</p>
          {commitDomainNote ? <p className="text-xs text-muted mt-2">{commitDomainNote}</p> : null}
          {commitSha ? (
            <div className="mt-2 text-sm text-muted">
              <p>
                Commit SHA: <code className="bg-surface-secondary px-2 py-1 rounded">{commitSha}</code>
              </p>
              {commitUrl ? (
                <a
                  href={commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline"
                >
                  View on GitHub →
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
