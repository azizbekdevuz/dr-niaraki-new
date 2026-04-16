'use client';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export type ContentStatTileProps = {
  icon: LucideIcon;
  value: string | number;
  label: string;
  /** Larger tile for profile / about hero stats. */
  variant?: 'default' | 'hero';
  className?: string;
};

/**
 * Metric tile used across publications, patents, about, and homepage stats.
 */
export function ContentStatTile({
  icon: Icon,
  value,
  label,
  variant = 'default',
  className,
}: ContentStatTileProps) {
  const hero = variant === 'hero';

  return (
    <div
      className={clsx(
        'rounded-xl border border-primary/25 bg-surface-primary/50 text-center shadow-sm transition-colors hover:border-accent-primary/35',
        hero ? 'p-5' : 'p-4',
        className,
      )}
    >
      <Icon
        className={clsx('mx-auto text-accent-primary', hero ? 'mb-3 h-8 w-8' : 'mb-2 h-6 w-6')}
        aria-hidden
      />
      <p className={clsx('font-bold tabular-nums text-foreground', hero ? 'mb-1 text-3xl' : 'text-2xl')}>
        {value}
      </p>
      <p className="text-xs font-medium text-muted md:text-sm">{label}</p>
    </div>
  );
}
