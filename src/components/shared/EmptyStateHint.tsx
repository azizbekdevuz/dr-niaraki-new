'use client';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export type EmptyStateHintProps = {
  icon: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
};

export function EmptyStateHint({ icon: Icon, title, hint, className }: EmptyStateHintProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-dashed border-primary/30 py-16 text-center text-muted',
        className,
      )}
    >
      <Icon className="mx-auto mb-4 h-12 w-12 opacity-50" aria-hidden />
      <p className="font-medium text-foreground/80">{title}</p>
      {hint ? <p className="mt-1 text-sm">{hint}</p> : null}
    </div>
  );
}
