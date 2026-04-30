'use client';

import React from 'react';

import type { DraftEditorSlice } from '@/lib/draftEditorSlice';

function ScrollPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`max-h-[min(36rem,78vh)] overflow-y-auto rounded-md border border-primary/10 bg-surface/30 px-3 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

/** About-tab preview of teaching / supervision / service rows from the current draft slice. */
export function DraftEditorPreviewAboutLists({ slice }: { slice: DraftEditorSlice }) {
  return (
    <div data-testid="draft-preview-simple-lists" className="space-y-3">
      <p className="text-xs font-medium text-muted">Teaching, supervision & service (draft lists)</p>
      <ScrollPanel className="mt-1">
        <div className="space-y-4 text-xs text-muted">
          <div>
            <p className="font-medium text-foreground">Teaching ({slice.teaching.length})</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {slice.teaching.map((t) => (
                <li key={t.id}>
                  <span className="text-foreground">{t.title}</span>
                  {t.body ? (
                    <p className="mt-0.5 whitespace-pre-wrap text-[11px] text-foreground/80">{t.body}</p>
                  ) : null}
                </li>
              ))}
              {slice.teaching.length === 0 ? <li>—</li> : null}
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground">Supervision ({slice.supervision.length})</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {slice.supervision.map((t) => (
                <li key={t.id}>
                  <span className="text-foreground">{t.title}</span>
                  {t.body ? (
                    <p className="mt-0.5 whitespace-pre-wrap text-[11px] text-foreground/80">{t.body}</p>
                  ) : null}
                </li>
              ))}
              {slice.supervision.length === 0 ? <li>—</li> : null}
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground">Service ({slice.service.length})</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {slice.service.map((t) => (
                <li key={t.id}>
                  <span className="text-foreground">{t.title}</span>
                  {t.body ? (
                    <p className="mt-0.5 whitespace-pre-wrap text-[11px] text-foreground/80">{t.body}</p>
                  ) : null}
                </li>
              ))}
              {slice.service.length === 0 ? <li>—</li> : null}
            </ul>
          </div>
        </div>
      </ScrollPanel>
    </div>
  );
}
