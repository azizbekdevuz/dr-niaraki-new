'use client';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export type MetaFactRowProps = {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
};

/** Icon + label row for dense metadata (research projects, etc.). */
export function MetaFactRow({ icon: Icon, children, className }: MetaFactRowProps) {
  return (
    <div className={clsx('flex items-start gap-2 text-sm text-muted', className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary/85" aria-hidden />
      <span className="min-w-0 leading-snug">{children}</span>
    </div>
  );
}
