'use client';

import { ChevronDown } from 'lucide-react';
import React from 'react';

export type ReviewableStringListProps = {
  title: string;
  items: readonly string[];
  itemLabel?: string;
  emptyText?: string;
};

/**
 * Native `<details>` disclosure for long warning/finding lists — fully scrollable, no “…and N more” cut-off.
 */
export function ReviewableStringList({
  title,
  items,
  itemLabel = 'items',
  emptyText = 'None.',
}: ReviewableStringListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }

  return (
    <details
      data-testid="reviewable-string-list"
      className="group rounded-lg border border-primary/25 bg-surface-secondary/40 open:shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium text-foreground marker:content-none hover:bg-surface-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          <span className="ml-2 font-normal text-muted">
            ({items.length} {itemLabel})
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="max-h-[min(28rem,70vh)] overflow-y-auto border-t border-primary/20 px-3 py-3">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
          {items.map((w, i) => (
            <li key={i} className="break-words">
              {w}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
