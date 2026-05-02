'use client';

import { ChevronDown } from 'lucide-react';
import React from 'react';

import type { ImportReviewBlockModel } from './importDetailTypes';

function toneBorder(tone: 'added' | 'removed' | 'neutral'): string {
  if (tone === 'added') {
    return 'border-success/35 bg-success/[0.06]';
  }
  if (tone === 'removed') {
    return 'border-error/35 bg-error/[0.06]';
  }
  return 'border-primary/20 bg-surface-secondary/50';
}

function LineListDisclosure({
  title,
  countLabel,
  lines,
  tone,
  defaultOpen,
  testId,
}: {
  title: string;
  countLabel: string;
  lines: readonly string[];
  tone: 'added' | 'removed' | 'neutral';
  defaultOpen: boolean;
  testId: string;
}) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <details
      data-testid={testId}
      className={`group rounded-lg border open:shadow-sm ${toneBorder(tone)}`}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-medium text-foreground marker:content-none hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary dark:hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          <span className="ml-2 font-normal text-muted">
            ({lines.length} {countLabel})
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="max-h-[min(32rem,78vh)] overflow-y-auto border-t border-primary/15 px-3 py-3">
        <ol className="list-decimal space-y-2 pl-5 text-xs text-foreground/90 marker:text-muted">
          {lines.map((line, i) => (
            <li key={i} className="break-words pl-1">
              {line}
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}

function ChangedClusters({ items }: { items: ImportReviewBlockModel['changed'] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Changed</p>
      <div className="space-y-2">
        {items.map((c, i) => (
          <details
            key={i}
            className="group rounded-lg border border-primary/20 bg-surface-secondary/40 open:shadow-sm"
            open={items.length <= 3}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-foreground marker:content-none hover:bg-surface-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 break-words pr-2">{c.label}</span>
              <span className="flex shrink-0 items-center gap-2 text-muted">
                <span>{c.lines.length} lines</span>
                <ChevronDown
                  className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </span>
            </summary>
            <div className="max-h-[min(28rem,70vh)] overflow-y-auto border-t border-primary/15 px-3 py-2">
              <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted">
                {c.lines.map((ln, j) => (
                  <li key={j} className="break-words text-foreground/90">
                    {ln}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export function ImportReviewBlockDiffLists({ block }: { block: ImportReviewBlockModel }) {
  const totalLines = block.added.length + block.removed.length;
  const large = totalLines > 24 || block.changed.length > 8;

  return (
    <div className="space-y-3">
      {block.unchangedSummary ? <p className="text-xs text-muted">{block.unchangedSummary}</p> : null}
      <div className="grid gap-2">
        <LineListDisclosure
          title="Added"
          countLabel="rows"
          lines={block.added}
          tone="added"
          defaultOpen={!large || block.added.length <= 12}
          testId="import-diff-added"
        />
        <LineListDisclosure
          title="Removed"
          countLabel="rows"
          lines={block.removed}
          tone="removed"
          defaultOpen={!large || block.removed.length <= 12}
          testId="import-diff-removed"
        />
      </div>
      <ChangedClusters items={block.changed} />
      {block.added.length + block.removed.length + block.changed.length === 0 && !block.unchangedSummary ? (
        <p className="text-xs text-muted">No differences surfaced in this block.</p>
      ) : null}
    </div>
  );
}
