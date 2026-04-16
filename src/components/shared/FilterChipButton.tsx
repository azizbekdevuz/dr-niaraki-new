'use client';

import clsx from 'clsx';
import React from 'react';

export type FilterChipButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/**
 * Segmented filter control (publications, patents, research, etc.).
 */
export function FilterChipButton({
  selected,
  className,
  type = 'button',
  children,
  ...rest
}: FilterChipButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
        selected
          ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-md ring-1 ring-white/10'
          : 'border border-primary/30 bg-surface-secondary/60 text-muted hover:border-accent-primary/40 hover:text-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
